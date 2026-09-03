---
name: tao-chu-de-video
description: >-
  Trợ lý tư vấn chọn chủ đề & nội dung video viral cho MỌI lĩnh vực (lịch sử, sức khỏe, tài chính, công nghệ, thể thao, ẩm thực, du lịch... bất kỳ). Dùng khi người dùng muốn "tìm chủ đề", "gợi ý nội dung", "nên làm video gì", "phân tích niche", "ý tưởng cho kênh". Quy trình hội thoại vòng lặp: hỏi user chọn hướng → WebSearch phân tích → đề xuất 5-7 nội dung cụ thể → user chọn HOẶC yêu cầu khác → tìm lại tinh gọn hơn → nghiên cứu nguồn chính xác → user duyệt facts → đóng gói topic-package → bàn giao skill tao-video-remotion. Có memory theo kênh để nhớ nội dung đã làm và tạo series liền mạch. Interactive topic & content discovery assistant for ANY domain with web research, 5-7 curated suggestions per round, and per-channel memory.
---

# Skill: Tạo Chủ Đề Video (Interactive Topic & Content Discovery)

Skill này là **trợ lý tư vấn nội dung** — hội thoại vòng lặp với user cho đến khi chốt được chủ đề + nội dung, rồi bàn giao cho skill `tao-video-remotion` (bộ máy sản xuất). **Không giới hạn lĩnh vực** — lịch sử, sức khỏe, tài chính chỉ là ví dụ; bất kỳ hướng nào user muốn đều làm được cùng một khung quy trình.

## 🔄 QUY TRÌNH HỘI THOẠI (vòng lặp — không chạy một mạch)

### Vòng 0 — Hỏi hướng chủ đề (LUÔN hỏi user, không tự chọn thay)
Dùng `AskUserQuestion` hỏi: **"Anh/chị muốn làm video về lĩnh vực nào?"**, kèm 3-4 gợi ý hướng:
- Các kênh đã có trong `channels/` (đọc trước — kèm gợi ý tập tiếp theo của series đang chạy)
- 2-3 hướng đang dễ viral (lấy từ `references/niche-playbooks.md` hoặc WebSearch trend hôm nay)
- User luôn có thể gõ lĩnh vực bất kỳ (Other) — thể thao, ẩm thực, du lịch, phim, giáo dục...

Mọi lĩnh vực đều map được sang 1 trong **10 visual style có sẵn** trong template (`src/styles/presets.ts`) — dùng bảng này khi gợi ý để user hình dung ngay phong cách:

| Hướng nội dung | Visual style | Cảm giác |
|---|---|---|
| Khoa học vũ trụ / AI / vật lý | `cosmic-neon` | Kỳ vĩ, neon |
| Hóa–sinh, kỹ thuật, cơ chế | `lab-blueprint` | Bản vẽ phòng lab, chính xác |
| Số liệu, so sánh, khảo sát | `data-documentary` | Big number, chart |
| Chứng khoán, crypto, thị trường | `market-terminal` | Terminal xanh đỏ |
| Tài chính cá nhân premium, fintech | `fintech-glass` | Kính tối giản |
| Kinh tế vĩ mô, chính sách, phân tích | `editorial-macro` | Tạp chí sáng, duotone |
| Y khoa, cơ chế bệnh, thuốc | `clinical-clarity` | Sạch, teal, tin cậy |
| Dinh dưỡng, giấc ngủ, tinh thần | `organic-wellness` | Kem, xanh rêu, nhẹ nhàng |
| Sự kiện/nhân vật lịch sử, tiểu sử | `archive-documentary` | Sepia, tư liệu, Ken Burns |
| Đế chế, khảo cổ, lịch sử địa lý | `museum-map` | Bản đồ vàng, bảo tàng |
| Lĩnh vực khác (thể thao, ẩm thực, du lịch, phim...) | chọn gần nhất theo cảm giác, hoặc `data-documentary` + custom palette | — |

Nếu user chưa có ý tưởng gì: WebSearch "xu hướng video ngắn Việt Nam" tuần này rồi đề xuất 3 hướng kèm lý do.

### Vòng 1 — Đề xuất 5–7 nội dung cụ thể
Sau khi user chọn hướng → **WebSearch phân tích** (2-4 truy vấn: chủ đề đang hot, video tương tự đã viral ở VN, khoảng trống nội dung) → trình bày **5–7 gợi ý nội dung**, mỗi gợi ý gồm:
- Tiêu đề dự kiến (≤ 60 ký tự, có số/câu hỏi)
- Hook 1 câu
- Vì sao nội dung này hay (1 dòng: nhu cầu / khoảng trống / gây tranh luận...)
- Điểm tổng (Hook+Nhu cầu+Khoảng trống+Series, mỗi tiêu chí /10 — xem `references/viral-formulas.md`)

Trình bày qua `AskUserQuestion` (3-4 lựa chọn đẹp nhất) + liệt kê đầy đủ 5-7 gợi ý trong tin nhắn, luôn nhắc user được **gõ chủ đề riêng** (Other).

### Vòng lặp — "Nội dung khác" thì tìm lại
Nếu user không ưng lựa chọn nào:
- Hỏi ngược 1 câu để refine: "Anh muốn thiên về hướng nào hơn — cảm xúc/story, số liệu sốc, hay hướng nghiệp vụ thực tế?"
- WebSearch lại với hướng hẹp hơn → đưa 5-7 gợi ý MỚI (không lặp gợi ý cũ).
- Lặp tối đa ~3 vòng; nếu vẫn chưa chốt, đề xuất user chắp 2 gợi ý mình thích nhất.

