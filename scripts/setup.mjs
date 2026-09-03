#!/usr/bin/env node

import { cp, mkdir, readFile, stat, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const SKILLS_DIR = path.join(REPO_ROOT, "skills");
const DEFAULT_TEMPLATE_DIR = path.join(REPO_ROOT, "template");
const DEFAULT_OUTPUT_DIR = path.join(REPO_ROOT, "output");
const CONFIG_FILE = path.join(os.homedir(), ".tao-video-suite", "config.json");
const SKILL_NAMES = ["tao-chu-de-video", "tao-video-remotion"];
const TARGETS = {
  antigravity: path.join(os.homedir(), ".gemini", "config", "skills"),
  agents: path.join(os.homedir(), ".agents", "skills"),
  claude: path.join(os.homedir(), ".claude", "skills"),
  codex: path.join(os.homedir(), ".codex", "skills"),
  gemini: path.join(os.homedir(), ".gemini", "skills"),
  zcode: path.join(os.homedir(), ".zcode", "skills"),
};

function printHelp() {
  console.log(`Tao Video Suite setup

Usage:
  node scripts/setup.mjs
  node scripts/setup.mjs --targets antigravity,claude --output-dir ./output

Options:
  --targets LIST       antigravity, agents, claude, codex, gemini, zcode hoặc all
  --template-dir DIR   Thư mục Remotion template
  --output-dir DIR     Thư mục lưu MP4
  --non-interactive    Dùng giá trị mặc định, không hỏi
  --dry-run            Chỉ kiểm tra, không ghi file
  --help               Hiển thị hướng dẫn

Tương thích lệnh cũ: ./install.sh claude hoặc ./install.sh zcode`);
}

function parseArgs(argv) {
  const options = {
    targets: undefined,
    templateDir: undefined,
    outputDir: undefined,
    nonInteractive: false,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--targets") {
      options.targets = argv[++index];
      if (!options.targets) throw new Error("--targets cần một giá trị.");
      continue;
    }
    if (arg === "--template-dir") {
      options.templateDir = argv[++index];
      if (!options.templateDir)
        throw new Error("--template-dir cần một đường dẫn.");
      continue;
    }
    if (arg === "--output-dir") {
      options.outputDir = argv[++index];
      if (!options.outputDir)
        throw new Error("--output-dir cần một đường dẫn.");
      continue;
    }
    if (arg === "--non-interactive") {
      options.nonInteractive = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (Object.hasOwn(TARGETS, arg)) {
      options.targets = arg;
      continue;
    }
    throw new Error(
      `Tham số không hợp lệ: ${arg}. Dùng --help để xem hướng dẫn.`,
    );
  }

  return options;
}

async function loadConfig() {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(await readFile(CONFIG_FILE, "utf8"));
  } catch {
    throw new Error(`Không đọc được cấu hình hiện tại: ${CONFIG_FILE}`);
  }
}

function normalizePath(value, fallback) {
  const selected = value?.trim() || fallback;
  return path.resolve(selected.replace(/^~(?=$|[\\/])/, os.homedir()));
}

function parseTargets(value) {
  const raw = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const selected = raw.includes("all")
    ? Object.keys(TARGETS)
    : [...new Set(raw)];
  const invalid = selected.filter((item) => !Object.hasOwn(TARGETS, item));
  if (invalid.length > 0 || selected.length === 0) {
    throw new Error(
      `Nơi cài skill không hợp lệ: ${invalid.join(", ") || value}. ` +
        `Chọn: ${Object.keys(TARGETS).join(", ")} hoặc all.`,
    );
  }
  return selected;
}

async function isDirectory(targetPath) {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch {
    return false;
  }
}

async function copySkills(targetName, dryRun) {
  const destination = TARGETS[targetName];
  for (const skillName of SKILL_NAMES) {
    const source = path.join(SKILLS_DIR, skillName);
    const target = path.join(destination, skillName);
    if (!dryRun) {
      await mkdir(destination, { recursive: true });
      await rm(target, { recursive: true, force: true });
      await cp(source, target, { recursive: true });
    }
    console.log(`✓ ${skillName} → ${target}${dryRun ? " (dry run)" : ""}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const current = await loadConfig();
  const interactive = process.stdin.isTTY && !options.nonInteractive;
  const prompt = interactive
    ? createInterface({ input: process.stdin, output: process.stdout })
    : null;

  try {
    const defaultTargets = Array.isArray(current.targets)
      ? current.targets.join(",")
      : "antigravity";
    const targetsInput =
      options.targets ||
      (prompt
        ? await prompt.question(
            `Cài skill cho nền tảng nào? antigravity/agents/claude/codex/gemini/zcode/all [${defaultTargets}]: `,
          )
        : defaultTargets);
    const targets = parseTargets(targetsInput || defaultTargets);

    const templateDefault = current.templateDir || DEFAULT_TEMPLATE_DIR;
    const templateInput =
      options.templateDir ||
      (prompt
        ? await prompt.question(
            `Thư mục Remotion template [${templateDefault}]: `,
          )
        : templateDefault);
    const templateDir = normalizePath(templateInput, templateDefault);
    if (
      !(await isDirectory(templateDir)) ||
      !existsSync(path.join(templateDir, "package.json"))
    ) {
      throw new Error(
        `Template không hợp lệ hoặc thiếu package.json: ${templateDir}`,
      );
    }

    const outputDefault = current.outputDir || DEFAULT_OUTPUT_DIR;
    const outputInput =
      options.outputDir ||
      (prompt
        ? await prompt.question(`Thư mục lưu video MP4 [${outputDefault}]: `)
        : outputDefault);
    const outputDir = normalizePath(outputInput, outputDefault);

    for (const target of targets) await copySkills(target, options.dryRun);

    const config = {
      schemaVersion: 1,
      repoRoot: REPO_ROOT,
      templateDir,
      outputDir,
      targets,
    };

    if (!options.dryRun) {
      await mkdir(outputDir, { recursive: true });
      await mkdir(path.dirname(CONFIG_FILE), { recursive: true });
      await writeFile(
        CONFIG_FILE,
        `${JSON.stringify(config, null, 2)}\n`,
        "utf8",
      );

      const envFile = path.join(templateDir, ".env");
      const envExample = path.join(templateDir, ".env.example");
      if (!existsSync(envFile) && existsSync(envExample)) {
        await cp(envExample, envFile);
        console.log(`✓ Đã tạo ${envFile} từ .env.example`);
      }
    }

    console.log(`✓ Template: ${templateDir}`);
    console.log(`✓ Video output: ${outputDir}`);
    console.log(
      `✓ Cấu hình: ${CONFIG_FILE}${options.dryRun ? " (chưa ghi vì dry run)" : ""}`,
    );
    console.log("\nBước tiếp theo: cd template && npm install");
  } finally {
    prompt?.close();
  }
}

main().catch((error) => {
  console.error(`\nLỗi setup: ${error.message}`);
  process.exit(1);
});
