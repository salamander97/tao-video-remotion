#!/usr/bin/env node
// Deterministic BPM/phase estimation from raw audio (no librosa/Python
// dependency — pure JS autocorrelation over an RMS onset envelope decoded
// via ffmpeg). This exists because the vendored BGM's BPM values are
// upstream-supplied metadata (measured once by Shotcraft's own librosa
// pipeline, per ATTRIBUTION.md) — this module lets US independently verify
// those numbers (or measure BPM/phase for any new audio) without adding a
// Python/librosa dependency to this repo.
//
// TTS remains the sole authority for scene/composition duration everywhere
// in this repo (see beatGrid.ts) — this module only ever informs SECONDARY
// cue placement (SFX/transition timing against a BGM's beat grid) or
// post-render verification, never scene length.
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

const FRAME_SIZE = 128; // samples per onset-envelope frame (~86Hz envelope rate at SAMPLE_RATE=11025 — enough resolution to distinguish 60-200 BPM periods, which span only ~26-86 envelope frames)
const SAMPLE_RATE = 11025; // downsampled — plenty for tempo/onset analysis, keeps arrays small
const MIN_BPM = 60;
const MAX_BPM = 200;

/** Decodes `file` to mono PCM16 at SAMPLE_RATE via ffmpeg, returns a Float64Array of samples in [-1, 1]. */
async function decodePcm(file) {
  const { stdout } = await exec(
    "ffmpeg",
    ["-i", file, "-ac", "1", "-ar", String(SAMPLE_RATE), "-f", "s16le", "-"],
    { encoding: "buffer", maxBuffer: 1024 * 1024 * 64 },
  );
  const buf = stdout;
  const n = Math.floor(buf.length / 2);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(i * 2) / 32768;
  return out;
}

/** RMS-energy onset-strength envelope: positive first-difference of
 * per-frame RMS energy (a standard, simple onset-detection function). */
function onsetEnvelope(pcm) {
  const nFrames = Math.floor(pcm.length / FRAME_SIZE);
  const rms = new Float64Array(nFrames);
  for (let f = 0; f < nFrames; f++) {
    let sum = 0;
    const start = f * FRAME_SIZE;
    for (let i = 0; i < FRAME_SIZE; i++) sum += pcm[start + i] * pcm[start + i];
    rms[f] = Math.sqrt(sum / FRAME_SIZE);
  }
  const onset = new Float64Array(nFrames);
  for (let f = 1; f < nFrames; f++) onset[f] = Math.max(0, rms[f] - rms[f - 1]);
  return onset;
}

/** Autocorrelation of the onset envelope over the lag range corresponding
 * to [MIN_BPM, MAX_BPM], returns the lag (in envelope frames) with maximum
 * correlation — the dominant beat period. */
function estimatePeriodFrames(onset, fps) {
  const minLag = Math.floor((60 / MAX_BPM) * fps);
  const maxLag = Math.ceil((60 / MIN_BPM) * fps);
  let bestLag = minLag;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag && lag < onset.length; lag++) {
    let score = 0;
    for (let i = 0; i + lag < onset.length; i++) score += onset[i] * onset[i + lag];
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  return bestLag;
}

/** Phase: the offset (in envelope frames, within one period) whose
 * comb-filtered sum of onset energy is maximal — i.e. where the beats
 * actually land relative to frame 0. */
function estimatePhaseFrames(onset, periodFrames) {
  let bestPhase = 0;
  let bestScore = -Infinity;
  for (let phase = 0; phase < periodFrames; phase++) {
    let score = 0;
    for (let i = phase; i < onset.length; i += periodFrames) score += onset[i];
    if (score > bestScore) {
      bestScore = score;
      bestPhase = phase;
    }
  }
  return bestPhase;
}

/** Analyzes `file`, returns { bpm, phaseSec }. `phaseSec` is the time of the
 * first detected beat, in seconds from the start of the file. */
export async function analyzeBpmPhase(file) {
  const pcm = await decodePcm(file);
  const onset = onsetEnvelope(pcm);
  const envFps = SAMPLE_RATE / FRAME_SIZE;
  const periodFrames = estimatePeriodFrames(onset, envFps);
  const phaseFrames = estimatePhaseFrames(onset, periodFrames);
  const bpm = Math.round((60 / (periodFrames / envFps)) * 10) / 10;
  const phaseSec = phaseFrames / envFps;
  return { bpm, phaseSec, periodSec: periodFrames / envFps };
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: audio-bpm-analysis.mjs <audio-file>");
  const result = await analyzeBpmPhase(file);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) main();
