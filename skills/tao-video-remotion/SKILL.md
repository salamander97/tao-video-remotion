---
name: tao-video-remotion
description: >-
  Tạo video dọc bằng Remotion cho nhiều lĩnh vực và nhiều độ dài, từ video ngắn 50–60 giây đến deep-dive 3–5 phút, có giọng đọc AI, phụ đề và visual phù hợp chủ đề. Dùng khi người dùng yêu cầu tạo, dựng hoặc render video Remotion từ một chủ đề đã có.
---

# Tạo video bằng Remotion

Phiên bản hướng dẫn: **2026-09-06 — editorial + web assets**.

> 🔗 **Skill liên kết**: nếu người dùng CHƯA có chủ đề hoặc muốn tìm chủ đề/niche hay nhất cho kênh (lịch sử, sức khỏe, tài chính...), dùng skill **`tao-chu-de-video`** trước — skill đó nghiên cứu, chấm điểm viral, bàn giao topic-package (facts có nguồn + memory kênh) rồi mới quay lại skill này để dựng video.

## ⚙️ Môi trường làm việc

- Đọc cấu hình tại `<thư-mục-home>/.tao-video-suite/config.json`. Không ghi đường dẫn tuyệt đối của một máy cụ thể vào skill hoặc mã nguồn.
- Dùng `templateDir` làm thư mục làm việc cho mọi lệnh (`npm run tts`, `npx tsx`, `npx remotion ...`). Xác nhận thư mục này có `package.json` trước khi chạy.
- Render MP4 vào `outputDir`, với tên file an toàn như `<TopicName>.mp4`. Luôn đặt đường dẫn trong dấu nháy khi chạy lệnh.
- Nếu chưa có cấu hình hoặc đường dẫn không còn tồn tại, yêu cầu người dùng chạy `node scripts/setup.mjs` từ repository. Chỉ hỏi trực tiếp đường dẫn template/output khi không thể chạy setup.
- Nếu `node_modules` hoặc `.env` chưa có, báo rõ và chạy bước cài đặt tương ứng trong `templateDir`; không giả định máy đã được setup.
- Quy trình: nhận chủ đề → **phân tích & hỏi người dùng chọn độ dài kịch bản + branding** (xem 2 mục ❓/📐 bên dưới) → tự soạn kịch bản → tự sinh TTS → tự viết component → tự render → báo đường dẫn file video. Chỉ hỏi lại người dùng nếu chủ đề chưa rõ hoặc ở 2 bước hỏi bắt buộc.

## ❓ BẮT BUỘC HỎI TRƯỚC KHI RENDER (Branding)

TRƯỚC KHI chạy lệnh `npx remotion render`, PHẢI hỏi người dùng 1 câu duy nhất:

> "Video này có hiển thị tên kênh / logo thương hiệu ở trên không? Nếu có thì tên là gì?"

- Nếu người dùng **trả lời có + tên** (ví dụ "TRUNG HIẾU"): render kèm props:
  ```bash
  npx remotion render <TopicName> "<outputDir>/<TopicName>.mp4" --props='{"channelName":"<TÊN KÊNH>"}'
  ```
- Nếu người dùng **trả lời không / bỏ trống**: render KHÔNG kèm `--props` — brand header tự ẩn hoàn toàn (rỗng = ẩn, đã xử lý sẵn trong `BrandHeader` component và schema `channelName` mặc định `""`).
- KHÔNG bao giờ tự ý gắn tên kênh mặc định nếu người dùng không yêu cầu.

## 📐 BẮT BUỘC: PHÂN TÍCH CHỦ ĐỀ & CHỌN ĐỘ DÀI TRƯỚC KHI LÀM (Bước 0)

> 🔗 **Ngoại lệ quan trọng**: nếu nhận topic-package từ skill `tao-chu-de-video` mà package đã có `chosenLength` (độ dài user chốt) và `channelName` → **KHÔNG hỏi lại các thông tin đó**, dùng luôn. Chỉ hỏi phần còn thiếu.

Khi nhận chủ đề, KHÔNG bắt tay vào soạn kịch bản ngay. PHẢI làm theo thứ tự:

**Bước 0.1 — Phân tích chủ đề** (không cần hỏi, tự đánh giá):
- Chủ đề hẹp/khái niệm đơn giản (vd: "Docker là gì", "API là gì") → hợp độ ngắn.
- Chủ đề rộng/có quy trình nhiều bước/có ví dụ thực chiến (vd: "Reverse Engineer", "Cách hoạt động của HTTPS", "Phân tích malware") → hợp độ trung/dài.
- Cân nhắc mục tiêu nền tảng: TikTok ≤10 phút, Shorts ≤3 phút, Reels ~90s.

**Bước 0.2 — Đưa ra 2-3 phương án kịch bản và HỎI người dùng chọn** (dùng AskUserQuestion hoặc hỏi trực tiếp, mỗi phương án nêu rõ):

| Phương án | Độ dài | Số cảnh | Phù hợp khi |
| :--- | :--- | :--- | :--- |
| **NGẮN** | 50–60s (1500–1800 frames) | 7–10 cảnh; beat phân bổ theo thời lượng từng cảnh | Khái niệm đơn giản, cần viral nhanh, giữ chân người xem |
| **TRUNG BÌNH** | 90–120s (2700–3600 frames) | 12–20 cảnh hoặc chapter editorial có diễn biến; beat theo từng cảnh | Có quy trình nhiều bước, cần ví dụ minh họa |
| **DÀI (deep-dive)** | 3–5 phút (5400–9000 frames) | 24–45 cảnh hoặc chapter có nhiều beat | Chủ đề rộng, cần đi sâu cơ chế + thực chiến + case study |

Mỗi phương án phải kèm **outline tóm tắt các cảnh** (tên cảnh + nội dung sẽ nói) để người dùng hình dung. Có thể gợi ý phương án phù hợp nhất dựa trên phân tích ở 0.1 (đánh dấu "Recommended").

**Bước 0.3 — Chỉ khi người dùng đã chọn** phương án và tên kênh (mục branding phía trên) rồi mới bắt đầu: soạn kịch bản chi tiết → TTS → code → render.

**Quy tắc dựng cảnh theo độ dài:**
- Video dài hơn 60s: KHÔNG kéo dài một layout tĩnh để đủ thời lượng. Thêm scene hoặc thêm visual beat có ý nghĩa; scene thường 4–8s, chỉ dài hơn khi có montage/diagram progression/camera change xuyên suốt. Cấu trúc mở rộng: Hook → Problem → N khái niệm/step → Ví dụ thực tế → Case study → Tổng kết → Outro.
- Mỗi câu thoại vẫn 15–30 từ; tổng thời lượng = tổng frame audio + buffer (+3/cảnh, +10 cảnh cuối).
- Với video >3 phút: cảnh báo người dùng thời gian render sẽ lâu (tuyến tính theo độ dài) và nên render khi không dùng máy.


This skill guides you in creating high-quality vertical explainer videos (TikTok / YouTube Shorts / Reels format: 1080x1920 @ 30fps) of different lengths and across different subject areas.

It combines:
1. **Visual Best Practices** from `remotion-dev/skills` (frame-accurate springs, clamping interpolations, sequence composition, typography hierarchy).
2. **AI Voiceover Synthesis** powered by `edge-tts-universal` configured via `.env` (Vietnamese, English, etc.).
3. **Exact Timing Synchronization** mapping audio voiceover lengths directly into Remotion frame sequences.

---

## 1. Video Structure & Timing (50-60s / 1500-1800 frames @ 30fps) — các khối kể chuyện cơ sở

A captivating short video follows the **Hook-Problem-Solution-Value-Outro** framework. Bảng dưới là sáu **khối kể chuyện**, không bắt buộc là sáu scene: tách một khối thành nhiều scene khi narration hoặc visual không thể phát triển đủ nhịp.

| Scene | Name | Time | Frame Range (@ 30fps) | Purpose & Visuals |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Hook** | 0s – 5s | ~150 frames | Gây chú ý tức thì: Tiêu đề lớn, câu hỏi kích thích tò mò, floating badge. |
| **2** | **Context / Pain Point** | 5s – 15s | ~300 frames | Nêu vấn đề hoặc bối cảnh bằng real-world media, comparison, map hoặc evidence visual. |
| **3** | **Core Concept Part 1** | 15s – 28s | ~390 frames | Giải thích nguyên lý bằng diagram, UI demo, footage, chart hoặc simulation có diễn biến. |
| **4** | **Core Concept Part 2** | 28s – 42s | ~420 frames | Mở rộng chi tiết hoặc cơ chế hoạt động: Quy trình 3 bước, sơ đồ luồng mượt mà. |
| **5** | **Real-World Impact** | 42s – 52s | ~300 frames | Ứng dụng thực tế, lời khuyên thực chiến hoặc số liệu ấn tượng. |
| **6** | **Outro & CTA** | 52s – 60s | ~240 frames | Đúc kết 1 câu đắt giá, lời kêu gọi Like/Share/Follow & thương hiệu cá nhân. |

