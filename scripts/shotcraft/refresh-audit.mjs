#!/usr/bin/env node
// Compares (and, with --apply, refreshes) the vendored Shotcraft snapshot
// against a live checkout, covering EVERY mapped category explicitly (not a
// whole-directory diff of `gallery/` or repo root, which produces false
// positives against files this repo never vendors) — see CATEGORY_MAPPINGS
// below for the exact, auditable list. `refreshFromLive()` is exported and
// used both by the CLI and by tests that run the REAL copy logic against a
// disposable fixture tree, never the real vendor/shotcraft/.
//
// Usage:
//   node scripts/shotcraft/refresh-audit.mjs                 # report only
//   node scripts/shotcraft/refresh-audit.mjs --apply          # refresh vendor from live
import { readFile, readdir, mkdir, mkdtemp, writeFile, rename, unlink, lstat, realpath, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import os from "node:os";

const exec = promisify(execFile);
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const VENDOR_ROOT = path.join(REPO_ROOT, "vendor/shotcraft");
const CONFIG_FILE = path.join(os.homedir(), ".tao-video-suite", "config.json");
// The audio builder is ALWAYS resolved from this repo's own canonical code
// location — never derived from a caller-supplied `vendorRoot` parameter
// (that parameter is untrusted in tests, and a fixture's own
// `<vendorRoot>/scripts/build-audio-manifest.mjs` could be a symlink to
// arbitrary code). See `resolveTrustedBuilderPath()`.
const CANONICAL_AUDIO_BUILDER_PATH = path.join(VENDOR_ROOT, "scripts/build-audio-manifest.mjs");

export async function getLiveRoot() {
  try {
    const config = JSON.parse(await readFile(CONFIG_FILE, "utf8"));
    if (!config.shotcraftRepo) return { ok: false, reason: "shotcraftRepo chưa cấu hình trong ~/.tao-video-suite/config.json" };
    if (!existsSync(config.shotcraftRepo)) return { ok: false, reason: `shotcraftRepo (${config.shotcraftRepo}) không tồn tại hoặc không truy cập được (kiểm tra mount/permission)` };
    try {
      await readdir(config.shotcraftRepo);
    } catch (error) {
      return { ok: false, reason: `shotcraftRepo tồn tại nhưng không đọc được (${error.code ?? error.message}) — có thể do permission hệ điều hành (macOS TCC/Full Disk Access), không phải lỗi code` };
    }
    return { ok: true, root: config.shotcraftRepo };
  } catch {
    return { ok: false, reason: "không đọc được config.json" };
  }
}

export async function walkFiles(dir, extensions = null, out = [], base = dir) {
  if (!existsSync(dir)) return out;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("._")) continue; // AppleDouble — always excluded
    if (entry.name === "__pycache__" || entry.name === "node_modules" || entry.name.endsWith(".pyc")) continue; // build/runtime artifacts, not vendored content
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkFiles(full, extensions, out, base);
    else if (!extensions || extensions.some((ext) => entry.name.endsWith(ext))) out.push(path.relative(base, full));
  }
  return out;
}

