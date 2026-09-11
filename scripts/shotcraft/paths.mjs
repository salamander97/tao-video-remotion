import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { readFile } from "node:fs/promises";

const CONFIG_FILE = path.join(os.homedir(), ".tao-video-suite", "config.json");

/**
 * Resolves the Shotcraft source root: prefers a live checkout configured via
 * `shotcraftRepo` in config.json (fresher, has binary previews too) when the
 * path actually exists on disk right now; falls back to the vendored
 * snapshot at `vendor/shotcraft/` otherwise. Never silently mixes the two —
 * every resolved card records which root ("live" | "vendored") it came from.
 */
export async function resolveShotcraftRoot(repoRoot) {
  let live;
  try {
    const config = JSON.parse(await readFile(CONFIG_FILE, "utf8"));
    live = config.shotcraftRepo;
  } catch {
    /* no config or no shotcraftRepo set — fall through to vendored */
  }
  if (live && existsSync(live)) {
    return { root: live, source: "live" };
  }
  const vendored = path.join(repoRoot, "vendor", "shotcraft");
  if (!existsSync(vendored)) {
    throw new Error(`Không tìm thấy Shotcraft: cả shotcraftRepo (${live ?? "chưa cấu hình"}) lẫn vendored snapshot (${vendored}) đều không tồn tại`);
  }
  return { root: vendored, source: "vendored" };
}

/** library.json lives at `gallery/api/library.json` in both a live checkout
 * and the vendored snapshot — kept symmetric on purpose so a verbatim-copied
 * `workbench/` (which hardcodes this relative path) works against either
 * root without source edits. */
export function libraryJsonPath(root) {
  return path.join(root, "gallery/api/library.json");
}

/** A recipe's `source` field (from library.json) is always the LIVE-repo
 * relative path `references/shots/<cat>/<name>.md`. The vendored snapshot
 * dropped the `references/` prefix (kept `shots/...` as-is). */
export function recipeDiskPath(root, source, entrySourceField) {
  return path.join(root, source === "live" ? entrySourceField : entrySourceField.replace(/^references\//, ""));
}

/** A demo path parsed out of a recipe's "参考实现" section is always the
 * LIVE-repo relative path `demos/<cat>/<name>/<Name>.tsx`. The vendored
 * snapshot kept the same `demos/...` layout, so both roots resolve the same
 * way — no prefix-stripping needed here (unlike recipes). */
export function demoDiskPath(root, demoRelPath) {
  return path.join(root, demoRelPath);
}
