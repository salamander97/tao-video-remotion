import { readFile } from "node:fs/promises";
import { resolveShotcraftRoot, libraryJsonPath } from "./paths.mjs";

let cache;

/** Loads the full 157-card catalog (cached per process). This is the ONLY
 * source of truth for "what cards exist" — never hardcode a subset list. */
export async function loadCatalog(repoRoot) {
  if (cache) return cache;
  const { root, source } = await resolveShotcraftRoot(repoRoot);
  const raw = JSON.parse(await readFile(libraryJsonPath(root), "utf8"));
  cache = { root, source, cards: raw.cards, stats: raw.stats, categories: raw.categories, revision: raw.revision, generatedAt: raw.generatedAt };
  return cache;
}

export async function listCards(repoRoot, { category, tag, energyContains } = {}) {
  const { cards } = await loadCatalog(repoRoot);
  return cards.filter((c) => {
    if (category && c.category !== category) return false;
    if (tag && !(c.tags ?? []).includes(tag)) return false;
    if (energyContains && !(c.energy ?? "").includes(energyContains)) return false;
    return true;
  });
}

/** Simple substring search across name/summary/use/tags — the full catalog
 * has no English tagging, so callers should try both Vietnamese/English
 * keyword guesses and Chinese terms lifted from `summary`/`use` fields. */
export async function searchCards(repoRoot, query) {
  const { cards } = await loadCatalog(repoRoot);
  const q = query.toLowerCase();
  return cards.filter((c) =>
    [c.name, c.summary, c.use, ...(c.tags ?? [])].some((field) => (field ?? "").toLowerCase().includes(q)),
  );
}

export async function getCardEntry(repoRoot, name) {
  const { cards } = await loadCatalog(repoRoot);
  return cards.find((c) => c.name === name);
}
