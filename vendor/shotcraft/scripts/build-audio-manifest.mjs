#!/usr/bin/env node
// One-off vendoring script: parses Shotcraft's ATTRIBUTION.md tables, splits
// files into "clear provenance" (vendored + copied) vs "quarantined" (URL
// unresolved — excluded from the copy, listed for the record only), and
// emits vendor/shotcraft/audio/manifest.json consumed by the audio-ducking
// helper and the integration report. Run once from repo root:
//   node vendor/shotcraft/scripts/build-audio-manifest.mjs <shotcraft-repo-path>
//
// HARDENING NOTE (local adaptation — the QUARANTINE set and the
// classification OUTCOME for every legitimately-formed row are unchanged;
// the code that reads ATTRIBUTION.md and copies files has been rewritten).
// Every row of ATTRIBUTION.md is untrusted input from a live checkout this
// repo does not control. A malicious `category` (e.g. `sfx/../../../tmp/`) or
// `file` (e.g. `../../../etc/evil.mp3`) column could otherwise make the
// original mkdir(recursive)/copyFile calls read or write outside both
// `assets/audio/` on the source side and the destination root on the write
// side. `category` must now be exactly one of the 16 recognized source SFX
// categories (a closed allowlist, not inferred from the input — see
// `KNOWN_SOURCE_SFX_CATEGORIES`); a non-quarantined row must additionally
// land in one of the 15 approved OUTPUT categories (`riser` is a real
// source category but every file under it is currently quarantined, so
// nothing is ever vendored there — see `APPROVED_OUTPUT_SFX_CATEGORIES`).
// `file` must be a bare basename matching a safe charset with a real audio
// extension —
// this alone closes traversal, since a traversal payload necessarily
// contains a path separator, which the filename pattern rejects outright.
// Source reads additionally canonicalize via `realpath` and reject anything
// that resolves outside `assets/audio/` (catches a symlinked intermediate
// directory, not just an unsafe filename). Destination writes go through
// the same lexical-containment/safe-component-mkdir/reject-symlink pattern
// used by `scripts/shotcraft/refresh-audit.mjs`'s `applyCategory`, including
// the caller-supplied destination root itself, which must already exist as
// a real (non-symlink) directory — this script never creates it, blindly
// recursive or otherwise.
//
// FAIL-CLOSED: the ENTIRE table is parsed first, with zero filesystem
// mutation (only ATTRIBUTION.md itself is read). If ANY row fails
// validation, this script throws (nonzero exit) before reading a single
// source file or writing a single destination file, and before
// manifest.json is written at all — it never emits a "successful" manifest
// that silently swallowed a traversal attempt. A row that is legitimately
// quarantined (its filename matches the hardcoded `QUARANTINE` set) is NOT
// a validation failure and never triggers this — quarantine is a normal,
// expected outcome; a malformed category/filename is not, and there is no
// `manifest.rejected[]` field, because a run that found one never produces
// a manifest at all.
import { readFile, writeFile, mkdir, lstat, realpath, rename, unlink } from "node:fs/promises";
import path from "node:path";

const QUARANTINE = new Set([
  "keyboard.mp3",
  "pop.mp3",
  "riser-cine.mp3",
  "sparkle.mp3",
  "whoosh-big.mp3",
  "bgm-tech-house.mp3",
]);

// Closed allowlist of the 16 categories that genuinely exist under real
// Shotcraft's assets/audio/sfx/<category>/ — used ONLY for structural
// validation of the `category` column (rejecting arbitrary/traversal
// values outright, never used to build a filesystem path before this
// check). This is a SOURCE-side taxonomy, not an approval list: "riser" is
// a real, recognized source category, but every file under it is currently
// hardcoded-quarantined (`riser-cine.mp3` is in `QUARANTINE` below), so
// nothing under "riser" is ever actually read or copied — see
// APPROVED_OUTPUT_SFX_CATEGORIES for what's actually allowed onto disk.
const KNOWN_SOURCE_SFX_CATEGORIES = new Set([
  "camera", "counter", "crowd", "data", "film", "fluid", "glass", "impact",
  "light", "mech", "paper", "riser", "scifi", "text", "transition", "ui",
]);

// Closed allowlist of the 15 categories this repo actually vendors to disk
// (144 sfx files today). A row is only ever copied if BOTH its category is
// a known source category AND (it is not quarantined implies) its category
// is also in this approved-OUTPUT set — see the parse-time guard below,
// which rejects (fail-closed) any non-quarantined row whose category is
// merely a known source category (e.g. a hypothetical future non-quarantined
// "riser" file) rather than silently vendoring into a new, unreviewed
// output directory.
const APPROVED_OUTPUT_SFX_CATEGORIES = new Set([
  "camera", "counter", "crowd", "data", "film", "fluid", "glass", "impact",
  "light", "mech", "paper", "scifi", "text", "transition", "ui",
]);

// Bare basename only: safe charset, must end in a real audio extension. No
// path separator can ever appear in a string this matches, which is what
// actually blocks "../../../evil.mp3"-style traversal in the filename column.
const SAFE_AUDIO_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(mp3|wav|m4a|aac|ogg|flac)$/;

