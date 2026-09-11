/**
 * Lookup over the vendored, properly-attributed Mixkit audio at
 * `public/audio/shotcraft/` (source of truth + provenance: `vendor/shotcraft/
 * audio/manifest.json` and NOTICE.md at the repo root; this file reads the
 * PUBLIC copy so `staticFile()` can serve it at render time). Maps the
 * `SfxType` union used by `soundCues.ts` to the vendored category folder
 * that best matches Shotcraft's own `sound-design.md` taxonomy.
 *
 * KNOWN GAP (concrete, not glossed over): the `riser` category had exactly
 * ONE source file (`riser-cine.mp3`) and it was quarantined for unresolved
 * attribution — `pickSfx("riser")` returns `null` and always will until a
 * properly-attributed riser SFX is sourced separately (see asset-sourcing.md
 * workflow) and added to the manifest. Do not silently substitute another
 * category's sound for a riser cue — pick "impact" or "none" instead and say
 * so in the scene's `sfxCues[]` comment if you need a stand-in.
 */
import manifest from "../../../public/audio/shotcraft/manifest.json";
import type { SfxType } from "./soundCues";

export interface ShotcraftAudioAsset {
  file: string;
  path: string; // relative to public/audio/shotcraft/ — pass to staticFile(`audio/shotcraft/${path}`)
  category?: string; // sfx only
  title?: string; // bgm only
  artist?: string; // bgm only
  genre?: string; // bgm only
  bpm?: string; // bgm only
  license: string;
  sourceUrl: string | null;
  peakDb: number | null;
  durationSec: number | null;
  leadingSilenceMs: number;
}

const SFX_TYPE_TO_CATEGORY: Record<Exclude<SfxType, "none">, string | null> = {
  whoosh: "transition",
  impact: "impact",
  riser: null, // see KNOWN GAP above — quarantined, zero files
  sparkle: "light",
  tick: "counter",
};

/** Deterministic pick (NOT random) — same `type` + same `seedIndex` always
 * returns the same file, so re-planning a scene doesn't shuffle its sound. */
export function pickSfx(type: SfxType, seedIndex = 0): ShotcraftAudioAsset | null {
  if (type === "none") return null;
  const category = SFX_TYPE_TO_CATEGORY[type];
  if (!category) return null;
  const pool = (manifest.sfx as ShotcraftAudioAsset[]).filter((s) => s.category === category);
  if (!pool.length) return null;
  return pool[seedIndex % pool.length];
}

export function listSfxByCategory(category: string): ShotcraftAudioAsset[] {
  return (manifest.sfx as ShotcraftAudioAsset[]).filter((s) => s.category === category);
}

/** All real SFX category names present in the approved corpus, derived from
 * the manifest itself (not hardcoded) — 15 categories as of 2026-09-11:
 * camera, impact, transition, data, crowd, light, counter, film, fluid,
 * glass, mech, paper, scifi, text, ui. Use this (or `pickSfxByCategory`)
 * when a scene needs a sound outside the 5 `SfxType` values `soundCues.ts`
 * ergonomically covers — e.g. `paper`/`film`/`mech`/`scifi`/`glass`/`fluid`/
 * `crowd` have no `SfxType` mapping at all but are fully usable directly. */
export function listAllSfxCategories(): string[] {
  return [...new Set((manifest.sfx as ShotcraftAudioAsset[]).map((s) => s.category!))].sort();
}

/** Deterministic pick from ANY of the 15 real categories (not just the 5
 * ergonomic `SfxType` values) — same `category` + `seedIndex` always
 * returns the same file. */
export function pickSfxByCategory(category: string, seedIndex = 0): ShotcraftAudioAsset | null {
  const pool = listSfxByCategory(category);
  if (!pool.length) return null;
  return pool[seedIndex % pool.length];
}

export function pickBgm(index = 0): ShotcraftAudioAsset {
  const pool = manifest.bgm as ShotcraftAudioAsset[];
  return pool[index % pool.length];
}

/** staticFile()-ready path for a resolved asset, e.g. "audio/shotcraft/sfx/transition/whoosh-fast.mp3". */
export function shotcraftAudioSrc(asset: ShotcraftAudioAsset): string {
  return `audio/shotcraft/${asset.path}`;
}
