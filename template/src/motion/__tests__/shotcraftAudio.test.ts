import { test } from "node:test";
import assert from "node:assert/strict";
import { pickSfx, pickSfxByCategory, listAllSfxCategories, listSfxByCategory, pickBgm, shotcraftAudioSrc } from "../audio/shotcraftAudio";
import { sfxCueStartFrame, DEFAULT_AAC_PRIMING_MS } from "../audio/twoOffsetAlignment";

test("listAllSfxCategories exposes all 15 real categories, not just the 5 SfxType-mapped ones", () => {
  const cats = listAllSfxCategories();
  assert.ok(cats.length >= 15, `expected >=15 categories, got ${cats.length}: ${cats.join(", ")}`);
  for (const expected of ["camera", "paper", "film", "mech", "scifi", "glass", "fluid", "crowd", "data", "ui", "text", "counter", "light", "impact", "transition"]) {
    assert.ok(cats.includes(expected), `missing category ${expected}`);
  }
});

test("pickSfxByCategory is deterministic and covers categories with no SfxType mapping", () => {
  const a = pickSfxByCategory("paper", 2);
  const b = pickSfxByCategory("paper", 2);
  assert.deepEqual(a, b);
  assert.ok(a && a.category === "paper");
});

test("pickSfx('riser') is always null — riser has zero approved files (preserved quarantine)", () => {
  assert.equal(pickSfx("riser"), null);
  assert.equal(listSfxByCategory("riser").length, 0);
});

test("pickSfx is deterministic for the same type+seedIndex", () => {
  assert.deepEqual(pickSfx("whoosh", 3), pickSfx("whoosh", 3));
});

test("pickBgm cycles deterministically through the approved BGM pool", () => {
  const a = pickBgm(0);
  const b = pickBgm(4); // wraps if pool has 4 entries
  assert.equal(a.file, b.file);
});

test("shotcraftAudioSrc produces a staticFile-ready relative path", () => {
  const asset = pickSfx("impact", 0)!;
  assert.equal(shotcraftAudioSrc(asset), `audio/shotcraft/${asset.path}`);
});

test("sfxCueStartFrame subtracts leading-silence frames, clamped at 0", () => {
  assert.equal(sfxCueStartFrame(30, 30, 500), 15); // 500ms lead at 30fps = 15 frames earlier
  assert.equal(sfxCueStartFrame(5, 30, 1000), 0); // would go negative — clamped
  assert.equal(sfxCueStartFrame(30, 30, 0), 30); // no lead — unchanged
});

test("DEFAULT_AAC_PRIMING_MS is a small, documented empirical value, not a placeholder", () => {
  assert.ok(DEFAULT_AAC_PRIMING_MS > 0 && DEFAULT_AAC_PRIMING_MS < 200);
});
