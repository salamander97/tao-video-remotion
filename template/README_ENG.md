# Tao Video Suite Remotion template

A React + Remotion template for 1080×1920, 30fps vertical videos with AI voiceover, sentence-aware captions, visual presets, and sample compositions. It supports multiple subject areas and durations rather than only 50–60 second technology explainers.

**Author:** [Trung Hiếu](https://github.com/salamander97)

## Install

Run the cross-platform setup from the repository root first:

```bash
cd ..
node scripts/setup.mjs
cd template
npm install
```

Setup creates `.env` from `.env.example` when needed. To use the template without installing the skills:

```bash
cp .env.example .env
npm install
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

## AI skills

The canonical skills live at the repository root:

- `../skills/tao-chu-de-video/SKILL.md`
- `../skills/tao-video-remotion/SKILL.md`

The template no longer contains stale copies under `.agents/` or `.claude/`. Run `node scripts/setup.mjs` to install the canonical skills for Claude Code, Gemini CLI, Codex, Antigravity, or ZCode.

Example:

```bash
node ../scripts/setup.mjs --targets agents,claude,codex
```

Then use a natural-language request such as:

```text
Create a 90-second video about recognizing online scams.
Create a three-minute historical documentary with sourced archival visuals.
```

## Voice configuration

Edit `template/.env`:

```env
EDGE_TTS_VOICE=vi-VN-HoaiMyNeural
EDGE_TTS_RATE=+10%
EDGE_TTS_PITCH=+0Hz
EDGE_TTS_VOLUME=+0%
EDGE_TTS_OUTPUT_DIR=public/audio
CHANNEL_NAME=""
```

Keep `CHANNEL_NAME` empty for an unbranded video. The skill asks before rendering and can pass `channelName` through Remotion props.

## Preview and render

Open Remotion Studio:

```bash
npm run dev
```

List compositions:

```bash
npx remotion compositions
```

Render to the output directory selected during setup:

```bash
npx remotion render <CompositionId> "/path/to/output/<CompositionId>.mp4"
```

Windows example:

```powershell
npx remotion render DockerExplainer "D:\Videos\Tao Video\DockerExplainer.mp4"
```

## Sample compositions

- `DockerExplainer`: a short technology explainer.
- `ReverseEngineering`: a technical concept video.
- `QuangTri1972`: a multi-scene history video with archival visuals.
- `AiMalwareShort`: a digital-safety video.

Generated audio and downloaded images are not committed. Re-run the scripts under `scripts/` when those assets need to be recreated.

## Verify

```bash
npm run lint
npx remotion compositions
```

## Main structure

```text
template/
├── .env.example
├── public/
│   ├── audio/
│   └── images/
├── scripts/
│   ├── generate-tts.ts
│   └── fetch-images.ts
├── src/
│   ├── Root.tsx
│   ├── lib/subtitleUtils.ts
│   ├── styles/presets.ts
│   └── <Composition>/
└── remotion.config.ts
```

See `../README.md` for the complete suite documentation.
