# Thiết kế scene full-stage và nhịp visual

Đọc file này sau khi chốt kịch bản, trước khi tạo `visual-plan.json` hoặc viết JSX. Mục tiêu là biến mỗi scene thành một đoạn kể chuyện bằng hình ảnh, không phải một slide gồm card, chữ và emoji.

## 1. Thứ bậc thị giác trên khung 1080×1920

Visual chính là nhân vật chính; brand và caption là lớp phủ hỗ trợ.

| Lớp | Vùng/giới hạn khuyến nghị | Quy tắc |
|---|---|---|
| Visual canvas | Toàn bộ 1080×1920 | Ảnh, footage và background có thể full-bleed. |
| Focal stage | `x=40..1040`, `y≈180..1580` | Primary visual thường rộng 880–1000px; không dùng `max-w-xl` cho chủ thể chính. |
| Brand overlay | neo quanh `top=140..160px` | Tối đa khoảng 360–420px, font 22–26px, opacity/glow vừa phải; chỉ hiện khi user yêu cầu. |
| Caption overlay | `bottom=280..320px`, max-width 840–920px | Tối đa 2 dòng; nền gọn theo nội dung; không tham gia flex layout của visual. |
| Platform safe zone | 260px cuối màn hình | Không đặt thông tin bắt buộc phải đọc ở đây. |

Không chia màn hình thành ba dải cứng. Brand và caption phải dùng `position: absolute` hoặc component overlay tương đương để visual được quyền dùng toàn sân khấu. Khi visual là ảnh/footage, cho phép nó chạy dưới overlay nếu vùng focus và độ tương phản vẫn an toàn.

## 2. Substantive visual

Mỗi scene phải có ít nhất một visual mang thông tin, trừ một hook/quote/outro text-only có chủ ý và được dùng có tiết chế:

- ảnh hoặc footage thực tế;
- ảnh tư liệu có nguồn;
- SVG/diagram giải thích cơ chế;
- chart/data visualization;
- bản đồ/timeline;
- mô phỏng 2D/3D;
- screen recording hoặc UI demo phù hợp chủ đề.

Brand, category badge, headline, subtitle, particle nền, glow, card chữ và emoji **không** được tính là substantive visual.

### Emoji và icon

- Không dùng emoji làm primary visual, trừ khi user chủ động chọn phong cách emoji/cartoon.
- Emoji/icon mặc định chỉ là accent trong badge, bullet hoặc nhãn phụ và không nên chiếm quá khoảng 5% diện tích frame.
- Với science/health/finance/history, ưu tiên visual chính xác theo lĩnh vực. Nếu không có ảnh phù hợp, dựng SVG/diagram; không rơi về emoji như một fallback tự động.

## 3. Chọn chất liệu theo intent

Không ép ảnh thật vào mọi scene. Chọn chất liệu giúp người xem hiểu đúng nhất:

- **Người thật, địa điểm, hậu quả đời thực:** ưu tiên ảnh/footage.
- **Cơ chế vô hình hoặc quá nhỏ:** ưu tiên SVG/2D/3D có nhãn và diễn biến.
- **So sánh định lượng:** chart, map hoặc number reveal có nguồn.
- **Quy trình phần mềm:** UI demo, terminal/code crop, node graph hoặc flow diagram.
- **Lịch sử:** tư liệu thật và bản đồ/timeline; tuân thủ thêm luật lịch sử trong `SKILL.md`.

Với video giải thích 50–60 giây, dùng một media mix có chủ ý thay vì quota cứng: thường nên có nhiều hơn một nhóm trong `real media | diagram/simulation | data/map | kinetic type`, không để quá hai scene liên tiếp cùng một ngôn ngữ hình ảnh. Text-only chỉ dùng cho focal moment ngắn.

## 4. Visual beat phải trải đều scene

`spring()` xuất hiện lúc đầu không đủ để gọi là một scene có chuyển động. Mỗi scene cần cấu trúc:

```text
entrance → evolution → change of focus → resolution → transition
```

Ba cấp nhịp:

