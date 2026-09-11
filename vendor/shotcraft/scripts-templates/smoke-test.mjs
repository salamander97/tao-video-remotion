#!/usr/bin/env node
// Operationalizes capture-template.mjs by IMPORTING AND CALLING its exact
// `runCapture()` implementation — never reimplementing the screenshot logic
// here — against a synthetic, local-only fixture page (no real product, no
// external network — server binds to 127.0.0.1 only). Verifies the
// three-piece output (full-page screenshot, per-element cutouts,
// layout.json) is actually produced with correct structure. Persists a
// compact JSON evidence report and deletes the bulky screenshot/cutout PNGs
// afterward (the report keeps hashes/sizes, not the images themselves).
//
// Usage (from vendor/shotcraft/scripts-templates/, after `npm install`):
//   node smoke-test.mjs
import http from "node:http";
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, rm, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCapture, DEFAULT_CONFIG } from "./capture-template.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../..");
const REPORT_PATH = path.join(REPO_ROOT, "docs/qa/capture-template-report.json");
const OUT_DIR = path.join(HERE, ".smoke-out");
const PORT = 4173;

function startFixtureServer() {
  return new Promise((resolve) => {
    const html = readFileSync(path.join(HERE, "fixture/index.html"));
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const server = await startFixtureServer();
  const issues = [];
  let layout = null;
  let files = [];
  try {
    // Fixture config: same shape as DEFAULT_CONFIG, only BASE/OUT_DIR/
    // LAYOUT_JSON/PAGES overridden to point at the synthetic local fixture —
    // this calls the REAL runCapture() from capture-template.mjs, so any
    // drift in that implementation shows up here, not in a parallel copy.
    layout = await runCapture(
      {
        ...DEFAULT_CONFIG,
        BASE: `http://127.0.0.1:${PORT}`,
        OUT_DIR,
        LAYOUT_JSON: path.join(OUT_DIR, "live-layout.json"),
        SETTLE_MS: 300,
        PAGES: [
          {
            name: "home",
            path: "/",
            boxes: [{ key: "sections", selector: "main h2", all: true }],
            cutouts: [
              { name: "nav", selector: "header, [role='banner']" },
              { name: "card", selector: "article", all: true, max: 12 },
              { name: "float-search", selector: "input", parent: true, omitBackground: true },
            ],
          },
        ],
      },
      { resolveFrom: HERE },
    );

    files = await readdir(OUT_DIR);
    if (!files.includes("home-full.png")) issues.push("missing home-full.png");
    if (!files.includes("nav.png")) issues.push("missing nav.png");
    const cardFiles = files.filter((f) => /^card\d+\.png$/.test(f));
    if (cardFiles.length < 2) issues.push(`expected >=2 article cutouts, got ${cardFiles.length}`);
    if (!files.includes("live-layout.json")) issues.push("missing live-layout.json");
    if (!layout?.home?.cutouts?.length) issues.push("layout.json has no cutouts recorded");
    if (!layout?.home?.boxes?.sections?.length) issues.push("layout.json boxes.sections not recorded");
  } finally {
    server.close();
  }

  const fileHashes = {};
  for (const f of files) {
    const full = path.join(OUT_DIR, f);
    fileHashes[f] = { sha256: await sha256(full), sizeBytes: (await stat(full)).size };
  }

  const report = {
    generatedAt: new Date().toISOString(),
    implementation: "capture-template.mjs runCapture() — called directly, not reimplemented",
    fixture: "vendor/shotcraft/scripts-templates/fixture/index.html (synthetic, local-only, no real product data)",
    serverBoundTo: `127.0.0.1:${PORT} (no external network)`,
    outputFiles: fileHashes,
    layout,
    issues,
    pass: issues.length === 0,
  };
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
  await rm(OUT_DIR, { recursive: true, force: true }); // bulky PNGs deleted — evidence lives in the JSON report's hashes

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${path.relative(REPO_ROOT, REPORT_PATH)}`);
  if (!report.pass) { console.error("FAIL"); process.exitCode = 1; }
}

main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
