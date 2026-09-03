# Tao Video Suite

Bộ hai AI skill và một template Remotion để đi từ ý tưởng đến video dọc hoàn chỉnh: chọn chủ đề, nghiên cứu có nguồn, viết kịch bản, sinh giọng đọc, dựng visual và render MP4.

Skill sản xuất hỗ trợ nhiều lĩnh vực và ba nhóm thời lượng: video ngắn 50–60 giây, video 90–120 giây và deep-dive 3–5 phút.

**Tác giả:** [Trung Hiếu](https://github.com/salamander97)

## Bắt đầu nhanh

Yêu cầu: Node.js 20 trở lên và npm.

```bash
git clone https://github.com/salamander97/tao-video-remotion.git
cd tao-video-remotion
node scripts/setup.mjs
cd template
npm install
```

Trình setup sẽ:

1. Hỏi nền tảng cần cài skill.
2. Tự nhận diện `template/`, nhưng cho phép chọn một template khác.
3. Hỏi thư mục lưu video MP4.
4. Tạo `.env` từ `.env.example` nếu chưa có.
5. Lưu cấu hình riêng của máy tại `<home>/.tao-video-suite/config.json`.

Không có đường dẫn macOS hoặc Windows nào được ghi cứng vào skill. Nếu chuyển repository hay đổi ổ đĩa, chỉ cần chạy setup lại.

Trên macOS/Linux có thể dùng lệnh rút gọn tương đương:

```bash
./install.sh
```

## Cài cho từng nền tảng

Nhập nhiều nền tảng, phân cách bằng dấu phẩy:

```bash
node scripts/setup.mjs --targets antigravity,claude,codex
```

| Giá trị       | Thư mục cài               | Phù hợp                                       |
| ------------- | ------------------------- | --------------------------------------------- |
| `antigravity` | `~/.gemini/config/skills` | Antigravity IDE/CLI trên toàn máy             |
| `agents`      | `~/.agents/skills`        | Agent khác dùng thư mục skill chung `.agents` |
| `claude`      | `~/.claude/skills`        | Claude Code                                   |
| `gemini`      | `~/.gemini/skills`        | Gemini CLI có hỗ trợ skill cục bộ             |
| `codex`       | `~/.codex/skills`         | Codex CLI/Desktop                             |
| `zcode`       | `~/.zcode/skills`         | ZCode                                         |
| `all`         | Tất cả thư mục trên       | Máy dùng nhiều agent                          |

Ví dụ không cần hỏi tương tác:

```bash
node scripts/setup.mjs \
  --targets claude,codex \
  --template-dir ./template \
  --output-dir ./output \
  --non-interactive
```

Windows chạy cùng một script bằng PowerShell hoặc Command Prompt:

```powershell
node scripts/setup.mjs --targets claude,gemini --output-dir "D:\Videos\Tao Video"
```

`install.sh` chỉ là lệnh tiện lợi cho macOS/Linux; Windows không cần Git Bash hay WSL.

## Hai skill chính

- `skills/tao-chu-de-video/`: tìm niche/chủ đề cho nhiều lĩnh vực, đánh giá khả năng viral, nghiên cứu facts có nguồn và lưu memory theo kênh.
- `skills/tao-video-remotion/`: nhận chủ đề đã chọn, tư vấn độ dài và branding, tạo TTS, code Remotion, kiểm tra rồi render MP4.

Ví dụ yêu cầu:

```text
Tìm chủ đề làm video lịch sử Việt Nam.
Tạo video 90 giây về cách nhận biết cuộc gọi lừa đảo.
Tạo video deep-dive về cơ chế hoạt động của HTTPS.
```

Hai bản skill cũ trong `template/.agents` và `template/.claude` đã được loại bỏ. `skills/` ở root là nguồn chuẩn duy nhất; setup sẽ sao chép từ đây sang đúng thư mục của từng nền tảng.

## ChatGPT, Gemini và Claude

- Codex, Claude Code, Gemini CLI và Antigravity có thể chạy pipeline local khi được cấp quyền đọc file và chạy lệnh.
- ChatGPT, Gemini web và Claude web có thể dùng phần tư vấn/kịch bản, nhưng không tự render trên máy nếu không có môi trường thực thi local.
- Với ChatGPT Project, đưa `skills/tao-chu-de-video/SKILL.md` cùng thư mục `references/` vào Knowledge và dùng `prompts/chatgpt-project.md` làm Instructions.

## Cấu hình

Cấu hình máy được lưu ngoài repository:

```json
{
  "schemaVersion": 1,
  "repoRoot": "/path/to/tao-video-suite",
  "templateDir": "/path/to/tao-video-suite/template",
  "outputDir": "/path/to/tao-video-suite/output",
  "targets": ["antigravity"]
}
```

Không commit file cấu hình này. Để đổi đường dẫn, chạy lại `node scripts/setup.mjs`; không sửa đường dẫn trong `SKILL.md`.

Cấu hình giọng đọc nằm trong `template/.env`. Mặc định `CHANNEL_NAME` để trống; skill phải hỏi trước khi thêm branding vào video.

## Quy trình sử dụng

```text
Ý tưởng
  → tao-chu-de-video
  → topic package có facts và nguồn
  → tao-video-remotion
  → script + visual plan + audio + composition
  → MP4 trong outputDir
```

Các nguyên tắc quan trọng:

- Không tự gắn tên kênh nếu người dùng chưa yêu cầu.
- Không bịa facts hoặc số liệu, đặc biệt với lịch sử, y tế và tài chính.
- Video lịch sử cần đủ mật độ tư liệu và phải kiểm tra đúng chủ đề/thời kỳ.
- Kết thúc mỗi video thì cập nhật memory của kênh trong `skills/tao-chu-de-video/channels/`.

## Cấu trúc repository

```text
tao-video-suite/
├── AGENTS.md
├── install.sh
├── scripts/
│   └── setup.mjs
├── prompts/
│   └── chatgpt-project.md
├── skills/
│   ├── tao-chu-de-video/
│   └── tao-video-remotion/
└── template/
    ├── scripts/
    ├── src/
    └── README.md
```

## Kiểm tra template

```bash
cd template
npm run lint
npx remotion compositions
```

## License và ghi công

- Tạo và duy trì bởi [Trung Hiếu](https://github.com/salamander97).
- Repository phát hành theo giấy phép MIT.
- Giọng đọc sử dụng `edge-tts-universal`.
- Ảnh tư liệu cần tuân thủ giấy phép và ghi nguồn tương ứng.
- Kiểm tra điều khoản Remotion phù hợp với mục đích sử dụng của bạn.
