# Nhịp năng lượng toàn video (full-video pacing)

Đọc file này ở Bước 0 (soạn kịch bản) khi video có ≥4 scene, trước khi chốt outline gửi
user chọn. Đây là bản chuyển thể sang khung dọc/TTS-first của
`vendor/shotcraft/sequences/promo-energy-arc.md` (bộ khung 4 hồi cho quảng cáo sản phẩm
ngang, hội tụ từ 3 lần dựng thật — 1 mẫu 1085f + 2 lần dựng lại 900f). Khung Hook-Problem-
Solution-Value-Outro trong SKILL.md mục 1 là bố cục NỘI DUNG; tài liệu này bổ sung bố cục
NĂNG LƯỢNG (energy) đè lên trên — hai thứ không thay thế nhau.

## 4 hồi năng lượng (chuyển thể)

| Hồi | Ứng với khối SKILL.md | % thời lượng | Energy | Nhiệm vụ |
|---|---|---|---|---|
| ① Mở đầu | Hook | 8–12% | `low`→`medium` | Gây chú ý, brand/hook giữ ≥1s sau khi ổn định (không vội chuyển ngay) |
| ② Lập nhân vật chính | Context/Pain Point | 12–15% | `medium` | Một ý chính, một cung động tác trọn vẹn ≥3s — đừng cắt vụn |
| ③ Leo thang nội dung | Core Concept 1+2, Real-World Impact | 55–65% | xen kẽ `high`⇄`low` | Mỗi scene gắn 1 ý/kỹ thuật riêng biệt, không lặp cùng cách trình bày quá 2 scene liên tiếp (đã có luật này ở validator); scene mật độ thông tin cao nhất (bảng số liệu, quy trình nhiều bước) đặt ngay TRƯỚC hồi ④, không đặt ở giữa |
| ④ Chốt cao trào | Outro & CTA | 13–16% | `high` (đỉnh cả video) | Tổng hợp các ý đã nêu, câu chốt + CTA, hold ≥1s trước khi kết |

## Quy tắc cứng (đã biết từ 3 lần dựng thật)

1. **Không lặp cùng energy quá 2 scene liên tiếp** ở hồi ③ — energy đứng yên đọc là nhàm, xen kẽ mới tạo nhịp.
2. **Hold/rest tối thiểu SAU mỗi scene energy=`high`**: dành ra khung giữ nghỉ trước khi bung tiếp (xem `template/src/motion/settle.ts` `holdThenSettle`) — không đẩy động tác kế tiếp đè lên lúc còn đang settle.
3. **Scene cuối (outro) luôn energy=`high`** — đây là đỉnh năng lượng, không phải scene "hạ nhiệt".
4. **Scene mở đầu KHÔNG bắt đầu ở `high`** — hồi ① luôn `low` hoặc `medium`, đỉnh dành cho hồi ④.
5. Khung là mặc định, KHÔNG phải luật cứng cho mọi video — video ngắn dưới 60s/chủ đề đơn giản có thể gộp hồi ①+② hoặc ③+④; ghi rõ lý do lệch khung trong `visual-plan.json` (field `pacingArc.deviationReason`) nếu lệch.

## Khai báo trong visual-plan.json (tùy chọn, không phá plan cũ)

Thêm object cấp-plan (không phải cấp-scene) khi muốn validator xác minh nhịp năng lượng:
```json
{
  "pacingArc": { "mode": "energy-arc-v1" },
  "scenes": [{ "energy": "low", "holdFrames": 18, "...": "..." }]
}
```
Mỗi scene khai báo `energy` (đã có sẵn trong schema v3: `low|medium|high`) — khi `pacingArc.mode` có mặt, validator (`scripts/validate-visual-plan.mjs`) kiểm:
- Scene đầu không phải `high`.
- Scene cuối là `high`.
- Không có 3 scene liên tiếp cùng `energy`.
- Mọi scene `energy=high` có `holdFrames` ≥ 0.8×fps (giữ nghỉ thật sau đỉnh, không phải số tùy tiện).

Vắng `pacingArc` = hành vi cũ hoàn toàn (không gate) — plan cũ (`DiBo10PhutSauAn`, `MotionSystemShowcase`) không khai báo field này nên không bị ảnh hưởng.

## Áp dụng cho video KHÔNG có cấu trúc 4 hồi rõ ràng

Video deep-dive (3–5 phút, nhiều chapter) có thể lặp lại chu kỳ ①②③④ theo từng chapter thay vì 1 lần cho toàn video — mỗi chapter là một "video con" có mở-leo thang-chốt riêng, nối tiếp nhau. Đọc thêm `sound-design.md`/`aesthetic-rules.md` (vendor) cho quy tắc SFX/beat gắn theo mỗi đỉnh năng lượng nếu dùng BGM.
