# AGENTS.md — Tao Video Suite

Repo này chứa 2 skill tạo video + 1 template Remotion. Agent (Codex/Antigravity/Cursor...) đọc file này để biết làm gì.

## Hai skill — đọc đúng file khi cần

1. **`skills/tao-chu-de-video/SKILL.md`** — dùng khi người dùng muốn: tìm chủ đề, gợi ý nội dung, phân tích niche, "nên làm video gì tiếp". Quy trình hội thoại vòng lặp: hỏi hướng → WebSearch → đề xuất 5-7 nội dung có chấm điểm → user chọn + chốt độ dài → nghiên cứu facts có nguồn → duyệt → bàn giao cho skill tạo video. Memory kênh nằm ở `skills/tao-chu-de-video/channels/` — ĐỌC trước khi đề xuất, GHI sau khi video xong.

2. **`skills/tao-video-remotion/SKILL.md`** — dùng khi người dùng muốn tạo video từ một chủ đề đã có. Làm việc trong thư mục `template/` (chạy `npm install` lần đầu). Đọc kỹ SKILL.md trước khi code — có các luật bắt buộc (hỏi branding, độ dài, spring/clamp, mật độ tư liệu video lịch sử...).

## Môi trường

- Đọc cấu hình máy tại `<home>/.tao-video-suite/config.json`. Nếu chưa có hoặc đường dẫn không hợp lệ, chạy `node scripts/setup.mjs` ở root repository.
- Template mặc định: `<repo>/template`; có thể đổi trong lần setup đầu tiên mà không sửa `SKILL.md`.
- Lệnh luôn chạy với cwd = thư mục template: `npx tsx scripts/...`, `npx remotion render ...`, `npm run lint`.
- File MP4 xuất vào `outputDir` trong cấu hình máy.
- Setup tự tạo `.env` từ `.env.example` nếu chưa có; không ghi đè cấu hình hiện tại.

## Quy tắc bất di bất dịch

- Trước khi viết scene: đọc `skills/tao-video-remotion/references/scene-design.md`; chọn full-stage hoặc editorial-news theo nội dung, không dùng emoji làm primary visual.
- Mỗi video mới tìm hình ảnh Internet đúng chủ đề theo `references/asset-sourcing.md` của skill dựng video; kế thừa visualResearch từ topic-package. Asset phải được xem, xác minh nguồn/quyền dùng và có file/hash trong manifest trước JSX; chạy validator với `--ready` trước JSX/render. Ngoại lệ offline/provided-only/diagram-only ghi lý do trong plan.
- Editorial được giữ shell nhưng evidence phải có crop/highlight/đổi trạng thái mang thông tin; preview chuyển động ở tốc độ thật ngoài contact sheet.
- Trước khi render: PHẢI hỏi người dùng có hiển thị tên kênh không (không tự gắn brand).
- Không bịa số liệu/fact — mọi con số trong kịch bản phải có nguồn (lịch sử/y tế/tài chính).
- Video lịch sử: ≥ 2 tư liệu/cảnh hoặc 1 visual động; ảnh phải kiểm tra đúng chủ đề trước khi dùng.
- Hoàn tất video: cập nhật `skills/tao-chu-de-video/channels/<kênh>/episodes.json`.
- Không commit: `.env`, `node_modules/`, `out/`, `public/audio/*`, `public/images/*` (sinh lại bằng script).

## Kiểm tra sau khi sửa code

```bash
cd template && npm run lint
npx remotion compositions
node ../scripts/validate-visual-plan.mjs <đường-dẫn-visual-plan.json>
```
