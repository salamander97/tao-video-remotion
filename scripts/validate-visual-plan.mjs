#!/usr/bin/env node
import { readFile, realpath, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const required = ["narration", "visualIntent", "sceneType", "primaryVisualType", "data", "assetQuery", "assetRequired", "visualCoverage", "visualBeats", "motionPreset", "captionEmphasis", "sourceCredit"];
const allowed = new Set(["footage", "photo", "archival", "svgDiagram", "dataViz", "map", "timeline", "uiDemo", "threeObject", "kineticType"]);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const url = (value) => {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};
const within = (root, file) => {
  const relative = path.relative(root, file);
  return relative !== "" && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
};

/** Draft validates structure; ready verifies reviewed local assets. Neither replaces visual QA. */
export async function validateVisualPlan(raw, { ready = false, manifest, publicDir } = {}) {
  const errors = [];
  const scenes = Array.isArray(raw) ? raw : raw?.scenes;
  if (!Array.isArray(scenes) || !scenes.length) return ["visual plan phải chứa scenes[] không rỗng"];
  const v2 = raw.schemaVersion === 2;
  if (raw.schemaVersion !== undefined && ![1, 2].includes(raw.schemaVersion)) errors.push("schemaVersion không hỗ trợ");
  if (ready && !v2) errors.push("gate ready yêu cầu schemaVersion 2; plan cũ vẫn dùng được ở chế độ draft");
  const fps = v2 ? raw.fps : 30;
  if (!Number.isFinite(fps) || fps <= 0) errors.push("fps phải là số dương");
  const search = raw.assetSearch;
  if (v2) {
    if (!["web", "provided-only", "diagram-only"].includes(search?.mode)) errors.push("thiếu assetSearch.mode hợp lệ");
    if (search?.mode === "web" && (!Array.isArray(search.queries) || !search.queries.length || !search.queries.every(text))) errors.push("assetSearch web cần queries thực");
    if (["provided-only", "diagram-only"].includes(search?.mode) && !text(search.reason)) errors.push("ngoại lệ assetSearch cần reason");
  }

  const used = new Set();
  for (const [index, scene] of scenes.entries()) {
    if (!scene || typeof scene !== "object" || Array.isArray(scene)) { errors.push("scene " + (index + 1) + " không hợp lệ"); continue; }
    const label = scene.id || "scene " + (index + 1);
    for (const field of required) if (!Object.hasOwn(scene, field)) errors.push(label + ": thiếu " + field);
    if (!allowed.has(scene.primaryVisualType)) errors.push(label + ": primaryVisualType không hợp lệ");
    if (scene.emojiRole === "primary") errors.push(label + ": emoji không được làm primary visual");
    if (typeof scene.assetRequired !== "boolean") errors.push(label + ": assetRequired phải là boolean");
    if (scene.assetRequired && !scene.assetQuery && !scene.assetPath && !scene.assetIds?.length) errors.push(label + ": thiếu assetQuery/assetPath/assetIds");
    if (!Number.isFinite(scene.visualCoverage) || scene.visualCoverage <= 0 || scene.visualCoverage > 1) errors.push(label + ": visualCoverage phải trong (0,1]");
    else if (scene.visualCoverage < 0.7 && !["quote", "kineticType"].includes(scene.sceneType)) errors.push(label + ": visualCoverage dưới 0.70 chiều ngang");
    if (typeof scene.narration === "string" && /\p{Extended_Pictographic}/u.test(scene.narration)) errors.push(label + ": narration chứa emoji");
    if (v2) {
      if (!["full-stage", "editorial"].includes(scene.layoutMode)) errors.push(label + ": layoutMode không hợp lệ");
      if (!Number.isInteger(scene.durationInFrames) || scene.durationInFrames <= 0) errors.push(label + ": durationInFrames phải là số nguyên dương");
      if (!Array.isArray(scene.assetIds) || !scene.assetIds.every(text)) errors.push(label + ": assetIds phải là mảng ID");
      if (scene.assetRequired && !scene.assetIds?.length) errors.push(label + ": assetRequired cần assetIds (ID dự kiến được phép ở draft)");
      if (["photo", "footage", "archival"].includes(scene.primaryVisualType) && !scene.assetRequired) errors.push(label + ": media thực phải có assetRequired=true");
      if (scene.layoutMode === "editorial") {
        if (!text(scene.headline) || !text(scene.evidenceTreatment)) errors.push(label + ": editorial thiếu headline/evidenceTreatment");
        if (!["editorial-inline", "subtitle-pill"].includes(scene.captionMode)) errors.push(label + ": captionMode editorial không hợp lệ");
      }
    }
    if (Array.isArray(scene.assetIds)) for (const id of scene.assetIds) used.add(id);
    if (!Array.isArray(scene.visualBeats) || !scene.visualBeats.length) {
      errors.push(label + ": visualBeats phải là mảng không rỗng");
      continue;
    }
    const duration = scene.durationInFrames;
    const beats = scene.visualBeats;
    const minimum = duration >= 8 * fps ? 4 : 3;
    if (beats.length < minimum) errors.push(label + ": chỉ có " + beats.length + "/" + minimum + " visual beat");
    let previous = -1;
    for (const beat of beats) {
      if (!beat || !Number.isInteger(beat.frame) || beat.frame < 0 || !text(beat.action)) { errors.push(label + ": beat cần frame nguyên không âm và action"); continue; }
      if (beat.frame <= previous) errors.push(label + ": beat phải tăng dần, không trùng frame");
      if (Number.isFinite(duration) && beat.frame >= duration) errors.push(label + ": beat nằm ngoài duration");
      if (beat.frame - Math.max(previous, 0) > 3 * fps) errors.push(label + ": khoảng visual beat vượt 3 giây");
      previous = beat.frame;
    }
    if (Number.isFinite(duration) && duration - previous > 3 * fps) errors.push(label + ": đuôi scene sau beat cuối vượt 3 giây");
  }
  const treatment = (scene) => scene?.layoutMode === "editorial" ? scene.evidenceTreatment : scene?.sceneType;
  for (let i = 2; i < scenes.length; i++) {
    const current = treatment(scenes[i]);
    if (current && current === treatment(scenes[i - 1]) && current === treatment(scenes[i - 2])) errors.push("scene " + (i - 1) + "–" + (i + 1) + ": lặp cách trình bày " + current + " 3 lần");
  }
  if (!ready) return errors;
  if (!Array.isArray(manifest?.assets)) return [...errors, "ready cần asset-manifest có assets[] (có thể rỗng nếu không dùng file ngoài)"];
  const assets = new Map();
  for (const asset of manifest.assets) {
    if (!asset || !text(asset.id) || assets.has(asset.id)) { errors.push("asset ID thiếu hoặc trùng"); continue; }
    assets.set(asset.id, asset);
  }
  let root;
  try { root = await realpath(publicDir); } catch { errors.push("public-dir không tồn tại"); }
  let webCount = 0;
  for (const id of used) {
    const asset = assets.get(id);
    if (!asset) { errors.push("asset " + id + ": không có trong manifest"); continue; }
    const before = errors.length;
    if (!["web", "provided"].includes(asset.origin)) errors.push("asset " + id + ": origin không hợp lệ");
    if (!["photo", "footage", "archival", "screenshot"].includes(asset.kind)) errors.push("asset " + id + ": kind không hợp lệ");
    for (const field of ["creator", "license", "credit"]) if (!text(asset[field])) errors.push("asset " + id + ": thiếu " + field);
    if (asset.origin === "web" && (!url(asset.sourceUrl) || !url(asset.licenseUrl))) errors.push("asset " + id + ": cần sourceUrl/licenseUrl hợp lệ");
    if (asset.review?.status !== "verified" || !text(asset.review?.relevance) || !Number.isFinite(Date.parse(asset.review?.checkedAt))) errors.push("asset " + id + ": chưa có review hình ảnh hợp lệ");
    if (!/^[a-f0-9]{64}$/i.test(asset.sha256 ?? "")) errors.push("asset " + id + ": thiếu SHA-256 hợp lệ");
    if (!text(asset.file) || path.isAbsolute(asset.file) || /^[a-z]+:/i.test(asset.file) || asset.file.split(/[\\/]/).includes("..")) {
      errors.push("asset " + id + ": file phải tương đối trong public-dir");
    } else if (root) {
      try {
        const file = await realpath(path.resolve(root, asset.file));
        if (!within(root, file)) throw new Error("file hoặc symlink thoát khỏi public-dir");
        const info = await stat(file);
        if (!info.isFile() || info.size === 0) throw new Error("file rỗng/không phải file");
        const hash = createHash("sha256").update(await readFile(file)).digest("hex");
        if (hash !== asset.sha256?.toLowerCase()) throw new Error("hash không khớp; cần kiểm tra lại file");
      } catch (error) { errors.push("asset " + id + ": " + error.message); }
    }
    if (asset.origin === "web" && errors.length === before && root) webCount++;
  }
  if (search?.mode === "web" && webCount === 0) errors.push("mode web chưa có asset Internet đã kiểm tra được scene sử dụng");
  return errors;
}

async function main() {
  const [input, ...args] = process.argv.slice(2);
  if (!input) throw new Error("Cách dùng: node scripts/validate-visual-plan.mjs <plan.json> [--ready --asset-manifest file.json --public-dir template/public]");
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--ready") options.ready = true;
    else if (["--asset-manifest", "--public-dir"].includes(args[i])) {
      const key = args[i] === "--asset-manifest" ? "manifestPath" : "publicDir";
      const value = args[++i];
      if (!value || value.startsWith("--")) throw new Error("Thiếu giá trị " + key);
      options[key] = value;
    } else throw new Error("Tham số không hợp lệ: " + args[i]);
  }
  const raw = JSON.parse(await readFile(path.resolve(input), "utf8"));
  if (options.ready) {
    if (!options.manifestPath || !options.publicDir) throw new Error("--ready cần --asset-manifest và --public-dir");
    options.manifest = JSON.parse(await readFile(options.manifestPath, "utf8"));
  }
  const errors = await validateVisualPlan(raw, options);
  if (errors.length) throw new Error("Visual plan chưa đạt (" + errors.length + " lỗi):\n" + errors.map((error) => "  - " + error).join("\n"));
  console.log("✓ Visual plan hợp lệ (" + (options.ready ? "ready: file/hash/metadata; vẫn cần visual QA" : "draft: chưa xác minh asset") + ")");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error("✗ " + error.message); process.exitCode = 1; });
}
