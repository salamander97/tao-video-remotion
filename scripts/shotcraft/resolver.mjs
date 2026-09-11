import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolveShotcraftRoot, recipeDiskPath, demoDiskPath } from "./paths.mjs";
import { loadCatalog } from "./catalog.mjs";

/**
 * Recipe "参考实现" sections use two observed formats (verified against
 * multiple real recipes — do not assume a single format holds for all 157):
 *   (a) one line with the FULL path: `demos/<cat>/<name>/<Name>.tsx`
 *   (b) a directory line `demos/<cat>/<name>/` followed by a parenthetical
 *       list of sibling filenames: `（CrashImpactReal.tsx / CrashZoomReal.tsx）`
 * This walks the section line-by-line tracking the most recent directory so
 * format (b)'s bare filenames resolve to full paths.
 */
export function parseDemoPaths(section) {
  const results = [];
  let currentDir = null;
  for (const line of section.split("\n")) {
    const fullPathMatches = [...line.matchAll(/demos\/[\w-]+\/[\w-]+\/[\w.]+\.tsx/g)].map((m) => m[0]);
    if (fullPathMatches.length) {
      results.push(...fullPathMatches);
      currentDir = fullPathMatches[0].slice(0, fullPathMatches[0].lastIndexOf("/") + 1);
      continue;
    }
    const dirMatch = line.match(/demos\/[\w-]+\/[\w-]+\//);
    if (dirMatch) currentDir = dirMatch[0];
    if (currentDir) {
      const bareFiles = [...line.matchAll(/[A-Za-z][\w]*\.tsx/g)].map((m) => m[0]);
      for (const f of bareFiles) results.push(currentDir + f);
    }
  }
  return results;
}

/**
 * Resolves ONE card end-to-end: library entry → recipe .md (verbatim) →
 * every demo .tsx the recipe's own "参考实现"/reference-implementation
 * section points at (verbatim). This is a HARD GATE: any missing piece
 * returns `{ ok: false, reason }` and the caller MUST NOT proceed to write
 * JSX inferring the card from its name/category alone — that is exactly the
 * failure mode this resolver exists to prevent (see SKILL.md mandate #6 and
 * the tao-video-remotion workflow rewrite that requires calling this before
 * setting `scene.shotCard`).
 */
export async function resolveShotcraftCard(repoRoot, cardName) {
  const { root, source } = await resolveShotcraftRoot(repoRoot);
  const { cards } = await loadCatalog(repoRoot);
  const entry = cards.find((c) => c.name === cardName);
  if (!entry) {
    return { ok: false, reason: `Không tìm thấy card "${cardName}" trong catalog 157 card (kiểm tra chính tả hoặc dùng searchCards)`, source };
  }

  const recipePath = recipeDiskPath(root, source, entry.source);
  if (!existsSync(recipePath)) {
    return { ok: false, reason: `Card "${cardName}" có trong library.json nhưng thiếu file recipe tại ${recipePath}`, entry, source };
  }
  const recipeMd = await readFile(recipePath, "utf8");

  const implSection = recipeMd.split(/^##\s*参考实现/m)[1];
  if (!implSection) {
    return { ok: false, reason: `Recipe "${cardName}" không có mục "参考实现" (reference implementation) — không có đường dẫn demo để tra`, entry, recipePath, recipeMd, source };
  }
  const uniqueDemoRelPaths = [...new Set(parseDemoPaths(implSection.split(/^##\s/m)[0]))];
  if (!uniqueDemoRelPaths.length) {
    return { ok: false, reason: `Recipe "${cardName}" có mục tham chiếu nhưng không parse được đường dẫn demos/**/*.tsx nào`, entry, recipePath, recipeMd, source };
  }

  const demoFiles = [];
  for (const rel of uniqueDemoRelPaths) {
    const diskPath = demoDiskPath(root, rel);
    if (!existsSync(diskPath)) {
      return { ok: false, reason: `Recipe "${cardName}" trỏ tới demo ${rel} nhưng file không tồn tại tại ${diskPath}`, entry, recipePath, recipeMd, source };
    }
    demoFiles.push({ path: rel, diskPath, content: await readFile(diskPath, "utf8") });
  }

  return { ok: true, entry, recipePath, recipeMd, demoFiles, source, resolvedAt: new Date().toISOString() };
}
