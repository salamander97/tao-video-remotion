---
name: tao-video-remotion
description: >-
  Tạo video dọc bằng Remotion cho nhiều lĩnh vực và nhiều độ dài, từ video ngắn 50–60 giây đến deep-dive 3–5 phút, có giọng đọc AI, phụ đề và visual phù hợp chủ đề. Dùng khi người dùng yêu cầu tạo, dựng hoặc render video Remotion từ một chủ đề đã có.
---

# Tạo video bằng Remotion

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
| **NGẮN** | 50–60s (1500–1800 frames) | 6 cảnh chuẩn | Khái niệm đơn giản, cần viral nhanh, giữ chân người xem |
| **TRUNG BÌNH** | 90–120s (2700–3600 frames) | 8–10 cảnh | Có quy trình nhiều bước, cần ví dụ minh họa |
| **DÀI (deep-dive)** | 3–5 phút (5400–9000 frames) | 12–18 cảnh | Chủ đề rộng, cần đi sâu cơ chế + thực chiến + case study |

Mỗi phương án phải kèm **outline tóm tắt các cảnh** (tên cảnh + nội dung sẽ nói) để người dùng hình dung. Có thể gợi ý phương án phù hợp nhất dựa trên phân tích ở 0.1 (đánh dấu "Recommended").

**Bước 0.3 — Chỉ khi người dùng đã chọn** phương án và tên kênh (mục branding phía trên) rồi mới bắt đầu: soạn kịch bản chi tiết → TTS → code → render.

**Quy tắc dựng cảnh theo độ dài:**
- Video dài hơn 60s: KHÔNG kéo dài từng cảnh, mà **Thêm cảnh** (mỗi cảnh vẫn 6–12s để giữ nhịp nhanh). Cấu trúc mở rộng: Hook → Problem → N khái niệm/step → Ví dụ thực tế → Case study → Tổng kết → Outro.
- Mỗi câu thoại vẫn 15–30 từ; tổng thời lượng = tổng frame audio + buffer (+3/cảnh, +10 cảnh cuối).
- Với video >3 phút: cảnh báo người dùng thời gian render sẽ lâu (tuyến tính theo độ dài) và nên render khi không dùng máy.


This skill guides you in creating high-quality vertical explainer videos (TikTok / YouTube Shorts / Reels format: 1080x1920 @ 30fps) of different lengths and across different subject areas.

It combines:
1. **Visual Best Practices** from `remotion-dev/skills` (frame-accurate springs, clamping interpolations, sequence composition, typography hierarchy).
2. **AI Voiceover Synthesis** powered by `edge-tts-universal` configured via `.env` (Vietnamese, English, etc.).
3. **Exact Timing Synchronization** mapping audio voiceover lengths directly into Remotion frame sequences.

---

## 1. Video Structure & Timing (50-60s / 1500-1800 frames @ 30fps) — cấu trúc cơ sở cho phương án NGẮN

A captivating short video follows the **Hook-Problem-Solution-Value-Outro** framework. Với phương án TRUNG BÌNH/DÀI, giữ nguyên khung nền tảng này và **chèn thêm cảnh** theo quy tắc ở mục 📐 Bước 0.3:

| Scene | Name | Time | Frame Range (@ 30fps) | Purpose & Visuals |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Hook** | 0s – 5s | ~150 frames | Gây chú ý tức thì: Tiêu đề lớn, câu hỏi kích thích tò mò, floating badge. |
| **2** | **Context / Pain Point** | 5s – 15s | ~300 frames | Nêu vấn đề hoặc bối cảnh vì sao chủ đề này quan trọng. Icon cảnh báo/so sánh. |
| **3** | **Core Concept Part 1** | 15s – 28s | ~390 frames | Giải thích nguyên lý cốt lõi thứ 1: Card kính, biểu tượng minh họa, từ khóa nổi bật. |
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
Không dùng CSS keyframes/transitions hay linear easing vô hồn. Dùng `spring()`:
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


