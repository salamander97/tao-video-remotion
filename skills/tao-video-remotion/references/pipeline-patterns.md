# Repo pipeline video tự động đáng học

## Nhóm A — tích hợp trực tiếp hoặc rất gần Remotion/React

| Repo | Pipeline/ý tưởng đáng lấy | Việc cần thay để hợp skill tiếng Việt |
|---|---|---|
| [remotion-dev/remotion — template-prompt-to-video](https://github.com/remotion-dev/remotion/tree/main/packages/template-prompt-to-video) | Template chính thức: CLI sinh story script, image, voiceover và `timeline.json`; Remotion render Elements + Text + Audio đã đồng bộ. Đây là baseline kiến trúc tốt nhất. | Thay ElevenLabs bằng adapter `edge-tts`; thêm preset/scene registry thay vì chủ yếu ảnh nền; chuẩn hóa caption `Caption[]`. |
| [gyoridavid/short-video-maker](https://github.com/gyoridavid/short-video-maker) | Text → Kokoro TTS → Whisper captions → Pexels clips → Remotion; có REST API, MCP, Docker và cấu hình caption/music/orientation. MIT. | Kokoro hiện thiên về tiếng Anh; thay tầng TTS bằng Edge TTS tiếng Việt, giữ orchestration, Whisper, Pexels cache và render service. |
| [itsPremkumar/Automated-Video-Generator](https://github.com/itsPremkumar/Automated-Video-Generator) | Script/JSON/prompt → stock media → voiceover → Remotion → MP4 + thumbnail + scene data; có local-first mode, Docker/MCP và quality checks. MIT. | Tách lấy job schema, quality gate và module boundaries; thay visual renderer bằng scene primitives/presets của skill. |
| [aixwangtw/code-to-video-remotion](https://github.com/aixwangtw/code-to-video-remotion) | Toàn bộ nội dung nằm trong `src/content.ts`; `SceneRenderer` dispatch theo visual type; duration tự tính từ voiceover; có render video + nhiều thumbnail. MIT. | Thay Gemini TTS bằng Edge TTS; chuyển `content.ts` thành JSON/TS schema sinh tự động; thêm captions word-level và 9:16 default. |
| [cyanluna-git/remotion-video-gen](https://github.com/cyanluna-git/remotion-video-gen) | Có `scenario.json`, `edit.json`, Edge TTS theo chunk, Remotion render, loudnorm, thumbnail và QA; job artifacts rõ, hỗ trợ tiếp tục pipeline. | Repo thiên về biên tập video đầu vào. Học artifact contract, granular TTS, post-audio và QA; không cần bê nguyên phần jump-cut. |
| [remotion-dev/template-prompt-to-motion-graphics-saas](https://github.com/remotion-dev/template-prompt-to-motion-graphics-saas) | Prompt → motion graphics React/TS; stack có Tailwind v4, Three, Lottie, paths, shapes, transitions và schema. Hữu ích cho visual generation hơn stock footage. | Ghép với Edge TTS/caption/timeline hiện tại; giới hạn component whitelist để output ổn định và dễ kiểm thử. |
| [remotion-dev/template-render-server](https://github.com/remotion-dev/template-render-server) | Mẫu render server Express chính thức; hữu ích khi tách render thành service hoặc hàng đợi job. | Thêm job id, timeout, concurrency limit, cache và artifact status. Không cần cho workflow local một người nếu chưa batch render. |

## Nhóm B — không dùng Remotion trực tiếp nhưng kiến trúc đáng học

| Repo | Nên học gì | Không nên bê nguyên |
|---|---|---|
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | Provider registry cho LLM/TTS/asset; topic → script → keyword → stock footage → caption/music → video; WebUI/API/CLI, batch, lịch sử job và nhiều nguồn asset/TTS, gồm Edge TTS. MIT. | Renderer MoviePy/FFmpeg và code Python không đi thẳng vào React. Giữ Remotion làm composition layer, chỉ học orchestration/provider abstraction. |
| [RayVentura/ShortGPT](https://github.com/RayVentura/ShortGPT) | “LLM-oriented video editing language”, prompt/script library, Edge TTS đa ngôn ngữ, asset sourcing và persistent variables. | Dự án Python/FFmpeg, kiến trúc cũ hơn; lấy DSL/job-state idea, không lấy render layer. |
| [midrender/revideo](https://github.com/midrender/revideo) | TypeScript scene DSL, headless rendering API và React player; đáng xem để thiết kế scene schema rõ và agent-friendly. | Đây là renderer khác Remotion. Không đưa cả framework vào cùng project trừ khi có lý do rõ; chỉ học scene DSL/API. |

## Kiến trúc đề xuất cho skill hiện tại

### 1. Contract giữa các stage

```text
01-script/
  script.json
02-visual-plan/
  visual-plan.json
03-audio/
  scene-*.mp3
  audio-manifest.json
04-captions/
  captions.json
05-assets/
  asset-manifest.json
06-timeline/
  timeline.json
07-render/
  video.mp4
  render-report.json
```

Mỗi artifact có `schemaVersion`, `createdAt`, `inputHash`, `configHash` và danh sách lỗi/cảnh báo. Không để JSX là nơi duy nhất chứa nội dung hay timing.

### 2. Job schema tối thiểu

```ts
type VideoJob = {
  id: string;
  topic: string;
  language: "vi-VN";
  format: {width: 1080; height: 1920; fps: 30};
  durationTargetSec: number;
  visualStyle: string;
  voice: {provider: "edge-tts"; name: string; rate: string; pitch: string};
  stages: Record<
    "script" | "visualPlan" | "tts" | "captions" | "assets" | "timeline" | "render" | "qa",
    {status: "pending" | "running" | "done" | "failed"; inputHash?: string; error?: string}
  >;
};
```

### 3. Provider interface

```ts
interface TtsProvider {
  synthesize(input: {
    text: string;
    voice: string;
    rate: string;
    outputPath: string;
  }): Promise<{
    durationMs: number;
    wordBoundaries?: Array<{text: string; startMs: number; endMs: number}>;
  }>;
}

interface AssetProvider {
  search(input: {query: string; orientation: "portrait"}): Promise<AssetCandidate[]>;
}
```

Tạo adapter `EdgeTtsProvider`, `LocalAssetProvider`, `PexelsProvider`; scene code không biết provider nào đã tạo asset.

### 4. Cache và resume

- Cache key TTS: hash của `text + voice + rate + pitch + providerVersion`.
- Cache key asset: `query + source + orientation + licenseFilter`.
- Cache key render: `timelineHash + codeVersion + RemotionVersion`.
- Nếu chỉ đổi palette, tái sử dụng script/audio/caption/asset và chạy lại timeline/render.
- Nếu sửa một câu thoại, chỉ sinh lại TTS/caption cho scene đó rồi ghép lại timeline.

### 5. Quality gates

```text
Script gate     1 hook rõ, câu thoại 15–30 từ, không claim vô nguồn
Audio gate      file đọc được, peak/loudness hợp lệ, không có khoảng lặng dài bất thường
Caption gate    timing tăng dần, không overlap sai, glyph Việt đầy đủ, tối đa 2 dòng
Visual gate     mỗi scene có visualIntent, không lặp layout quá 2 lần, contrast đạt mức đọc được
Timeline gate   tổng frame khớp, asset tồn tại, transition không âm duration
Render gate     sample frames không blank/overflow, audio có mặt, output probe thành công
```

## Lộ trình ghép thực tế

1. Lấy `timeline.json` idea từ template chính thức của Remotion.
2. Lấy caption data model từ `@remotion/captions` và render logic từ `template-tiktok`.
3. Lấy REST/MCP + Docker orchestration từ `short-video-maker` nếu cần gọi từ n8n/agent.
4. Lấy `SceneRenderer` typed config từ `code-to-video-remotion`.
5. Lấy stage artifacts, loudnorm và QA từ `remotion-video-gen`.
6. Lấy provider registry/batch/history từ MoneyPrinterTurbo khi pipeline đã ổn định.

Kết quả vẫn giữ Remotion + React/Tailwind làm renderer duy nhất, còn Edge TTS, Whisper và asset providers là các adapter có thể thay thế.
