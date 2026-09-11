import { test } from "node:test";
import assert from "node:assert/strict";
import { auditDemoImports } from "../audit-demo-imports.mjs";

// Regression test for a real bug: vendoring copied .tsx/.ts/.json but
// silently dropped local binary assets a few demos import (24 PNG textures
// + 1 JPG), and a demo importing `../../../assets/lib/ClipCard` (repo-root
// relative, matching the ORIGINAL Shotcraft layout) had no matching path in
// the vendor snapshot (fixed via a compat symlink `vendor/shotcraft/assets/
// lib -> ../lib`). `tsc` never caught either — asset imports are typed via
// `vite-env.d.ts` ambient module declarations, not checked against the
// filesystem — the failure only surfaced at `vite build` time inside
// `workbench/`. This test makes that class of bug fail fast and in CI.
test("every relative import in vendored Shotcraft demos/lib resolves to a real file on disk", async () => {
  const { filesScanned, missing } = await auditDemoImports();
  assert.ok(filesScanned > 200, `expected 200+ vendored demo/lib files, scanned ${filesScanned}`);
  assert.deepEqual(missing, [], `${missing.length} unresolved import(s):\n${missing.map((m) => `  ${m.file}: "${m.specifier}"`).join("\n")}`);
});
