# vendor/shotcraft — vendored snapshot

This directory is a **verbatim, unmodified snapshot** of parts of
[`video-shotcraft`](https://github.com) (local path at integration time:
`/Volumes/SSD_1TB/Video Remotion/video-shotcraft`), licensed under
**Apache License, Version 2.0**, Copyright 2026 Wei Yihao. Full license text:
[`/licenses/video-shotcraft/LICENSE-APACHE-2.0.txt`](../../licenses/video-shotcraft/LICENSE-APACHE-2.0.txt).

Snapshot metadata:
- Vendored: 2026-09-11
- `gallery/api/library.json` — `revision`/`generatedAt` fields preserved from source, see file itself.
- Source repo has no upstream `NOTICE` file (checked at vendoring time); this file plus
  `/THIRD_PARTY_NOTICES.md` serve as the voluntary NOTICE per Apache-2.0 §4(c).

## What's here and why

| Path | Content | Purpose |
|---|---|---|
| `gallery/api/library.json` | 157-card / 214-style catalog metadata | Source of truth for `scripts/shotcraft/catalog.mjs`. Kept at the same relative path as the live repo (`gallery/api/library.json`, not flattened) so `workbench/` — copied verbatim, unmodified — resolves it via repo-root symlinks (`/gallery`, `/assets/audio`) without any source edits. |
| `shots/**/*.md` (158 files) | Full recipe text for every card (frontmatter + intent/motion-core/params/pitfalls/reference-impl) | Read verbatim by the resolver — recipe params/pitfalls must never be paraphrased from memory |
| `demos/**/*.tsx` (221 files) | Exact tuned reference implementation per recipe | Read verbatim by the resolver alongside the recipe — this is the "ground truth" per Shotcraft's own `SKILL.md` mandate #6 |
| `lib/**` (12 files: helpers + top-level components) | `rand.ts`, `motion.ts`, `shake.ts`, `camera.tsx` (3D Rig), `Caption.tsx`, `ClipCard.tsx`, `DigitRoll.tsx`, `FlashCut.tsx`, `FlatPanel.tsx`, `PageCam.tsx`, `VerticalTicker.tsx` | Reference copies kept alongside the already-ported/adapted versions in `template/src/motion/` so a diff against the original is always possible |
| `sequences/promo-energy-arc.md` | 4-act full-video pacing template | Referenced by `references/full-video-pacing.md` in the skill (new) |
| `demos/**/*.{png,jpg}` (25 files, ~3.3MB: 24 page-screenshot textures in `demos/_textures/`, 1 decorative image in `demos/interaction/ai-stream-response/`) | Local binary assets some demo `.tsx` files import directly | Same Apache-2.0 tree as the `.tsx` code (mockup/synthetic UI screenshots authored by the upstream repo itself for demo purposes, not verified third-party stock photography — no separate ATTRIBUTION.md covers them, same basis as the rest of `demos/**`). **Initially missed** in the first vendoring pass (only `.tsx/.ts/.json` were copied) — this broke `workbench`'s `vite build` (`Could not resolve "./agent-stream.jpg"`), caught by independent review, fixed by vendoring all `.png`/`.jpg` demo assets and adding `scripts/shotcraft/audit-demo-imports.mjs` (+ a permanent test) that resolves every relative import in every vendored demo/lib file against the filesystem, so a missing local asset fails immediately instead of surfacing only at bundle time. |
| `assets/lib` → `lib` (symlink) | Compatibility path | One demo (`ui-entrance/clipcard-looping/ClipCardLooping.tsx`) imports `../../../assets/lib/ClipCard` — the exact repo-root-relative path from the live Shotcraft layout. Rather than duplicate `lib/` under a second path, a symlink preserves the upstream import path with zero file duplication. |
| `SKILL.md`, `pipeline.md`, `aesthetic-rules.md`, `sound-design.md`, `final-review.md`, `music-beat-sync.md`, `guided-free-creation.md` | Shotcraft's own process docs | Read by the skill's mandatory-lookup workflow step; never paraphrased from memory when a rule needs citing |
| `audio/manifest.json` + `audio/{bgm,sfx}/**` (148 files, 4 bgm + 144 sfx) | Properly-attributed Mixkit audio (Free Sound Effects / Stock Music license, royalty-free commercial use) | Consumed by `template/src/motion/audio/` ducking + cue helpers |
| `workbench.md`, `jianying-export.md` | Two more of Shotcraft's own process docs (obtained via a read-only staged export after the live checkout became inaccessible mid-session — see git history/session notes, not re-derived from memory) | `workbench.md` documents the `src/workbench.ts` manifest contract (§1 of this integration); `jianying-export.md` documents the optional CapCut/JianYing export adapter |
| `gallery/media/poster/*.jpg` (64 files) | Static poster thumbnails, ONE per card (not per style-variant — 64 ≠ 157 cards ≠ 214 styles; confirm mapping before assuming 1:1 with any other count) | Referenced by `gallery/app.js`/`library.html` for the browsable card gallery UI; connected to the CLI (`scripts/shotcraft-lookup.mjs`) and Workbench per the integration audit |
| `gallery/{translations.js,app.js,styles.css,index.html,library.html}` | Minimal gallery UI + Chinese-label translation table | Lets `workbench/`'s `gen-index.mjs` show Chinese card labels instead of English/pinyin fallback (previously listed as a limitation — now resolved) |
| `aifl-template/**` (Ink Press / AiflPromo full source + public assets, ~7.8MB) | Shotcraft's own complete horizontal product-promo template | Ported (with audio re-mapped away from quarantined files) to `template/src/AiflPromoDemo/` as the optional horizontal-promo path — see `docs/shotcraft-integration-audit.md` §6 |
| `jianying-export/*.py` (5 files) | CapCut/JianYing (China) draft-file export scripts | Wrapped by `scripts/shotcraft/jianying-export-adapter.mjs` — GUARDED, optional, never default; writes to a real local app data directory, so it requires an explicit confirmation flag (see that file's header comment) |
| `scripts-templates/upstream/{capture-template.mjs,smoke-render-demos.py}` | PRISTINE, untouched upstream snapshot — refreshed by `refresh-audit.mjs --apply` | Reference-only. `smoke-render-demos.py` was ported to Node at `template/scripts/smoke-render-demos.mjs` (kept here verbatim for reference/diff). |
| `scripts-templates/capture-template.mjs` | **OPERATIONAL** file — REFACTORED from the upstream snapshot to export `runCapture(config)` + `DEFAULT_CONFIG` (same screenshot logic, restructured so `smoke-test.mjs` can import and call the real implementation against a fixture instead of reimplementing it) | **NEVER touched by `refresh-audit.mjs --apply`** — that only ever writes `scripts-templates/upstream/capture-template.mjs`. An earlier version of this integration mapped the refresh target directly onto this operational file, which would have silently overwritten the `runCapture()` refactor on every refresh; caught by independent review and fixed by splitting the destination — see `scripts/shotcraft/refresh-audit.mjs`'s `CATEGORY_MAPPINGS` comment and the regression test in `scripts/shotcraft/__tests__/refresh-audit.test.mjs`. When refreshing, diff `upstream/capture-template.mjs` against this file by hand to decide whether the operational refactor needs a matching update — this is intentionally a manual step, not automated, since a refactored file's diff against pristine upstream isn't a simple copy decision. |

## What's deliberately excluded

- **6 quarantined audio files** with unresolved source attribution in the
  upstream `ATTRIBUTION.md` (`keyboard.mp3`, `pop.mp3`, `riser-cine.mp3`,
  `sparkle.mp3`, `whoosh-big.mp3`, `bgm-tech-house.mp3`) — listed in
  `audio/manifest.json`'s `quarantined[]` array with the reason, never copied.
  Regenerate this snapshot with `scripts/build-audio-manifest.mjs` if upstream
  resolves their provenance. This script has TWO local adaptations beyond its
  original one-off form, both interface/hardening only — the code that reads
  `ATTRIBUTION.md` and copies files has been rewritten for hardening (below),
  but the QUARANTINE set and the classification OUTCOME/semantics for every
  legitimately-formed row (which files end up approved vs. quarantined, and
  why) are unchanged:
  1. An optional 3rd CLI argument (`build-audio-manifest.mjs <shotcraftRepo>
     [destVendorRoot]`) lets `refresh-audit.mjs`'s `refreshFromLive()` point
     it at a disposable test fixture vendor root instead of always writing to
     the real `vendor/shotcraft/audio/`.
  2. Hardening against a malicious/malformed `ATTRIBUTION.md` (an
     independent-audit finding — every row is untrusted input from a live
     checkout this repo doesn't control): `category` must be exactly one of
     the 15 real SFX categories and `file` a safe basename with a real audio
     extension, both validated before any source-audio read or destination
     mutation (parsing `ATTRIBUTION.md` itself still requires reading that
     one file first); source reads are realpath-contained to
     `assets/audio/`; destination writes use lexical containment + safe
     per-component mkdir + reject-existing-symlink, mirroring
     `refresh-audit.mjs`'s own `safeWriteFile`; the destination root itself
     must already exist as a real, non-symlink directory — the script never
     creates it. The whole table is parsed first with zero further
     filesystem access; if ANY row fails validation the script throws
     (nonzero exit) before reading a source file or writing anything, rather than silently
     dropping the bad row and reporting success. See the script's own header
     comment for the full rationale.
- Binary preview **videos** (`gallery/media/*.mp4`, 214 files — one per card
  `styles[]` entry, confirmed via `library.json`'s `media.type: "mp4"` on all
  214) — large, and not needed since the resolver reads the demo `.tsx`
  source directly rather than a rendered preview. **Distinct from** the 64
  static JPG poster thumbnails at `gallery/media/poster/*.jpg`, which ARE
  vendored (see the table above) — do not conflate the two: posters are
  small static images, previews are the (unvendored) full-length mp4 clips.
- ~~`jianying-export/` — not vendored, out of scope~~ **CORRECTED**: this was
  true only in the first pass of this integration. `jianying-export/*.py` (5
  files) IS now vendored (see the table above) and wrapped by the GUARDED,
  default-off `scripts/shotcraft/jianying-export-adapter.mjs` — never part of
  the default pipeline, requires an explicit confirmation flag to do anything
  beyond dry-run path validation. See `docs/shotcraft-integration-audit.md`
  for the adapter's exact guardrails and test coverage.
- `workbench/` is NOT in this vendor snapshot — it was copied to its own
  top-level `/workbench` package (isolated `package.json`, own `node_modules`,
  Remotion/React/zod bumped to match this repo's pins: 4.0.520/19.2.3/4.4.3).
  Contrary to the initial audit's assumption of "a real dependency-version
  conflict," bumping the three pinned versions and running `npm install` +
  `npx tsc -b` was sufficient — clean install (0 vulnerabilities, no peer
  conflicts) and a clean build with zero type errors. It reads this vendor
  snapshot via two repo-root compatibility symlinks so its own source stays
  byte-identical to upstream: `/gallery -> vendor/shotcraft/gallery` and
  `/assets/audio -> ../vendor/shotcraft/audio`. `gen-index.mjs` confirms it
  now sees all 216 demo cards, 144 SFX + 4 BGM (matching the quarantine
  count exactly). The Chinese `translations.js` label file IS vendored (see
  the table above) and used by `gen-index.mjs` for Chinese card labels; only
  the binary preview videos (`gallery/media/*.mp4`, not vendored, see "What's
  deliberately excluded" below) are absent, which is cosmetic. See
  `docs/shotcraft-integration-audit.md` §Workbench.

## Re-vendoring

Do NOT hand-roll partial `rsync`/`cp` commands per category — that was the
original (now superseded) approach and it's exactly how the
`scripts-templates` operational-file overwrite bug happened (see the table
row above). Every vendored category is enumerated explicitly in
`scripts/shotcraft/refresh-audit.mjs`'s `CATEGORY_MAPPINGS`, and refreshing
goes through that script only:

```bash
# Report-only: diff every mapped category (shots/demos/lib/library.json/gallery
# posters/gallery UI/jianying-export/process docs/aifl-template/scripts-templates
# upstream snapshot) plus audio, without writing anything
node scripts/shotcraft/refresh-audit.mjs

# Apply: copy every changed file through symlink-safe containment (rejects any
# destination/source path component that turns out to be a symlink or escapes
# the resolved live/vendor roots), and re-run build-audio-manifest.mjs into a
# disposable scratch dir before merging into vendor/shotcraft/audio/
node scripts/shotcraft/refresh-audit.mjs --apply
```

Set `shotcraftRepo` in `~/.tao-video-suite/config.json` to a live checkout
path first — the resolver (`scripts/shotcraft/resolver.mjs`, CLI at
`scripts/shotcraft-lookup.mjs`) prefers the live path when it exists and falls
back to this vendored snapshot otherwise, so a stale snapshot never blocks
work, only risks staleness (which the resolver reports via its
`source: "live" | "vendored"` return field).

**Manual step after `--apply`**: `refresh-audit.mjs` only ever refreshes
`scripts-templates/upstream/capture-template.mjs` (the pristine reference),
never the OPERATIONAL `scripts-templates/capture-template.mjs` (the
`runCapture()` refactor consumed by `smoke-test.mjs`) — diff the two by hand
afterward to decide whether the operational refactor needs a matching update.