**Tổng thời lượng:** 1500 – 1800 frames (khoảng 50 – 60 giây).

---

## 2. TTS Voiceover Generation (`edge-tts-universal`)

### 2.1 Cấu hình Voice qua `.env`
Đảm bảo file `.env` đã được cấu hình:
```env
EDGE_TTS_VOICE=vi-VN-HoaiMyNeural    # hoặc vi-VN-NamMinhNeural, en-US-ChristopherNeural
EDGE_TTS_RATE=+10%                   # +10% đến +15% giúp video ngắn nhịp độ nhanh cuốn hút
EDGE_TTS_PITCH=+0Hz
EDGE_TTS_VOLUME=+0%
EDGE_TTS_OUTPUT_DIR=public/audio
```

### 2.2 Quy trình sinh file Audio
Khi nhận chủ đề, tạo file kịch bản voiceover và chạy script `scripts/generate-tts.ts` để sinh audio:

```typescript
import { generateTopicVoices } from "../../scripts/generate-tts";

const scenes = [
  {
    id: "scene1_hook",
    text: "Bạn có biết Docker thực chất là gì và tại sao mọi lập trình viên đều cần nó?",
  },
  {
    id: "scene2_problem",
    text: "Trước đây, câu nói 'trên máy tôi vẫn chạy được' luôn là cơn ác mộng khi bàn giao sản phẩm.",
  },
  {
    id: "scene3_concept1",
    text: "Docker giải quyết việc này bằng Container - đóng gói toàn bộ code và môi trường vào một khối duy nhất.",
  },
  {
    id: "scene4_concept2",
    text: "Khác với máy ảo nặng nề, Docker chia sẻ chung nhân hệ điều hành, giúp khởi động chỉ trong tích tắc.",
  },
  {
    id: "scene5_impact",
    text: "Nhờ đó, bạn deploy ứng dụng mượt mà trên mọi máy chủ từ AWS, GCP cho đến VPS giá rẻ.",
  },
  {
    id: "scene6_outro",
    text: "Follow kênh để nắm trọn các kiến thức công nghệ ngắn gọn mỗi ngày nhé!",
  },
];

await generateTopicVoices("DockerShort", scenes);
```

File âm thanh sẽ được lưu tự động vào `public/audio/<TopicName>/<sceneId>.mp3` kèm file `manifest.json` ghi lại chính xác số frame (`durationInFrames`) cho từng phân cảnh.

---

## 3. Remotion Coding Rules (from `remotion-dev/skills`)

Khi viết mã nguồn Remotion, BẮT BUỘC tuân thủ các nguyên tắc sau:

### 3.1 Sử dụng Spring Animations
Animation phải theo frame, không dùng CSS keyframes/transitions theo đồng hồ thực. Dùng `spring()` cho entrance cần settling; dùng `interpolate()`/easing phù hợp cho camera, path và highlight, không ép mọi vật nảy:
```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Spring nảy mượt mà cho Card/Icon
const scale = spring({
  frame,
  fps,
  config: {
    damping: 12,    // Dưới 15 tạo độ nảy đàn hồi tự nhiên
    stiffness: 100,  // Độ căng
    mass: 0.8,
  },
});

const entrance = spring({
  frame: frame - 10, // Delay 10 frames
  fps,
  from: 50,
  to: 0,
});
```

### 3.2 Interpolation An toàn (Always Clamp)
Luôn luôn cung cấp `extrapolateLeft: "clamp"` và `extrapolateRight: "clamp"` để tránh tràn giá trị khi timeline chạy ngoài phạm vi:
```tsx
import { interpolate } from "remotion";

const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### 3.3 Nhúng Audio và Đồng bộ Sequence
Mỗi scene trong Composition dùng `<Sequence>` hoặc `<Series>` để quản lý timing chính xác:
```tsx
import { Audio, staticFile, Sequence } from "remotion";

