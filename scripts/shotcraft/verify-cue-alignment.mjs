#!/usr/bin/env node
// Post-render verification that an SFX cue's ACTUAL audible attack (in a
// rendered file) lands where the composition intended, accounting for the
// two real offsets that can otherwise silently desync cues from action:
//   1. per-file source-peak lag: the attack transient inside the mp3 itself
//      may not sit at sample 0 (`leadingSilenceMs` in the audio manifest,
//      measured by measure-audio.mjs via ffmpeg silencedetect).
//   2. AAC output-track priming: the encoder can shift the whole audio
//      track by a small fixed offset (container/encoder/samplerate
//      dependent — must be re-measured per Remotion/ffmpeg version, not
//      assumed constant forever).
// This script measures the ACTUAL onset time of the loudest new sound near
// an expected timestamp and compares it to the intended frame, so drift in
// either offset is caught empirically rather than assumed away.
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

/** Finds the first silence_end (index.e. sound onset) at or after `afterSec`
 * in `file`'s audio track, using ffmpeg silencedetect. Returns seconds, or
 * null if none found within `searchWindowSec`. */
export async function findNextOnset(file, afterSec, { searchWindowSec = 2, noiseDb = -35 } = {}) {
  const { stderr } = await exec(
    "ffmpeg",
    ["-i", file, "-af", `atrim=start=${afterSec}:end=${afterSec + searchWindowSec},asetpts=PTS-STARTPTS,silencedetect=noise=${noiseDb}dB:d=0.01`, "-f", "null", "-"],
    { encoding: "utf8" },
  ).catch((e) => ({ stderr: e.stderr ?? "" }));
  const match = stderr.match(/silence_end:\s*([\d.]+)/);
  if (!match) return null;
  return afterSec + Number(match[1]);
}

/** Verifies a single cue: expected onset = intendedFrame/fps + leadingSilenceMs/1000.
 * Returns { ok, expectedSec, actualSec, driftMs }. */
export async function verifyCueAlignment(file, { intendedFrame, fps, leadingSilenceMs = 0, toleranceMs = 120 }) {
  const expectedSec = intendedFrame / fps + leadingSilenceMs / 1000;
  const searchFrom = Math.max(0, expectedSec - 0.3);
  const actualSec = await findNextOnset(file, searchFrom);
  if (actualSec === null) return { ok: false, expectedSec, actualSec: null, driftMs: null, reason: "no onset detected near expected time" };
  const driftMs = Math.round((actualSec - expectedSec) * 1000);
  return { ok: Math.abs(driftMs) <= toleranceMs, expectedSec, actualSec, driftMs };
}

async function main() {
  const [file, frameArg, fpsArg, leadingSilenceArg] = process.argv.slice(2);
  if (!file || !frameArg) throw new Error("Usage: verify-cue-alignment.mjs <file> <intendedFrame> [fps=30] [leadingSilenceMs=0]");
  const result = await verifyCueAlignment(file, { intendedFrame: Number(frameArg), fps: Number(fpsArg ?? 30), leadingSilenceMs: Number(leadingSilenceArg ?? 0) });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) main();
