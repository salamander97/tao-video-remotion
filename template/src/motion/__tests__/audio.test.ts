import { test } from "node:test";
import assert from "node:assert/strict";
import { duckingEnvelope, isSfxFrequencyOk, DEFAULT_GAIN } from "../audio/soundCues";
import { beatFrame, nearestBeatIndex } from "../audio/beatGrid";

test("duckingEnvelope stays at base gain outside tts windows", () => {
  const g = duckingEnvelope(0, [[100, 200]], 0.28, 0.1, 6);
  assert.equal(g, 0.28);
});

test("duckingEnvelope ducks fully inside tts window", () => {
  const g = duckingEnvelope(150, [[100, 200]], 0.28, 0.1, 6);
  assert.equal(g, 0.1);
});

test("duckingEnvelope ramps at window edges", () => {
  const g = duckingEnvelope(97, [[100, 200]], 0.28, 0.1, 6);
  assert.ok(g > 0.1 && g < 0.28);
});

test("isSfxFrequencyOk rejects cues closer than minGap", () => {
  const cues = [
    { frame: 0, type: "impact" as const },
    { frame: 10, type: "impact" as const },
  ];
  assert.equal(isSfxFrequencyOk(cues, "impact", 30), false);
  assert.equal(isSfxFrequencyOk(cues, "impact", 5), true);
});

test("DEFAULT_GAIN keeps tts as the priority track", () => {
  assert.equal(DEFAULT_GAIN.tts, 1);
  assert.ok(DEFAULT_GAIN.bgm < DEFAULT_GAIN.tts);
});

test("beatFrame is a pure function of bpm/phase/fps", () => {
  const cfg = { bpm: 120, phaseSec: 0.2, fps: 30 };
  assert.equal(beatFrame(cfg, 0), 6);
  assert.equal(beatFrame(cfg, 1), 21);
});

test("nearestBeatIndex rounds to closest beat", () => {
  const cfg = { bpm: 120, phaseSec: 0, fps: 30 };
  assert.equal(nearestBeatIndex(cfg, 15), 1);
});
