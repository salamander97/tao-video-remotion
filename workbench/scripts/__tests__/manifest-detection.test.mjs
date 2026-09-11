import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, symlink, unlink, lstat, readlink, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const WB_ROOT = path.resolve(import.meta.dirname, "../..");
const PROJ_LINK = path.join(WB_ROOT, "proj");
const GEN_INDEX = path.join(WB_ROOT, "scripts", "gen-index.mjs");
const PROJ_META = path.join(WB_ROOT, "src", "projMeta.ts");

/** Regression test for the exact bug caught by independent review: this
 * repo's per-composition manifests live NESTED (`template/src/AiflPromoDemo/
 * workbench.ts`), but Shotcraft's own detection (`gen-index.mjs`'s
 * `hasManifest` check, `vite.config.ts`'s `@proj` alias fallback to
 * `proj-stub`) ONLY ever looks at `<linked-src>/workbench.ts` — the TOP of
 * whatever directory `workbench/proj` points at. A nested-only manifest is
 * therefore invisible to the real import pipeline even though the file
 * exists and typechecks fine — `npm run build` printing "成片工程 未链接"
 * (or "无 workbench.ts 清单") is the actual failure signal, not a build
 * error, which is exactly why it slipped past `tsc`/`vite build` earlier.
 *
 * This exercises the REAL detection logic (relinks `proj`, runs the actual
 * `gen-index.mjs`, reads its real output) rather than reimplementing the
 * check — a reimplementation could drift from gen-index.mjs and pass even
 * if the real detection breaks again. Restores the original `proj` link
 * (currently → `template/src`) when done, and never starts a dev server.
 */
async function currentProjTarget() {
  try {
    return await readlink(PROJ_LINK);
  } catch {
    return null;
  }
}

async function relinkAndDetect(srcDir) {
  if (existsSync(PROJ_LINK) || (await lstat(PROJ_LINK).catch(() => null))) await unlink(PROJ_LINK).catch(() => {});
  await symlink(srcDir, PROJ_LINK);
  await exec("node", [GEN_INDEX]);
  const metaSrc = await import("node:fs/promises").then((fs) => fs.readFile(PROJ_META, "utf8"));
  return {
    hasManifest: /PROJ_HAS_MANIFEST = true/.test(metaSrc),
    linked: /PROJ_LINKED = true/.test(metaSrc),
  };
}

test("a NESTED-only workbench.ts (no top-level file) must NOT count as PROJ_HAS_MANIFEST", async (t) => {
  const original = await currentProjTarget();
  const fixture = await mkdtemp(path.join(tmpdir(), "wb-fixture-nested-"));
  try {
    await mkdir(path.join(fixture, "Sub"), { recursive: true });
    await writeFile(path.join(fixture, "Root.tsx"), "export const Root = () => null;\n");
    await writeFile(path.join(fixture, "index.ts"), "export {};\n");
    // Manifest exists, but NESTED one level down — the exact real bug.
    await writeFile(path.join(fixture, "Sub", "workbench.ts"), "export const WORKBENCH = { name: 'x', fps: 30, width: 1, height: 1, total: 1, shots: [] };\n");

    const result = await relinkAndDetect(fixture);
    assert.equal(result.linked, true, "sanity: proj should still be considered linked");
    assert.equal(result.hasManifest, false, "a NESTED-only manifest must be detected as absent — this is the regression this test guards");
  } finally {
    await rm(fixture, { recursive: true, force: true });
    if (original) {
      await unlink(PROJ_LINK).catch(() => {});
      await symlink(original, PROJ_LINK);
      await exec("node", [GEN_INDEX]).catch(() => {});
    }
  }
});

test("a TOP-LEVEL workbench.ts (same fixture, manifest promoted to the root) IS detected", async (t) => {
  const original = await currentProjTarget();
  const fixture = await mkdtemp(path.join(tmpdir(), "wb-fixture-top-"));
  try {
    await writeFile(path.join(fixture, "Root.tsx"), "export const Root = () => null;\n");
    await writeFile(path.join(fixture, "index.ts"), "export {};\n");
    await writeFile(path.join(fixture, "workbench.ts"), "export const WORKBENCH = { name: 'x', fps: 30, width: 1, height: 1, total: 1, shots: [] };\n");

    const result = await relinkAndDetect(fixture);
    assert.equal(result.hasManifest, true, "a top-level manifest must be detected as present");
  } finally {
    await rm(fixture, { recursive: true, force: true });
    if (original) {
      await unlink(PROJ_LINK).catch(() => {});
      await symlink(original, PROJ_LINK);
      await exec("node", [GEN_INDEX]).catch(() => {});
    }
  }
});

test("real repo state: template/src/workbench.ts (the selector) is currently detected as present", async () => {
  // No relinking here — asserts the ACTUAL current state of this repo's own
  // workbench/proj link, which should already point at template/src with
  // the selector file in place from select-workbench-composition.mjs.
  const target = await currentProjTarget();
  assert.ok(target, "workbench/proj is not linked at all — run `node scripts/open.mjs ../template --no-open` first");
  await exec("node", [GEN_INDEX]);
  const metaSrc = await import("node:fs/promises").then((fs) => fs.readFile(PROJ_META, "utf8"));
  assert.match(metaSrc, /PROJ_HAS_MANIFEST = true/);
});
