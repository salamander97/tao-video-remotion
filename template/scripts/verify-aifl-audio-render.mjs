#!/usr/bin/env node
// Reproducible, persistent audio-render verification for AiflPromoDemo.
// Renders a real audio-bearing segment, verifies the audio stream is real
// (codec/channels/duration), loudness is audible and not clipping, and every
// SFX cue in that segment references an approved (non-quarantined) asset —
// then writes a compact JSON evidence report and deletes the (large) temp
// video, so this can be re-run any time without accumulating artifacts.
//
// Usage (from template/):
//   node scripts/verify-aifl-audio-render.mjs
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { readFile, writeFile, rm, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SFX } from "../src/AiflPromoDemo/Main";

const exec = promisify(execFile);
const TEMPLATE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = path.resolve(TEMPLATE_DIR, "..");
const REPORT_PATH = path.join(REPO_ROOT, "docs/qa/aifl-audio-render-report.json");
const TMP_VIDEO = path.join(REPO_ROOT, ".qa-tmp", "aifl-audio-segment.mp4");

const FRAME_RANGE = "0-250"; // covers cues at frames 12/78/127/141/204/220 (6 distinct SFX)

async function sha256File(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function main() {
  await mkdir(path.dirname(TMP_VIDEO), { recursive: true });
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });

  const manifest = JSON.parse(await readFile(path.join(REPO_ROOT, "vendor/shotcraft/audio/manifest.json"), "utf8"));
  const approved = new Set([...manifest.sfx, ...manifest.bgm].map((a) => a.file));
  const quarantined = new Set(manifest.quarantined.map((q) => q.file));

  const cuesInRange = SFX.filter((s) => s.from <= 250);
  const assetIssues = cuesInRange.filter((s) => !approved.has(s.src) || quarantined.has(s.src)).map((s) => s.src);

  const renderCmd = ["remotion", "render", "src/index.ts", "AiflPromoDemo", TMP_VIDEO, `--frames=${FRAME_RANGE}`, "--log=error"];
  await exec("npx", renderCmd, { cwd: TEMPLATE_DIR });

  const fileHash = await sha256File(TMP_VIDEO);
  const fileSize = (await stat(TMP_VIDEO)).size;

  const { stdout: probeOut } = await exec("ffprobe", ["-v", "error", "-show_streams", "-select_streams", "a", "-of", "json", TMP_VIDEO]);
  const probe = JSON.parse(probeOut).streams[0];

  const { stderr: volOut } = await exec("ffmpeg", ["-i", TMP_VIDEO, "-af", "volumedetect", "-f", "null", "-"]).catch((e) => ({ stderr: e.stderr }));
  const meanMatch = volOut.match(/mean_volume:\s*(-?[\d.]+) dB/);
  const maxMatch = volOut.match(/max_volume:\s*(-?[\d.]+) dB/);
  const meanVolumeDb = meanMatch ? Number(meanMatch[1]) : null;
  const maxVolumeDb = maxMatch ? Number(maxMatch[1]) : null;

  const report = {
    generatedAt: new Date().toISOString(),
    command: `npx ${renderCmd.join(" ")}`,
    frameRange: FRAME_RANGE,
    fps: 30,
    tempFile: { path: path.relative(REPO_ROOT, TMP_VIDEO), sha256: fileHash, sizeBytes: fileSize, deletedAfterReport: true },
    audioStream: {
      codecName: probe?.codec_name ?? null,
      channels: probe?.channels ?? null,
      sampleRate: probe?.sample_rate ?? null,
      durationSec: probe?.duration ? Number(probe.duration) : null,
    },
    loudness: { meanVolumeDb, maxVolumeDb, noClipping: maxVolumeDb !== null && maxVolumeDb < 0 },
    sfxCuesInRange: cuesInRange.map((s) => ({ from: s.from, src: s.src, volume: s.volume })),
    assetProvenance: { allApproved: assetIssues.length === 0, issues: assetIssues },
    pass:
      probe?.codec_name === "aac" &&
      probe?.channels === 2 &&
      meanVolumeDb !== null && meanVolumeDb > -60 &&
      maxVolumeDb !== null && maxVolumeDb < 0 &&
      assetIssues.length === 0,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
  await rm(path.dirname(TMP_VIDEO), { recursive: true, force: true }); // clean up the large temp video — evidence lives in the JSON report + hash

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${path.relative(REPO_ROOT, REPORT_PATH)}`);
  if (!report.pass) {
    console.error("FAIL — see report for details");
    process.exitCode = 1;
  }
}

main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
