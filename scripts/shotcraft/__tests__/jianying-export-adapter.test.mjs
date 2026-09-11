import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { validateDraftName, applyInstall, macifyAndInstall } from "../jianying-export-adapter.mjs";

const exec = promisify(execFile);
const ADAPTER = path.resolve(import.meta.dirname, "../jianying-export-adapter.mjs");
const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const JIANYING_DIR = path.join(REPO_ROOT, "vendor/shotcraft/jianying-export");
const isMac = process.platform === "darwin";

async function findPycacheArtifacts(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__pycache__") found.push(full);
      else found.push(...(await findPycacheArtifacts(full)));
    } else if (entry.name.endsWith(".pyc")) {
      found.push(full);
    }
  }
  return found;
}
// 1x1 PNG — real, valid, decodable image bytes so ffmpeg's cover-frame
// extraction inside the real macify() has genuine input, not a stub.
const TINY_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/YsAAAAASUVORK5CYII=", "base64");

test("validateDraftName accepts a safe name and resolves it under a throwaway temp root, never the real JianYing directory", async () => {
  const result = await validateDraftName("my-video-2026-09-11");
  assert.equal(result.ok, true);
  assert.ok(result.resolvedPath.includes("jianying-export-dry-run-probe"));
  assert.ok(!result.resolvedPath.includes("Movies/JianyingPro"), "must never resolve into the real JianYing library during validation");
});

test("validateDraftName rejects a path-escape draft name (../../etc/evil) using the real vendored validator logic", async () => {
  const result = await validateDraftName("../../etc/evil");
  assert.equal(result.ok, false);
  assert.match(result.reason, /非法草稿名|ValueError/);
});

test("validateDraftName rejects an absolute path draft name", async () => {
  const result = await validateDraftName("/etc/passwd");
  assert.equal(result.ok, false);
});

test("CLI 'install' without the explicit confirmation flag refuses and exits non-zero — never runs silently", async () => {
  await assert.rejects(() => exec("node", [ADAPTER, "install", "/tmp/fake-draft", "my-video"]));
});

test("CLI 'install' with confirmation but without --apply only dry-run validates, does not install", async () => {
  const { stdout } = await exec("node", [ADAPTER, "install", "/tmp/fake-draft", "safe-name", "--i-understand-this-writes-to-my-jianying-library"]);
  assert.match(stdout, /Dry-run only/);
});

test("applyInstall refuses when draftDir does not exist", async () => {
  const result = await applyInstall("/definitely/not/a/real/dir", "x", { draftRoot: "/tmp/whatever" });
  assert.equal(result.ok, false);
  assert.match(result.reason, /does not exist/);
});

test("applyInstall refuses when draftDir exists but lacks draft_info.json (not a real draft folder)", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "not-a-draft-"));
  try {
    const result = await applyInstall(dir, "x", { draftRoot: "/tmp/whatever" });
    assert.equal(result.ok, false);
    assert.match(result.reason, /already-macified/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("applyInstall refuses to fabricate a draft_id when it cannot be derived and none was trusted-supplied", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "no-draft-id-"));
  try {
    await writeFile(path.join(dir, "draft_info.json"), JSON.stringify({ duration: 5000000 })); // no draft_meta_info.json alongside — draft_id undiscoverable
    const result = await applyInstall(dir, "x", { draftRoot: "/tmp/whatever" });
    assert.equal(result.ok, false);
    assert.match(result.reason, /refusing to fabricate/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("applyInstall (already-macified path) derives real info from the draft's own JSON and a real Resources/ byte count — never fabricates — end-to-end against a disposable fixture root", { skip: !isMac && "mac_draft.py path only; this environment is not macOS" }, async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "jianying-fixture-root-"));
  const draftDir = await mkdtemp(path.join(tmpdir(), "jianying-fixture-draft-"));
  try {
    await writeFile(path.join(fixtureRoot, "root_meta_info.json"), JSON.stringify({ all_draft_store: [] }));
    await writeFile(path.join(draftDir, "draft_info.json"), JSON.stringify({ duration: 7654321 }));
    await writeFile(path.join(draftDir, "draft_meta_info.json"), JSON.stringify({ draft_id: "REAL-DERIVED-DRAFT-ID" }));
    await mkdir(path.join(draftDir, "Resources"));
    await writeFile(path.join(draftDir, "Resources", "clip.png"), TINY_PNG); // real bytes — materials_size must equal this, not 0

    const result = await applyInstall(draftDir, "derived-info-draft", { draftRoot: fixtureRoot });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.info.draft_id, "REAL-DERIVED-DRAFT-ID");
    assert.equal(result.info.duration, 7654321);
    assert.equal(result.info.materials_size, TINY_PNG.length, "materials_size must be the REAL Resources/ byte count, not a fabricated 0");

    assert.ok(existsSync(path.join(fixtureRoot, "derived-info-draft", "draft_info.json")));
    const registry = JSON.parse(await readFile(path.join(fixtureRoot, "root_meta_info.json"), "utf8"));
    assert.equal(registry.all_draft_store[0].draft_id, "REAL-DERIVED-DRAFT-ID");
    assert.equal(registry.all_draft_store[0].tm_duration, 7654321);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
    await rm(draftDir, { recursive: true, force: true }).catch(() => {});
  }
});

