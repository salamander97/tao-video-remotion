import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, chmod, rm, symlink, lstat, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { compareTree, refreshFromLive, CATEGORY_MAPPINGS } from "../refresh-audit.mjs";

const exec = promisify(execFile);
const SCRIPT = path.resolve(import.meta.dirname, "../refresh-audit.mjs");
const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");

test("reports N/A gracefully when shotcraftRepo is unset (real current default state)", async () => {
  const { stdout } = await exec("node", [SCRIPT]);
  assert.match(stdout, /Live checkout: N\/A/);
  assert.match(stdout, /chưa cấu hình/);
  assert.match(stdout, /recipes: \d+, demo \.tsx: \d+/);
});

test("reports N/A with an EPERM-specific reason for a path that exists but cannot be read", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "shotcraft-unreadable-"));
  try {
    await chmod(dir, 0o000);
    const homeDir = await mkdtemp(path.join(tmpdir(), "tao-home-"));
    await mkdir(path.join(homeDir, ".tao-video-suite"), { recursive: true });
    await writeFile(path.join(homeDir, ".tao-video-suite", "config.json"), JSON.stringify({ shotcraftRepo: dir }));
    const { stdout } = await exec("node", [SCRIPT], { env: { ...process.env, HOME: homeDir } });
    assert.match(stdout, /Live checkout: N\/A/);
    assert.match(stdout, /EACCES|EPERM|permission/i);
    await rm(homeDir, { recursive: true, force: true });
  } finally {
    await chmod(dir, 0o755);
    await rm(dir, { recursive: true, force: true });
  }
});

