#!/usr/bin/env node
// Node port of the staged `smoke-render-demos.py` (ported to match this
// repo's Node-only script convention; same core contract: find every demo
// with a `_DURATION`/`_DUR` export + a matching `React.FC` component,
// register all of them into one temporary Root, render frame 0 of each, and
// report pass/fail — closing the "compiles but doesn't render" gap that
// `tsc`/`audit-demo-imports.mjs` cannot catch (those check static structure,
// not actual Chromium rendering).
//
// Usage (from template/ — this script needs template's own node_modules,
// see the webpackOverride below for why):
//   node scripts/smoke-render-demos.mjs [--subset a,b,c] [--list]
//   npm run smoke-render-demos   (same thing, registered in package.json)
import { readFile, writeFile, rm, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const TEMPLATE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = path.resolve(TEMPLATE_DIR, "..");
const VENDOR_DEMOS = path.join(REPO_ROOT, "vendor/shotcraft/demos");
const TEMPLATE_SRC = path.join(TEMPLATE_DIR, "src");
const SMOKE_ROOT_REL = "__smoke-root.tsx";
const SMOKE_ROOT_ABS = path.join(TEMPLATE_SRC, SMOKE_ROOT_REL);
const SMOKE_INDEX_ABS = path.join(TEMPLATE_SRC, "__smoke-index.ts");
const REPORT_PATH = path.join(REPO_ROOT, "docs/qa/demo-smoke-report.json");

const SKIP_REASONS = {
  ClipCardLooping: "requires real external mp4 material this snapshot does not vendor",
  VerticalTicker: "not standalone-renderable — a shared library component requiring a `columns` prop with no default, consumed by PageWaterfallWall (which IS smoke-tested)",
};

// Demos requiring real external material (mp4/large binary) this snapshot
// intentionally does not vendor — genuine, evidenced skip, not silent.
const MATERIAL_REQUIRED = new Set(["ClipCardLooping"]);

// Not standalone-renderable: these export `React.FC` (matching the demo
// regex) but are actually a shared library component consumed BY another
// demo with real data, not a demo in their own right — rendering them with
// no props throws immediately, by design (e.g. `VerticalTicker` requires a
// `columns` prop with no default; its actual demo is `PageWaterfallWall`,
// which IS smoke-tested and does supply it).
const REQUIRES_PARENT_PROPS = new Set(["VerticalTicker"]);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("._") || entry.name.startsWith("_fixtures") || entry.name.startsWith("_textures")) {
      if (entry.name === "_fixtures" || entry.name === "_textures") continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const FALLBACK_DURATION = 300; // demos with no self-declared duration — smoke test only needs frame 0 to render, not the real length

async function findDemos() {
  const files = (await walk(VENDOR_DEMOS)).sort();
  const out = [];
  for (const file of files) {
    const src = await readFile(file, "utf8");
    const stem = path.basename(file, ".tsx");
    if (!new RegExp(`export const ${stem}\\s*:\\s*React\\.FC`).test(src)) continue; // not a component file (e.g. a types/const-only module)
    const durMatch = src.match(/export const (\w+_DURATION|\w+_DUR)\s*=/);
    const category = path.relative(VENDOR_DEMOS, file).split(path.sep)[0];
    out.push({
      file,
      relPath: path.relative(REPO_ROOT, file),
      category,
      durName: durMatch ? durMatch[1] : null,
      durationSource: durMatch ? "export" : "fallback",
      stem,
      sha256: createHash("sha256").update(src).digest("hex"),
    });
  }
  return out;
}

async function writeSmokeRoot(demos) {
  const lines = ["import { Composition } from 'remotion';"];
  const regs = [];
  for (const { file, durName, stem } of demos) {
    const rel = "./" + path.relative(TEMPLATE_SRC, file).replace(/\.tsx$/, "").split(path.sep).join("/");
    const importSpec = durName ? `${stem}, ${durName}` : stem;
    const durationExpr = durName ?? String(FALLBACK_DURATION);
    lines.push(`import { ${importSpec} } from '${rel}';`);
    regs.push(`    <Composition id="${stem}" component={${stem}} durationInFrames={${durationExpr}} fps={30} width={1920} height={1080} />`);
  }
  lines.push("export const SmokeRoot: React.FC = () => (\n  <>\n" + regs.join("\n") + "\n  </>\n);");
  await writeFile(SMOKE_ROOT_ABS, lines.join("\n") + "\n");
  await writeFile(SMOKE_INDEX_ABS, "import { registerRoot } from 'remotion';\nimport { SmokeRoot } from './__smoke-root';\nregisterRoot(SmokeRoot);\n");
}

async function main() {
  const args = process.argv.slice(2);
  const list = args.includes("--list");
  const subsetArg = args.find((a) => a.startsWith("--subset="));
  const subset = subsetArg ? new Set(subsetArg.split("=")[1].split(",")) : null;

  let demos = await findDemos();
  if (list) {
    for (const d of demos) console.log(d.stem);
    return;
  }
  if (subset) demos = demos.filter((d) => subset.has(d.stem));

  const skip = demos.filter((d) => MATERIAL_REQUIRED.has(d.stem) || REQUIRES_PARENT_PROPS.has(d.stem));
  const run = demos.filter((d) => !MATERIAL_REQUIRED.has(d.stem) && !REQUIRES_PARENT_PROPS.has(d.stem));
  const withDurationExport = demos.filter((d) => d.durName).length;
  console.log(`Found ${demos.length} demo components (${withDurationExport} with a self-declared duration export, ${demos.length - withDurationExport} using FALLBACK_DURATION=${FALLBACK_DURATION} for the smoke render — frame 0 only, real length doesn't matter here); ${skip.length} genuinely skipped (evidenced reason each); will attempt ${run.length}.`);
  if (skip.length) for (const d of skip) console.log(`  skip ${d.stem}: ${SKIP_REASONS[d.stem] ?? "unspecified"}`);

  await writeSmokeRoot(run);

  let bundleLocation;
  try {
    bundleLocation = await bundle({
      entryPoint: SMOKE_INDEX_ABS,
      onProgress: () => {},
      // Demos physically live under vendor/shotcraft/demos/**, OUTSIDE
      // template/'s own directory tree — webpack's default node_modules
      // resolution walks up from each file's own disk location, so a demo
      // file's bare-specifier imports (e.g. `@remotion/motion-blur`) never
      // reach template/node_modules on their own. Explicitly add it so
      // vendored files resolve the same deps template/ already installed,
      // without duplicating node_modules anywhere.
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          modules: [...(config.resolve?.modules ?? []), path.join(TEMPLATE_DIR, "node_modules")],
        },
      }),
    });
  } catch (error) {
    await rm(SMOKE_ROOT_ABS, { force: true });
    await rm(SMOKE_INDEX_ABS, { force: true });
    throw error;
  }

  const outDir = path.join(REPO_ROOT, ".smoke-render-out");
  await mkdir(outDir, { recursive: true });
  const results = [];
  for (const demo of run) {
    const outPng = path.join(outDir, `${demo.stem}.png`);
    try {
      const composition = await selectComposition({ serveUrl: bundleLocation, id: demo.stem });
      await renderStill({ composition, serveUrl: bundleLocation, output: outPng, frame: 0 });
      const pngHash = createHash("sha256").update(await readFile(outPng)).digest("hex");
      results.push({ stem: demo.stem, relPath: demo.relPath, category: demo.category, sourceSha256: demo.sha256, durationSource: demo.durationSource, status: "pass", renderedFrame0Sha256: pngHash });
      console.log(`  ✓ ${demo.stem}`);
    } catch (error) {
      const message = String(error.message ?? error).slice(0, 500);
      results.push({ stem: demo.stem, relPath: demo.relPath, category: demo.category, sourceSha256: demo.sha256, durationSource: demo.durationSource, status: "fail", error: message });
      console.log(`  ✗ ${demo.stem}: ${message.slice(0, 200)}`);
    }
  }

  await rm(SMOKE_ROOT_ABS, { force: true });
  await rm(SMOKE_INDEX_ABS, { force: true });
  await rm(outDir, { recursive: true, force: true }); // rendered PNGs are temp — evidence is each result's sha256 in the JSON report, not the images

  const passed = results.filter((r) => r.status === "pass");
  const failed = results.filter((r) => r.status === "fail");

  const report = {
    generatedAt: new Date().toISOString(),
    totalCandidates: demos.length,
    skipped: skip.map((d) => ({ stem: d.stem, relPath: d.relPath, category: d.category, sourceSha256: d.sha256, reason: SKIP_REASONS[d.stem] ?? "unspecified" })),
    attempted: run.length,
    passed: passed.length,
    failed: failed.length,
    results,
  };
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n${passed.length}/${run.length} rendered OK, ${skip.length} genuinely skipped (evidenced), ${failed.length} failed.`);
  console.log(`Report written to ${path.relative(REPO_ROOT, REPORT_PATH)}`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(`  - ${f.stem}: ${f.error}`);
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  await rm(SMOKE_ROOT_ABS, { force: true }).catch(() => {});
  await rm(SMOKE_INDEX_ABS, { force: true }).catch(() => {});
  console.error(error.stack);
  process.exitCode = 1;
});
