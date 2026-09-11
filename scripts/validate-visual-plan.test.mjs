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

test("v3 extension fields are optional and backward-compatible", async () => {
  // Plan v1 (legacy) không có field mở rộng — vẫn hợp lệ y hệt trước khi thêm schema v3.
  const legacy = JSON.parse(await readFile(new URL("../template/src/DockerExplainer/visual-plan.json", import.meta.url), "utf8"));
  assert.deepEqual(await validateVisualPlan(legacy), []);

  // Plan v2 + field mở rộng hợp lệ vẫn pass.
  const p = plan();
  p.scenes[0] = {
    ...scene(),
    shotCard: "image-reveal-crop",
    motionVariant: "push-in-slow",
    compositionPlan: "focal center, evidence right third",
    cameraMove: "parallax-2.5d",
    transitionIn: "cut",
    transitionOut: "wipe-cut",
    energy: "medium",
    visualHierarchy: "evidence over caption over brand",
    safeZoneStrategy: "keep 260px bottom clear",
    holdFrames: 18,
    sfxCues: [{ frame: 0, type: "tick" }, { frame: 120, type: "whoosh", gain: 0.4 }],
  };
  assert.deepEqual(await validateVisualPlan(p), []);
});

test("v3 extension fields reject invalid values without affecting legacy scenes", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), cameraMove: "drone-orbit" };
  assert.match((await validateVisualPlan(p)).join(), /cameraMove không hợp lệ/);

  const p2 = plan();
  p2.scenes[0] = { ...scene(), holdFrames: -1 };
  assert.match((await validateVisualPlan(p2)).join(), /holdFrames/);

  const p3 = plan();
  p3.scenes[0] = { ...scene(), sfxCues: [{ frame: 50, type: "boom" }] };
  assert.match((await validateVisualPlan(p3)).join(), /sfxCues\[\]\.type/);

  const p4 = plan();
  p4.scenes[0] = { ...scene(), sfxCues: [{ frame: 100, type: "tick" }, { frame: 10, type: "tick" }] };
  assert.match((await validateVisualPlan(p4)).join(), /sfxCues phải sắp xếp tăng dần/);

  const p5 = plan();
  p5.scenes[0] = { ...scene(), energy: "extreme" };
  assert.match((await validateVisualPlan(p5)).join(), /energy không hợp lệ/);
});

const VENDOR_ROOT = path.resolve(new URL("../vendor/shotcraft", import.meta.url).pathname);
const DOC_TYPEWRITER = {
  name: "document-typewriter-reveal",
  category: "typography",
  recipePath: path.join(VENDOR_ROOT, "shots/typography/document-typewriter-reveal.md"),
  demoPaths: [path.join(VENDOR_ROOT, "demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx")],
};
const CRASH_ZOOM = {
  name: "crash-zoom-punch",
  category: "camera",
  recipePath: path.join(VENDOR_ROOT, "shots/camera/crash-zoom-punch.md"),
  demoPaths: [
    path.join(VENDOR_ROOT, "demos/camera/crash-zoom-punch/CrashImpactReal.tsx"),
    path.join(VENDOR_ROOT, "demos/camera/crash-zoom-punch/CrashZoomReal.tsx"),
  ],
};
const realSha256 = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const buildSourceCard = async (fixture, overrides = {}) => ({
  name: fixture.name,
  category: fixture.category,
  recipePath: fixture.recipePath,
  demoPaths: fixture.demoPaths,
  recipeHash: await realSha256(fixture.recipePath),
  demoHashes: await Promise.all(fixture.demoPaths.map(realSha256)),
  invariants: { timing: "6f ease-in crash zoom" },
  adaptationNotes: "Adapted target zoom to vertical safe zone.",
  resolvedAt: "2026-09-11T00:00:00.000Z",
  ...overrides,
});

test("sourceCard traceability: full+correct object (real vendored card, 1-demo and 2-demo cases) passes", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), shotCard: DOC_TYPEWRITER.name, sourceCard: await buildSourceCard(DOC_TYPEWRITER) };
  assert.deepEqual(await validateVisualPlan(p), []);

  const p2 = plan();
  p2.scenes[0] = { ...scene(), shotCard: CRASH_ZOOM.name, sourceCard: await buildSourceCard(CRASH_ZOOM) };
  assert.deepEqual(await validateVisualPlan(p2), []);
});

test("sourceCard: missing required fields (recipePath/demoPaths/resolvedAt/invariants/adaptationNotes) are individually caught", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), sourceCard: { name: "crash-zoom-punch", category: "camera" } };
  const errors = (await validateVisualPlan(p)).join();
  assert.match(errors, /sourceCard\.recipePath thiếu/);
  assert.match(errors, /sourceCard\.resolvedAt thiếu/);
  assert.match(errors, /sourceCard\.adaptationNotes thiếu/);
  assert.match(errors, /sourceCard\.demoPaths phải là mảng/);
  assert.match(errors, /sourceCard\.recipeHash thiếu/);
  assert.match(errors, /sourceCard\.demoHashes phải là mảng/);
  assert.match(errors, /sourceCard\.invariants phải là object không rỗng/);
});

