#!/usr/bin/env node
// Agent-facing CLI over scripts/shotcraft/{catalog,resolver}.mjs. Always run
// this BEFORE writing scene.shotCard in a visual-plan — never pick a card
// name from memory of the vertical-shot-library.md table without resolving
// it here first, since the table only lists 17 curated starting points out
// of the full 157-card catalog.
//
// Usage:
//   node scripts/shotcraft-lookup.mjs list [--category=data] [--tag=x]
//   node scripts/shotcraft-lookup.mjs search "before after"
//   node scripts/shotcraft-lookup.mjs resolve <card-name>
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { listCards, searchCards, loadCatalog } from "./shotcraft/catalog.mjs";
import { resolveShotcraftCard } from "./shotcraft/resolver.mjs";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [cmd, ...rest] = process.argv.slice(2);

function parseFlags(args) {
  const flags = {};
  for (const a of args) {
    const m = a.match(/^--([\w-]+)=(.*)$/);
    if (m) flags[m[1]] = m[2];
  }
  return flags;
}

async function main() {
  if (cmd === "list") {
    const flags = parseFlags(rest);
    const cards = await listCards(repoRoot, { category: flags.category, tag: flags.tag, energyContains: flags.energy });
    console.log(JSON.stringify(cards.map((c) => ({ name: c.name, category: c.category, energy: c.energy, duration: c.duration, use: c.use })), null, 2));
    return;
  }
  if (cmd === "search") {
    const query = rest.join(" ");
    const cards = await searchCards(repoRoot, query);
    console.log(JSON.stringify(cards.map((c) => ({ name: c.name, category: c.category, summary: c.summary, use: c.use })), null, 2));
    return;
  }
  if (cmd === "resolve") {
    const result = await resolveShotcraftCard(repoRoot, rest[0]);
    if (!result.ok) {
      console.error(`✗ ${result.reason}`);
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({
      ok: true,
      source: result.source,
      resolvedAt: result.resolvedAt,
      entry: { name: result.entry.name, category: result.entry.category, duration: result.entry.duration, energy: result.entry.energy },
      recipePath: result.recipePath,
      recipeMd: result.recipeMd,
      demoFiles: result.demoFiles.map((d) => ({ path: d.path, content: d.content })),
      // Ready-to-paste skeleton for visual-plan.json's `scene.sourceCard` —
      // hashes/paths are REAL (computed from disk just now), only
      // `invariants`/`adaptationNotes` need to be filled in by hand after
      // reading recipeMd/demoFiles above (what to keep, what to adapt for
      // vertical framing — the validator hard-fails on empty invariants).
      sourceCardSkeleton: {
        name: result.entry.name,
        category: result.entry.category,
        recipePath: result.recipePath,
        demoPaths: result.demoFiles.map((d) => d.diskPath),
        recipeHash: sha256(Buffer.from(result.recipeMd, "utf8")),
        demoHashes: result.demoFiles.map((d) => sha256(Buffer.from(d.content, "utf8"))),
        invariants: "TODO: điền timing/easing/spring/camera/SFX bất biến lấy từ recipe ở trên",
        adaptationNotes: "TODO: mô tả đã đổi gì cho khung dọc/pipeline TTS-first",
        resolvedAt: result.resolvedAt,
      },
    }, null, 2));
    return;
  }
  if (cmd === "stats") {
    const { stats, revision, generatedAt, source } = await loadCatalog(repoRoot);
    console.log(JSON.stringify({ ...stats, revision, generatedAt, source }, null, 2));
    return;
  }
  console.error("Usage: shotcraft-lookup.mjs <list|search|resolve|stats> [args]");
  process.exitCode = 1;
}

main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