function isKnownSourceCategory(category) {
  return KNOWN_SOURCE_SFX_CATEGORIES.has(category);
}
function isApprovedOutputCategory(category) {
  return APPROVED_OUTPUT_SFX_CATEGORIES.has(category);
}
function isSafeFilename(file) {
  return SAFE_AUDIO_FILENAME.test(file);
}

/** Resolves `rel` (already built from a validated category+filename, so it
 * contains no ".."/absolute segments) against `srcAudioRootReal`, rejecting
 * a symlinked final component outright and — via `realpath` containment —
 * rejecting a resolved path that escapes `assets/audio/` through a
 * symlinked INTERMEDIATE directory too (a plain lstat on the final
 * component alone would miss that case). */
async function resolveSafeSource(srcAudioRootReal, rel) {
  const candidate = path.join(srcAudioRootReal, rel);
  let st;
  try {
    st = await lstat(candidate);
  } catch (error) {
    throw new Error(`source not found: ${rel} (${error.code ?? error.message})`);
  }
  if (st.isSymbolicLink()) throw new Error(`refusing to read a symlinked source file: ${rel}`);
  if (!st.isFile()) throw new Error(`source is not a regular file: ${rel}`);
  const real = await realpath(candidate);
  const relCheck = path.relative(srcAudioRootReal, real);
  if (relCheck.startsWith("..") || path.isAbsolute(relCheck)) {
    throw new Error(`source resolves outside assets/audio/ (symlinked intermediate directory?): ${rel} -> ${real}`);
  }
  return real;
}

/** One destination path component under `parentReal` (itself already a
 * verified-real, non-symlink directory). Never `mkdir(recursive)` from an
 * unverified root — that call happily walks THROUGH an existing symlinked
 * intermediate directory. */
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
    throw new Error(`refusing to traverse into a non-directory or symlinked destination component: ${target}`);
  }
  return target;
}

async function safeResolveDestDir(destRootReal, relDirParts) {
  let current = destRootReal;
  for (const part of relDirParts) {
    if (part === "" || part === ".") continue;
    if (part === "..") throw new Error(`refusing '..' in a destination-relative path (parts: ${relDirParts.join("/")})`);
    current = await safeMkdirComponent(current, part);
  }
  return current;
}

/** Verifies the caller-supplied top-level destination root is safe: it MUST
 * already exist as a real (non-symlink) directory — this function never
 * creates it, recursively or otherwise. Both real call sites already
 * guarantee this: `refresh-audit.mjs` always passes a directory it just
 * created itself via `mkdtemp` (so it unconditionally exists before this
 * script ever runs), and the default (no override — a direct/manual
 * invocation) is this repo's own committed `vendor/shotcraft/` directory,
 * which also always exists. Requiring pre-existence rather than creating on
 * demand closes the one remaining way an unverified root could be walked
 * through: `mkdir({recursive:true})` from an untrusted, possibly-symlinked
 * ancestor. Returns the resolved real path, the trusted base every
 * subsequent write is lexically contained under. */
async function resolveSafeDestRoot(destRoot) {
  let st;
  try {
    st = await lstat(destRoot);
  } catch (error) {
    throw new Error(`destination root does not exist (this script never creates it — the caller must create it first, e.g. via mkdtemp): ${destRoot} (${error.code ?? error.message})`);
  }
  if (st.isSymbolicLink() || !st.isDirectory()) {
    throw new Error(`refusing to write into a symlinked or non-directory destination root: ${destRoot}`);
  }
  return realpath(destRoot);
}

/** Writes `content` to `destRootReal/relPath` safely: every intermediate
 * directory component is verified real/non-symlink; an existing destination
 * that is a symlink or any non-regular file is rejected outright (never
 * opened for writing); the write itself lands in a temp file in the same
 * verified-safe directory, then an atomic `rename()` into place. */