### 3.4 Quy chuẩn Thiết kế Visual (Vertical 1080x1920)
1. **Background**: Dark Mode cao cấp (`bg-slate-950` hoặc gradient `from-slate-950 via-zinc-900 to-black`) kết hợp hiệu ứng radial glow/grid mờ.
2. **Glassmorphism Cards**:
   - `backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl`
3. **Thương hiệu Kênh Phía Trên (Brand Header)**:
   - Chỉ hiển thị component thương hiệu `⚡ [CHANNEL_NAME]` khi người dùng yêu cầu. Đặt ở phía trên chính giữa (`top: 150px`, `left: 50%` translate-x) để tránh vùng giao diện của TikTok, Shorts và Reels. Giá trị mặc định phải là chuỗi rỗng.
4. **Typography Tối ưu cho Mobile (1080x1920)**:
   - Tiêu đề chính: 72px - 96px, in đậm font-black, gradient sắc nét.
   - Nội dung thẻ / trích dẫn: 40px - 50px font-extrabold.
   - Text phụ / giải thích: 28px - 36px font-semibold.
   - Badge danh mục: 28px - 32px font-black uppercase.
5. **Bố cục Trung tâm & Phụ đề theo Câu (Sentence-Based Caption)**:
   - **Bố cục chính**: Toàn bộ khối nội dung quan trọng BẮT BUỘC nằm ở **chính giữa màn hình** (`justify-center` theo chiều dọc).
   - **Vị trí Phụ đề**: Nằm phía dưới khối trung tâm với khoảng cách thoáng đãng (`mt-64`), không bị che bởi thanh công cụ dưới của TikTok/Reels.
   - **QUY TẮC NGẮT CÂU (BẮT BUỘC)**: 1 câu hoàn chỉnh = 1 dòng phụ đề, ngắt theo dấu câu tiếng Việt (`. ! ? …`), KHÔNG BAO GIỜ cắt cứng theo số từ làm đứt giữa câu (kiểu "Xin chào tất cả các / bạn nhé!" là SAI). Câu quá dài (>12 từ) tách tại dấu phẩy gần giữa câu nhất. Thời lượng mỗi câu chia theo tỉ lệ số từ để bám nhịp đọc.
   - **Dùng thư viện dùng chung** `src/lib/subtitleUtils.ts` của template: `chunkSentences(text, 12)` + `getChunkStartFrames(chunks, durationInFrames)` — luôn import từ đó, không tự viết hàm chunk lại. Chữ to `text-4xl font-black` (cho xuống tối đa 2 dòng, bỏ `whitespace-nowrap`, pill `rounded-[2.5rem]`), highlight từ khóa. Xem `SubtitleBox.tsx` của DockerExplainer làm mẫu.

---

## 3.5 VISUAL SYSTEM MỞ RỘNG (theo báo cáo nghiên cứu 2026-09-03)

Trước khi viết scene JSX, **phân loại chủ đề** thành `science | finance | health | history | general`, rồi **tự chọn visual preset** (không hỏi thêm người dùng — chỉ follow nếu họ chủ động yêu cầu style):

- Registry 10 preset + hàm chọn: `src/styles/presets.ts` trong template (cosmic-neon, lab-blueprint, data-documentary, market-terminal, fintech-glass, editorial-macro, clinical-clarity, organic-wellness, **archive-documentary**, museum-map).
- Chi tiết từng preset (palette, font, hiệu ứng): đọc `references/visual-presets.md`.
- Component/template mở rộng (caption TikTok, kinetic typography, chart, 3D): đọc `references/remotion-components.md`.
- Kiến trúc pipeline artifact/cache/resume: đọc `references/pipeline-patterns.md`.

