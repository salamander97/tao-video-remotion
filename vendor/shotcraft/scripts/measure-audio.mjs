#!/usr/bin/env node
// Measures REAL peak dB, duration and leading-silence (attack-transient lag —
// "peak-delay" in the task's terms: how far into the file the actual sound
// starts, which matters for cueing SFX to land exactly on an action frame)
// for every vendored audio file via ffprobe/ffmpeg, and writes the numbers
// into audio/manifest.json. Run once after build-audio-manifest.mjs:
//   node vendor/shotcraft/scripts/measure-audio.mjs
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const exec = promisify(execFile);
const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "audio");

async function measure(relPath) {
  const abs = path.join(root, relPath);
  // ffmpeg writes filter/log output to STDERR even on success (exit 0) — must
  // read stderr on both the success and error path, not just on failure.
  const runFfmpeg = (args) => exec("ffmpeg", args, { encoding: "utf8" }).then((r) => r.stderr, (e) => e.stderr ?? "");
  const combined = await runFfmpeg(["-i", abs, "-af", "astats=metadata=0:reset=0", "-f", "null", "-"]);
  const peakMatch = combined.match(/Peak level dB:\s*(-?[\d.]+)/);
  const durMatch = combined.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  let durationSec = null;
  if (durMatch) durationSec = Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]);

  const silence = await runFfmpeg(["-i", abs, "-af", "silencedetect=noise=-40dB:d=0.02", "-f", "null", "-"]);
  const startMatch = silence.match(/silence_end:\s*([\d.]+)/);
  const leadingSilenceMs = startMatch ? Math.round(Number(startMatch[1]) * 1000) : 0;

  return { peakDb: peakMatch ? Number(peakMatch[1]) : null, durationSec: durationSec ? Number(durationSec.toFixed(3)) : null, leadingSilenceMs };
}

async function main() {
  const manifestPath = path.join(root, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  let done = 0;
  const total = manifest.sfx.length + manifest.bgm.length;
  for (const entry of [...manifest.sfx, ...manifest.bgm]) {
    try {
      const m = await measure(entry.path);
      Object.assign(entry, m);
    } catch (e) {
      entry.measureError = String(e.message ?? e);
    }
    done++;
    if (done % 20 === 0) console.error(`measured ${done}/${total}`);
  }
  manifest.measuredAt = new Date().toISOString();
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Done: measured ${done} files, peak/duration/leadingSilenceMs written to ${manifestPath}`);
}

main();