export async function hashFile(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

/** Generic tree/file-set comparison — pure, no side effects. Used both for
 * "tree" categories (whole filtered directory) and "files" categories
 * (explicit whitelist), so the same tested logic backs every category. */
export async function compareFileSet(liveFiles, liveBase, vendorFiles, vendorBase) {
  const liveSet = new Set(liveFiles);
  const vendorSet = new Set(vendorFiles);
  const onlyLive = liveFiles.filter((f) => !vendorSet.has(f));
  const onlyVendor = vendorFiles.filter((f) => !liveSet.has(f));
  const changed = [];
  for (const f of liveFiles.filter((f) => vendorSet.has(f))) {
    try {
      if ((await hashFile(path.join(liveBase, f))) !== (await hashFile(path.join(vendorBase, f)))) changed.push(f);
    } catch { /* unreadable on one side — already surfaced via onlyLive/onlyVendor if applicable */ }
  }
  return { liveCount: liveFiles.length, vendorCount: vendorFiles.length, onlyLive, onlyVendor, changed };
}

/** Backward-compatible directory-tree wrapper over compareFileSet — kept for
 * existing tests/callers that compare two full directories 1:1. */
export async function compareTree(label, liveDir, vendorDir, { pathMap = (p) => p } = {}) {
  const liveRaw = await walkFiles(liveDir);
  const vendorRaw = await walkFiles(vendorDir);
  const liveMapped = new Map(liveRaw.map((f) => [pathMap(f), f]));
  const vendorSet = new Set(vendorRaw);
  const onlyLive = [...liveMapped.keys()].filter((f) => !vendorSet.has(f));
  const onlyVendor = vendorRaw.filter((f) => !liveMapped.has(f));
  const changed = [];
  for (const mapped of [...liveMapped.keys()].filter((f) => vendorSet.has(f))) {
    try {
      if ((await hashFile(path.join(liveDir, liveMapped.get(mapped)))) !== (await hashFile(path.join(vendorDir, mapped)))) changed.push(mapped);
    } catch { /* unreadable on one side */ }
  }
  return { label, liveCount: liveRaw.length, vendorCount: vendorRaw.length, onlyLive, onlyVendor, changed };
}

/**
 * Explicit, auditable list of every vendored category and exactly how it
 * maps between a live Shotcraft checkout and this repo's vendor snapshot.
 * Adding a new vendored category means adding a row here — nothing is
 * covered by an implicit whole-directory diff.
 *
 * `type: "tree"` — recursive directory, optionally extension-filtered.
 * `type: "files"` — an explicit filename whitelist inside one directory
 *   (used for gallery UI and scripts-templates, where the destination
 *   directory ALSO holds files this repo authored itself — e.g.
 *   scripts-templates/package.json, fixture/, smoke-test.mjs — which must
 *   NEVER be touched by a refresh).
 * `type: "docPairs"` — explicit (liveRelPath, vendorRelPath) pairs, for docs
 *   that live at different relative locations on each side.
 */
export const CATEGORY_MAPPINGS = [
  { label: "shots (recipes)", type: "tree", liveRel: "references/shots", vendorRel: "shots" },
  { label: "demos", type: "tree", liveRel: "demos", vendorRel: "demos", extensions: [".tsx", ".ts", ".json", ".png", ".jpg"] },
  { label: "lib helpers", type: "tree", liveRel: "assets/lib", vendorRel: "lib" },
  { label: "library.json", type: "files", liveRel: "gallery/api", vendorRel: "gallery/api", files: ["library.json"] },
  { label: "gallery posters", type: "tree", liveRel: "gallery/media/poster", vendorRel: "gallery/media/poster" },
  { label: "gallery UI", type: "files", liveRel: "gallery", vendorRel: "gallery", files: ["translations.js", "app.js", "styles.css", "index.html", "library.html"] },
  { label: "jianying-export scripts", type: "tree", liveRel: "jianying-export", vendorRel: "jianying-export", extensions: [".py"] },
  { label: "root process docs", type: "files", liveRel: ".", vendorRel: ".", files: ["SKILL.md"] },
  {
    label: "reference process docs",
    type: "docPairs",
    pairs: [
      ["references/aesthetic-rules.md", "aesthetic-rules.md"],
      ["references/sound-design.md", "sound-design.md"],
      ["references/final-review.md", "final-review.md"],
      ["references/music-beat-sync.md", "music-beat-sync.md"],
      ["references/guided-free-creation.md", "guided-free-creation.md"],
      ["references/pipeline.md", "pipeline.md"],
      ["references/workbench.md", "workbench.md"],
      ["references/jianying-export.md", "jianying-export.md"],
    ],
  },
  { label: "aifl-template (Ink Press full source)", type: "tree", liveRel: "template", vendorRel: "aifl-template" },
  // IMPORTANT: this maps to scripts-templates/upstream/, NOT
  // scripts-templates/ directly. scripts-templates/capture-template.mjs is
  // an OPERATIONAL file we refactored (exports runCapture()/DEFAULT_CONFIG,
  // consumed by smoke-test.mjs) — a refresh must never overwrite it with the
  // raw upstream snapshot. upstream/ holds untouched reference copies only;
  // diff upstream/ against the operational file by hand when refreshing to
  // decide whether the operational refactor needs updating too.
  { label: "scripts-templates upstream snapshot (reference only — NOT the operational capture-template.mjs)", type: "files", liveRel: "assets/scripts", vendorRel: "scripts-templates/upstream", files: ["capture-template.mjs", "smoke-render-demos.py"] },
];

async function compareCategory(cat, liveRoot, vendorRoot) {
  if (cat.type === "tree") {
    const liveDir = path.join(liveRoot, cat.liveRel);
    const vendorDir = path.join(vendorRoot, cat.vendorRel);
    const liveFiles = await walkFiles(liveDir, cat.extensions ?? null);
    const vendorFiles = await walkFiles(vendorDir, cat.extensions ?? null);
    const result = await compareFileSet(liveFiles, liveDir, vendorFiles, vendorDir);
    return { label: cat.label, ...result };
  }
  if (cat.type === "files") {
    const liveDir = path.join(liveRoot, cat.liveRel);
    const vendorDir = path.join(vendorRoot, cat.vendorRel);
    const liveFiles = cat.files.filter((f) => existsSync(path.join(liveDir, f)));
    const vendorFiles = cat.files.filter((f) => existsSync(path.join(vendorDir, f)));
    const result = await compareFileSet(liveFiles, liveDir, vendorFiles, vendorDir);
    return { label: cat.label, ...result };
  }
  if (cat.type === "docPairs") {
    let onlyLive = [], onlyVendor = [], changed = [], liveCount = 0, vendorCount = 0;
    for (const [liveRel, vendorRel] of cat.pairs) {
      const liveDoc = path.join(liveRoot, liveRel);
      const vendorDoc = path.join(vendorRoot, vendorRel);
      const liveExists = existsSync(liveDoc);
      const vendorExists = existsSync(vendorDoc);
      if (liveExists) liveCount++;
      if (vendorExists) vendorCount++;
      if (liveExists && !vendorExists) onlyLive.push(vendorRel);
      else if (!liveExists && vendorExists) onlyVendor.push(vendorRel);
      else if (liveExists && vendorExists && (await hashFile(liveDoc)) !== (await hashFile(vendorDoc))) changed.push(vendorRel);
    }
    return { label: cat.label, liveCount, vendorCount, onlyLive, onlyVendor, changed };
  }
  throw new Error(`Unknown category type: ${cat.type}`);
}

/**
 * Creates (or verifies) ONE path component under `parentReal` (itself
 * already a verified-real, non-symlink directory) and returns its own real
 * path. Never uses `mkdir({recursive:true})` from an untrusted root — that
 * call happily walks THROUGH an existing symlinked intermediate directory
 * and creates the remainder outside the intended tree; checking containment
 * only *after* such a call is too late; the escape has already happened.
 * Rejects if the component already exists as a symlink or anything other
 * than a real directory.
 */
async function safeMkdirComponent(parentReal, name) {
  const target = path.join(parentReal, name);
  let st;
  try {
    st = await lstat(target);
  } catch {
    await mkdir(target);
    return target;
  }
  if (!st.isDirectory() || st.isSymbolicLink()) {
    throw new Error(`Refusing to traverse into a non-directory or symlinked path component: ${target}`);
  }
  return target;
}

/** Walks `relDirParts` one component at a time from `vendorRootReal`,
 * rejecting any symlinked/non-directory component instead of following it —
 * returns the resulting real directory path. */
async function safeResolveDir(vendorRootReal, relDirParts) {
  let current = vendorRootReal;
  for (const part of relDirParts) {
    if (part === "" || part === ".") continue;
    if (part === "..") throw new Error(`Refusing '..' in a vendor-relative destination path (parts: ${relDirParts.join("/")})`);
    current = await safeMkdirComponent(current, part);
  }
  return current;
}

/**
 * Writes `content` to `destRelPath` (relative to `vendorRootReal`) safely:
 * every intermediate directory component is verified real/non-symlink
 * (never `mkdir recursive` through untrusted path segments); an EXISTING
 * destination that is a symlink or any non-regular file is rejected outright
 * (never opened for writing — that would follow the symlink and clobber
 * whatever it points at); the actual write goes to a temp file in the same
 * verified-safe directory, re-checked for a symlink race immediately before
 * an atomic `rename()` into place (rename does not dereference an existing
 * symlink at the destination on POSIX — it replaces the link itself — so
 * this is safe even under a TOCTOU race, but we still reject explicitly for
 * a clear error rather than silently replacing a symlink with a real file).
 */
async function safeWriteFile(vendorRootReal, destRelPath, content) {
  const parts = destRelPath.split(path.sep);
  const fileName = parts.pop();
  const safeDir = await safeResolveDir(vendorRootReal, parts);
  const finalPath = path.join(safeDir, fileName);

  const rejectIfUnsafeExisting = async () => {
    try {
      const st = await lstat(finalPath);
      if (st.isSymbolicLink() || !st.isFile()) {
        throw new Error(`Refusing to overwrite a non-regular-file destination (symlink or special file): ${finalPath}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error; // ENOENT = doesn't exist yet, fine
    }
  };
  await rejectIfUnsafeExisting();

  const tmpPath = path.join(safeDir, `.refresh-audit-tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await writeFile(tmpPath, content);
  try {
    await rejectIfUnsafeExisting(); // re-check right before the atomic swap (TOCTOU guard)
    await rename(tmpPath, finalPath);
  } catch (error) {
    await unlinkSafe(tmpPath);
    throw error;
  }
  return finalPath;
}

async function unlinkSafe(p) {
  try {
    await unlink(p);
  } catch { /* best-effort cleanup */ }
}

/** Reads a live source file, REJECTING if it (after resolving all symlinks)
 * resolves outside `liveRootReal` — a symlink inside a "live" tree pointing
 * elsewhere must never be read and copied into vendor as if it were real
 * upstream content. */
async function safeReadLiveFile(liveRootReal, srcPath) {
  let srcReal;
  try {
    srcReal = await realpath(srcPath);
  } catch (error) {
    throw new Error(`Cannot resolve live source path: ${srcPath} (${error.code ?? error.message})`);
  }
  const rel = path.relative(liveRootReal, srcReal);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Refusing to read a live source that escapes the live root via symlink: ${srcPath} -> ${srcReal}`);
  }
  return readFile(srcReal);
}

/** Copies one category's onlyLive+changed files from live to vendor for
 * real, using `safeReadLiveFile`/`safeWriteFile` throughout — no path,
 * source, or destination in this function is ever trusted at face value;
 * every component is verified. Exported indirectly via `refreshFromLive`;
 * tests exercise it through that same public entry point. */
async function applyCategory(cat, liveRoot, vendorRoot, vendorRootReal, liveRootReal, comparison) {
  const copied = [];
  const toCopy = [...comparison.onlyLive, ...comparison.changed];
  const pairs =
    cat.type === "docPairs"
      ? cat.pairs.filter(([, vendorRel]) => toCopy.includes(vendorRel)).map(([liveRel, vendorRel]) => [path.join(liveRoot, liveRel), vendorRel])
      : toCopy.map((rel) => [path.join(liveRoot, cat.liveRel, rel), path.join(cat.vendorRel, rel)]);
  for (const [src, destRel] of pairs) {
    const content = await safeReadLiveFile(liveRootReal, src);
    const finalPath = await safeWriteFile(vendorRootReal, destRel, content);
    copied.push(path.relative(vendorRoot, finalPath));
  }
  return copied;
}

/**
 * Verifies `candidatePath` is a real (non-symlink) regular file that lives
 * inside the canonical `vendor/shotcraft/scripts/` directory of THIS repo
 * checkout — never trusts the path string at face value. Used to gate the
 * one place this script executes external code (`node <builder>`), so an
 * attacker-controlled symlink planted anywhere (including inside a test's
 * disposable vendorRoot, which this function deliberately ignores) can never
 * cause arbitrary code execution.
 */
async function resolveTrustedBuilderPath(candidatePath) {
  let st;
  try {
    st = await lstat(candidatePath);
  } catch (error) {
    throw new Error(`Audio builder script not found: ${candidatePath} (${error.code ?? error.message})`);
  }
  if (st.isSymbolicLink() || !st.isFile()) {
    throw new Error(`Refusing to execute a symlinked or non-regular-file audio builder script: ${candidatePath}`);
  }
  const real = await realpath(candidatePath);
  const canonicalScriptsDirReal = await realpath(path.join(VENDOR_ROOT, "scripts"));
  const rel = path.relative(canonicalScriptsDirReal, real);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Refusing to execute an audio builder script outside the canonical vendor/shotcraft/scripts directory: ${candidatePath} -> ${real}`);
  }
  return real;
}

/** Lstat-based walk that NEVER follows a symlink: a symlinked entry (file or
 * directory) is reported as a leaf in its own right, never recursed into —
 * so a directory symlink planted inside `audio/` can't smuggle the walk
 * outside the tree, and every returned path is guaranteed to be physically
 * inside `dir` by construction (built lexically, never via realpath). Every
 * leaf carries `isRegular` (`lstat().isFile()`) alongside `isSymlink`, so a
 * FIFO/socket/device/etc. — which is neither a symlink nor a regular file —
 * is distinguishable from an ordinary file by its caller, not silently
 * treated as one. */
async function walkNoFollowSymlink(dir, base = dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const st = await lstat(full);
    if (st.isSymbolicLink()) out.push({ rel: path.relative(base, full), isSymlink: true, isRegular: false, full });
    else if (st.isDirectory()) await walkNoFollowSymlink(full, base, out);
    else out.push({ rel: path.relative(base, full), isSymlink: false, isRegular: st.isFile(), full });
  }
  return out;
}

// Only these extensions are ever eligible for stale-binary pruning — this is
// an AUDIO BINARY cleanup, not a general "delete whatever isn't allowlisted"
// sweep. `manifest.json` and any non-audio file (README, NOTICE, future docs)
// are never touched, matched by extension, not by an allowlist exclusion
// (i.e. even an accidental gap in `allow` can never cause a doc deletion).
const PRUNABLE_AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]);

