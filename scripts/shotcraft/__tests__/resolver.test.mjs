import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveShotcraftCard } from "../resolver.mjs";
import { loadCatalog, listCards, searchCards, getCardEntry } from "../catalog.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("resolves a known card end-to-end (entry + recipe + demo, single demo file)", async () => {
  const r = await resolveShotcraftCard(repoRoot, "document-typewriter-reveal");
  assert.equal(r.ok, true);
  assert.equal(r.entry.category, "typography");
  assert.ok(r.recipeMd.includes("参考实现"));
  assert.equal(r.demoFiles.length, 1);
  assert.equal(r.demoFiles[0].path, "demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx");
  assert.ok(r.demoFiles[0].content.includes("PageCam") || r.demoFiles[0].content.length > 100);
  assert.ok(["live", "vendored"].includes(r.source));
});

test("resolves a card whose recipe declares a directory + parenthetical multi-file list", async () => {
  const r = await resolveShotcraftCard(repoRoot, "crash-zoom-punch");
  assert.equal(r.ok, true);
  assert.equal(r.demoFiles.length, 2);
  const names = r.demoFiles.map((d) => d.path).sort();
  assert.deepEqual(names, [
    "demos/camera/crash-zoom-punch/CrashImpactReal.tsx",
    "demos/camera/crash-zoom-punch/CrashZoomReal.tsx",
  ]);
});

test("resolves a card whose demo dir is announced mid-sentence on the same line as filenames", async () => {
  const r = await resolveShotcraftCard(repoRoot, "page-waterfall-wall");
  assert.equal(r.ok, true);
  assert.ok(r.demoFiles.some((d) => d.path.endsWith("PageWaterfallWall.tsx")));
});

test("hard-gates on a card name absent from the catalog — never infers from the name", async () => {
  const r = await resolveShotcraftCard(repoRoot, "totally-fake-card-xyz");
  assert.equal(r.ok, false);
  assert.match(r.reason, /Không tìm thấy card/);
});

test("hard-gates cleanly (does not throw) — resolver returns structured failure, not an exception", async () => {
  await assert.doesNotReject(() => resolveShotcraftCard(repoRoot, "another-fake-one"));
});

test("full catalog: every one of the 157 cards resolves (recipe + at least 1 demo file each)", async () => {
  const { cards, stats } = await loadCatalog(repoRoot);
  assert.equal(stats.cardCount, 157);
  assert.equal(cards.length, 157);
  const failures = [];
  for (const c of cards) {
    const r = await resolveShotcraftCard(repoRoot, c.name);
    if (!r.ok) failures.push(`${c.name}: ${r.reason}`);
  }
  assert.deepEqual(failures, [], `${failures.length} card(s) failed to resolve:\n${failures.join("\n")}`);
});

test("listCards filters by category against the real 157-card catalog, not a hardcoded subset", async () => {
  const dataCards = await listCards(repoRoot, { category: "data" });
  assert.ok(dataCards.length >= 10, "data category should have double digits of cards per the audit (13)");
  assert.ok(dataCards.every((c) => c.category === "data"));
});

test("searchCards finds cards by substring across name/summary/use/tags", async () => {
  const results = await searchCards(repoRoot, "before-after");
  assert.ok(results.some((c) => c.name === "before-after-slider-scrub"));
});

test("getCardEntry returns undefined (not throw) for a nonexistent name", async () => {
  const entry = await getCardEntry(repoRoot, "nonexistent-card-name");
  assert.equal(entry, undefined);
});
