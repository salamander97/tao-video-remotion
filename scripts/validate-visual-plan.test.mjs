import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { validateVisualPlan } from "./validate-visual-plan.mjs";

const scene = () => ({
  id: "evidence", narration: "Xem chi tiết bằng chứng này.", visualIntent: "Chỉ ra hai chi tiết trong ảnh",
  sceneType: "evidence", primaryVisualType: "photo", data: null, assetQuery: "specific subject detail",
  assetRequired: true, visualCoverage: 0.85, durationInFrames: 300,
  visualBeats: [0, 60, 130, 210, 280].map((frame, i) => ({ frame, action: "focus-detail-" + i })),
  motionPreset: "precise", captionEmphasis: [], sourceCredit: "Fixture source",
  layoutMode: "editorial", headline: "Hai chi tiết", evidenceTreatment: "photo-story",
  captionMode: "editorial-inline", assetIds: ["photo"],
});
const plan = () => ({ schemaVersion: 2, fps: 30, assetSearch: { mode: "web", queries: ["specific subject detail"] }, scenes: [scene()] });

test("legacy draft remains valid", async () => {
  const raw = JSON.parse(await readFile(new URL("../template/src/DockerExplainer/visual-plan.json", import.meta.url), "utf8"));
  assert.deepEqual(await validateVisualPlan(raw), []);
});

test("catches static tail, duplicate/out-of-range beats and missing beats", async () => {
  const p = plan();
  p.scenes[0].visualBeats = [0, 10, 20, 30].map((frame) => ({ frame, action: "detail" }));
  assert.match((await validateVisualPlan(p)).join(), /đuôi scene/);
  p.scenes[0].visualBeats = [{ frame: 0, action: "detail" }, { frame: 0, action: "detail" }, { frame: 400, action: "detail" }];
  assert.match((await validateVisualPlan(p)).join(), /trùng frame/);
  assert.match((await validateVisualPlan(p)).join(), /ngoài duration/);
  p.scenes[0].visualBeats = null;
  assert.match((await validateVisualPlan(p)).join(), /visualBeats/);
});

test("editorial shell may persist while evidence treatment changes", async () => {
  const p = plan();
  p.scenes = [scene(), { ...scene(), evidenceTreatment: "document-focus" }, { ...scene(), evidenceTreatment: "comparison" }];
  assert.deepEqual(await validateVisualPlan(p), []);
  p.scenes = [scene(), scene(), scene()];
  assert.match((await validateVisualPlan(p)).join(), /lặp cách trình bày/);
});

test("asset gate requires real reviewed bytes and catches changed/missing/escaping files", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "tao-asset-test-"));
  try {
    // Tiny valid PNG; rights URLs below are fixtures, never real media verification.
    const bytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/YsAAAAASUVORK5CYII=", "base64");
    await writeFile(path.join(dir, "photo.png"), bytes);
    const asset = { id: "photo", kind: "photo", origin: "web", file: "photo.png", sourceUrl: "https://example.org/source", licenseUrl: "https://example.org/rights", creator: "Fixture", license: "Fixture only", credit: "Fixture", sha256: createHash("sha256").update(bytes).digest("hex"), review: { status: "verified", relevance: "Fixture for file verification", checkedAt: "2026-09-06T00:00:00Z" } };
    const options = { ready: true, publicDir: dir, manifest: { assets: [asset] } };
    assert.deepEqual(await validateVisualPlan(plan(), options), []);
    asset.review.status = "candidate";
    assert.match((await validateVisualPlan(plan(), options)).join(), /review/);
    asset.review.status = "verified";
    await writeFile(path.join(dir, "photo.png"), "changed");
    assert.match((await validateVisualPlan(plan(), options)).join(), /hash không khớp/);
    asset.file = "absent.png";
    assert.match((await validateVisualPlan(plan(), options)).join(), /ENOENT/);
    asset.file = "../outside.png";
    assert.match((await validateVisualPlan(plan(), options)).join(), /tương đối/);
    await symlink(new URL(import.meta.url), path.join(dir, "escape"));
    asset.file = "escape";
    assert.match((await validateVisualPlan(plan(), options)).join(), /thoát khỏi/);
    options.manifest.assets = [];
    assert.match((await validateVisualPlan(plan(), options)).join(), /không có trong manifest/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("web requirement cannot pass on an unreferenced asset or empty plan assets", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), primaryVisualType: "svgDiagram", assetRequired: false, assetIds: [] };
  const errors = await validateVisualPlan(p, { ready: true, publicDir: tmpdir(), manifest: { assets: [] } });
  assert.match(errors.join(), /chưa có asset Internet/);
  p.assetSearch = { mode: "diagram-only", reason: "User explicitly requested pure animation" };
  assert.deepEqual(await validateVisualPlan(p, { ready: true, publicDir: tmpdir(), manifest: { assets: [] } }), []);
  p.assetSearch.reason = "";
  assert.match((await validateVisualPlan(p)).join(), /reason/);
});