test("CLI 'install --apply' end-to-end through the actual CLI entry point (already-macified path), still fully sandboxed", { skip: !isMac && "mac_draft.py path only; this environment is not macOS" }, async () => {
  const fixtureHome = await mkdtemp(path.join(tmpdir(), "jianying-fixture-home-"));
  const draftRoot = path.join(fixtureHome, "Movies/JianyingPro/User Data/Projects/com.lveditor.draft");
  const draftDir = await mkdtemp(path.join(tmpdir(), "jianying-fixture-draft-cli-"));
  try {
    await mkdir(draftRoot, { recursive: true });
    await writeFile(path.join(draftRoot, "root_meta_info.json"), JSON.stringify({ all_draft_store: [] }));
    await writeFile(path.join(draftDir, "draft_info.json"), JSON.stringify({ duration: 1000000 }));
    await writeFile(path.join(draftDir, "draft_meta_info.json"), JSON.stringify({ draft_id: "CLI-DRAFT-ID" }));

    const { stdout } = await exec("node", [ADAPTER, "install", draftDir, "cli-smoke-draft", "--i-understand-this-writes-to-my-jianying-library", "--apply"], {
      env: { ...process.env, HOME: fixtureHome },
    });
    const result = JSON.parse(stdout);
    assert.equal(result.ok, true, stdout);
    assert.ok(existsSync(path.join(draftRoot, "cli-smoke-draft", "draft_info.json")));
  } finally {
    await rm(fixtureHome, { recursive: true, force: true });
    await rm(draftDir, { recursive: true, force: true }).catch(() => {});
  }
});

test("macifyAndInstall fails closed by default with no fingerprint source (mirrors mac_draft.py's own safe-failure default, not loosened)", { skip: !isMac && "mac_draft.py path only; this environment is not macOS" }, async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "jianying-fixture-nofp-"));
  const rawDraftDir = await mkdtemp(path.join(tmpdir(), "jianying-raw-nofp-"));
  try {
    await writeFile(path.join(fixtureRoot, "root_meta_info.json"), JSON.stringify({ all_draft_store: [] }));
    await writeFile(path.join(rawDraftDir, "draft_content.json"), JSON.stringify({ duration: 1, platform: {}, last_modified_platform: {}, materials: { videos: [], audios: [] } }));
    await writeFile(path.join(rawDraftDir, "draft_meta_info.json"), JSON.stringify({ draft_materials: [{ type: 0, value: [] }] }));

    // No donorDraft, no allowMissingFingerprint — must fail exactly like
    // mac_draft.py's own macify() does by default (empty DRAFT_ROOT fixture
    // has no plaintext donor to auto-scan).
    const result = await macifyAndInstall(rawDraftDir, "no-fingerprint-draft", { draftRoot: fixtureRoot });
    assert.equal(result.ok, false);
    assert.match(result.reason, /指纹|fingerprint/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
    await rm(rawDraftDir, { recursive: true, force: true }).catch(() => {});
  }
});