### Vòng 1.5 — Chốt độ dài video (bắt buộc hỏi TRƯỚC khi soạn nội dung)
Ngay khi user chốt nội dung, hỏi độ dài dự kiến để outline và research khớp độ dài:

| Lựa chọn | Độ dài | Số cảnh | Phù hợp |
|---|---|---|---|
| NGẮN | 50–60s | 6 | Khái niệm đơn giản, viral nhanh |
| TRUNG BÌNH | 90–120s | 8–10 | Quy trình, có ví dụ |
| DÀI | 3–4 phút | 12–18 | Deep-dive, kể chuyện |

Độ dài user chốt ghi vào package (`chosenLength`) — skill tạo video sẽ KHÔNG hỏi lại. Outline ở Vòng 2 dựng đúng theo số cảnh của độ dài đã chọn.

### Vòng 2 — Nghiên cứu & duyệt facts (phân loại theo LOẠI NỘI DUNG)
User chọn nội dung xong → **phân loại nội dung trước**:

**Loại A — Kiến thức chính xác** (lịch sử, y tế/sức khỏe, tài chính, khoa học):
- Nguồn phải **uy tín TUYỆT ĐỐI** theo chuẩn `references/research-standards.md` (WHO/NIH/Harvard cho y tế; lưu trữ/bảo tàng/báo chính thống cho lịch sử; nguồn chính thức cho tài chính).
- **Cross-check tối thiểu 2 nguồn độc lập** cho mọi mốc số/con số/tháng năm; các nguồn chênh nhau thì ghi rõ "theo nguồn X".
- Không chắc 100% → BỎ fact đó hoặc đổi góc kể. Không có ngoại lệ "cho đẹp kịch bản".

**Loại B — Tin tức/trend/sự kiện đang hot**:
- Ưu tiên **MỚI nhất**: tin trong vòng 24–72h; cũ hơn 1 tuần phải cảnh báo user "tin có thể đã nguội".
- Nguồn: báo chính thống đăng trước (VnExpress, Tuổi Trẻ, Thanh Niên, Kenh14...), sau đó mới đến fanpage/tổng hợp; ghi rõ **ngày đăng** vào fact.
- Ưu tiên góc đang viral (nhiều tương tác/chia sẻ) nhưng fact cốt lõi vẫn phải từ báo chính thống, không lấy số liệu từ meme/tài khoản ẩn danh.

Cả hai loại: trình bày lại cho user **3-5 facts đắt giá (kèm nguồn + ngày/năm) + outline theo độ dài đã chốt + phương án tiêu đề cuối** → user duyệt/chỉnh → chốt.

### Vòng 3 — Chốt & bàn giao
1. Lưu topic-package vào memory kênh (status `scripted`), package bắt buộc chứa: `topic`, `titles`, `hook5s`, `keyFacts` (kèm nguồn + ngày/năm), `outline` (đúng số cảnh của `chosenLength`), `contentClass` ("A-kiến thức chính xác" | "B-tin tức"), `imageKeywords`, `visualStyle`, `chosenLength`, `channelName` (nếu biết).
2. Invoke skill **`tao-video-remotion`** với package. Vì độ dài đã chốt ở Vòng 1.5, skill tạo video **không hỏi lại độ dài** — chỉ hỏi branding nếu package chưa có channelName.
3. Video render xong: append/cập nhật `episodes.json` (status done, mp4, ngày) — BẮT BUỘC.

## 🧠 MEMORY THEO KÊNH

Mỗi kênh (một lĩnh vực/hướng nội dung) có thư mục riêng:

```text
channels/<tên-kênh-slug>/
├── channel.json    # domain, tone, giọng đọc, brand, series đang chạy, niche
└── episodes.json   # mọi tập: id, tiêu đề, hook, facts chính, ngày, file mp4
```

- Đầu phiên: đọc `channels/` — nếu user chọn hướng trùng kênh cũ → **không đề xuất trùng tập đã làm**, ưu tiên tập tiếp theo của series, hook có thể nối chuyện tập trước ("như tập trước anh đã xem...").
- Kênh mới (lĩnh vực chưa có thư mục): tạo `channel.json` khi chốt topic đầu tiên (hỏi user tên kênh nếu chưa có).
- Domain trong channel.json map thẳng sang visual preset của skill tạo video (`history→archive-documentary`, `health→clinical-clarity`, `finance→market-terminal`...).

## ⚡ Nguyên tắc viral (dùng khi chấm điểm)
- 5 giây đầu: câu hỏi ngược / con số sốc / tiết lộ lạ + visual động ngay frame đầu. Không mở bằng định nghĩa.
- Công thức hook & tiêu đề theo domain: xem `references/viral-formulas.md` (áp cho mọi lĩnh vực, có ví dụ muôn hình).
- Mọi gợi ý phải có ít nhất 1 lý do "vì sao người xem dừng tay".

## 📏 Ràng buộc nội dung (mọi lĩnh vực)
- **Không bịa số liệu/fact** — không tìm được nguồn thì bỏ hoặc đổi góc.
- Lĩnh vực nhạy cảm (y tế, tài chính): áp chuẩn disclaimer theo `references/research-standards.md`.
- Ảnh/素材 dùng đúng license, hiện credit khi yêu cầu.

## 📚 References
- `references/niche-playbooks.md` — sub-niche mẫu cho 4 domain phổ biến + cách tự phân tích domain mới.
- `references/viral-formulas.md` — công thức hook/tiêu đề dùng được cho mọi lĩnh vực.
- `references/research-standards.md` — chuẩn nguồn theo domain + cách ghi nguồn vào video.
