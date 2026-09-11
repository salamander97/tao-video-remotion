import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { SFX, assertSfxAssets } from "../Main";

// Avoid `import.meta` (incompatible with this template's tsconfig
// `module: commonjs` under `tsc --noEmit`) — npm scripts always run with
// `template/` as cwd, so resolve relative to that instead.
const PUBLIC_AUDIO_DIR = path.resolve(process.cwd(), "public/audio");
const QUARANTINED = new Set(["keyboard.mp3", "pop.mp3", "riser-cine.mp3", "sparkle.mp3", "whoosh-big.mp3", "bgm-tech-house.mp3"]);

test("every AiflPromo SFX cue references a file that actually exists in public/audio/", () => {
  const present = new Set(readdirSync(PUBLIC_AUDIO_DIR).filter((f) => f.endsWith(".mp3")));
  assertSfxAssets(SFX, present); // throws (fails the test) on any drift
});

test("no AiflPromo SFX cue references a quarantined file — regression guard for the exact bug this was corrected from", () => {
  const offenders = SFX.filter((s) => QUARANTINED.has(s.src));
  assert.deepEqual(offenders, [], `quarantined file(s) referenced: ${offenders.map((o) => o.src).join(", ")}`);
});

test("no riser cue exists — the riser category has zero approved files, so it must be omitted, not faked", () => {
  const hasRiserLike = SFX.some((s) => /riser/i.test(s.src));
  assert.equal(hasRiserLike, false, "found a riser-named cue, but the approved corpus has 0 riser files — this must be an omission, not a substitution");
});

test("every public/audio/*.mp3 file that AiflPromo could reference is also in the approved Shotcraft manifest (no back-door unattributed audio)", async () => {
  const manifest = JSON.parse(readFileSync(path.resolve(process.cwd(), "../vendor/shotcraft/audio/manifest.json"), "utf8"));
  const approvedFiles = new Set([...manifest.sfx, ...manifest.bgm].map((a: { file: string }) => a.file));
  const usedFiles = new Set(SFX.map((s) => s.src));
  for (const file of usedFiles) {
    assert.ok(approvedFiles.has(file), `${file} is referenced by AiflPromo but not present in the approved audio manifest`);
  }
});
