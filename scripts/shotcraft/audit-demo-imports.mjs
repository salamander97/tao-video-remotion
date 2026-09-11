#!/usr/bin/env node
// Deterministic audit: every relative import specifier (`./x`, `../x`) in
// every vendored demo/lib .ts/.tsx file must resolve to a real file on disk.
// This exists because a prior vendoring pass copied .tsx/.ts/.json but
// silently dropped local binary assets (.jpg/.png) some demos import — a
// failure that `tsc` never catches (asset imports are typed via
// `vite-env.d.ts` module declarations, not checked against the filesystem)
// and that only surfaced at `vite build` time. Run standalone or via the
// test in __tests__/demo-imports.test.mjs.
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VENDOR_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../vendor/shotcraft");
const CODE_EXTS = [".tsx", ".ts", ".jsx", ".js"];
const RESOLVABLE_EXTS_IF_NO_EXT = [".tsx", ".ts", ".jsx", ".js", ".json"];

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (CODE_EXTS.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
  return out;
}

function extractRelativeImports(source) {
  const specifiers = [];
  const patterns = [/from\s+['"](\.[^'"]+)['"]/g, /import\s+['"](\.[^'"]+)['"]/g, /require\(\s*['"](\.[^'"]+)['"]\s*\)/g];
  for (const re of patterns) {
    for (const m of source.matchAll(re)) specifiers.push(m[1]);
  }
  return specifiers;
}

function resolveSpecifier(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  if (existsSync(base)) return base; // has its own extension (.jpg/.png/.json/.css/...) or is a literal match
  for (const ext of RESOLVABLE_EXTS_IF_NO_EXT) {
    if (existsSync(base + ext)) return base + ext;
  }
  // directory import (./foo -> ./foo/index.ts(x))
  for (const ext of RESOLVABLE_EXTS_IF_NO_EXT) {
    if (existsSync(path.join(base, "index" + ext))) return path.join(base, "index" + ext);
  }
  return null;
}

/** Returns an array of { file, specifier } for every relative import that
 * does NOT resolve to a real file under the vendor snapshot. Empty = clean. */
export async function auditDemoImports(root = VENDOR_ROOT) {
  const files = [...(await walk(path.join(root, "demos"))), ...(await walk(path.join(root, "lib")))];
  const missing = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const specifier of extractRelativeImports(source)) {
      if (!resolveSpecifier(file, specifier)) missing.push({ file: path.relative(root, file), specifier });
    }
  }
  return { filesScanned: files.length, missing };
}

async function main() {
  const { filesScanned, missing } = await auditDemoImports();
  if (missing.length) {
    console.error(`✗ ${missing.length} unresolved local import(s) across ${filesScanned} files scanned:`);
    for (const m of missing) console.error(`  - ${m.file}: "${m.specifier}"`);
    process.exitCode = 1;
    return;
  }
  console.log(`✓ ${filesScanned} vendored demo/lib files scanned — every relative import resolves to a real file.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
