#!/usr/bin/env node
// GUARDED OPTIONAL adapter over vendor/shotcraft/jianying-export/*.py — NEVER
// invoked by the default pipeline (no code path in the skill/validator calls
// this automatically). JianYing (CapCut China) draft export writes into a
// REAL local editing-app data directory (`~/Movies/JianyingPro/...` on Mac,
// `%LOCALAPPDATA%\JianyingPro\...` on Windows) and mutates that app's own
// project library — a real, hard-to-reverse action on shared local state,
// not something to run silently. It also embeds device-fingerprint fields
// in the generated draft (documented privacy warning in mac_draft.py) that
// must never be distributed to a third party.
//
// TWO distinct source shapes exist, handled by TWO distinct functions —
// never conflate them:
//   1. RAW pyJianYingDraft staging (`draft_content.json` + `draft_meta_info.json`,
//      real media paths, no `draft_info.json` yet) → `macifyAndInstall()`,
//      which runs the real macify() → install() chain: macify() bundles real
//      media, derives real duration/materials_size/draft_id/timestamps from
//      the actual content, resolves a device fingerprint (donor draft or an
//      explicit, non-default opt-in), and its RETURNED info (never fabricated)
//      is what install() receives.
//   2. ALREADY-MACIFIED draft (`draft_info.json` already present) →
//      `applyInstall()`, which DERIVES real info from that draft's own
//      `draft_info.json`/`draft_meta_info.json` content (duration from the
//      content JSON, materials_size from a real `Resources/` byte count,
//      draft_id from the meta JSON) — it never fabricates zero/placeholder
//      metadata; a field it cannot derive and the caller does not explicitly
//      supply causes a hard failure, not a silent zero.
//
// Fingerprint policy (mirrors mac_draft.py's own default exactly — this
// adapter does not loosen it): by default, NO fingerprint source means
// macifyAndInstall() fails closed (same as calling macify() with
// allow_missing_fingerprint=False, the source's own default). Passing a
// `donorDraft` (a real plaintext draft path) or explicitly setting
// `allowMissingFingerprint: true` are the ONLY ways around that, and both
// must be requested by name — never inferred or defaulted to "on".
//
// Usage:
//   node scripts/shotcraft/jianying-export-adapter.mjs validate <draftName>
//   node scripts/shotcraft/jianying-export-adapter.mjs install <draftDir> <draftName> --i-understand-this-writes-to-my-jianying-library [--apply]
//
// Platform support: implemented and exercised (real Python macify()/install()
// calls, against temp fixture roots — see __tests__/jianying-export-adapter.test.mjs)
// on macOS via mac_draft.py. Windows uses the structurally different
// windows_draft.py (no `info`/fingerprint step at all — see applyInstall's
// Windows branch) but has NOT been run on real Windows hardware from this
// adapter — no Windows machine was available in this environment. Treat the
// Windows path as implemented-but-unverified, not as tested.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const JIANYING_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../vendor/shotcraft/jianying-export");
const CONFIRM_FLAG = "--i-understand-this-writes-to-my-jianying-library";

function platformScript() {
  if (process.platform === "darwin") return { module: "mac_draft", isWin: false };
  if (process.platform === "win32") return { module: "windows_draft", isWin: true };
  throw new Error(`jianying-export is only supported on macOS/Windows (got ${process.platform})`);
}

function defaultDraftRoot() {
  if (process.platform === "darwin") return path.join(os.homedir(), "Movies/JianyingPro/User Data/Projects/com.lveditor.draft");
  return path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData/Local"), "JianyingPro/User Data/Projects/com.lveditor.draft");
}

// -B (no bytecode) + PYTHONDONTWRITEBYTECODE=1 (belt-and-suspenders in case a
// caller's environment strips CLI flags before exec) — this adapter imports
// mac_draft/windows_draft directly from the vendored, license-tracked tree,
// so a stray __pycache__/*.pyc there must never happen, not even once.
async function runPython(py) {
  try {
    const { stdout } = await exec("python3", ["-B", "-c", py], {
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    });
    return { ok: true, stdout: stdout.trim() };
  } catch (error) {
    return { ok: false, reason: String(error.stderr ?? error.message).trim() };
  }
}

/** Dry-run: validates a draft name against the SAME path-escape logic the
 * real installer uses, without touching any real JianYing directory unless
 * `draftRoot` is left at its default AND the caller intends a real check —
 * pass an explicit `draftRoot` (e.g. a temp dir) to keep this fully sandboxed. */
export async function validateDraftName(draftName, { draftRoot } = {}) {
  const { module, isWin } = platformScript();
  const root = draftRoot ?? path.join(os.tmpdir(), "jianying-export-dry-run-probe");
  const py = [
    `import sys; sys.path.insert(0, ${JSON.stringify(JIANYING_DIR)})`,
    `import ${module} as m`,
    isWin
      ? `print(m._validate_draft_name(${JSON.stringify(draftName)}, ${JSON.stringify(root)}))`
      : `m.DRAFT_ROOT = ${JSON.stringify(root)}; print(m._validate_draft_name(${JSON.stringify(draftName)}))`,
  ].join("\n");
  const result = await runPython(py);
  return result.ok ? { ok: true, resolvedPath: result.stdout } : result;
}