// Trong Scene component:
<Sequence from={0} durationInFrames={sceneDuration}>
  <Audio src={staticFile(`audio/${topicName}/scene1_hook.mp3`)} />
  <SceneContent />
</Sequence>
```

4. **Buffer Chuyển cảnh Tinh gọn (Snappy Transition Buffer)**:
   - Khoảng đệm giữa các cảnh chỉ nên để **+3 đến +4 frames** (khoảng 0.1s) sau khi giọng đọc kết thúc.
   - Tránh để buffer quá dài (+15 đến +20 frames) gây ra khoảng lặng/chết nhịp giữa các phân cảnh. Cảnh tiếp theo cần xuất hiện ngay khi câu trước vừa dứt để duy trì nhịp độ dồn dập, hấp dẫn cho video ngắn.

```tsx
// Ví dụ tính thời lượng các cảnh trong Series
const d1 = audioManifest.scenes[0].durationInFrames + 3;
const d2 = audioManifest.scenes[1].durationInFrames + 3;
// ...
```


### 3.4 Quy chuẩn Thiết kế Visual Full-stage (Vertical 1080x1920)
1. **Chọn layout theo câu chuyện**: `full-stage` cho hình ảnh/cơ chế nhập vai; `editorial` cho headline + screenshot/tài liệu/bằng chứng. Full-stage có thể full-bleed, primary visual thường rộng 880–1000px. Editorial theo `references/editorial-news.md`, không ép evidence chiếm toàn chiều cao. Không dùng `max-w-xl` hoặc card chữ nhỏ thay visual.
2. **Brand và caption độc lập với visual**: không đặt chung trong cột `justify-center`. Full-stage dùng caption overlay trên safe zone đáy; editorial cho phép caption inline theo slot. Brand nhỏ, chỉ hiện khi user yêu cầu và không tranh độ sáng/kích thước với headline.
3. **Chất liệu có ý nghĩa**: mỗi scene cần ảnh/footage, diagram/SVG, chart, map/timeline, UI demo hoặc mô phỏng phù hợp. Card, glow, particle, caption và emoji không thay thế primary visual.
4. **Emoji chỉ là accent**: không dùng emoji làm primary visual hoặc fallback tự động, trừ khi user chủ động yêu cầu phong cách emoji/cartoon.
5. **Typography Tối ưu cho Mobile (1080x1920)**:
   - Tiêu đề chính: 72px - 96px, in đậm font-black, gradient sắc nét.
   - Nội dung thẻ / trích dẫn: 40px - 50px font-extrabold.
   - Text phụ / giải thích: 28px - 36px font-semibold.
   - Badge danh mục: 28px - 32px font-black uppercase.
6. **Phụ đề theo Câu (Sentence-Based Caption)**: mặc định `subtitle-pill`; editorial có thể chọn `editorial-inline` dưới headline. Cả hai phải bám TTS, không dùng mô tả tĩnh thay toàn bộ phụ đề.
   - **Vị trí**: subtitle-pill dùng overlay, thường `bottom: 280..320px`, max-width 840–920px và tối đa 2 dòng; editorial-inline theo `editorial-news.md`. Không dùng `mt-64` để đẩy caption khỏi visual.
   - **QUY TẮC NGẮT CÂU (BẮT BUỘC)**: 1 câu hoàn chỉnh = 1 dòng phụ đề, ngắt theo dấu câu tiếng Việt (`. ! ? …`), KHÔNG BAO GIỜ cắt cứng theo số từ làm đứt giữa câu (kiểu "Xin chào tất cả các / bạn nhé!" là SAI). Câu quá dài (>12 từ) tách tại dấu phẩy gần giữa câu nhất. Thời lượng mỗi câu chia theo tỉ lệ số từ để bám nhịp đọc.
   - **Dùng thư viện dùng chung** `src/lib/subtitleUtils.ts` của template: `chunkSentences(text, 12)` + `getChunkStartFrames(chunks, durationInFrames)` — luôn import từ đó, không tự viết hàm chunk lại. Giữ chữ đọc được trên mobile, pill gọn theo nội dung và highlight 1–3 từ khóa. Xem `SubtitleBox.tsx` của DockerExplainer làm mẫu.

---

## 3.5 VISUAL SYSTEM MỞ RỘNG (theo báo cáo nghiên cứu 2026-09-03)

Trước khi viết scene JSX, **phân loại chủ đề** thành `science | finance | health | history | general`, rồi **tự chọn visual preset** (không hỏi thêm người dùng — chỉ follow nếu họ chủ động yêu cầu style):

- Registry 11 preset + hàm chọn: `src/styles/presets.ts` trong template (cosmic-neon, lab-blueprint, data-documentary, market-terminal, fintech-glass, editorial-macro, clinical-clarity, organic-wellness, **archive-documentary**, museum-map, **editorial-news**). Với tin tức/review/case study có bằng chứng, ưu tiên editorial-news; domain vẫn quyết định chuẩn fact-check.
- Chi tiết từng preset (palette, font, hiệu ứng): đọc `references/visual-presets.md`.
- Component/template mở rộng (caption TikTok, kinetic typography, chart, 3D): chỉ đọc mục liên quan trong `references/remotion-components.md` khi cần.
- **Bắt buộc đọc trước khi lập visual plan/viết scene**: `references/scene-design.md` — full-stage, substantive visual, asset, visual beat và contact-sheet QA.
- **Tìm hình ảnh cho mỗi video**: đọc `references/asset-sourcing.md`; search Internet theo chủ đề, kiểm tra ảnh/footage/screenshot, quyền dùng và lưu manifest trước JSX. Kế thừa visualResearch nếu có; gọi trực tiếp skill này vẫn phải tự lập kế hoạch tìm ảnh. Ngoại lệ provided-only/diagram-only phải có lý do, không âm thầm thay ảnh bằng card.
- Khi chọn editorial-news: đọc `references/editorial-news.md`, dùng `EditorialFrame` và dựng diễn biến evidence thật.
- Kiến trúc pipeline artifact/cache/resume: chỉ đọc `references/pipeline-patterns.md` khi sửa pipeline hoặc cần resume; không tải các catalog component/preset không dùng.

### Lập visual-plan TRƯỚC khi code JSX
Mỗi scene phải có: `narration`, `visualIntent`, `sceneType`, `primaryVisualType`, `data`, `assetQuery`, `assetRequired`, `visualCoverage`, `visualBeats`, `motionPreset`, `captionEmphasis` và `sourceCredit`. Schema/quy tắc chi tiết nằm trong `references/scene-design.md`.

Plan mới dùng schemaVersion 2, fps, assetSearch và scenes; scene thêm layoutMode, durationInFrames, assetIds. Chạy gate `--ready` theo `references/asset-sourcing.md` trước JSX và render. Gate không thay QA hình ảnh/chuyển động.

Quy tắc chống nhàm chán:
- **Không lặp cùng cách trình bày nội dung quá 2 scene liên tiếp**. Editorial được giữ shell; đổi evidenceTreatment/focus có ý nghĩa, không đổi màu hoặc tên scene để né luật.
- Micro change mỗi 1–2s, secondary change mỗi 2.5–4s và major focal/layout change mỗi 5–8s. Không giữ primary visual cùng trạng thái quá khoảng 3s.
- Scene dưới 8s cần ít nhất 3 meaningful visual beat; scene từ 8s cần 4–5 beat hoặc phải tách. Caption, glow, particle và background drift không được tính là meaningful beat.
- Không dùng emoji làm primary visual. Nếu asset bắt buộc chưa có, tìm/kiểm tra asset hoặc đổi sang diagram chính xác; không thay bằng generic card.
- Animation luôn theo `frame` (spring/interpolate + clamp 2 đầu), random phải có seed; không CSS transition theo thời gian thực.

### 📜 LUẬT DÀNH RIÊNG CHO VIDEO LỊCH SỬ (bài học từ Thành cổ Quảng Trị)
Video lịch sử **sống bằng tư liệu** — thiếu tư liệu = nhàm chán:
1. **Mật độ tối thiểu**: mỗi cảnh ≥ 2 tư liệu (ảnh/archival) hoặc 1 visual động tự vẽ (bản đồ SVG diễn biến, counter số liệu, con dấu son, cờ/hiệu động, typography cinematic). Video 2–4 phút cần ≥ 15–20 tư liệu.
2. **Montage cắt nhanh**: dùng component `PhotoSlideshow` (N ảnh/cảnh, chuyển slide 8 frame, Ken Burns xen kẽ zoom-in/out) — không để 1 ảnh đứng nguyên > 8 giây.
3. **Nguồn ảnh**: Wikimedia Commons/lưu trữ có metadata → nguồn web phù hợp nếu có căn cứ quyền dùng; ghi credit không tự cấp quyền tái sử dụng. Theo `references/asset-sourcing.md` và **LUÔN kiểm tra ảnh bằng mắt/AI vision** trước khi dùng: đúng phía, đúng thời kỳ, đúng sự kiện/nhân vật.
4. **Nhịp độ**: giọng đọc lịch sử dùng rate **+10% ~ +15%** (kể chuyện vẫn trang trọng nhưng không buồn ngủ); rate +0% chỉ dùng khi user yêu cầu nghi thức trang trọng.
5. Hiệu ứng chất tài liệu: film grain/vignette, hạt tàn lửa, date stamp, khung ảnh sepia + credit license ngay trên khung.

### Pipeline artifact (áp dụng dần)
Mỗi stage ghi file ra đĩa để sửa 1 câu chỉ chạy lại 1 stage: `script.json → visual-plan.json → audio + audio-manifest.json → images.json (asset-manifest) → timeline (composition) → render`. Cache theo hash nội dung (text+voice+rate cho TTS; query+source cho ảnh).

---

## 4. Quy trình tạo video từng bước cho AI agent

Khi nhận được yêu cầu: *"Tạo video giải thích về [Chủ đề X]"*:

### Bước 1: Soạn Kịch bản (Scripting)
1. Xác định các khối Hook, Problem, Concept, Impact, Outro rồi tách thành số scene đủ để mỗi scene có visual phát triển xuyên suốt; không mặc định ép về 6 scene.
2. Viết lời thoại tiếng Việt tự nhiên, súc tích; mỗi scene thường 15–30 từ và phải khớp với `visualBeats`.
3. Chọn preset/layout, lập visual plan nháp và asset search từ outline; lấy/tìm nguồn thực và kiểm tra ảnh theo `references/asset-sourcing.md`. Không viết JSX khi asset bắt buộc còn thiếu. Sau TTS, cập nhật beat frame theo thời lượng thực và chạy gate ready.

### Bước 2: Sinh Giọng Đọc (TTS Generation)
1. Tạo script TTS tạm hoặc gọi trực tiếp `scripts/generate-tts.ts` cho topic đó.
2. Lấy danh sách thời lượng frame thực tế từ `manifest.json`.

### Bước 3: Tạo Thư mục Code `src/<TopicName>/`
Cấu trúc thư mục chuẩn:
```text
src/<TopicName>/
├── <TopicName>.tsx          # Main composition tập hợp các Series.Sequence
├── types.ts                 # Schema & Props
├── audioData.ts             # Metadata thời lượng audio
├── visual-plan.json         # Primary visual, asset, coverage và visual beat
└── scenes/                  # Số scene theo nội dung, không cố định 6 file
    ├── Scene1Hook.tsx
    └── ...
```

### Bước 4: Đăng ký Composition vào `src/Root.tsx`
Thêm Composition mới vào `src/Root.tsx`:
```tsx
<Composition
  id="<TopicName>"
  component={<TopicName>}
  durationInFrames={totalFrames}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{}}
/>
```

### Bước 5: Kiểm tra và Báo cáo
1. Chạy `npm run lint` để kiểm tra lỗi TypeScript/ESLint.
2. Render contact sheet ở 25%/50%/75% mỗi scene và kiểm tra theo `references/scene-design.md`; sửa scene nếu visual nhỏ, lặp hoặc đứng yên.
   Sau đó phát preview tốc độ thật cho hook, chuyển cảnh, scene dài và đoạn cuối: kiểm tra hành động bám lời đọc, caption, tiếng và khoảng giữ tĩnh; still đẹp không chứng minh animation tốt. Không tuyên bố đã xem/nghe nếu công cụ chỉ cung cấp still; nêu phần QA chưa thực hiện.
3. Báo cáo cho người dùng link mở Composition trên Remotion Studio (`http://localhost:3000`) hoặc lệnh render MP4:
   ```bash
   npx remotion render <TopicName> "<outputDir>/<TopicName>.mp4"
   ```