/**
 * Strict-allowlist cleanup: after a real audio refresh, `manifest` (the
 * freshly-merged `audio/manifest.json`) is the single source of truth for
 * which binaries are currently approved. Any AUDIO BINARY file (by
 * extension — see `PRUNABLE_AUDIO_EXTENSIONS`) physically present under
 * `vendorRoot/audio` that is NOT exactly one of `manifest.sfx[].path` /
 * `manifest.bgm[].path` is stale and gets removed — this is what actually
 * purges a binary that was approved on a previous refresh and has since
 * transitioned to quarantined (or vanished from ATTRIBUTION.md entirely):
 * the manifest JSON alone already reflects that correctly, but without this
 * step the stale binary bytes silently linger on disk, contradicting the
 * manifest. `manifest.json` and every non-audio-extension file (docs, etc.)
 * are always kept, unconditionally, regardless of the allowlist.
 *
 * Two-pass, fail-closed: pass 1 walks the whole tree WITHOUT deleting
 * anything and throws immediately if it finds a symlink or non-regular file
 * anywhere under `audio/` — a symlink there is never something
 * `safeWriteFile` creates, so its mere presence means something is wrong,
 * and this function must never partially clean up before discovering that.
 * Only once pass 1 confirms the whole tree is plain regular files does pass
 * 2 unlink the stale ones. This guarantees: on a symlink/special-file
 * finding, ZERO files are removed (not even the legitimately stale ones),
 * and whatever the symlink points at outside `vendorRoot` is never touched
 * (pass 1 never dereferences it — `lstat` only, no `readFile`/`realpath`
 * follow-through).
 */