test("compareTree correctly identifies identical / added / removed / changed files, and excludes AppleDouble", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-live-"));
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-vendor-"));
  try {
    await mkdir(path.join(live, "sub"), { recursive: true });
    await mkdir(path.join(vendor, "sub"), { recursive: true });
    await writeFile(path.join(live, "same.md"), "unchanged content");
    await writeFile(path.join(vendor, "same.md"), "unchanged content");
    await writeFile(path.join(live, "sub/changed.md"), "live version");
    await writeFile(path.join(vendor, "sub/changed.md"), "vendor version (stale)");
    await writeFile(path.join(live, "new-in-live.md"), "brand new upstream file");
    await writeFile(path.join(vendor, "stale-only-here.md"), "removed upstream, still vendored");
    await writeFile(path.join(live, "._AppleDouble.md"), "resource fork junk — must be excluded");

    const result = await compareTree("test", live, vendor);
    assert.deepEqual(result.onlyLive.sort(), ["new-in-live.md"]);
    assert.deepEqual(result.onlyVendor.sort(), ["stale-only-here.md"]);
    assert.deepEqual(result.changed, [path.join("sub", "changed.md")]);
    assert.equal(result.liveCount, 3, "AppleDouble file must be excluded from the live count (3, not 4)");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("compareTree reports no differences for two identical trees", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-live-"));
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-vendor-"));
  try {
    await writeFile(path.join(live, "a.md"), "same");
    await writeFile(path.join(vendor, "a.md"), "same");
    const result = await compareTree("test", live, vendor);
    assert.deepEqual(result, { label: "test", liveCount: 1, vendorCount: 1, onlyLive: [], onlyVendor: [], changed: [] });
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("CATEGORY_MAPPINGS covers every integrated area by explicit mapping, not a whole-directory diff", () => {
  const labels = CATEGORY_MAPPINGS.map((c) => c.label).join(" | ");
  for (const mustCover of ["shots", "demos", "lib helpers", "library.json", "gallery posters", "gallery UI", "jianying-export", "process docs", "aifl-template", "scripts-templates"]) {
    assert.ok(labels.toLowerCase().includes(mustCover.toLowerCase()), `CATEGORY_MAPPINGS is missing coverage for: ${mustCover}`);
  }
  // every category resolves under vendor/shotcraft — never template/ or top-level workbench/
  for (const cat of CATEGORY_MAPPINGS) {
    const vendorRel = cat.vendorRel ?? (cat.pairs ? cat.pairs.map(([, v]) => v).join(",") : "");
    assert.ok(!vendorRel.includes(".."), `${cat.label}: vendorRel must not escape (${vendorRel})`);
  }
});

test("scripts-templates category writes to scripts-templates/upstream/, NEVER directly to scripts-templates/ (regression guard for the operational-file overwrite bug an independent audit caught)", () => {
  const cat = CATEGORY_MAPPINGS.find((c) => c.label.toLowerCase().includes("scripts-templates"));
  assert.ok(cat, "scripts-templates category missing entirely");
  assert.equal(cat.vendorRel, "scripts-templates/upstream", `scripts-templates category must target the upstream/ subfolder, not scripts-templates/ directly (got ${cat.vendorRel}) — writing directly there would overwrite the operational capture-template.mjs`);
});

/** Builds a synthetic "live Shotcraft checkout" fixture spanning every
 * mapped category, including a real audio ATTRIBUTION.md with one approved
 * SFX/BGM pair and the two REAL hardcoded-quarantine filenames
 * (`pop.mp3`/`bgm-tech-house.mp3`) so the actual quarantine policy in
 * build-audio-manifest.mjs is genuinely exercised, not simulated. */
async function buildLiveFixture() {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-full-live-"));
  await mkdir(path.join(live, "references/shots/camera"), { recursive: true });
  await writeFile(path.join(live, "references/shots/camera/test-card.md"), "# test-card\n## 参考实现\ndemos/camera/test-card/TestCard.tsx\n");
  for (const doc of ["aesthetic-rules", "sound-design", "final-review", "music-beat-sync", "guided-free-creation", "pipeline", "workbench", "jianying-export"]) {
    await writeFile(path.join(live, "references", `${doc}.md`), `# ${doc} fixture content`);
  }
  await writeFile(path.join(live, "SKILL.md"), "# SKILL fixture content");

  await mkdir(path.join(live, "demos/camera/test-card"), { recursive: true });
  await writeFile(path.join(live, "demos/camera/test-card/TestCard.tsx"), "export const TestCard = () => null;\n");
  await writeFile(path.join(live, "demos/camera/test-card/._AppleDouble.tsx"), "junk — must be excluded");

  await mkdir(path.join(live, "assets/lib/helpers"), { recursive: true });
  await writeFile(path.join(live, "assets/lib/helpers/rand.ts"), "export const rand = () => 0;\n");

  await mkdir(path.join(live, "assets/audio/sfx/transition"), { recursive: true });
  await mkdir(path.join(live, "assets/audio/sfx/ui"), { recursive: true });
  await mkdir(path.join(live, "assets/audio/bgm"), { recursive: true });
  await writeFile(path.join(live, "assets/audio/sfx/transition/approved-sfx.mp3"), "fake-approved-sfx-bytes");
  await writeFile(path.join(live, "assets/audio/sfx/ui/pop.mp3"), "fake-quarantined-sfx-bytes"); // REAL hardcoded quarantine filename
  await writeFile(path.join(live, "assets/audio/bgm/approved-bgm.mp3"), "fake-approved-bgm-bytes");
  await writeFile(path.join(live, "assets/audio/bgm/bgm-tech-house.mp3"), "fake-quarantined-bgm-bytes"); // REAL hardcoded quarantine filename
  await writeFile(
    path.join(live, "assets/audio/ATTRIBUTION.md"),
    [
      "| 文件 | 路径 | 来源 | 原名 / URL |",
      "|---|---|---|---|",
      "| `approved-sfx.mp3` | `sfx/transition/` | Mixkit | Test approved · https://example.com/approved |",
      "| `pop.mp3` | `sfx/ui/` | 来源待考 | 无法反查 |",
      "",
      "## bgm/（BGM 备选）",
      "",
      "| 文件名 | 原曲名 | 艺术家 | 风格 | BPM | URL |",
      "|---|---|---|---|---|---|",
      "| `approved-bgm.mp3` | Test Song | Test Artist | Test | ~120 | https://example.com/bgm |",
      "| `bgm-tech-house.mp3` | （无法反查） | — | Test | ~124 | 无法反查 |",
    ].join("\n"),
  );

  await mkdir(path.join(live, "gallery/api"), { recursive: true });
  await mkdir(path.join(live, "gallery/media/poster"), { recursive: true });
  await writeFile(path.join(live, "gallery/api/library.json"), JSON.stringify({ cards: [] }));
  await writeFile(path.join(live, "gallery/media/poster/test-card.jpg"), "fake-jpg-bytes");
  for (const f of ["translations.js", "app.js", "styles.css", "index.html", "library.html"]) {
    await writeFile(path.join(live, "gallery", f), `// fixture ${f}`);
  }

  await mkdir(path.join(live, "jianying-export"), { recursive: true });
  await writeFile(path.join(live, "jianying-export/mac_draft.py"), "# fixture mac_draft.py\n");
  await mkdir(path.join(live, "jianying-export/__pycache__"), { recursive: true });
  await writeFile(path.join(live, "jianying-export/__pycache__/mac_draft.cpython-314.pyc"), "junk — must be excluded");

  await mkdir(path.join(live, "template/src/aifl"), { recursive: true });
  await mkdir(path.join(live, "template/public/textures/live"), { recursive: true });
  await writeFile(path.join(live, "template/src/aifl/Main.tsx"), "export const AiflMain = () => null;\n");
  await writeFile(path.join(live, "template/public/textures/live/dummy.png"), "fake-png-bytes");

  await mkdir(path.join(live, "assets/scripts"), { recursive: true });
  await writeFile(path.join(live, "assets/scripts/capture-template.mjs"), "// fixture capture-template.mjs\n");
  await writeFile(path.join(live, "assets/scripts/smoke-render-demos.py"), "# fixture smoke-render-demos.py\n");

  return live;
}

test("refreshFromLive: real end-to-end apply across every mapped category into a disposable temp vendor root", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-full-vendor-"));
  // Pre-populate scripts-templates with files that MUST survive untouched:
  // our own package.json, AND — the exact bug an independent audit caught —
  // the OPERATIONAL capture-template.mjs (refactored to export
  // runCapture()/DEFAULT_CONFIG, imported by smoke-test.mjs). A refresh must
  // update ONLY scripts-templates/upstream/, never this file.
  await mkdir(path.join(vendor, "scripts-templates"), { recursive: true });
  await writeFile(path.join(vendor, "scripts-templates/package.json"), '{"name":"our-own-file"}');
  const OPERATIONAL_MARKER = "// OPERATIONAL-MARKER: export function runCapture(config) { /* real refactored implementation */ }\nexport const DEFAULT_CONFIG = { BASE: 'http://localhost:3000' };\n";
  await writeFile(path.join(vendor, "scripts-templates/capture-template.mjs"), OPERATIONAL_MARKER);
  // NOTE: refreshFromLive() always executes the REAL builder from this repo's
  // own canonical vendor/shotcraft/scripts/build-audio-manifest.mjs — never
  // from `<vendorRoot>/scripts/...` (that would trust an untrusted caller
  // path; see resolveTrustedBuilderPath()). Nothing needs to be seeded into
  // the fixture vendor's own scripts/ dir for the audio step to run for real.

  try {
    const report = await refreshFromLive(live, vendor, { apply: true });

    const byLabel = Object.fromEntries(report.categories.map((c) => [c.label, c]));

    // shots
    assert.ok(existsSync(path.join(vendor, "shots/camera/test-card.md")));
    assert.equal(await readFile(path.join(vendor, "shots/camera/test-card.md"), "utf8"), await readFile(path.join(live, "references/shots/camera/test-card.md"), "utf8"));

    // demos — real file copied, AppleDouble excluded
    assert.ok(existsSync(path.join(vendor, "demos/camera/test-card/TestCard.tsx")));
    assert.ok(!existsSync(path.join(vendor, "demos/camera/test-card/._AppleDouble.tsx")), "AppleDouble must never be copied");

    // lib
    assert.ok(existsSync(path.join(vendor, "lib/helpers/rand.ts")));

    // library.json
    assert.ok(existsSync(path.join(vendor, "gallery/api/library.json")));

    // gallery posters
    assert.ok(existsSync(path.join(vendor, "gallery/media/poster/test-card.jpg")));

    // gallery UI — all 5 whitelisted files, nothing extra
    for (const f of ["translations.js", "app.js", "styles.css", "index.html", "library.html"]) {
      assert.ok(existsSync(path.join(vendor, "gallery", f)), `missing gallery UI file: ${f}`);
    }

    // jianying-export — real .py copied, __pycache__/.pyc excluded
    assert.ok(existsSync(path.join(vendor, "jianying-export/mac_draft.py")));
    assert.ok(!existsSync(path.join(vendor, "jianying-export/__pycache__")), "__pycache__ must never be copied");

    // root + reference process docs
    assert.ok(existsSync(path.join(vendor, "SKILL.md")));
    for (const doc of ["aesthetic-rules.md", "sound-design.md", "final-review.md", "music-beat-sync.md", "guided-free-creation.md", "pipeline.md", "workbench.md", "jianying-export.md"]) {
      assert.ok(existsSync(path.join(vendor, doc)), `missing doc: ${doc}`);
    }

    // aifl-template — full tree, including public assets
    assert.ok(existsSync(path.join(vendor, "aifl-template/src/aifl/Main.tsx")));
    assert.ok(existsSync(path.join(vendor, "aifl-template/public/textures/live/dummy.png")));

    // scripts-templates — the regression this test guards against: the
    // upstream snapshot subfolder gets the new live content...
    assert.ok(existsSync(path.join(vendor, "scripts-templates/upstream/capture-template.mjs")));
    assert.ok(existsSync(path.join(vendor, "scripts-templates/upstream/smoke-render-demos.py")));
    assert.equal(
      await readFile(path.join(vendor, "scripts-templates/upstream/capture-template.mjs"), "utf8"),
      await readFile(path.join(live, "assets/scripts/capture-template.mjs"), "utf8"),
      "upstream/ snapshot must be updated to match the live checkout",
    );
    // ...while the OPERATIONAL file (refactored runCapture()/DEFAULT_CONFIG,
    // real consumer smoke-test.mjs) is completely untouched — byte-identical
    // to what was there before refresh, not overwritten with raw upstream.
    assert.equal(
      await readFile(path.join(vendor, "scripts-templates/capture-template.mjs"), "utf8"),
      OPERATIONAL_MARKER,
      "refreshFromLive must NEVER overwrite the operational capture-template.mjs — only scripts-templates/upstream/",
    );
    assert.equal(await readFile(path.join(vendor, "scripts-templates/package.json"), "utf8"), '{"name":"our-own-file"}', "refreshFromLive must never touch files outside its explicit whitelist, even co-located ones");

    // audio — real build-audio-manifest.mjs ran; approved files copied,
    // BOTH real hardcoded-quarantine filenames excluded from the copy.
    assert.equal(report.audio.ran, true, JSON.stringify(report.audio));
    assert.ok(existsSync(path.join(vendor, "audio/sfx/transition/approved-sfx.mp3")));
    assert.ok(existsSync(path.join(vendor, "audio/bgm/approved-bgm.mp3")));
    assert.ok(!existsSync(path.join(vendor, "audio/sfx/ui/pop.mp3")), "quarantined pop.mp3 must NOT be copied");
    assert.ok(!existsSync(path.join(vendor, "audio/bgm/bgm-tech-house.mp3")), "quarantined bgm-tech-house.mp3 must NOT be copied");
    assert.ok(report.audio.quarantinedFiles.includes("pop.mp3"));
    assert.ok(report.audio.quarantinedFiles.includes("bgm-tech-house.mp3"));
    assert.equal(report.audio.sfxCount, 1);
    assert.equal(report.audio.bgmCount, 1);

    // Nothing escaped the temp vendor root.
    assert.ok(!existsSync(path.join(REPO_ROOT, "vendor/shotcraft/shots/camera/test-card.md")), "fixture must never leak into the real vendor/shotcraft/");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("refreshFromLive (report-only, apply:false) detects diffs without copying anything", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-report-only-vendor-"));
  try {
    const report = await refreshFromLive(live, vendor, { apply: false });
    const shotsCategory = report.categories.find((c) => c.label.includes("shots"));
    assert.ok(shotsCategory.onlyLive.length > 0, "should detect the fixture's new file as onlyLive");
    assert.ok(!existsSync(path.join(vendor, "shots")), "report-only must not create any vendor files");
    assert.equal(report.audio.ran, false, "report-only must not run the audio manifest builder");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

async function copyFileReal(src, dest) {
  await writeFile(dest, await readFile(src));
}

// ---------------------------------------------------------------------
// ADVERSARIAL symlink tests — the exact class of bug an independent audit
// caught: a symlinked destination FILE or an intermediate destination
// DIRECTORY pointing outside vendorRoot must never let a copy write into
// (or traverse into) whatever it points at.
// ---------------------------------------------------------------------

test("ADVERSARIAL: a destination FILE symlink pointing outside vendorRoot is rejected — the outside victim file is never overwritten", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-sym-live-"));
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-sym-vendor-"));
  const victimDir = await mkdtemp(path.join(tmpdir(), "shotcraft-sym-victim-"));
  try {
    await mkdir(path.join(live, "references/shots/camera"), { recursive: true });
    await writeFile(path.join(live, "references/shots/camera/test-card.md"), "NEW malicious-looking upstream content");

    const victimFile = path.join(victimDir, "innocent-bystander.md");
    const originalVictimContent = "original victim content — must survive byte-identical";
    await writeFile(victimFile, originalVictimContent);

    // The vendor destination is a SYMLINK pointing at the victim, not a real file.
    await mkdir(path.join(vendor, "shots/camera"), { recursive: true });
    await symlink(victimFile, path.join(vendor, "shots/camera/test-card.md"));

    let threw = null;
    try {
      await refreshFromLive(live, vendor, { apply: true });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw, "refreshFromLive must reject (throw), not silently succeed, when a destination is a symlink");
    assert.match(threw.message, /symlink|non-regular/i);

    // The victim, OUTSIDE vendorRoot entirely, must be byte-identical.
    assert.equal(await readFile(victimFile, "utf8"), originalVictimContent, "outside victim file must never be modified");
    // The vendor-side symlink itself must still be a symlink (not replaced).
    const st = await lstat(path.join(vendor, "shots/camera/test-card.md"));
    assert.ok(st.isSymbolicLink(), "the vendor-side symlink must not have been silently replaced either");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
    await rm(victimDir, { recursive: true, force: true });
  }
});

test("ADVERSARIAL: an intermediate destination DIRECTORY symlink pointing outside vendorRoot is rejected — nothing is created inside the victim directory or anywhere outside vendorRoot", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-symdir-live-"));
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-symdir-vendor-"));
  const victimDir = await mkdtemp(path.join(tmpdir(), "shotcraft-symdir-victim-"));
  try {
    await mkdir(path.join(live, "references/shots/camera"), { recursive: true });
    await writeFile(path.join(live, "references/shots/camera/test-card.md"), "content that must never land in the victim directory");

    // vendor/shots/camera is a SYMLINK to an external victim directory —
    // naive `mkdir(destDir, {recursive:true})` would happily walk through
    // this and materialize files inside victimDir.
    await mkdir(path.join(vendor, "shots"), { recursive: true });
    await symlink(victimDir, path.join(vendor, "shots/camera"));

    let threw = null;
    try {
      await refreshFromLive(live, vendor, { apply: true });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw, "refreshFromLive must reject (throw) when an intermediate destination directory is a symlink");
    assert.match(threw.message, /symlink|non-directory/i);

    // Nothing was created inside the victim directory.
    assert.deepEqual(await readdir(victimDir), [], "victim directory outside vendorRoot must remain empty");
    // The symlink itself is untouched (still a symlink, not replaced by a real dir).
    const st = await lstat(path.join(vendor, "shots/camera"));
    assert.ok(st.isSymbolicLink(), "the vendor-side directory symlink must not have been silently replaced");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
    await rm(victimDir, { recursive: true, force: true });
  }
});

test("ADVERSARIAL (audio): a destination FILE symlink under vendor/audio pointing outside vendorRoot is rejected during the real build-audio-manifest.mjs merge — outside victim untouched", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-audio-sym-vendor-"));
  const victimDir = await mkdtemp(path.join(tmpdir(), "shotcraft-audio-sym-victim-"));
  try {
    const victimFile = path.join(victimDir, "innocent-bystander.mp3");
    const originalVictimContent = "original victim audio bytes — must survive byte-identical";
    await writeFile(victimFile, originalVictimContent);

    // The real approved-sfx.mp3's eventual destination is a SYMLINK to the victim.
    await mkdir(path.join(vendor, "audio/sfx/transition"), { recursive: true });
    await symlink(victimFile, path.join(vendor, "audio/sfx/transition/approved-sfx.mp3"));

    let threw = null;
    try {
      await refreshFromLive(live, vendor, { apply: true });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw, "refreshFromLive must reject when an audio destination is a symlink, not silently merge through it");
    assert.match(threw.message, /symlink|non-regular/i);
    assert.equal(await readFile(victimFile, "utf8"), originalVictimContent, "outside victim audio file must never be modified");
    const st = await lstat(path.join(vendor, "audio/sfx/transition/approved-sfx.mp3"));
    assert.ok(st.isSymbolicLink(), "the vendor-side audio symlink must not have been silently replaced");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
    await rm(victimDir, { recursive: true, force: true });
  }
});

test("ADVERSARIAL (audio): an intermediate DIRECTORY symlink under vendor/audio pointing outside vendorRoot is rejected during the real merge — nothing created inside the victim directory or anywhere outside vendorRoot", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-audio-symdir-vendor-"));
  const victimDir = await mkdtemp(path.join(tmpdir(), "shotcraft-audio-symdir-victim-"));
  try {
    // vendor/audio/sfx is a SYMLINK to an external victim directory.
    await mkdir(path.join(vendor, "audio"), { recursive: true });
    await symlink(victimDir, path.join(vendor, "audio/sfx"));

    let threw = null;
    try {
      await refreshFromLive(live, vendor, { apply: true });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw, "refreshFromLive must reject when an intermediate audio destination directory is a symlink");
    assert.match(threw.message, /symlink|non-directory/i);
    assert.deepEqual(await readdir(victimDir), [], "victim directory outside vendorRoot must remain empty");
    const st = await lstat(path.join(vendor, "audio/sfx"));
    assert.ok(st.isSymbolicLink(), "the vendor-side audio directory symlink must not have been silently replaced");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
    await rm(victimDir, { recursive: true, force: true });
  }
});

test("ADVERSARIAL (builder trust): a fixture vendorRoot's own scripts/build-audio-manifest.mjs being a symlink to malicious code is never executed — refreshFromLive always runs the canonical trusted builder from this repo's own vendor/shotcraft/scripts/", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-trust-vendor-"));
  const outsideDir = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-trust-outside-"));
  try {
    const evilMarker = path.join(outsideDir, "evil-ran.marker");
    const evilScript = path.join(outsideDir, "evil.mjs");
    // If this were ever executed, it proves arbitrary code ran off an
    // untrusted, caller-supplied vendorRoot path — it must never run.
    await writeFile(evilScript, `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(evilMarker)}, "evil ran");\n`);

    await mkdir(path.join(vendor, "scripts"), { recursive: true });
    await symlink(evilScript, path.join(vendor, "scripts/build-audio-manifest.mjs"));

    // Must succeed — the real canonical builder runs regardless of what's
    // (mis)placed under this disposable fixture's own scripts/ dir.
    const report = await refreshFromLive(live, vendor, { apply: true });

    assert.equal(existsSync(evilMarker), false, "the malicious symlinked script must never have been executed");
    assert.equal(report.audio.ran, true, JSON.stringify(report.audio));
    assert.equal(report.audio.sfxCount, 1);
    assert.equal(report.audio.bgmCount, 1);
    assert.ok(existsSync(path.join(vendor, "audio/sfx/transition/approved-sfx.mp3")), "the real canonical builder must still have run and merged approved audio");
    const st = await lstat(path.join(vendor, "scripts/build-audio-manifest.mjs"));
    assert.ok(st.isSymbolicLink(), "the fixture's own poisoned symlink must be left exactly as it was — never consulted, never touched");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
    await rm(outsideDir, { recursive: true, force: true });
  }
});

const BUILDER_PATH = path.join(REPO_ROOT, "vendor/shotcraft/scripts/build-audio-manifest.mjs");

test("REGRESSION (real taxonomy): riser-cine.mp3 | sfx/riser/ is a REAL, recognized source category (16th) that is NOT one of the 15 approved output categories — the builder must succeed, file lands in manifest.quarantined, and the riser binary is never read or copied", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-riser-live-"));
  const dest = await mkdtemp(path.join(tmpdir(), "shotcraft-riser-dest-"));
  try {
    await mkdir(path.join(live, "assets/audio/sfx/transition"), { recursive: true });
    await mkdir(path.join(live, "assets/audio/sfx/riser"), { recursive: true });
    await writeFile(path.join(live, "assets/audio/sfx/transition/approved-sfx.mp3"), "fake-approved-sfx-bytes");
    await writeFile(path.join(live, "assets/audio/sfx/riser/riser-cine.mp3"), "fake-riser-bytes — must never be read or copied");
    await writeFile(
      path.join(live, "assets/audio/ATTRIBUTION.md"),
      [
        "| 文件 | 路径 | 来源 | 原名 / URL |",
        "|---|---|---|---|",
        "| `approved-sfx.mp3` | `sfx/transition/` | Mixkit | Test approved · https://example.com/approved |",
        "| `riser-cine.mp3` | `sfx/riser/` | Mixkit License | **无法反查**，商用前须确认 |",
        "",
        "## bgm/（BGM 备选）",
        "",
        "| 文件名 | 原曲名 | 艺术家 | 风格 | BPM | URL |",
        "|---|---|---|---|---|---|",
      ].join("\n"),
    );

    const { stdout } = await exec("node", [BUILDER_PATH, live, dest]);
    assert.match(stdout, /sfx vendored: 1/);
    assert.match(stdout, /quarantined: 1/);

    const manifest = JSON.parse(await readFile(path.join(dest, "audio/manifest.json"), "utf8"));
    assert.equal(manifest.sfx.length, 1);
    assert.equal(manifest.sfx[0].file, "approved-sfx.mp3");
    assert.equal(manifest.quarantined.length, 1);
    assert.equal(manifest.quarantined[0].file, "riser-cine.mp3");
    assert.equal(manifest.quarantined[0].category, "riser");

    assert.equal(existsSync(path.join(dest, "audio/sfx/riser")), false, "no riser binary or directory may ever be created under vendored audio — riser-cine.mp3 must never be read or copied");
    assert.deepEqual(
      (await readdir(path.join(dest, "audio/sfx"))).sort(),
      ["transition"],
      "sfx/ must contain only the approved-output categories actually used — never a riser/ directory",
    );
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(dest, { recursive: true, force: true });
  }
});

test("ADVERSARIAL (builder hardening): the real canonical builder, run directly, exits nonzero and writes NOTHING when ATTRIBUTION.md has a path-traversal CATEGORY — known outside victim unchanged", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-cattraverse-live-"));
  const outsideDir = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-cattraverse-outside-"));
  const dest = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-cattraverse-dest-"));
  try {
    await mkdir(path.join(live, "assets/audio/sfx/transition"), { recursive: true });
    await writeFile(path.join(live, "assets/audio/sfx/transition/approved-sfx.mp3"), "fake-approved-sfx-bytes");

    const victimFile = path.join(outsideDir, "victim.mp3");
    const originalVictimContent = "known outside victim — category traversal must never touch this";
    await writeFile(victimFile, originalVictimContent);

    // A category column that, if ever joined unvalidated into a real path,
    // would resolve out of assets/audio/ and into outsideDir.
    const traversalCategory = path.relative(path.join(live, "assets/audio"), outsideDir);

    await writeFile(
      path.join(live, "assets/audio/ATTRIBUTION.md"),
      [
        "| 文件 | 路径 | 来源 | 原名 / URL |",
        "|---|---|---|---|",
        "| `approved-sfx.mp3` | `sfx/transition/` | Mixkit | Test approved · https://example.com/approved |",
        `| \`victim.mp3\` | \`sfx/${traversalCategory}/\` | attacker | attacker-controlled |`,
        "",
        "## bgm/（BGM 备选）",
        "",
        "| 文件名 | 原曲名 | 艺术家 | 风格 | BPM | URL |",
        "|---|---|---|---|---|---|",
      ].join("\n"),
    );

    let caught = null;
    try {
      await exec("node", [BUILDER_PATH, live, dest]);
    } catch (error) {
      caught = error;
    }
    assert.ok(caught, "the builder must exit nonzero, not succeed while silently dropping a traversal row");
    assert.notEqual(caught.code, 0);
    assert.match(String(caught.stderr ?? caught.message), /category is not one of the 16 recognized source SFX categories/);

    assert.equal(existsSync(path.join(dest, "audio")), false, "nothing must be written — fail-closed happens before any destination directory is even created");
    assert.equal(await readFile(victimFile, "utf8"), originalVictimContent, "outside victim must be completely untouched");
    assert.deepEqual(await readdir(outsideDir), ["victim.mp3"], "no new file may be created anywhere under the outside directory the traversal targeted");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(outsideDir, { recursive: true, force: true });
    await rm(dest, { recursive: true, force: true });
  }
});

test("ADVERSARIAL (builder hardening): the real canonical builder, run directly, exits nonzero and writes NOTHING when ATTRIBUTION.md has a path-traversal FILENAME — known outside victim unchanged", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-filetraverse-live-"));
  const outsideDir = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-filetraverse-outside-"));
  const dest = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-filetraverse-dest-"));
  try {
    await mkdir(path.join(live, "assets/audio/sfx/transition"), { recursive: true });
    await writeFile(path.join(live, "assets/audio/sfx/transition/approved-sfx.mp3"), "fake-approved-sfx-bytes");

    const victimFile = path.join(outsideDir, "victim.mp3");
    const originalVictimContent = "known outside victim — filename traversal must never touch this";
    await writeFile(victimFile, originalVictimContent);

    // A filename that, if ever joined unvalidated into a real path, escapes
    // assets/audio/sfx/transition/ and lands on the outside victim.
    const traversalFilename = path.join(path.relative(path.join(live, "assets/audio/sfx/transition"), outsideDir), "victim.mp3");

    await writeFile(
      path.join(live, "assets/audio/ATTRIBUTION.md"),
      [
        "| 文件 | 路径 | 来源 | 原名 / URL |",
        "|---|---|---|---|",
        "| `approved-sfx.mp3` | `sfx/transition/` | Mixkit | Test approved · https://example.com/approved |",
        `| \`${traversalFilename}\` | \`sfx/transition/\` | attacker | attacker-controlled |`,
        "",
        "## bgm/（BGM 备选）",
        "",
        "| 文件名 | 原曲名 | 艺术家 | 风格 | BPM | URL |",
        "|---|---|---|---|---|---|",
      ].join("\n"),
    );

    let caught = null;
    try {
      await exec("node", [BUILDER_PATH, live, dest]);
    } catch (error) {
      caught = error;
    }
    assert.ok(caught, "the builder must exit nonzero, not succeed while silently dropping a traversal row");
    assert.notEqual(caught.code, 0);
    assert.match(String(caught.stderr ?? caught.message), /filename fails safe-basename validation/);

    assert.equal(existsSync(path.join(dest, "audio")), false, "nothing must be written — fail-closed happens before any destination directory is even created");
    assert.equal(await readFile(victimFile, "utf8"), originalVictimContent, "outside victim must be completely untouched");
    assert.deepEqual(await readdir(outsideDir), ["victim.mp3"], "no new file may be created anywhere under the outside directory the traversal targeted");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(outsideDir, { recursive: true, force: true });
    await rm(dest, { recursive: true, force: true });
  }
});

