# Template và component Remotion đáng tham khảo

Ưu tiên: code React/TypeScript, animation theo frame, có thể copy hoặc tích hợp với Remotion/Tailwind mà không cần đổi renderer.

## Caption kiểu TikTok

| Repo/tài nguyên | Nên học hoặc lấy gì | Mức phù hợp |
|---|---|---|
| [remotion-dev/template-tiktok](https://github.com/remotion-dev/template-tiktok) | Pipeline Whisper.cpp → JSON, `createTikTokStyleCaptions()`, phân trang caption và highlight từ đang đọc. Dùng làm baseline chính. | Rất cao |
| [Hướng dẫn caption chính thức trong remotion-dev/remotion](https://github.com/remotion-dev/remotion/blob/main/packages/skills/skills/remotion-captions/display-captions.md) | Kiểu `Caption`, `TikTokPage`, `Sequence` theo `startMs`, giữ whitespace và word highlight. Nên chuyển caption nội bộ sang format này. | Rất cao |
| [ahgsql/remotion-subtitles](https://github.com/ahgsql/remotion-subtitles) | Cách import `.srt`, chia subtitle và tạo animated subtitle style. Hợp nếu pipeline có nguồn caption ngoài Edge TTS. | Cao |
| [KyleTryon/TikTokTextBox](https://github.com/KyleTryon/TikTokTextBox) | Component React mô phỏng text box TikTok; chỉ nên lấy phần visual, timing vẫn dùng `@remotion/captions`. | Trung bình |

### Quyết định tích hợp

- Dùng `@remotion/captions` làm data model duy nhất.
- Tạo `CaptionRenderer` riêng với props `style`, `maxWords`, `highlightColor`, `position`, `safeZoneBottom`.
- Với tiếng Việt, ưu tiên word-boundary từ TTS; fallback Whisper. Không chia thời lượng từ đều theo ký tự trừ khi buộc phải làm vậy.

## Kinetic typography

| Repo | Nên học hoặc lấy gì | Mức phù hợp |
|---|---|---|
| [pskd73/remotion-animate-text](https://github.com/pskd73/remotion-animate-text) | API animate theo ký tự/từ qua opacity, x/y, scale, rotate; gần với `interpolate()` native. | Cao |
| [av/remotion-bits](https://github.com/av/remotion-bits) | Bộ block copy-paste gồm text reveal, chart, transition; MIT, React + TypeScript, hợp để dựng scene primitive nhanh. | Rất cao |
| [degueba/onda](https://github.com/degueba/onda) | CLI chép `.tsx` + Zod schema vào project; motion language nhất quán, code MIT và không tạo runtime dependency đóng. | Rất cao |
| [remotion-dev/morph-text](https://github.com/remotion-dev/morph-text) | Morph giữa các cụm từ; hợp hook, định nghĩa khái niệm hoặc before/after. | Cao |
| [remotion-dev/text-warping](https://github.com/remotion-dev/text-warping) | Animate chữ theo SVG path; dùng có tiết chế cho lịch sử, bản đồ hoặc science wave. | Trung bình |
| [zz41354899/SwiftClip](https://github.com/zz41354899/SwiftClip) | Nhiều composition typed, có vertical story, quote, metric, bar chart, timeline và typewriter. MIT, dễ copy vào registry. | Rất cao |
| [RenderComp/free-remotion-templates](https://github.com/RenderComp/free-remotion-templates) | 50 template MIT gồm parallax, draw-on, particle, vertical effects; giữ lại SPDX/MIT notice khi copy. | Cao |

### Primitive nên chuẩn hóa

```text
KineticHeadline   word/line stagger + keyword punch
NumberReveal      count-up + unit + delta
DefinitionMorph   term A → term B
QuoteTypewriter   typewriter + caret + source
SplitComparison   before/after hoặc myth/fact
PathLabel         text chạy theo SVG path
```

Để tránh video “template-y”, component chỉ cung cấp cơ chế; màu, font, easing, density và caption lấy từ visual preset.

## Chart và data visualization

| Repo | Nên học hoặc lấy gì | Mức phù hợp |
|---|---|---|
| [remotion-dev/d3-example](https://github.com/remotion-dev/d3-example) | Ví dụ chính thức kết hợp D3 với Remotion. Nên dùng D3 để tính scale/path, React/SVG để render. | Rất cao |
| [hylarucoder/remotion-bar-race-chart](https://github.com/hylarucoder/remotion-bar-race-chart) | Bar race chart dùng Remotion + Tailwind; ISC. Hợp lịch sử số liệu hoặc xếp hạng tài chính. | Cao |
| [av/remotion-bits](https://github.com/av/remotion-bits) | Chart block sẵn dùng, giúp giảm thời gian viết lại primitives. | Cao |
| [zz41354899/SwiftClip](https://github.com/zz41354899/SwiftClip) | Mẫu bar chart, metric dashboard, data viz và timeline có props typed. | Cao |

### Quy tắc chart cho video dọc

- Mỗi chart chỉ truyền đạt một kết luận; tiêu đề nên nói thẳng insight, không chỉ tên metric.
- Tối đa 5–7 marks/series nhìn thấy cùng lúc trên 1080×1920.
- Animate domain/value bằng `interpolate()` hoặc `spring()`, render thành SVG; tránh animation nội bộ chạy theo đồng hồ của thư viện chart.
- Luôn có unit, baseline hợp lý và source nếu dữ liệu bên ngoài.
- Với nội dung sức khỏe/tài chính, không bịa số liệu để làm đẹp cảnh.

## 3D và chiều sâu

| Repo | Nên học hoặc lấy gì | Mức phù hợp |
|---|---|---|
| [remotion-dev/template-three](https://github.com/remotion-dev/template-three) | Boilerplate chính thức cho `@remotion/three` + React Three Fiber. Điểm khởi đầu tốt nhất cho 3D. | Rất cao |
| [remotion-dev/3d-text](https://github.com/remotion-dev/3d-text) | 3D typography, camera/light và server render; hợp hook hoặc chapter title. | Cao |
| [remotion-dev/three-particles](https://github.com/remotion-dev/three-particles) | Particle field trong Three.js; hợp không gian, nguyên tử, dòng tiền hoặc network. | Cao |
| [remotion-dev/remotion – prompt-to-motion-graphics](https://github.com/remotion-dev/template-prompt-to-motion-graphics-saas) | Tham khảo stack hiện đại gồm Tailwind v4, `@remotion/three`, Lottie, shapes, paths và transitions trong một hệ React thống nhất. | Rất cao |

### Giới hạn vận hành 3D

- Chỉ dùng 3D khi nó giải thích cấu trúc/không gian hoặc tạo một focal moment; không dùng làm nền cho mọi scene.
- Camera, model transform và particles phải lấy từ `frame`; randomness dùng seed.
- Chuẩn bị fallback SVG/2.5D cho render máy yếu.
- Lazy-load model/texture và kiểm tra asset trước render để tránh fail ở phút cuối.

## Bộ chọn nhanh

```text
Caption production       → template-tiktok + @remotion/captions
Text reveal cơ bản       → remotion-bits
Motion system typed      → Onda
Scene/template đa dạng   → SwiftClip + RenderComp
Chart                     → D3 example + SVG primitives
3D                        → template-three + three-particles
AI tạo motion graphics   → prompt-to-motion-graphics-saas
```