async function pruneStaleAudioBinaries(vendorRootReal, manifest) {
  const audioDirReal = path.join(vendorRootReal, "audio");
  const allow = new Set(["manifest.json"]);
  for (const s of manifest?.sfx ?? []) allow.add(s.path);
  for (const b of manifest?.bgm ?? []) allow.add(b.path);

  const entries = await walkNoFollowSymlink(audioDirReal);

  // Pass 1: validate only — no mutation. Fail closed on the first symlink or
  // non-regular file (FIFO/socket/device/etc. — isRegular is false for all
  // of these, not just symlinks) found anywhere under audio/, before
  // touching anything.
  for (const entry of entries) {
    if (entry.isSymlink || !entry.isRegular) {
      const kind = entry.isSymlink ? "symlink" : "non-regular file (FIFO/socket/device/etc.)";
      throw new Error(`Refusing to prune stale audio binaries: unexpected ${kind} found under vendor audio/ (never created by safeWriteFile, treated as tampering, nothing removed): ${entry.rel}`);
    }
  }

  // Pass 2: only plain regular files remain possible at this point. Remove
  // exactly the ones that are (a) an audio binary by extension and (b) not
  // in the current approved allowlist.
  const removed = [];
  for (const entry of entries) {
    const ext = path.extname(entry.rel).toLowerCase();
    if (!PRUNABLE_AUDIO_EXTENSIONS.has(ext)) continue; // never touch manifest.json or any doc
    if (allow.has(entry.rel)) continue; // still approved — keep
    await unlink(entry.full);
    removed.push(entry.rel);
  }
  return { removed };
}