### Lập visual-plan TRƯỚC khi code JSX
Mỗi scene phải có: `narration` (câu thoại chính xác), `visualIntent` (người xem phải hiểu gì), `sceneType` (một trong `heroText | comparison | process | metric | chart | timeline | map | diagram | quote | threeObject`), `data` (nhãn/số liệu — KHÔNG tự bịa số liệu), `assetQuery` (từ khóa tìm ảnh hoặc null nếu vẽ SVG), `motionPreset` (`calm | precise | energetic | cinematic`), `captionEmphasis` (1–3 từ khóa highlight).

Quy tắc chống nhàm chán:
- **Không dùng cùng một bố cục quá 2 scene liên tiếp**.
- Mỗi 6–12 giây phải có ít nhất một **focal change** (đổi hierarchy, chart state, camera/parallax, diagram step, hoặc keyword emphasis).
- Animation luôn theo `frame` (spring/interpolate + clamp 2 đầu), random phải có seed; không CSS transition theo thời gian thực.

### 📜 LUẬT DÀNH RIÊNG CHO VIDEO LỊCH SỬ (bài học từ Thành cổ Quảng Trị)
Video lịch sử **sống bằng tư liệu** — thiếu tư liệu = nhàm chán:
1. **Mật độ tối thiểu**: mỗi cảnh ≥ 2 tư liệu (ảnh/archival) hoặc 1 visual động tự vẽ (bản đồ SVG diễn biến, counter số liệu, con dấu son, cờ/hiệu động, typography cinematic). Video 2–4 phút cần ≥ 15–20 tư liệu.
2. **Montage cắt nhanh**: dùng component `PhotoSlideshow` (N ảnh/cảnh, chuyển slide 8 frame, Ken Burns xen kẽ zoom-in/out) — không để 1 ảnh đứng nguyên > 8 giây.
3. **Nguồn ảnh**: Wikimedia Commons (API, có license, hiện credit) → ảnh web Việt Nam (Báo QĐND, Báo Nhân Dân...) cho khoảng trống Commons không có (credit nguồn + "Web (tham khảo)") → **LUÔN kiểm tra ảnh bằng mắt/AI vision** trước khi dùng: đúng phía, đúng thời kỳ, không phải ảnh Mỹ/ARVN khi nói về bộ đội ta.
4. **Nhịp độ**: giọng đọc lịch sử dùng rate **+10% ~ +15%** (kể chuyện vẫn trang trọng nhưng không buồn ngủ); rate +0% chỉ dùng khi user yêu cầu nghi thức trang trọng.
5. Hiệu ứng chất tài liệu: film grain/vignette, hạt tàn lửa, date stamp, khung ảnh sepia + credit license ngay trên khung.

### Pipeline artifact (áp dụng dần)
Mỗi stage ghi file ra đĩa để sửa 1 câu chỉ chạy lại 1 stage: `script.json → visual-plan.json → audio + audio-manifest.json → images.json (asset-manifest) → timeline (composition) → render`. Cache theo hash nội dung (text+voice+rate cho TTS; query+source cho ảnh).

---

## 4. Quy trình tạo video từng bước cho AI agent

Khi nhận được yêu cầu: *"Tạo video giải thích về [Chủ đề X]"*:

### Bước 1: Soạn Kịch bản (Scripting)
1. Xác định 6 phân cảnh (Hook, Problem, Concept 1, Concept 2, Impact, Outro).
2. Viết lời thoại tiếng Việt tự nhiên, súc tích, câu ngắn (mỗi cảnh 15-30 từ).

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
└── scenes/
    ├── Scene1Hook.tsx
    ├── Scene2Problem.tsx
    ├── Scene3Concept1.tsx
    ├── Scene4Concept2.tsx
    ├── Scene5Impact.tsx
    └── Scene6Outro.tsx
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
2. Báo cáo cho người dùng link mở Composition trên Remotion Studio (`http://localhost:3000`) hoặc lệnh render MP4:
   ```bash
   npx remotion render <TopicName> out/<TopicName>.mp4
   ```