test("sourceCard.resolvedAt must be a parseable date", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), sourceCard: { ...(await buildSourceCard(DOC_TYPEWRITER)), resolvedAt: "not-a-date" } };
  assert.match((await validateVisualPlan(p)).join(), /resolvedAt không phải ISO date/);
});

test("sourceCard.invariants rejects an empty object — traceability on paper only is not enough", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), sourceCard: { ...(await buildSourceCard(DOC_TYPEWRITER)), invariants: {} } };
  assert.match((await validateVisualPlan(p)).join(), /invariants phải là object không rỗng/);
});

test("catches a nonexistent card name (not in the 157-card catalog)", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), sourceCard: await buildSourceCard({ ...DOC_TYPEWRITER, name: "totally-fake-card-xyz" }) };
  assert.match((await validateVisualPlan(p)).join(), /không có trong catalog Shotcraft/);
});

test("catches category mismatch against the real catalog entry", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), sourceCard: await buildSourceCard({ ...DOC_TYPEWRITER, category: "camera" }) };
  assert.match((await validateVisualPlan(p)).join(), /category.*không khớp category thật/);
});

test("catches wrong-but-existing recipe: a real file, but the WRONG card's recipe", async () => {
  const p = plan();
  const wrong = await buildSourceCard(DOC_TYPEWRITER, { recipePath: CRASH_ZOOM.recipePath, recipeHash: await realSha256(CRASH_ZOOM.recipePath) });
  p.scenes[0] = { ...scene(), sourceCard: wrong };
  assert.match((await validateVisualPlan(p)).join(), /recipePath không khớp recipe thật/);
});

test("catches wrong-but-existing demo: a real file, but from a different card", async () => {
  const p = plan();
  const wrong = await buildSourceCard(DOC_TYPEWRITER, { demoPaths: [CRASH_ZOOM.demoPaths[0]], demoHashes: [await realSha256(CRASH_ZOOM.demoPaths[0])] });
  p.scenes[0] = { ...scene(), sourceCard: wrong };
  const errors = (await validateVisualPlan(p)).join();
  assert.match(errors, /demoPaths thiếu 1 demo mà recipe thật tham chiếu/);
  assert.match(errors, /demoPaths có 1 đường dẫn không khớp demo thật/);
});

test("catches an omitted referenced demo: crash-zoom-punch has 2 demos, declaring only 1 must fail", async () => {
  const p = plan();
  const sc = await buildSourceCard(CRASH_ZOOM, { demoPaths: [CRASH_ZOOM.demoPaths[0]], demoHashes: [await realSha256(CRASH_ZOOM.demoPaths[0])] });
  p.scenes[0] = { ...scene(), sourceCard: sc };
  assert.match((await validateVisualPlan(p)).join(), /demoPaths thiếu 1 demo mà recipe thật tham chiếu/);
});

test("catches a mismatched recipeHash/demoHashes (content changed or hash fabricated)", async () => {
  const p = plan();
  const sc = await buildSourceCard(DOC_TYPEWRITER, { recipeHash: "0".repeat(64) });
  p.scenes[0] = { ...scene(), sourceCard: sc };
  assert.match((await validateVisualPlan(p)).join(), /recipeHash không khớp nội dung file thật/);

  const p2 = plan();
  const sc2 = await buildSourceCard(DOC_TYPEWRITER, { demoHashes: ["1".repeat(64)] });
  p2.scenes[0] = { ...scene(), sourceCard: sc2 };
  assert.match((await validateVisualPlan(p2)).join(), /demoHashes\[0\] không khớp nội dung file thật/);
});

test("catches path escape: recipePath/demoPaths outside the resolved Shotcraft root", async () => {
  const p = plan();
  const sc = await buildSourceCard(DOC_TYPEWRITER, { recipePath: new URL(import.meta.url).pathname, recipeHash: await realSha256(new URL(import.meta.url).pathname) });
  p.scenes[0] = { ...scene(), sourceCard: sc };
  assert.match((await validateVisualPlan(p)).join(), /path escape/);
});

test("catches a wholesale-fabricated (nonexistent) path", async () => {
  const p = plan();
  const sc = { ...(await buildSourceCard(DOC_TYPEWRITER)), recipePath: "/definitely/not/a/real/path.md" };
  p.scenes[0] = { ...scene(), sourceCard: sc };
  assert.match((await validateVisualPlan(p)).join(), /không tồn tại trên đĩa/);
});

test("shotCardSource=shotcraft-catalog requires sourceCard; omitting it fails even with a shotCard name present", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), shotCard: "crash-zoom-punch", shotCardSource: "shotcraft-catalog" };
  assert.match((await validateVisualPlan(p)).join(), /bắt buộc có sourceCard đầy đủ/);
});

test("shotCardSource=vertical-shot-library (or omitted) never requires sourceCard — legacy plans unaffected", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), shotCard: "hook-kinetic-punch", shotCardSource: "vertical-shot-library" };
  assert.deepEqual(await validateVisualPlan(p), []);

  const p2 = plan();
  p2.scenes[0] = { ...scene(), shotCard: "hook-kinetic-punch" };
  assert.deepEqual(await validateVisualPlan(p2), []);
});