/**
 * The real, testable refresh implementation. Compares every mapped category
 * between `liveRoot` and `vendorRoot`; with `apply: true`, copies
 * new/changed files for real (never deletes vendor-only files — those are
 * only ever reported, matching the "don't silently remove" policy), then
 * runs the real `build-audio-manifest.mjs` (quarantine-aware, unchanged
 * logic) against `vendorRoot`'s audio subtree. Never touches anything
 * outside `vendorRoot` — every write is path-containment-checked.
 */
export async function refreshFromLive(liveRoot, vendorRoot, { apply = false } = {}) {
  await mkdir(vendorRoot, { recursive: true });
  const vendorRootReal = await realpath(vendorRoot);
  const liveRootReal = await realpath(liveRoot);
  const categories = [];
  for (const cat of CATEGORY_MAPPINGS) {
    const comparison = await compareCategory(cat, liveRoot, vendorRoot);
    let copied = [];
    if (apply && (comparison.onlyLive.length || comparison.changed.length)) {
      copied = await applyCategory(cat, liveRoot, vendorRoot, vendorRootReal, liveRootReal, comparison);
    }
    categories.push({ ...comparison, copied });
  }

  let audio = { ran: false };
  const liveAudioAttribution = path.join(liveRoot, "assets/audio/ATTRIBUTION.md");
  if (apply && existsSync(liveAudioAttribution)) {
    // SAFETY (two independent layers): build-audio-manifest.mjs itself is
    // now hardened (safe category/filename validation, realpath-contained
    // source reads, lexical-containment destination writes — see that
    // file's own header comment), so it is safe to run directly against a
    // real destination. This function still runs it into a throwaway
    // mkdtemp scratch directory rather than vendorRoot directly, and merges
    // the result through safeWriteFile — defense in depth, not a
    // compensation for a known-unsafe builder: even if a future change to
    // the builder regressed its own containment, this outer scratch+merge
    // layer would still catch it before anything reached vendorRoot. The
    // scratch dir is always removed, even on failure.
    const scratchRoot = await mkdtemp(path.join(os.tmpdir(), "shotcraft-audio-scratch-"));
    try {
      const builderPath = await resolveTrustedBuilderPath(CANONICAL_AUDIO_BUILDER_PATH);
      const { stdout } = await exec("node", [builderPath, liveRoot, scratchRoot]);
      const scratchAudioDir = path.join(scratchRoot, "audio");
      const scratchAudioReal = await realpath(scratchAudioDir);
      const audioFiles = await walkFiles(scratchAudioDir);
      const merged = [];
      for (const rel of audioFiles) {
        const content = await safeReadLiveFile(scratchAudioReal, path.join(scratchAudioDir, rel));
        const finalPath = await safeWriteFile(vendorRootReal, path.join("audio", rel), content);
        merged.push(path.relative(vendorRoot, finalPath));
      }
      const manifestPath = path.join(vendorRoot, "audio/manifest.json");
      const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : null;
      const pruneResult = await pruneStaleAudioBinaries(vendorRootReal, manifest);
      audio = {
        ran: true,
        log: stdout.trim(),
        mergedFileCount: merged.length,
        sfxCount: manifest?.sfx?.length ?? 0,
        bgmCount: manifest?.bgm?.length ?? 0,
        quarantinedCount: manifest?.quarantined?.length ?? 0,
        quarantinedFiles: manifest?.quarantined?.map((q) => q.file) ?? [],
        prunedStaleCount: pruneResult.removed.length,
        prunedStaleFiles: pruneResult.removed,
      };
    } finally {
      await rm(scratchRoot, { recursive: true, force: true });
    }
  } else if (!existsSync(liveAudioAttribution)) {
    audio = { ran: false, reason: "live root has no assets/audio/ATTRIBUTION.md (not a real Shotcraft checkout, or audio not present)" };
  }

  return { categories, audio };
}

