# 🎬 Tao Video Suite — Bộ skill tạo video ngắn tiếng Việt bằng AI

Bộ 2 skill + template Remotion để tự động sản xuất video giải thích dọc (TikTok/Shorts/Reels, 1080×1920 @30fps) từ ý tưởng → chủ đề → nghiên cứu → kịch bản → giọng đọc AI → render MP4.

## Kiến trúc

```
┌─────────────────────────┐        ┌──────────────────────────┐
│  tao-chu-de-video       │  bàn   │  tao-video-remotion      │
│  (NÃO — tìm chủ đề)     │ ─────► │  (TAY — sản xuất video)  │
│  • hội thoại chọn niche │ giao   │  • Edge TTS tiếng Việt   │
│  • WebSearch có nguồn   │        │  • 10 visual preset      │
│  • chấm điểm viral      │        │  • montage ảnh tư liệu   │
│  • memory theo kênh     │ ◄───── │  • render Remotion MP4   │
└─────────────────────────┘  ghi   └──────────────────────────┘
        channels/<kênh>/     memory
```

- **`skills/tao-chu-de-video/`** — trợ lý chọn chủ đề & nội dung viral cho MỌI lĩnh vực (lịch sử, sức khỏe, tài chính, công nghệ, thể thao, ẩm thực...). Có memory theo kênh (`channels/`) để tạo series liền mạch, không lặp tập.
- **`skills/tao-video-remotion/`** — bộ máy sản xuất: TTS (edge-tts), 10 visual preset (`cosmic-neon`, `archive-documentary`, `clinical-clarity`...), montage ảnh tư liệu tự tìm từ Wikimedia Commons, render MP4.
- **`template/`** — project Remotion đầy đủ (đã có 4 video mẫu: Docker, Reverse Engineering, Thành cổ Quảng Trị 1972, Mã độc giả AI).

## Cài đặt

### Yêu cầu
- Node.js ≥ 20, npm
- (macOS) ffmpeg — `brew install ffmpeg` (dùng để nén video, không bắt buộc)

### Cài nhanh (mọi agent hỗ trợ thư mục `~/.agents/skills`)

```bash
git clone https://github.com/<user>/tao-video-suite.git
cd tao-video-suite
./install.sh            # copy 2 skills vào ~/.agents/skills + trỏ template về bản trong repo
cd template && npm install && cp .env.example .env
```

### Cài cho từng nền tảng

| Nền tảng | Cách cài | Ghi chú |
|---|---|---|
| **ZCode** | `./install.sh` (mặc định vào `~/.agents/skills`) | Đã kiểm chứng đầy đủ |
| **Claude Code** | `./install.sh claude` (thêm vào `~/.claude/skills`) | Format SKILL.md native |
| **Codex CLI** | Không cần copy — mở repo và làm theo `AGENTS.md` ở root | Codex đọc AGENTS.md + có shell |
| **Antigravity** | Mở repo trong Antigravity, agent đọc `AGENTS.md` | Có shell nên chạy đủ pipeline |
| **ChatGPT app** | Chỉ dùng phần tư vấn: tạo Project mới, nộp `skills/tao-chu-de-video/SKILL.md` + `references/` vào Knowledge, dán `prompts/chatgpt-project.md` vào Instructions | App không chạy lệnh → không render được; dùng để tìm chủ đề/soạn package |

### Đổi đường dẫn template (nếu không dùng bản trong repo)

```bash
./install.sh --set-template "/Volumes/SSD_1TB/Video Remotion/template"
```

## Sử dụng

```
Bạn: "tìm chủ đề làm video"            → tao-chu-de-video chạy vòng hỏi & gợi ý 5-7 nội dung
Bạn: "tạo video về <chủ đề>"           → tao-video-remotion hỏi độ dài + branding rồi tự làm trọn gói
```

Quy ước quan trọng (đã ghi trong skill):
- Luôn hỏi branding trước render (không tên = video sạch, không hiện gì)
- Video lịch sử: ≥ 2 tư liệu/cảnh, giọng đọc +10~15%, kiểm tra ảnh bằng AI vision
- Y tế/tài chính/lịch sử: mọi số liệu phải có nguồn uy tín, không bịa
- Xong mỗi video: ghi vào `channels/<kênh>/episodes.json`

## Cấu trúc repo

```
tao-video-suite/
├── AGENTS.md                 # hướng dẫn cho Codex/Antigravity
├── install.sh                # cài skills + trỏ template
├── prompts/chatgpt-project.md # instruction cho ChatGPT Projects (phần tư vấn)
├── skills/
│   ├── tao-chu-de-video/     # SKILL.md + references/ + channels/ (memory)
│   └── tao-video-remotion/   # SKILL.md + references/
└── template/                 # Remotion project (npm install rồi dùng)
    ├── scripts/              # generate-tts, fetch-images (Commons API)...
    └── src/                  # 4 topic mẫu + styles/presets.ts (10 preset)
```

## Ghi công & license

- Skills: của tác giả repo này (MIT).
- Template Remotion gốc: dựa trên `remotion-cuongit-template`.
- Ảnh tư liệu trong video: Wikimedia Commons theo license CC/PD — component hiển thị credit ngay trên khung; script `fetch-images.ts` chỉ tải ảnh có license rõ ràng.
- Giọng đọc: Microsoft Edge TTS qua `edge-tts-universal`.
- Remotion: lưu ý license của Remotion (miễn phí cho cá nhân/công ty nhỏ, đăng ký key tại remotion.pro để bỏ watermark).
