#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const input = process.argv[2];

if (!input) {
  console.error("Cách dùng: node scripts/validate-visual-plan.mjs <visual-plan.json>");
  process.exit(1);
}

const required = [
  "narration",
  "visualIntent",
  "sceneType",
  "primaryVisualType",
  "data",
  "assetQuery",
  "assetRequired",
  "visualCoverage",
  "visualBeats",
  "motionPreset",
  "captionEmphasis",
  "sourceCredit",
];

const emojiPattern = /\p{Extended_Pictographic}/u;
const allowedPrimaryVisuals = new Set([
  "footage",
  "photo",
  "archival",
  "svgDiagram",
  "dataViz",
  "map",
  "timeline",
  "uiDemo",
  "threeObject",
  "kineticType",
]);

const raw = JSON.parse(await readFile(path.resolve(input), "utf8"));
const scenes = Array.isArray(raw) ? raw : raw.scenes;

if (!Array.isArray(scenes) || scenes.length === 0) {
  console.error("✗ visual plan phải là một mảng scene hoặc object có scenes[].");
  process.exit(1);
}

const errors = [];

for (const [index, scene] of scenes.entries()) {
  const label = scene.id || `scene ${index + 1}`;
  for (const field of required) {
    if (!Object.hasOwn(scene, field)) {
      errors.push(`${label}: thiếu ${field}`);
    }
  }

  if (
    scene.primaryVisualType &&
    !allowedPrimaryVisuals.has(scene.primaryVisualType)
  ) {
    errors.push(`${label}: primaryVisualType không hợp lệ`);
  }

  if (scene.primaryVisualType === "emoji" || scene.emojiRole === "primary") {
    errors.push(`${label}: emoji không được làm primary visual`);
  }

  if (scene.assetRequired === true && !scene.assetQuery && !scene.assetPath) {
    errors.push(`${label}: assetRequired=true nhưng thiếu assetQuery/assetPath`);
  }

  if (
    typeof scene.visualCoverage === "number" &&
    scene.visualCoverage < 0.7 &&
    !["quote", "kineticType"].includes(scene.sceneType)
  ) {
    errors.push(`${label}: visualCoverage dưới 0.70`);
  }

  if (typeof scene.narration === "string" && emojiPattern.test(scene.narration)) {
    errors.push(`${label}: narration chứa emoji; kiểm tra lại nội dung TTS`);
  }

  if (Array.isArray(scene.visualBeats)) {
    const beats = [...scene.visualBeats].sort((a, b) => a.frame - b.frame);
    const duration = scene.durationInFrames;
    const minimum = typeof duration === "number" && duration >= 240 ? 4 : 3;
    if (beats.length < minimum) {
      errors.push(`${label}: chỉ có ${beats.length}/${minimum} visual beat`);
    }
    for (let beat = 1; beat < beats.length; beat += 1) {
      if (beats[beat].frame - beats[beat - 1].frame > 90) {
        errors.push(`${label}: khoảng visual beat vượt 90 frame`);
        break;
      }
    }
  }
}

for (let index = 2; index < scenes.length; index += 1) {
  const type = scenes[index].sceneType;
  if (type && type === scenes[index - 1].sceneType && type === scenes[index - 2].sceneType) {
    errors.push(`scene ${index - 1}–${index + 1}: lặp sceneType "${type}" 3 lần liên tiếp`);
  }
}

if (errors.length > 0) {
  console.error(`✗ Visual plan chưa đạt (${errors.length} lỗi):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`✓ Visual plan hợp lệ: ${scenes.length} scene`);