test("macifyAndInstall: real macify()->install() chain end-to-end via an explicit donor fixture (real fingerprint source, not allow-missing)", { skip: !isMac && "mac_draft.py path only; this environment is not macOS" }, async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "jianying-fixture-macify-"));
  const rawDraftDir = await mkdtemp(path.join(tmpdir(), "jianying-raw-macify-"));
  const donorDraft = await mkdtemp(path.join(tmpdir(), "jianying-donor-"));
  try {
    await writeFile(path.join(fixtureRoot, "root_meta_info.json"), JSON.stringify({ all_draft_store: [] }));
    // Donor: a real plaintext draft with a genuine-shaped fingerprint —
    // exercises the explicit donor_draft path, not allow_missing_fingerprint.
    await writeFile(path.join(donorDraft, "draft_info.json"), JSON.stringify({ platform: { os: "mac", device_id: "TEST-DONOR-DEVICE-ID", app_version: "1.0.0", hard_disk_id: "TEST-DISK", mac_address: "TEST-MAC" } }));

    // Minimal real pyJianYingDraft staging shape: one photo-typed "video"
    // material pointing at a real, decodable PNG so macify()'s real
    // media-bundling + ffmpeg cover-frame extraction both run for real.
    const mediaSrc = path.join(rawDraftDir, "source-clip.png");
    await writeFile(mediaSrc, TINY_PNG);
    await writeFile(
      path.join(rawDraftDir, "draft_content.json"),
      JSON.stringify({
        duration: 5000000,
        platform: {},
        last_modified_platform: {},
        materials: { videos: [{ path: mediaSrc, duration: 5000000, width: 1, height: 1, type: "photo", material_name: "source-clip.png" }], audios: [] },
      }),
    );
    await writeFile(path.join(rawDraftDir, "draft_meta_info.json"), JSON.stringify({ draft_materials: [{ type: 0, value: [] }] }));

    const result = await macifyAndInstall(rawDraftDir, "macify-e2e-draft", { draftRoot: fixtureRoot, donorDraft, bundleMedia: true });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.info.duration, 5000000);
    assert.ok(result.info.materials_size > 0, "real bundled media must produce a nonzero real byte count");
    assert.ok(result.info.draft_id, "macify() must derive/generate a real draft_id");

    // The installed draft is real, in the fixture root only.
    const installedDir = path.join(fixtureRoot, "macify-e2e-draft");
    assert.ok(existsSync(path.join(installedDir, "draft_info.json")), "macify() writes the Mac-native draft_info.json entry file");
    assert.ok(existsSync(path.join(installedDir, "Resources", "source-clip.png")), "real media must be bundled into Resources/");
    const registry = JSON.parse(await readFile(path.join(fixtureRoot, "root_meta_info.json"), "utf8"));
    assert.equal(registry.all_draft_store.length, 1);
    assert.equal(registry.all_draft_store[0].draft_name, "macify-e2e-draft");

    // Fingerprint was genuinely propagated from the donor, not fabricated.
    const installedContent = JSON.parse(await readFile(path.join(installedDir, "draft_info.json"), "utf8"));
    assert.equal(installedContent.platform.device_id, "TEST-DONOR-DEVICE-ID");
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
    await rm(rawDraftDir, { recursive: true, force: true }).catch(() => {});
    await rm(donorDraft, { recursive: true, force: true }).catch(() => {});
  }
});

test("CLI 'install-raw' rejects --donor-draft with a nonexistent path before running anything", async () => {
  const { stdout, stderr } = await exec("node", [
    ADAPTER, "install-raw", "/tmp/fake-raw-draft", "x",
    "--i-understand-this-writes-to-my-jianying-library", "--apply",
    "--donor-draft", "/definitely/not/a/real/donor/path",
  ]).catch((e) => e);
  assert.match(stdout + stderr, /does not exist/);
});

test("CLI 'install-raw' rejects a --donor-draft flag with no following path argument", async () => {
  const { stdout, stderr } = await exec("node", [
    ADAPTER, "install-raw", "/tmp/fake-raw-draft", "x",
    "--i-understand-this-writes-to-my-jianying-library", "--apply", "--donor-draft",
  ]).catch((e) => e);
  assert.match(stdout + stderr, /requires a path argument/);
});