/** Sums real file sizes under `dir` (best-effort — 0 if the dir doesn't
 * exist, which is a legitimate "no bundled media" case, not an error). */
async function realDirByteSize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? await realDirByteSize(full) : (await stat(full)).size;
  }
  return total;
}

/**
 * ALREADY-MACIFIED draft path: `draftDir` must already contain a real
 * `draft_info.json` (mac_draft's Mac-native entry file). Derives `info`
 * fields from that draft's OWN real content rather than fabricating
 * placeholders — `duration` from the content JSON's `duration` field,
 * `materials_size` from a real byte-count of `draftDir/Resources/`,
 * `draft_id` from `draft_meta_info.json` if present alongside. Any field
 * that cannot be derived AND is not explicitly supplied via `trustedInfo`
 * causes a hard failure — never silently defaults to 0/placeholder.
 */
export async function applyInstall(draftDir, draftName, { draftRoot, trustedInfo } = {}) {
  if (!existsSync(draftDir)) return { ok: false, reason: `draftDir does not exist: ${draftDir}` };
  const infoJsonPath = path.join(draftDir, "draft_info.json");
  if (!existsSync(infoJsonPath)) {
    return { ok: false, reason: `draftDir does not look like an already-macified JianYing draft (missing draft_info.json) — if this is a RAW pyJianYingDraft staging dir (draft_content.json + draft_meta_info.json, no draft_info.json yet), use macifyAndInstall() instead: ${draftDir}` };
  }
  const { module, isWin } = platformScript();
  const root = draftRoot ?? defaultDraftRoot();

  let derivedDuration, derivedDraftId;
  try {
    const content = JSON.parse(await readFile(infoJsonPath, "utf8"));
    derivedDuration = content.duration;
  } catch (error) {
    return { ok: false, reason: `draft_info.json exists but is not valid JSON: ${error.message}` };
  }
  const metaJsonPath = path.join(draftDir, "draft_meta_info.json");
  if (existsSync(metaJsonPath)) {
    try {
      const meta = JSON.parse(await readFile(metaJsonPath, "utf8"));
      derivedDraftId = meta.draft_id;
    } catch { /* meta is optional context — absence/corruption falls through to trustedInfo/failure below */ }
  }

  const draftId = trustedInfo?.draft_id ?? derivedDraftId;
  const duration = trustedInfo?.duration ?? derivedDuration;
  if (!draftId) return { ok: false, reason: "could not derive draft_id from draft_meta_info.json and no trustedInfo.draft_id was supplied — refusing to fabricate one" };
  if (duration === undefined || duration === null) return { ok: false, reason: "could not derive duration from draft_info.json and no trustedInfo.duration was supplied — refusing to fabricate one" };

  const resolvedInfo = {
    fold_path: path.join(root, draftName),
    draft_id: draftId,
    duration,
    materials_size: trustedInfo?.materials_size ?? (await realDirByteSize(path.join(draftDir, "Resources"))),
    tm: trustedInfo?.tm ?? Math.floor(Date.now() * 1000), // "now" is a legitimate real timestamp, not fabricated identity data
  };

  const py = isWin
    ? [
        // windows_draft.install() has a DIFFERENT signature from mac_draft's
        // (no `info` dict at all — Windows JianYing scans the draft folder
        // itself); pass draft_root positionally, skip media bundling
        // (bundle=False) since this whole platform path is unverified on
        // real Windows hardware — don't compound an untested code path with
        // an untested media-copy side effect.
        `import sys; sys.path.insert(0, ${JSON.stringify(JIANYING_DIR)})`,
        `import ${module} as m`,
        `bak = m.install(${JSON.stringify(draftDir)}, ${JSON.stringify(draftName)}, ${JSON.stringify(root)}, bundle=False)`,
        `print(bak)`,
      ].join("\n")
    : [
        `import sys; sys.path.insert(0, ${JSON.stringify(JIANYING_DIR)})`,
        `import ${module} as m`,
        `m.DRAFT_ROOT = ${JSON.stringify(root)}`,
        `m.ROOT_META = ${JSON.stringify(path.join(root, "root_meta_info.json"))}`,
        `bak = m.install(${JSON.stringify(draftDir)}, ${JSON.stringify(draftName)}, ${JSON.stringify(resolvedInfo)})`,
        `print(bak)`,
      ].join("\n");
  const result = await runPython(py);
  return result.ok ? { ok: true, registryBackup: result.stdout, draftRoot: root, info: resolvedInfo } : result;
}

