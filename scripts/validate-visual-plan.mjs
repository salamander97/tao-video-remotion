#!/usr/bin/env node
import { readFile, realpath, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { pathToFileURL, fileURLToPath } from "node:url";
import { loadCatalog } from "./shotcraft/catalog.mjs";
import { resolveShotcraftRoot, recipeDiskPath, demoDiskPath } from "./shotcraft/paths.mjs";
import { parseDemoPaths } from "./shotcraft/resolver.mjs";

const DEFAULT_REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha256File = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");

const required = ["narration", "visualIntent", "sceneType", "primaryVisualType", "data", "assetQuery", "assetRequired", "visualCoverage", "visualBeats", "motionPreset", "captionEmphasis", "sourceCredit"];
const allowed = new Set(["footage", "photo", "archival", "svgDiagram", "dataViz", "map", "timeline", "uiDemo", "threeObject", "kineticType"]);
const allowedCameraMove = new Set(["static", "push-in", "parallax-2.5d", "handheld-light"]);
const allowedEnergy = new Set(["low", "medium", "high"]);
const allowedSfxType = new Set(["whoosh", "impact", "riser", "sparkle", "tick", "none"]);
const allowedCaptionEngine = new Set(["one-line-fit", "legacy-wordcount"]);
const allowedShotCardSource = new Set(["shotcraft-catalog", "vertical-shot-library"]);
const isHex64 = (v) => typeof v === "string" && /^[a-f0-9]{64}$/i.test(v);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const url = (value) => {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};
const within = (root, file) => {
  const relative = path.relative(root, file);
  return relative !== "" && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
};
/** Resolves `rawPath` and confirms it's really inside `rootReal` (both symlink-resolved) — catches both a nonexistent path and a `..`/symlink escape. */
const checkWithin = async (rootReal, rawPath) => {
  let real;
  try {
    real = await realpath(rawPath);
  } catch {
    return { ok: false, reason: "không tồn tại trên đĩa (" + rawPath + ")" };
  }
  if (!within(rootReal, real)) return { ok: false, reason: "nằm ngoài Shotcraft root đã resolve — path escape (" + rawPath + ")" };
  return { ok: true, real };
};

/** Draft validates structure; ready verifies reviewed local assets. Neither replaces visual QA. */
export async function validateVisualPlan(raw, { ready = false, manifest, publicDir, repoRoot } = {}) {
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
    // Mở rộng schema v3 (loose, backward-compatible): mọi field dưới đây là
    // TÙY CHỌN và áp dụng bất kể schemaVersion — vắng mặt không sinh lỗi.
    if (scene.shotCard !== undefined && !text(scene.shotCard)) errors.push(label + ": shotCard phải là chuỗi không rỗng nếu có mặt");
    if (scene.motionVariant !== undefined && !text(scene.motionVariant)) errors.push(label + ": motionVariant phải là chuỗi không rỗng nếu có mặt");
    if (scene.compositionPlan !== undefined && !text(scene.compositionPlan)) errors.push(label + ": compositionPlan phải là chuỗi không rỗng nếu có mặt");
    if (scene.cameraMove !== undefined && !allowedCameraMove.has(scene.cameraMove)) errors.push(label + ": cameraMove không hợp lệ");
    if (scene.transitionIn !== undefined && !text(scene.transitionIn)) errors.push(label + ": transitionIn phải là chuỗi không rỗng nếu có mặt");
    if (scene.transitionOut !== undefined && !text(scene.transitionOut)) errors.push(label + ": transitionOut phải là chuỗi không rỗng nếu có mặt");
    if (scene.energy !== undefined && !allowedEnergy.has(scene.energy)) errors.push(label + ": energy không hợp lệ");
    if (scene.visualHierarchy !== undefined && !text(scene.visualHierarchy)) errors.push(label + ": visualHierarchy phải là chuỗi không rỗng nếu có mặt");
    if (scene.safeZoneStrategy !== undefined && !text(scene.safeZoneStrategy)) errors.push(label + ": safeZoneStrategy phải là chuỗi không rỗng nếu có mặt");
    if (scene.holdFrames !== undefined && (!Number.isInteger(scene.holdFrames) || scene.holdFrames < 0)) errors.push(label + ": holdFrames phải là số nguyên không âm");
    if (scene.sfxCues !== undefined) {
      if (!Array.isArray(scene.sfxCues)) errors.push(label + ": sfxCues phải là mảng nếu có mặt");
      else {
        let prevCueFrame = -1;
        for (const cue of scene.sfxCues) {
          if (!cue || !Number.isInteger(cue.frame) || cue.frame < 0) { errors.push(label + ": sfxCues cần frame nguyên không âm"); continue; }
          if (cue.frame < prevCueFrame) errors.push(label + ": sfxCues phải sắp xếp tăng dần theo frame");
          prevCueFrame = cue.frame;
          if (!allowedSfxType.has(cue.type)) errors.push(label + ": sfxCues[].type không hợp lệ");
          if (cue.gain !== undefined && (!Number.isFinite(cue.gain) || cue.gain < 0)) errors.push(label + ": sfxCues[].gain phải là số không âm");
          if (cue.file !== undefined && !text(cue.file)) errors.push(label + ": sfxCues[].file phải là chuỗi không rỗng nếu có mặt");
          if (cue.durationInFrames !== undefined && (!Number.isInteger(cue.durationInFrames) || cue.durationInFrames <= 0)) errors.push(label + ": sfxCues[].durationInFrames phải là số nguyên dương (khớp độ dài hành động thật, không để mặc định)");
          if (cue.offsetFrames !== undefined && !Number.isInteger(cue.offsetFrames)) errors.push(label + ": sfxCues[].offsetFrames phải là số nguyên (bù lệch peak-delay, có thể âm/dương)");
        }
      }
    }
    // shotCardSource: phân biệt tường minh card lấy từ full 157-card catalog
    // Shotcraft (bắt buộc traceability đầy đủ) với `shotCard` registry 17
    // card nội bộ cũ (vertical-shot-library, không cần trace). Vắng mặt =
    // hành vi cũ (không gate) — plan cũ (DiBo10PhutSauAn, MotionSystemShowcase)
    // không khai báo field này nên hoàn toàn không bị ảnh hưởng.
    if (scene.shotCardSource !== undefined && !allowedShotCardSource.has(scene.shotCardSource)) {
      errors.push(label + ": shotCardSource không hợp lệ (shotcraft-catalog | vertical-shot-library)");
    }
    if (scene.shotCardSource === "shotcraft-catalog" && scene.sourceCard === undefined) {
      errors.push(label + ": shotCardSource=shotcraft-catalog bắt buộc có sourceCard đầy đủ (traceability) — không được pass chỉ với shotCard tên suông");
    }
    // sourceCard: khi có mặt (bất kể do shotCardSource ép hay tự nguyện khai
    // báo), traceability phải THẬT — không chỉ đúng hình dạng field mà còn
    // phải khớp catalog thật, path phải đúng chính xác (không phải "một file
    // có thật nhưng sai"), nằm trong root Shotcraft đã resolve (không escape),
    // và hash nội dung phải khớp file thật trên đĩa tại thời điểm verify.
    if (scene.sourceCard !== undefined) {
      const sc = scene.sourceCard;
      if (!sc || typeof sc !== "object" || Array.isArray(sc)) {
        errors.push(label + ": sourceCard phải là object nếu có mặt");
      } else {
        for (const field of ["name", "category", "recipePath", "resolvedAt", "adaptationNotes"]) {
          if (!text(sc[field])) errors.push(label + ": sourceCard." + field + " thiếu hoặc rỗng — phải resolve thật bằng scripts/shotcraft-lookup.mjs resolve, không tự bịa");
        }
        if (text(sc.resolvedAt) && Number.isNaN(Date.parse(sc.resolvedAt))) errors.push(label + ": sourceCard.resolvedAt không phải ISO date hợp lệ");
        if (!Array.isArray(sc.demoPaths) || !sc.demoPaths.length || !sc.demoPaths.every(text)) {
          errors.push(label + ": sourceCard.demoPaths phải là mảng đường dẫn không rỗng (mọi demo mà recipe tham chiếu, không chỉ 1 file)");
        }
        if (!isHex64(sc.recipeHash)) errors.push(label + ": sourceCard.recipeHash thiếu hoặc không phải sha256 hex hợp lệ");
        if (!Array.isArray(sc.demoHashes) || (Array.isArray(sc.demoPaths) && sc.demoHashes.length !== sc.demoPaths.length) || !sc.demoHashes.every(isHex64)) {
          errors.push(label + ": sourceCard.demoHashes phải là mảng sha256 hex, cùng độ dài và cùng thứ tự với demoPaths");
        }
        if (!sc.invariants || typeof sc.invariants !== "object" || Array.isArray(sc.invariants) || Object.keys(sc.invariants).length === 0) {
          errors.push(label + ": sourceCard.invariants phải là object không rỗng (timing/easing/spring/camera/SFX áp dụng được từ recipe — không được để trống)");
        }

        // Xác minh nội dung thật trên đĩa — chạy bất cứ khi nào catalog tải
        // được (không đợi --ready), vì đây là dữ liệu PHẢI đã resolve xong
        // trước khi ghi vào plan, không phải thứ chỉ kiểm tra ở bước cuối.
        if (text(sc.name) && text(sc.category) && text(sc.recipePath) && Array.isArray(sc.demoPaths) && sc.demoPaths.every(text)) {
          try {
            const rr = repoRoot ?? DEFAULT_REPO_ROOT;
            const { root, source: rootSource } = await resolveShotcraftRoot(rr);
            const rootReal = await realpath(root);
            const { cards } = await loadCatalog(rr);
            const entry = cards.find((c) => c.name === sc.name);
            if (!entry) {
              errors.push(label + ": sourceCard.name \"" + sc.name + "\" không có trong catalog Shotcraft (" + rootSource + ")");
            } else {
              if (entry.category !== sc.category) errors.push(label + ": sourceCard.category (\"" + sc.category + "\") không khớp category thật của card (\"" + entry.category + "\")");

              const expectedRecipePath = recipeDiskPath(root, rootSource, entry.source);
              const recipeContainment = await checkWithin(rootReal, sc.recipePath);
              if (!recipeContainment.ok) errors.push(label + ": sourceCard.recipePath " + recipeContainment.reason);
              else if (path.resolve(recipeContainment.real) !== path.resolve(await realpath(expectedRecipePath).catch(() => expectedRecipePath))) {
                errors.push(label + ": sourceCard.recipePath không khớp recipe thật của card \"" + sc.name + "\" (trỏ tới file khác, dù file đó có tồn tại)");
              } else {
                const actualRecipeHash = await sha256File(sc.recipePath).catch(() => null);
                if (isHex64(sc.recipeHash) && actualRecipeHash && actualRecipeHash !== sc.recipeHash.toLowerCase()) {
                  errors.push(label + ": sourceCard.recipeHash không khớp nội dung file thật (file đã đổi hoặc hash bịa)");
                }
                // Tập demo mà recipe THẬT tham chiếu — nguồn sự thật duy nhất.
                let expectedDemoRel = [];
                try {
                  const recipeMd = await readFile(expectedRecipePath, "utf8");
                  const implSection = recipeMd.split(/^##\s*参考实现/m)[1];
                  expectedDemoRel = implSection ? [...new Set(parseDemoPaths(implSection.split(/^##\s/m)[0]))] : [];
                } catch { /* recipe không đọc được — lỗi khác đã báo ở trên */ }
                const expectedDemoAbs = new Set(expectedDemoRel.map((rel) => path.resolve(demoDiskPath(root, rel))));
                const actualDemoAbs = new Set(sc.demoPaths.map((p) => path.resolve(p)));
                const missing = [...expectedDemoAbs].filter((p) => !actualDemoAbs.has(p));
                const extra = [...actualDemoAbs].filter((p) => !expectedDemoAbs.has(p));
                if (missing.length) errors.push(label + ": sourceCard.demoPaths thiếu " + missing.length + " demo mà recipe thật tham chiếu (" + missing.join(", ") + ")");
                if (extra.length) errors.push(label + ": sourceCard.demoPaths có " + extra.length + " đường dẫn không khớp demo thật của recipe này (" + extra.join(", ") + ") — có thể trỏ nhầm sang card khác");

                for (let i = 0; i < sc.demoPaths.length; i++) {
                  const demoContainment = await checkWithin(rootReal, sc.demoPaths[i]);
                  if (!demoContainment.ok) { errors.push(label + ": sourceCard.demoPaths[" + i + "] " + demoContainment.reason); continue; }
                  const actualHash = await sha256File(sc.demoPaths[i]).catch(() => null);
                  if (Array.isArray(sc.demoHashes) && isHex64(sc.demoHashes[i]) && actualHash && actualHash !== sc.demoHashes[i].toLowerCase()) {
                    errors.push(label + ": sourceCard.demoHashes[" + i + "] không khớp nội dung file thật tại demoPaths[" + i + "]");
                  }
                }
              }
            }
          } catch (error) {
            errors.push(label + ": không xác minh được sourceCard (" + error.message + ") — kiểm tra vendor/shotcraft hoặc shotcraftRepo trong config");
          }
        }
      }
    }
    if (scene.captionEngine !== undefined && !allowedCaptionEngine.has(scene.captionEngine)) errors.push(label + ": captionEngine không hợp lệ (one-line-fit | legacy-wordcount)");
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

  // pacingArc: nhịp năng lượng toàn video (references/full-video-pacing.md) —
  // TÙY CHỌN cấp-plan, chỉ gate khi khai báo `pacingArc.mode`. Vắng mặt =
  // hành vi cũ hoàn toàn, plan cũ không bị ảnh hưởng.
  if (raw.pacingArc !== undefined) {
    if (typeof raw.pacingArc !== "object" || raw.pacingArc === null || raw.pacingArc.mode !== "energy-arc-v1") {
      errors.push("pacingArc.mode không hợp lệ (chỉ hỗ trợ \"energy-arc-v1\")");
    } else if (scenes.length) {
      const energies = scenes.map((s) => s?.energy);
      if (energies[0] === "high") errors.push("pacingArc: scene đầu không được energy=high (đỉnh dành cho outro)");
      if (energies[energies.length - 1] !== "high") errors.push("pacingArc: scene cuối phải energy=high (đỉnh năng lượng toàn video)");
      for (let i = 2; i < energies.length; i++) {
        if (energies[i] && energies[i] === energies[i - 1] && energies[i] === energies[i - 2]) {
          errors.push("pacingArc: scene " + (i - 1) + "–" + (i + 1) + " lặp energy=" + energies[i] + " 3 lần liên tiếp");
        }
      }
      const minHoldFrames = 0.8 * fps;
      scenes.forEach((s, i) => {
        if (s?.energy === "high" && (!Number.isInteger(s.holdFrames) || s.holdFrames < minHoldFrames)) {
          errors.push("pacingArc: scene " + (s.id ?? i + 1) + " energy=high cần holdFrames >= " + minHoldFrames + " (giữ nghỉ thật sau đỉnh)");
        }
      });
    }
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