test("shotCardSource rejects unknown values", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), shotCardSource: "made-up" };
  assert.match((await validateVisualPlan(p)).join(), /shotCardSource không hợp lệ/);
});

test("REGRESSION: real shipped plans (DiBo10PhutSauAn, MotionSystemShowcase) still pass unchanged", async () => {
  for (const rel of ["../template/src/DiBo10PhutSauAn/visual-plan.json", "../template/src/MotionSystemShowcase/visual-plan.json"]) {
    const raw = JSON.parse(await readFile(new URL(rel, import.meta.url), "utf8"));
    assert.deepEqual(await validateVisualPlan(raw), []);
  }
});

test("captionEngine accepts the two known values and rejects anything else", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), captionEngine: "one-line-fit" };
  assert.deepEqual(await validateVisualPlan(p), []);
  const p2 = plan();
  p2.scenes[0] = { ...scene(), captionEngine: "whatever" };
  assert.match((await validateVisualPlan(p2)).join(), /captionEngine không hợp lệ/);
});

test("sfxCues[] duration/offset/file extensions validate when present", async () => {
  const p = plan();
  p.scenes[0] = { ...scene(), sfxCues: [{ frame: 46, type: "whoosh", file: "whoosh-fast.mp3", durationInFrames: 24, offsetFrames: -1 }] };
  assert.deepEqual(await validateVisualPlan(p), []);

  const p2 = plan();
  p2.scenes[0] = { ...scene(), sfxCues: [{ frame: 46, type: "whoosh", durationInFrames: 0 }] };
  assert.match((await validateVisualPlan(p2)).join(), /durationInFrames phải là số nguyên dương/);

  const p3 = plan();
  p3.scenes[0] = { ...scene(), sfxCues: [{ frame: 46, type: "whoosh", offsetFrames: 1.5 }] };
  assert.match((await validateVisualPlan(p3)).join(), /offsetFrames phải là số nguyên/);
});

test("pacingArc: a well-formed energy arc (low start, high end, no 3x repeat, hold after peaks) passes", async () => {
  const p = plan();
  p.pacingArc = { mode: "energy-arc-v1" };
  p.scenes = [
    { ...scene(), id: "s1", energy: "low", evidenceTreatment: "t1" },
    { ...scene(), id: "s2", energy: "medium", evidenceTreatment: "t2" },
    { ...scene(), id: "s3", energy: "high", holdFrames: 30, evidenceTreatment: "t3" },
    { ...scene(), id: "s4", energy: "low", evidenceTreatment: "t4" },
    { ...scene(), id: "s5", energy: "high", holdFrames: 30, evidenceTreatment: "t5" },
  ];
  assert.deepEqual(await validateVisualPlan(p), []);
});

test("pacingArc rejects a high-energy opener", async () => {
  const p = plan();
  p.pacingArc = { mode: "energy-arc-v1" };
  p.scenes = [{ ...scene(), id: "s1", energy: "high", holdFrames: 30 }, { ...scene(), id: "s2", energy: "high", holdFrames: 30 }];
  assert.match((await validateVisualPlan(p)).join(), /scene đầu không được energy=high/);
});

test("pacingArc rejects a non-high closer", async () => {
  const p = plan();
  p.pacingArc = { mode: "energy-arc-v1" };
  p.scenes = [{ ...scene(), id: "s1", energy: "low" }, { ...scene(), id: "s2", energy: "medium" }];
  assert.match((await validateVisualPlan(p)).join(), /scene cuối phải energy=high/);
});

test("pacingArc rejects 3 consecutive scenes with the same energy", async () => {
  const p = plan();
  p.pacingArc = { mode: "energy-arc-v1" };
  p.scenes = [
    { ...scene(), id: "s1", energy: "low" },
    { ...scene(), id: "s2", energy: "medium" },
    { ...scene(), id: "s3", energy: "medium" },
    { ...scene(), id: "s4", energy: "medium" },
    { ...scene(), id: "s5", energy: "high", holdFrames: 30 },
  ];
  assert.match((await validateVisualPlan(p)).join(), /lặp energy=medium 3 lần liên tiếp/);
});

test("pacingArc requires sufficient holdFrames after a high-energy scene", async () => {
  const p = plan();
  p.pacingArc = { mode: "energy-arc-v1" };
  p.scenes = [
    { ...scene(), id: "s1", energy: "low" },
    { ...scene(), id: "s2", energy: "high", holdFrames: 5 },
  ];
  assert.match((await validateVisualPlan(p)).join(), /cần holdFrames >= 24/);
});

test("pacingArc absent never gates — legacy plans and plans without the field are unaffected", async () => {
  const p = plan();
  p.scenes = [{ ...scene(), id: "s1", energy: "high" }]; // would fail every pacingArc rule if gated
  assert.deepEqual(await validateVisualPlan(p), []);
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