function printCategory(r) {
  console.log(`\n[${r.label}] live=${r.liveCount} vendor=${r.vendorCount}`);
  if (r.onlyLive.length) console.log(`  chỉ có ở live (${r.onlyLive.length}): ${r.onlyLive.slice(0, 10).join(", ")}${r.onlyLive.length > 10 ? "…" : ""}`);
  if (r.onlyVendor.length) console.log(`  chỉ có ở vendor, live đã xóa (${r.onlyVendor.length}): ${r.onlyVendor.slice(0, 10).join(", ")}${r.onlyVendor.length > 10 ? "…" : ""}`);
  if (r.changed.length) console.log(`  nội dung khác nhau (${r.changed.length}): ${r.changed.slice(0, 10).join(", ")}${r.changed.length > 10 ? "…" : ""}`);
  if (r.copied?.length) console.log(`  ✓ đã copy ${r.copied.length} file`);
  if (!r.onlyLive.length && !r.onlyVendor.length && !r.changed.length) console.log("  giống hệt nhau");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const live = await getLiveRoot();

  console.log(`Vendor snapshot: ${VENDOR_ROOT}`);
  if (!live.ok) {
    console.log(`Live checkout: N/A — ${live.reason}`);
    console.log("Không thể so sánh live vs vendor lúc này. Số liệu vendor hiện tại:");
    const recipes = await walkFiles(path.join(VENDOR_ROOT, "shots"));
    const demos = (await walkFiles(path.join(VENDOR_ROOT, "demos"))).filter((f) => f.endsWith(".tsx"));
    const lib = await walkFiles(path.join(VENDOR_ROOT, "lib"));
    const audioManifest = JSON.parse(await readFile(path.join(VENDOR_ROOT, "audio/manifest.json"), "utf8"));
    console.log(`  recipes: ${recipes.length}, demo .tsx: ${demos.length}, lib files: ${lib.length}, audio sfx: ${audioManifest.sfx.length}, bgm: ${audioManifest.bgm.length}, quarantined: ${audioManifest.quarantined.length}`);
    return;
  }

  console.log(`Live checkout: ${live.root}`);
  const { categories, audio } = await refreshFromLive(live.root, VENDOR_ROOT, { apply });
  for (const r of categories) printCategory(r);

  console.log(`\n[audio]`);
  if (audio.ran) {
    console.log(`  ✓ chạy thật scripts/build-audio-manifest.mjs — ${audio.sfxCount} sfx, ${audio.bgmCount} bgm, ${audio.quarantinedCount} quarantined (${audio.quarantinedFiles.join(", ")})`);
    if (audio.prunedStaleCount) console.log(`  ✓ dọn ${audio.prunedStaleCount} audio binary lỗi thời không còn trong allowlist (strict approved-only, docs/manifest.json luôn giữ): ${audio.prunedStaleFiles.join(", ")}`);
  } else if (apply) {
    console.log(`  không chạy: ${audio.reason}`);
  } else {
    console.log(`  chưa chạy (chỉ chạy khi --apply) — dùng chính scripts/build-audio-manifest.mjs, giữ nguyên chính sách quarantine`);
  }

  const anyChange = categories.some((r) => r.onlyLive.length || r.onlyVendor.length || r.changed.length);
  if (!anyChange && !apply) {
    console.log("\n✓ Vendor đã khớp live ở mọi category đã map — không cần refresh.");
    return;
  }
  if (!apply) {
    console.log("\nCó khác biệt. Chạy lại với --apply để đồng bộ toàn bộ category ở trên (không xóa file vendor-only mà không hỏi; audio giữ nguyên chính sách quarantine).");
    return;
  }
  console.log("\n✓ --apply hoàn tất cho mọi category đã map (shots/demos/lib/gallery/jianying-export/docs/aifl-template/scripts-templates/audio).");
}

// Guard against running (and its side effects — reporting, or worse,
// --apply mutating the real vendor tree) merely from being imported, e.g. by
// a test file doing `import { refreshFromLive } from "../refresh-audit.mjs"`.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
}