test("ADVERSARIAL (builder hardening) via refreshFromLive: a malicious ATTRIBUTION.md row (category traversal) makes the whole --apply audio step reject, and vendor/audio is never created or modified", async () => {
  const live = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-refresh-cattraverse-live-"));
  const outsideDir = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-refresh-cattraverse-outside-"));
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-builder-refresh-cattraverse-vendor-"));
  try {
    await mkdir(path.join(live, "assets/audio/sfx/transition"), { recursive: true });
    await writeFile(path.join(live, "assets/audio/sfx/transition/approved-sfx.mp3"), "fake-approved-sfx-bytes");
    const victimFile = path.join(outsideDir, "victim.mp3");
    const originalVictimContent = "known outside victim — must survive a refreshFromLive apply too";
    await writeFile(victimFile, originalVictimContent);
    const traversalCategory = path.relative(path.join(live, "assets/audio"), outsideDir);
    await writeFile(
      path.join(live, "assets/audio/ATTRIBUTION.md"),
      [
        "| 文件 | 路径 | 来源 | 原名 / URL |",
        "|---|---|---|---|",
        "| `approved-sfx.mp3` | `sfx/transition/` | Mixkit | Test approved · https://example.com/approved |",
        `| \`victim.mp3\` | \`sfx/${traversalCategory}/\` | attacker | attacker-controlled |`,
        "",
        "## bgm/（BGM 备选）",
        "",
        "| 文件名 | 原曲名 | 艺术家 | 风格 | BPM | URL |",
        "|---|---|---|---|---|---|",
      ].join("\n"),
    );

    let threw = null;
    try {
      await refreshFromLive(live, vendor, { apply: true });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw, "refreshFromLive must reject the whole audio step when the real builder detects a malicious row");
    assert.match(threw.message, /category is not one of the 16 recognized source SFX categories/);
    assert.equal(existsSync(path.join(vendor, "audio")), false, "no vendor audio content may exist — the scratch-to-vendor merge never runs because the builder itself already failed closed");
    assert.equal(await readFile(victimFile, "utf8"), originalVictimContent);
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(outsideDir, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("STALE AUDIO PRUNING: a physically-present binary that the CURRENT manifest quarantines (simulating a file vendored before its provenance issue was caught) is purged by --apply", async () => {
  const live = await buildLiveFixture(); // real quarantine: pop.mp3 under sfx/ui/
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-prune-quarantine-vendor-"));
  try {
    // Simulate a stale binary left over from before pop.mp3 was recognized as
    // quarantined — physically present at the exact path the manifest would
    // have vendored it to, but NOT listed in manifest.sfx (since it's really
    // quarantined per the real hardcoded QUARANTINE set).
    await mkdir(path.join(vendor, "audio/sfx/ui"), { recursive: true });
    await writeFile(path.join(vendor, "audio/sfx/ui/pop.mp3"), "stale bytes from before the quarantine policy caught this file");

    const report = await refreshFromLive(live, vendor, { apply: true });

    assert.ok(report.audio.quarantinedFiles.includes("pop.mp3"), JSON.stringify(report.audio));
    assert.equal(existsSync(path.join(vendor, "audio/sfx/ui/pop.mp3")), false, "the stale, now-quarantined binary must be purged, not just excluded from future copies");
    assert.ok(report.audio.prunedStaleFiles.includes(path.join("sfx", "ui", "pop.mp3")), JSON.stringify(report.audio.prunedStaleFiles));
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("STALE AUDIO PRUNING: an unattributed stale audio binary (never mentioned in ATTRIBUTION.md at all — not approved, not quarantined) is purged under the strict allowlist policy", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-prune-unattributed-vendor-"));
  try {
    await mkdir(path.join(vendor, "audio/sfx/ui"), { recursive: true });
    await writeFile(path.join(vendor, "audio/sfx/ui/totally-unattributed-leftover.mp3"), "no attribution row anywhere for this file");

    const report = await refreshFromLive(live, vendor, { apply: true });

    assert.equal(existsSync(path.join(vendor, "audio/sfx/ui/totally-unattributed-leftover.mp3")), false, "an unattributed leftover binary must be purged too — the allowlist is strict, not just quarantine-aware");
    assert.ok(report.audio.prunedStaleFiles.includes(path.join("sfx", "ui", "totally-unattributed-leftover.mp3")), JSON.stringify(report.audio.prunedStaleFiles));
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("STALE AUDIO PRUNING: non-audio-extension files under vendor/audio (README/NOTICE-style docs, manifest.json) always survive, even when not on the allowlist", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-prune-docs-survive-vendor-"));
  try {
    await mkdir(path.join(vendor, "audio"), { recursive: true });
    await writeFile(path.join(vendor, "audio/README.md"), "# audio README — must survive pruning, it is not an audio binary\n");
    await writeFile(path.join(vendor, "audio/NOTICE.md"), "# audio NOTICE — must survive pruning\n");

    const report = await refreshFromLive(live, vendor, { apply: true });

    assert.equal(await readFile(path.join(vendor, "audio/README.md"), "utf8"), "# audio README — must survive pruning, it is not an audio binary\n");
    assert.equal(await readFile(path.join(vendor, "audio/NOTICE.md"), "utf8"), "# audio NOTICE — must survive pruning\n");
    assert.ok(existsSync(path.join(vendor, "audio/manifest.json")), "manifest.json must always survive pruning");
    assert.ok(!report.audio.prunedStaleFiles.includes("README.md"));
    assert.ok(!report.audio.prunedStaleFiles.includes("NOTICE.md"));
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("STALE AUDIO PRUNING (fail-closed, no partial cleanup): a symlink anywhere under vendor/audio makes the whole prune step throw BEFORE deleting anything — a legitimately-stale regular file survives, and the outside symlink target is untouched", async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-prune-failclosed-vendor-"));
  const victimDir = await mkdtemp(path.join(tmpdir(), "shotcraft-prune-failclosed-victim-"));
  try {
    // A legitimately-stale regular file that WOULD be pruned on its own.
    await mkdir(path.join(vendor, "audio/sfx/ui"), { recursive: true });
    await writeFile(path.join(vendor, "audio/sfx/ui/totally-unattributed-leftover.mp3"), "would be pruned on its own");

    // An unrelated symlink elsewhere under audio/, pointing outside vendorRoot.
    const victimFile = path.join(victimDir, "innocent.mp3");
    const originalVictimContent = "outside victim bytes — must survive byte-identical";
    await writeFile(victimFile, originalVictimContent);
    await mkdir(path.join(vendor, "audio/sfx/weird"), { recursive: true });
    await symlink(victimFile, path.join(vendor, "audio/sfx/weird/dangling.mp3"));

    let threw = null;
    try {
      await refreshFromLive(live, vendor, { apply: true });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw, "the prune step must reject the whole operation when a symlink is found under audio/");
    assert.match(threw.message, /symlink/i);

    // No partial cleanup: the legitimately-stale file must STILL be present,
    // because pass 1 (validate-only) must throw before pass 2 (unlink) ever runs.
    assert.ok(existsSync(path.join(vendor, "audio/sfx/ui/totally-unattributed-leftover.mp3")), "no file may be pruned once a symlink is found anywhere in the tree — validation must run to completion first, fail closed, with zero mutation");

    // The outside victim is completely unaffected — pass 1 only ever lstats,
    // never dereferences/reads/deletes through the symlink.
    assert.equal(await readFile(victimFile, "utf8"), originalVictimContent);
    const st = await lstat(path.join(vendor, "audio/sfx/weird/dangling.mp3"));
    assert.ok(st.isSymbolicLink(), "the symlink itself must also survive untouched");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
    await rm(victimDir, { recursive: true, force: true });
  }
});

test("STALE AUDIO PRUNING (fail-closed, real special file): a genuine FIFO (named pipe) under vendor/audio — neither a symlink nor a regular file — also makes the prune step throw before deleting anything", { skip: process.platform !== "darwin" && process.platform !== "linux" && "mkfifo(1) not available on this platform" }, async () => {
  const live = await buildLiveFixture();
  const vendor = await mkdtemp(path.join(tmpdir(), "shotcraft-prune-fifo-vendor-"));
  try {
    await mkdir(path.join(vendor, "audio/sfx/ui"), { recursive: true });
    await writeFile(path.join(vendor, "audio/sfx/ui/totally-unattributed-leftover.mp3"), "would be pruned on its own");

    const fifoPath = path.join(vendor, "audio/sfx/ui/weird.mp3");
    await exec("mkfifo", [fifoPath]);
    const preSt = await lstat(fifoPath);
    assert.ok(preSt.isFIFO(), "test precondition: this must be a genuine FIFO, not a regular file or symlink");

    let threw = null;
    try {
      await refreshFromLive(live, vendor, { apply: true });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw, "a FIFO under audio/ must also be rejected — isRegular must be false for it, same as a symlink");
    assert.match(threw.message, /non-regular/i);
    assert.ok(existsSync(path.join(vendor, "audio/sfx/ui/totally-unattributed-leftover.mp3")), "no partial cleanup — the legitimately-stale file must survive when a FIFO elsewhere aborts the whole prune");
    const postSt = await lstat(fifoPath);
    assert.ok(postSt.isFIFO(), "the FIFO itself must be left untouched");
  } finally {
    await rm(live, { recursive: true, force: true });
    await rm(vendor, { recursive: true, force: true });
  }
});

test("importing refresh-audit.mjs (even with --apply in argv) never runs main() as a module side effect", async () => {
  // Simulates "argv has --apply" by running a tiny script that sets argv and
  // then imports the module — main() must NOT fire just from the import.
  const probe = await mkdtemp(path.join(tmpdir(), "refresh-audit-import-probe-"));
  try {
    const probeScript = path.join(probe, "probe.mjs");
    await writeFile(
      probeScript,
      [
        `process.argv = ["node", "not-refresh-audit.mjs", "--apply"];`,
        `let ran = false;`,
        `const origLog = console.log;`,
        `console.log = (...args) => { ran = true; origLog(...args); };`,
        `await import(${JSON.stringify(SCRIPT)});`,
        `console.log = origLog;`,
        `if (ran) { console.error("SIDE_EFFECT_DETECTED"); process.exit(1); }`,
        `console.log("NO_SIDE_EFFECT");`,
      ].join("\n"),
    );
    const { stdout } = await exec("node", [probeScript]);
    assert.match(stdout, /NO_SIDE_EFFECT/);
  } finally {
    await rm(probe, { recursive: true, force: true });
  }
});