async function safeWriteFile(destRootReal, relPath, content) {
  const parts = relPath.split(path.sep);
  const fileName = parts.pop();
  const dir = await safeResolveDestDir(destRootReal, parts);
  const finalPath = path.join(dir, fileName);
  try {
    const st = await lstat(finalPath);
    if (st.isSymbolicLink() || !st.isFile()) {
      throw new Error(`refusing to overwrite a non-regular-file destination (symlink or special file): ${finalPath}`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const tmpPath = path.join(dir, `.build-audio-manifest-tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await writeFile(tmpPath, content);
  try {
    await rename(tmpPath, finalPath);
  } catch (error) {
    await unlink(tmpPath).catch(() => {});
    throw error;
  }
  return finalPath;
}

const srcRepo = process.argv[2];
const destVendorRootOverride = process.argv[3]; // optional — lets refresh-audit.mjs's refreshFromLive() target a disposable fixture vendor root in tests, instead of the real vendor/shotcraft/ always
if (!srcRepo) throw new Error("Usage: build-audio-manifest.mjs <shotcraft-repo-path> [destVendorRoot]");
const attrPath = path.join(srcRepo, "assets/audio/ATTRIBUTION.md");
const md = await readFile(attrPath, "utf8");

const rejected = [];
const sfxRows = [];
const bgmRows = [];
for (const line of md.split("\n")) {
  const m = line.match(/^\|\s*`([^`]+\.mp3)`\s*\|\s*`?([^|`]*)`?\s*\|([^|]*)\|([^|]*)\|/);
  if (!m) continue;
  const [, fileRaw, col2, col3, col4] = m;
  if (col2.trim().startsWith("sfx/")) {
    const file = fileRaw.trim();
    const category = col2.trim().replace(/^sfx\//, "").replace(/\/$/, "");
    if (!isSafeFilename(file)) {
      rejected.push({ file, role: "sfx", category, reason: "filename fails safe-basename validation (path separator, dot-segment, or unsupported extension)" });
      continue;
    }
    if (!isKnownSourceCategory(category)) {
      rejected.push({ file, role: "sfx", category, reason: "category is not one of the 16 recognized source SFX categories" });
      continue;
    }
    if (!QUARANTINE.has(file) && !isApprovedOutputCategory(category)) {
      rejected.push({ file, role: "sfx", category, reason: "category is a recognized source category but not one of the 15 approved OUTPUT categories, and the file is not quarantined — refusing to vendor into a new, unreviewed output category" });
      continue;
    }
    sfxRows.push({ file, category, source: col3.trim(), origin: col4.trim() });
  }
}
// BGM table has a different column layout (文件名/原曲名/艺术家/风格/BPM/URL) — re-scan separately.
const bgmSection = md.split("## bgm/")[1] ?? "";
for (const line of bgmSection.split("\n")) {
  const m = line.match(/^\|\s*`([^`]+\.mp3)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/);
  if (!m) continue;
  const [, fileRaw, title, artist, genre, bpm, url] = m;
  const file = fileRaw.trim();
  if (!isSafeFilename(file)) {
    rejected.push({ file, role: "bgm", reason: "filename fails safe-basename validation (path separator, dot-segment, or unsupported extension)" });
    continue;
  }
  bgmRows.push({ file, title: title.trim(), artist: artist.trim(), genre: genre.trim(), bpm: bpm.trim(), url: url.trim() });
}

// FAIL-CLOSED: parsing is complete and nothing has been read from or
// written to any file yet other than ATTRIBUTION.md itself. If anything
// failed structural validation, stop here — never proceed to read a source
// file or write a destination file, and never emit a manifest that silently
// dropped a traversal attempt while reporting success.
if (rejected.length > 0) {
  throw new Error(
    `Refusing to run: ${rejected.length} row(s) in ATTRIBUTION.md failed safe category/filename validation — ` +
    `nothing was read or written. ${rejected.map((r) => `${r.file} (${r.reason})`).join("; ")}`,
  );
}

const destBase = destVendorRootOverride ?? path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const destBaseReal = await resolveSafeDestRoot(destBase);
const destAudioRootReal = await safeResolveDestDir(destBaseReal, ["audio"]);
const srcAudioRootReal = await realpath(path.join(srcRepo, "assets/audio"));

const manifest = { sfx: [], bgm: [], quarantined: [] };

for (const row of sfxRows) {
  const rel = path.join("sfx", row.category, row.file);
  if (QUARANTINE.has(row.file)) {
    manifest.quarantined.push({ file: row.file, role: "sfx", category: row.category, reason: "unresolved source URL in ATTRIBUTION.md — excluded from vendoring per provenance policy" });
    continue;
  }
  const srcReal = await resolveSafeSource(srcAudioRootReal, rel);
  const content = await readFile(srcReal);
  await safeWriteFile(destAudioRootReal, rel, content);
  manifest.sfx.push({ file: row.file, path: rel, category: row.category, license: "Mixkit Sound Effects Free License", sourceUrl: row.origin.includes("http") ? row.origin : null });
}

for (const row of bgmRows) {
  const rel = path.join("bgm", row.file);
  if (QUARANTINE.has(row.file)) {
    manifest.quarantined.push({ file: row.file, role: "bgm", reason: "unresolved source track in ATTRIBUTION.md — excluded from vendoring per provenance policy" });
    continue;
  }
  const srcReal = await resolveSafeSource(srcAudioRootReal, rel);
  const content = await readFile(srcReal);
  await safeWriteFile(destAudioRootReal, rel, content);
  manifest.bgm.push({ file: row.file, path: rel, title: row.title, artist: row.artist, genre: row.genre, bpm: row.bpm.replace(/[^0-9]/g, ""), license: "Mixkit Stock Music Free License", sourceUrl: row.url.includes("http") ? row.url : null });
}

await safeWriteFile(
  destAudioRootReal,
  "manifest.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), source: "video-shotcraft assets/audio/ATTRIBUTION.md", ...manifest }, null, 2),
);

console.log(`sfx vendored: ${manifest.sfx.length}, bgm vendored: ${manifest.bgm.length}, quarantined: ${manifest.quarantined.length}`);