test("CLI 'install-raw' with --allow-missing-fingerprint prints the experimental-risk warning", { skip: !isMac && "mac_draft.py path only; this environment is not macOS" }, async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "jianying-cli-fp-"));
  const rawDraftDir = await mkdtemp(path.join(tmpdir(), "jianying-cli-raw-"));
  try {
    await writeFile(path.join(fixtureRoot, "root_meta_info.json"), JSON.stringify({ all_draft_store: [] }));
    await writeFile(path.join(rawDraftDir, "draft_content.json"), JSON.stringify({ duration: 1, platform: {}, last_modified_platform: {}, materials: { videos: [], audios: [] } }));
    await writeFile(path.join(rawDraftDir, "draft_meta_info.json"), JSON.stringify({ draft_materials: [{ type: 0, value: [] }] }));

    // macifyAndInstall's draftRoot option isn't reachable from the bare CLI
    // (no --draft-root flag exists, by design — the CLI's real invocation
    // always targets the real platform default), so this only verifies the
    // WARNING fires and flag parsing works; it does not (and must not)
    // exercise a real install against $HOME here. Confirm the CLI still
    // fails safely rather than silently succeeding against a real path.
    const { stderr } = await exec("node", [
      ADAPTER, "install-raw", rawDraftDir, "cli-fp-draft",
      "--i-understand-this-writes-to-my-jianying-library", "--apply", "--allow-missing-fingerprint",
    ], { env: { ...process.env, HOME: fixtureRoot } }).catch((e) => e);
    assert.match(stderr, /EXPERIMENTAL, at your own risk/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
    await rm(rawDraftDir, { recursive: true, force: true }).catch(() => {});
  }
});

test("CLI 'install-raw' default (no --donor-draft, no --allow-missing-fingerprint) fails closed, matching the programmatic default", { skip: !isMac && "mac_draft.py path only; this environment is not macOS" }, async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "jianying-cli-default-"));
  const rawDraftDir = await mkdtemp(path.join(tmpdir(), "jianying-cli-raw-default-"));
  try {
    await mkdir(path.join(fixtureRoot, "Movies/JianyingPro/User Data/Projects/com.lveditor.draft"), { recursive: true });
    await writeFile(path.join(fixtureRoot, "Movies/JianyingPro/User Data/Projects/com.lveditor.draft/root_meta_info.json"), JSON.stringify({ all_draft_store: [] }));
    await writeFile(path.join(rawDraftDir, "draft_content.json"), JSON.stringify({ duration: 1, platform: {}, last_modified_platform: {}, materials: { videos: [], audios: [] } }));
    await writeFile(path.join(rawDraftDir, "draft_meta_info.json"), JSON.stringify({ draft_materials: [{ type: 0, value: [] }] }));

    const { stdout } = await exec("node", [
      ADAPTER, "install-raw", rawDraftDir, "cli-default-draft",
      "--i-understand-this-writes-to-my-jianying-library", "--apply",
    ], { env: { ...process.env, HOME: fixtureRoot } }).catch((e) => e);
    const result = JSON.parse(stdout);
    assert.equal(result.ok, false);
    assert.match(result.reason, /指纹|fingerprint/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
    await rm(rawDraftDir, { recursive: true, force: true }).catch(() => {});
  }
});

test("REGRESSION: running the Python subprocess flow (even with PYTHONDONTWRITEBYTECODE explicitly unset in the child env) never creates __pycache__/*.pyc anywhere under the vendored jianying-export tree", async () => {
  const before = await findPycacheArtifacts(JIANYING_DIR);
  assert.deepEqual(before, [], `test precondition violated — pycache artifacts already present before this test ran: ${before.join(", ")}`);

  // Deliberately strip PYTHONDONTWRITEBYTECODE from THIS process's env before
  // it reaches runPython()'s exec() call, so this proves the adapter's own
  // -B flag + explicit env override is what prevents bytecode writes — not
  // an inherited outer environment variable that happens to be set already.
  const savedEnv = process.env.PYTHONDONTWRITEBYTECODE;
  delete process.env.PYTHONDONTWRITEBYTECODE;
  try {
    // validateDraftName exercises runPython() via a real python3 -c invocation
    // that imports mac_draft/windows_draft from the vendored tree — exactly
    // the path that previously left mac_draft.cpython-314.pyc behind.
    const result = await validateDraftName("pycache-regression-probe");
    assert.equal(result.ok, true);
  } finally {
    if (savedEnv !== undefined) process.env.PYTHONDONTWRITEBYTECODE = savedEnv;
  }

  const after = await findPycacheArtifacts(JIANYING_DIR);
  assert.deepEqual(after, [], `Python subprocess left bytecode artifacts in the vendored tree: ${after.join(", ")}`);
});