| Cấp | Chu kỳ mục tiêu | Ví dụ |
|---|---:|---|
| Micro change | 1–2 giây | keyword/label, count-up, đường chạy, crop shift |
| Secondary change | 2,5–4 giây | đổi trạng thái chart, focus bước tiếp theo, thêm callout |
| Major focal change | 5–8 giây | đổi layout, ảnh, camera, scene hoặc kết luận hình ảnh |

Ràng buộc:

- Không giữ primary visual ở cùng một trạng thái quá khoảng 3 giây.
- Scene dưới 8 giây cần ít nhất 3 meaningful visual beat.
- Scene từ 8 giây trở lên cần ít nhất 4–5 beat; nếu không có đủ chất liệu thì tách scene.
- Caption đổi câu, particle, glow và background drift không được tính là meaningful beat.
- Tối đa hai chuyển động mạnh đồng thời; motion phải dẫn mắt hoặc giải thích nội dung.
- Scene dài vẫn hợp lệ nếu có montage, diagram progression, camera/focus change hoặc nhiều trạng thái rõ ràng.

Ví dụ:

```json
{
  "primaryVisualType": "svgDiagram",
  "assetQuery": null,
  "assetRequired": false,
  "visualCoverage": 0.86,
  "visualBeats": [
    {"frame": 0, "action": "reveal-cells"},
    {"frame": 50, "action": "connect-cells"},
    {"frame": 105, "action": "transfer-plasmid"},
    {"frame": 165, "action": "recipient-becomes-resistant"},
    {"frame": 220, "action": "transition-out"}
  ],
  "emojiRole": "accent-only"
}
```

## 5. Visual plan bắt buộc

Mỗi scene khai báo tối thiểu:

```text
narration
visualIntent
sceneType
primaryVisualType
data
assetQuery
assetRequired
visualCoverage
visualBeats
motionPreset
captionEmphasis
sourceCredit
```

- `primaryVisualType`: `footage | photo | archival | svgDiagram | dataViz | map | timeline | uiDemo | threeObject | kineticType`.
- `visualCoverage`: mục tiêu độ phủ của chủ thể chính theo chiều ngang; thường `0.75..0.93`, full-bleed có thể là `1`.
- `assetRequired`: `true` khi scene phụ thuộc asset thực; phải dừng trước JSX nếu asset chưa có hoặc chưa kiểm tra.
- `sourceCredit`: bắt buộc với dữ liệu/ảnh bên ngoài; không tự bịa fact để lấp scene.

Nếu `assetRequired=true`, không được thay asset thiếu bằng emoji hoặc generic card. Tìm nguồn phù hợp, đổi visual plan sang diagram chính xác, hoặc báo blocker.

## 6. Pattern theo loại scene

- **Hook:** full-bleed media hoặc focal object lớn + kinetic headline + camera punch/mask reveal.
- **Mechanism/process:** diagram nhiều trạng thái, connector/path draw và active-step focus.
- **Comparison:** split-screen, shared baseline, divider/morph; không chỉ hai card tĩnh.
- **Metric/chart:** number reveal → chart grow → annotation/kết luận; luôn có unit và source.
- **Map/timeline:** route/path progression, camera push và callout theo thời gian.
- **Real-world impact:** montage người/vật/địa điểm thật, hoặc before/after có bối cảnh.
- **Outro/disclaimer:** overlay ngắn trên visual liên quan; không dành nhiều giây cho một card đứng yên.

Mỗi scene chọn một hero effect và tối đa hai hiệu ứng phụ. Tránh chuỗi `card → card → card` dù màu sắc khác nhau.

## 7. Contact-sheet QA trước render

Render still ở khoảng 25%, 50% và 75% của từng scene rồi kiểm tra bằng mắt:

- Visual chính có được nhìn thấy trước brand và caption không?
- Primary visual có đủ lớn và mang thông tin không?
- Có khoảng trống lớn nhưng không có chủ ý không?
- Ba mốc trong scene có khác trạng thái thực sự không?
- Có quá hai scene liên tiếp cùng layout/chất liệu không?
- Có emoji nào đang thay thế cho ảnh/diagram cần thiết không?
- Caption có che vùng focus hoặc UI nền tảng không?
- Nguồn và asset có đúng nội dung, thời kỳ và giấy phép không?

Nếu thumbnail ở 25% kích thước vẫn trông như một slide gồm vài card nhỏ giữa nền trống, scene chưa đạt.
