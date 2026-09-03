# Remotion template của Tao Video Suite

Template React + Remotion để tạo video dọc 1080×1920, 30fps, có TTS, phụ đề theo câu, visual preset và nhiều composition mẫu. Template hỗ trợ nhiều lĩnh vực và không bị giới hạn ở video công nghệ 50–60 giây.

Scene mới dùng visual full-stage: primary visual thường rộng 880–1000px hoặc full-bleed; brand và caption là overlay độc lập. Đọc `../skills/tao-video-remotion/references/scene-design.md` trước khi code. Không dùng emoji/card làm primary visual và không để animation hoàn thành sớm rồi đứng yên hết lời thoại.

**Tác giả:** [Trung Hiếu](https://github.com/salamander97)

## Cài đặt

Nên chạy setup từ thư mục gốc repository trước:

```bash
cd ..
node scripts/setup.mjs
cd template
npm install
```

Setup tự tạo `.env` nếu chưa có. Nếu chỉ muốn chạy template thủ công:

```bash
cp .env.example .env
npm install
npm run dev
```

Trên Windows PowerShell, dùng:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

## Skill AI

Skill chuẩn duy nhất nằm ở thư mục root:

- `../skills/tao-chu-de-video/SKILL.md`
- `../skills/tao-video-remotion/SKILL.md`

Template không còn giữ các bản sao cũ trong `.agents/` hoặc `.claude/`. Chạy `node scripts/setup.mjs` để sao chép skill chuẩn đến Claude Code, Gemini CLI, Codex, Antigravity hoặc ZCode.

Ví dụ:

```bash
node ../scripts/setup.mjs --targets antigravity,claude,codex
```

Sau đó có thể yêu cầu bằng ngôn ngữ tự nhiên:

```text
Tạo video 90 giây về cách nhận biết lừa đảo trực tuyến.
Tạo video 3 phút kể lại chiến dịch Điện Biên Phủ, có tư liệu và nguồn.
```

## Cấu hình giọng đọc

Sửa `template/.env`:

```env
EDGE_TTS_VOICE=vi-VN-HoaiMyNeural
EDGE_TTS_RATE=+10%
EDGE_TTS_PITCH=+0Hz
EDGE_TTS_VOLUME=+0%
EDGE_TTS_OUTPUT_DIR=public/audio
CHANNEL_NAME=""
```

Để `CHANNEL_NAME` trống nếu không muốn hiển thị thương hiệu. Skill sẽ hỏi người dùng trước khi render và có thể truyền `channelName` qua props.

## Xem trước và render

Mở Remotion Studio:

```bash
npm run dev
```

Liệt kê composition:

```bash
npx remotion compositions
```

Render vào thư mục output đã chọn trong setup:

```bash
npx remotion render <CompositionId> "/duong-dan-output/<CompositionId>.mp4"
```

Trên Windows, ví dụ:

```powershell
npx remotion render DockerExplainer "D:\Videos\Tao Video\DockerExplainer.mp4"
```

## Các composition mẫu

- `DockerExplainer`: video giải thích công nghệ ngắn.
- `ReverseEngineering`: video khái niệm kỹ thuật.
- `QuangTri1972`: video lịch sử nhiều cảnh và ảnh tư liệu.
- `AiMalwareShort`: video an toàn số.

Audio và ảnh sinh tự động không được commit. Chạy lại các script trong `scripts/` khi cần tái tạo tài nguyên.

## Kiểm tra chất lượng

```bash
npm run lint
npx remotion compositions
```

## Cấu trúc chính

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

Xem hướng dẫn đầy đủ tại `../README.md`.
