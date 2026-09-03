# 10 visual style preset cho video giải thích dọc

Tất cả preset đều giả định 1080×1920, 30fps và caption nằm trong safe zone. Font được chọn theo hướng có hỗ trợ tiếng Việt; vẫn nên render thử chuỗi `Ă Â Đ Ê Ô Ơ Ư ă â đ ê ô ơ ư` trước khi dùng một weight cụ thể.

| ID / chủ đề phù hợp | Palette | Font | Bố cục & hiệu ứng cụ thể |
|---|---|---|---|
| **1. Cosmic Neon** — khoa học vũ trụ, vật lý, AI | `#050816` nền; `#7C3AED` tím; `#22D3EE` cyan; `#F472B6` hồng; `#F8FAFC` chữ | Display: **Space Grotesk 700**; body: **Be Vietnam Pro 500**; số: **Roboto Mono 600** | Starfield/parallax 3 lớp; orbit SVG draw-on; sphere/atom bằng R3F; radial glow; headline scale 0.92→1 bằng spring; chuyển cảnh light sweep. Caption active cyan, text shadow tím rất nhẹ. |
| **2. Lab Blueprint** — sinh học, hóa học, kỹ thuật | `#061826`; `#0B2B40`; `#38BDF8`; `#A7F3D0`; `#E6F6FF` | **Be Vietnam Pro 700** + **IBM Plex Mono 500** | Lưới blueprint, crosshair, nhãn callout mono; molecule/node diagram; SVG path draw; scan reveal 12–18 frames; camera pan 2.5D rất nhẹ. Không blur quá nhiều để giữ cảm giác chính xác. |
| **3. Data Documentary** — khoa học phổ thông, số liệu, so sánh | `#0F172A`; `#1E293B`; `#F8FAFC`; `#FBBF24`; `#38BDF8`; negative `#FB7185` | **Montserrat 800** + **Inter 500** | Big-number hero, counter, D3/SVG bar/line/donut; annotation xuất hiện sau chart 6–10 frames; split-screen; source line nhỏ. Transition bằng mask wipe hoặc chart morph, không dùng card kính mọi cảnh. |
| **4. Market Terminal** — chứng khoán, crypto, kinh tế ngắn hạn | `#060A0E`; `#101820`; `#22C55E`; `#EF4444`; `#F59E0B`; `#D1FAE5` | **IBM Plex Mono 600** + **Be Vietnam Pro 600** | Grid terminal, ticker ngang, sparkline/candlestick SVG, số tabular; flash giá chỉ 2–3 frames và không nhấp nháy liên tục; delta slide-up/down; chapter cut nhanh 4–6 frames. Caption pill đen, active xanh/vàng theo ngữ nghĩa. |
| **5. Fintech Glass** — ngân hàng số, fintech, tài chính cá nhân premium | `#07111F`; `#0F2742`; `#2DD4BF`; `#60A5FA`; `#A78BFA`; `#F8FAFC` | **Manrope 750** + **Inter 500** | Glass card có restraint, gradient mesh, progress ring, 3D coin/card tilt tối đa 4–6°, count-up mềm, connector line. Mỗi scene chỉ một glass surface chính; shadow xanh rất nhẹ. |
| **6. Editorial Macro** — lạm phát, chính sách, phân tích tài chính | `#F2EFE7`; `#111111`; `#C62828`; `#1D4ED8`; `#6B6258` | **Roboto Condensed 800** + **Noto Serif 500** | Layout kiểu tạp chí: headline lớn, rule line, ảnh duotone, quote pull-out, bar chart tối giản; hard cut + paper wipe; grain 2–3%; số liệu đỏ/xanh có chú thích, không neon. |
| **7. Clinical Clarity** — y khoa, cơ chế bệnh, hướng dẫn sức khỏe | `#F7FFFD`; `#E6F7F2`; `#0F766E`; `#2563EB`; `#FB7185`; `#16302B` | **Lexend 700** + **Noto Sans 500** | Nền sáng sạch; anatomical SVG đơn giản; pulse waveform; từng bước 1–2–3; highlight vùng bằng soft mask; chuyển cảnh dissolve/wipe 12–16 frames. Tránh glitch, strobe và đỏ phủ toàn màn hình. Gắn nhãn “thông tin tham khảo” khi phù hợp. |
| **8. Organic Wellness** — dinh dưỡng, giấc ngủ, tinh thần, lifestyle health | `#F6F1E7`; `#DDE8D5`; `#52796F`; `#D97757`; `#E9B949`; `#24352F` | **Nunito Sans 800** + **Be Vietnam Pro 500** | Blob hữu cơ, paper grain, hand-drawn underline, breathing scale chu kỳ chậm, icon mềm, ảnh bo 36px; parallax thấp; transition shape morph. Caption nền xanh rêu 92%, active vàng ấm. |
| **9. Archive Documentary** — tiểu sử, chiến tranh, sự kiện lịch sử | `#17130F`; `#3B2F24`; `#D6C3A1`; `#A65A3A`; `#E8DDC7` | **Noto Serif 750** + **Roboto Condensed 600** | Ảnh archival với Ken Burns; film grain/dust tinh tế; date stamp; typewriter cho trích dẫn ngắn; timeline line-draw; map pin. Không dùng scratch/dust quá dày làm giảm khả năng đọc. |
| **10. Museum Map** — đế chế, khảo cổ, lịch sử địa lý, “epic history” | `#090B0F`; `#1E293B`; `#D4AF37`; `#8B1E2D`; `#EDE3CF`; `#5B8C85` | **Spectral 800** + **Be Vietnam Pro 550** | Bản đồ nhiều lớp, route SVG draw-on, vùng lãnh thổ mask reveal, coin/bust 3D quay 6–10°, gold light sweep, chapter title như nhãn bảo tàng. Camera push-in chậm; caption ivory trên nền obsidian. |