/**
 * RAW pyJianYingDraft staging path (macOS only — mac_draft.py has no
 * Windows equivalent of macify(), Windows drafts don't need this step):
 * `rawDraftDir` must contain `draft_content.json` + `draft_meta_info.json`
 * (pyJianYingDraft's own output format) with real media paths. Runs the
 * REAL macify() → install() chain in one Python process so info flows
 * directly from macify()'s return value into install() without ever
 * touching Node-side fabricated data.
 *
 * Fingerprint (`platform.device_id` etc.) resolution follows mac_draft.py's
 * own default EXACTLY: fails closed unless `donorDraft` (a real plaintext
 * draft to copy the fingerprint from) or `allowMissingFingerprint: true`
 * (mac_draft's own documented "experimental, at your own risk" escape
 * hatch) is explicitly passed — this adapter adds no additional default-on
 * behavior beyond what the vendored script itself allows.
 */
export async function macifyAndInstall(rawDraftDir, draftName, { draftRoot, bundleMedia = true, donorDraft, allowMissingFingerprint = false } = {}) {
  if (!existsSync(rawDraftDir)) return { ok: false, reason: `rawDraftDir does not exist: ${rawDraftDir}` };
  if (!existsSync(path.join(rawDraftDir, "draft_content.json")) || !existsSync(path.join(rawDraftDir, "draft_meta_info.json"))) {
    return { ok: false, reason: `rawDraftDir does not look like a raw pyJianYingDraft staging dir (needs both draft_content.json and draft_meta_info.json): ${rawDraftDir}` };
  }
  if (process.platform !== "darwin") return { ok: false, reason: "macifyAndInstall is macOS-only (mac_draft.py's macify() has no Windows equivalent)" };
  const root = draftRoot ?? defaultDraftRoot();

  const py = [
    `import sys; sys.path.insert(0, ${JSON.stringify(JIANYING_DIR)})`,
    `import mac_draft as m`,
    `m.DRAFT_ROOT = ${JSON.stringify(root)}`,
    `m.ROOT_META = ${JSON.stringify(path.join(root, "root_meta_info.json"))}`,
    `info = m.macify(${JSON.stringify(rawDraftDir)}, ${JSON.stringify(draftName)}, bundle_media=${bundleMedia ? "True" : "False"}, donor_draft=${donorDraft ? JSON.stringify(donorDraft) : "None"}, allow_missing_fingerprint=${allowMissingFingerprint ? "True" : "False"})`,
    `bak = m.install(${JSON.stringify(rawDraftDir)}, ${JSON.stringify(draftName)}, info)`,
    `import json; print(json.dumps({"backup": bak, "info": info}))`,
  ].join("\n");
  const result = await runPython(py);
  if (!result.ok) return result;
  try {
    const parsed = JSON.parse(result.stdout);
    return { ok: true, registryBackup: parsed.backup, info: parsed.info, draftRoot: root };
  } catch {
    return { ok: false, reason: `macify/install ran but returned unparseable output: ${result.stdout}` };
  }
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "validate") {
    const result = await validateDraftName(args[0]);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (cmd === "install" || cmd === "install-raw") {
    if (!args.includes(CONFIRM_FLAG)) {
      console.error(`Refusing to run: install writes into your real JianYing library${cmd === "install-raw" ? " and bundles real media into it" : ""}. Pass ${CONFIRM_FLAG} to proceed, and --apply to actually write (otherwise this only validates).`);
      process.exitCode = 1;
      return;
    }
    const [draftDir, draftName] = args;
    if (!args.includes("--apply")) {
      const result = await validateDraftName(draftName);
      console.log("Dry-run only (pass --apply to actually install):", JSON.stringify(result, null, 2));
      return;
    }
    if (cmd === "install-raw") {
      const donorIdx = args.indexOf("--donor-draft");
      const donorDraft = donorIdx >= 0 ? args[donorIdx + 1] : undefined;
      const allowMissingFingerprint = args.includes("--allow-missing-fingerprint");
      if (donorIdx >= 0 && !donorDraft) {
        console.error("--donor-draft requires a path argument");
        process.exitCode = 1;
        return;
      }
      if (donorDraft && !existsSync(donorDraft)) {
        console.error(`--donor-draft path does not exist: ${donorDraft}`);
        process.exitCode = 1;
        return;
      }
      if (allowMissingFingerprint) {
        console.error("[warn] --allow-missing-fingerprint: EXPERIMENTAL, at your own risk (mac_draft.py's own words) — the installed draft may be silently rejected by JianYing on load. Prefer --donor-draft <a real plaintext draft path> whenever one is available.");
      }
      const result = await macifyAndInstall(draftDir, draftName, { donorDraft, allowMissingFingerprint });
      console.log(JSON.stringify(result, null, 2));
      if (!result.ok) process.exitCode = 1;
      return;
    }
    const result = await applyInstall(draftDir, draftName);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }
  console.error(
    "Usage: jianying-export-adapter.mjs <validate <name> | install <dir> <name> " + CONFIRM_FLAG + " [--apply] | " +
    "install-raw <dir> <name> " + CONFIRM_FLAG + " [--apply] [--donor-draft <path>] [--allow-missing-fingerprint]>",
  );
  process.exitCode = 1;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) main();
