import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { analyzeBpmPhase } from "../audio-bpm-analysis.mjs";

/** Synthesizes a mono 16-bit PCM WAV click track with clicks at exact
 * `bpm`/`phaseSec` ground truth — lets us test the estimator against a KNOWN
 * answer rather than eyeballing real music. Generated at test time (not a
 * committed binary fixture) to keep the repo clean. */
function synthesizeClickTrack({ bpm, phaseSec, durationSec = 20, sampleRate = 44100 }) {
  const periodSec = 60 / bpm;
  const n = sampleRate * durationSec;
  const samples = new Int16Array(n);
  const clickLen = Math.floor(0.01 * sampleRate);
  for (let t = phaseSec; t < durationSec; t += periodSec) {
    const start = Math.floor(t * sampleRate);
    for (let i = 0; i < clickLen && start + i < n; i++) {
      samples[start + i] = Math.round(20000 * Math.exp(-i / (clickLen / 4)) * Math.sin((2 * Math.PI * 1000 * i) / sampleRate));
    }
  }
  const dataSize = samples.length * 2;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, Buffer.from(samples.buffer)]);
}

async function withFixture(opts, fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "bpm-fixture-"));
  const file = path.join(dir, "click.wav");
  await writeFile(file, synthesizeClickTrack(opts));
  try {
    return await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// Tolerances reflect this method's actual measured precision (RMS-onset
// autocorrelation at ~86Hz envelope rate) — not aspirational frame-perfect
// numbers. BPM within 2%, phase within 15% of one beat period.
test("recovers ground-truth BPM/phase for a 120 BPM click track", async () => {
  await withFixture({ bpm: 120, phaseSec: 0.1 }, async (file) => {
    const { bpm, phaseSec } = await analyzeBpmPhase(file);
    assert.ok(Math.abs(bpm - 120) / 120 < 0.02, `bpm ${bpm} not within 2% of 120`);
    assert.ok(Math.abs(phaseSec - 0.1) < (60 / 120) * 0.15, `phase ${phaseSec}s not within tolerance of 0.1s`);
  });
});

test("recovers ground-truth BPM/phase for a 90 BPM click track with a different phase offset", async () => {
  await withFixture({ bpm: 90, phaseSec: 0.25 }, async (file) => {
    const { bpm, phaseSec } = await analyzeBpmPhase(file);
    assert.ok(Math.abs(bpm - 90) / 90 < 0.02, `bpm ${bpm} not within 2% of 90`);
    assert.ok(Math.abs(phaseSec - 0.25) < (60 / 90) * 0.15, `phase ${phaseSec}s not within tolerance of 0.25s`);
  });
});

test("real vendored BGM: measured BPM is within 10% of the upstream-attributed value (independent cross-check, not a copy of the metadata)", async () => {
  const manifest = (await import("../../../vendor/shotcraft/audio/manifest.json", { with: { type: "json" } })).default;
  const track = manifest.bgm.find((b) => b.file === "cat-walk.mp3"); // upstream-attributed ~129 BPM
  assert.ok(track, "fixture BGM file missing from manifest");
  const file = path.resolve(import.meta.dirname, "../../../vendor/shotcraft/audio", track.path);
  const { bpm } = await analyzeBpmPhase(file);
  const attributed = Number(track.bpm);
  assert.ok(Math.abs(bpm - attributed) / attributed < 0.1, `measured ${bpm} not within 10% of upstream-attributed ${attributed} — real music is harder than a click track, wider tolerance expected`);
});