## Chọn preset theo intent

| Intent | Preset mặc định | Biến thể |
|---|---|---|
| Giải thích cơ chế khoa học | Lab Blueprint | Cosmic Neon nếu cần cảm giác kỳ vĩ; Data Documentary nếu trọng tâm là số liệu |
| Tin nhanh thị trường | Market Terminal | Fintech Glass cho tài chính cá nhân/sản phẩm; Editorial Macro cho phân tích chính sách |
| Kiến thức y khoa | Clinical Clarity | Organic Wellness cho thói quen, tinh thần, dinh dưỡng nhẹ nhàng |
| Sự kiện/nhân vật lịch sử | Archive Documentary | Museum Map nếu câu chuyện phụ thuộc địa lý, hành trình hoặc đế chế |

## Motion token dùng chung

```ts
export const motion = {
  calm:      {enter: 18, exit: 12, stagger: 5, spring: {damping: 20, stiffness: 90}},
  precise:   {enter: 12, exit: 8,  stagger: 3, spring: {damping: 24, stiffness: 130}},
  energetic: {enter: 8,  exit: 6,  stagger: 2, spring: {damping: 14, stiffness: 170}},
  cinematic: {enter: 22, exit: 16, stagger: 6, spring: {damping: 22, stiffness: 75}},
} as const;
```

Số trên là frame ở 30fps. Mọi `interpolate()` cần clamp hai đầu. Dùng visual full-stage theo `scene-design.md`: primary visual thường hoạt động trong `y≈180..1580`, còn brand và caption là overlay độc lập.

## Caption token gợi ý

```ts
export const caption = {
  fontSize: 48,
  lineHeight: 1.12,
  maxLines: 2,
  maxCharsPerLine: 24,
  horizontalPadding: 32,
  maxWidth: 900,
  bottom: 290,
  bottomSafeZone: 260,
  pageDurationMs: [700, 1300],
};
```

Không ép caption luôn một dòng nếu làm chữ quá nhỏ. Với tiếng Việt, hai dòng ngắn thường đọc tốt hơn một dòng 5–7 từ bị co hoặc tràn ngang.

## Chất liệu và độ phủ visual

- Chọn primary visual theo intent, không theo component nào dễ viết nhất. Ảnh/footage cho bối cảnh đời thực; SVG/3D cho cơ chế; chart/map cho dữ liệu; UI demo cho sản phẩm/phần mềm.
- Primary visual thường rộng 880–1000px hoặc full-bleed. Card nhỏ, badge, emoji, caption, glow và particle không được tính là visual chính.
- Không dùng emoji làm fallback khi thiếu asset. Dựng diagram đúng ngữ nghĩa hoặc dừng để bổ sung asset.
- Không quá hai scene liên tiếp dùng cùng một ngôn ngữ hình ảnh. Đặc biệt tránh chuỗi card kính dù đổi màu.
- Với Clinical Clarity: ưu tiên lab/doctor/medicine media, anatomical hoặc mechanism SVG, waveform và evidence chart; tránh emoji làm tế bào/cơ quan và stock image sai ngữ cảnh.
- Với công nghệ/an ninh mạng: ưu tiên UI/terminal crop, network graph, data flow, device/browser mockup và code transformation; icon chỉ làm nhãn.
- Với disclaimer/credit: dùng overlay ngắn trên visual liên quan, không dành một scene dài cho card đứng yên.

Quy tắc visual beat, asset gate và contact-sheet QA nằm trong `scene-design.md`.
