# Kế hoạch tích hợp Shotcraft → tao-video-remotion

Dựa trên `docs/shotcraft-integration-audit.md`. Mọi file mới nằm dưới `template/src/motion/` (namespace riêng, không đụng `src/components`, `src/lib`, `src/styles` hiện có). Không cài package mới. Remotion giữ nguyên `4.0.520`.

## 1. Motion primitives

```text
template/src/motion/
  rand.ts        mulberry32(seed) — PRNG xác định, port nguyên từ Shotcraft (Apache-2.0, giữ header origin)
  motion.ts       velocityAt / lagged / dampedSettle — pure function of frame
  shake.ts        handheld(frame, amp) — rung máy cầm tay xác định, dùng tiết chế (history/archive)
  easing.ts       bảng easing (linear/inQuad/outQuad/inOutCubic/outQuart/outQuint/outExpo/outBack/inBack/outElastic) + seg(t,t0,t1,ease)
  stagger.ts      staggerDelay(index, base) — độ trễ xác định cho danh sách/montage
  settle.ts       holdThenSettle(frame, holdFrames, settleFn) — đảm bảo luật hold/rest tối thiểu
  camera2p5d.tsx  camera 2.5D dọc (port PageCam, tâm 540×960 thay vì 960×540)
  transitions/
    FlashCut.tsx  chớp sáng ấm phủ 2 phía hard-cut (port nguyên, đổi safe-zone dọc)
    WipeCut.tsx   mới — wipe dọc/ngang đơn giản dùng easing.ts, không có sẵn ở Shotcraft dạng component chung
  DigitRoll.tsx   odometer digit roll cho số liệu (port nguyên)
  shots/
    registry.ts   15-20 vertical shot card (metadata + adapter) — xem mục 2
  __tests__/
    rand.test.ts, motion.test.ts, shake.test.ts, easing.test.ts  (dùng node:test, không thêm devDependency)
```

Nguyên tắc port: giữ đúng công thức toán học gốc, chỉ đổi hằng số khung hình (`1920×1080` tâm `960×540` → `1080×1920` tâm `540×960`) và namespace import. Giữ comment `// origin: ...` để truy vết nguồn Apache-2.0.

## 2. Vertical shot library — 15–20 card

File: `skills/tao-video-remotion/references/vertical-shot-library.md` (tài liệu tra cứu, đọc khi lập visual-plan) + `template/src/motion/shots/registry.ts` (metadata máy đọc, không bắt buộc JSX dùng).

Schema mỗi card (TypeScript, không phải component bắt buộc — là gợi ý tham số + provenance):

```ts
export interface ShotCard {
  id: string;
  category:
    | "hook" | "reveal" | "before-after" | "process-timeline" | "data-stat"
    | "diagram" | "montage" | "focus-highlight" | "kinetic-type"
    | "transition" | "outro";
  narrativePurpose: string;      // vì sao dùng, khi nào dùng
  sceneType: string;             // khớp visual-plan.sceneType hiện có
  energy: "low" | "medium" | "high";
  durationFrames: [number, number]; // khoảng gợi ý @30fps
  aspectRatioBehavior: string;   // cách hành xử khi safe-zone TikTok/Reels/Shorts áp dụng
  primaryVisual: string;         // loại visual chính (khớp primaryVisualType)
  camera: string;                // tĩnh / push-in / parallax 2.5D / handheld nhẹ...
  holdRestFrames: number;        // số khung giữ nghỉ tối thiểu sau beat chính (luật R1/R3 áp dụng có điều chỉnh)
  transitionInOut: [string, string];
  sfxCue?: string;               // gợi ý loại SFX (whoosh/impact/riser/sparkle/none)
  pitfalls: string[];            // known pitfalls, dịch/thiết kế lại cho bối cảnh dọc
  provenance: "shotcraft-adapted" | "new-for-vertical";
  componentOrAdapter?: string;   // đường dẫn file trong template/src/motion nếu có
}
```

Danh sách 15–20 card dự kiến (đủ phủ các loại yêu cầu của user):

| ID | Category | Provenance | Ghi chú |
|---|---|---|---|
| `hook-kinetic-punch` | hook | new-for-vertical | Headline + camera punch nhẹ, dùng `easing.ts` outExpo |
| `hook-reveal-mask` | hook | new-for-vertical | Mask reveal ảnh/footage đầu video |
| `image-reveal-crop` | reveal | shotcraft-adapted | Lấy ý tưởng document-focus của `editorial-news.md` + `camera2p5d` |
| `before-after-slider` | before-after | shotcraft-adapted (`before-after-slider-scrub`) | Đổi bố cục dọc, giữ tỉ lệ tốc độ khác nhau 5:1 |
| `timeline-process-3step` | process-timeline | new-for-vertical | Dùng `stagger.ts` cho từng bước |
| `data-stat-counter` | data-stat | shotcraft-adapted (`DigitRoll`, `counter-confetti` ý tưởng) | Number reveal có unit/nguồn |
| `diagram-mechanism-state` | diagram | new-for-vertical | Nhiều trạng thái nối bằng path, dùng `dampedSettle` cho callout |
| `montage-photo-slideshow` | montage | shotcraft-adapted (nguyên lý rhythm/montage) | Ken Burns xen kẽ, cắt nhanh 8 khung như luật lịch sử hiện có |
| `focus-highlight-sweep` | focus-highlight | new-for-vertical | Highlight sweep trên evidence (editorial) |
| `kinetic-headline-stagger` | kinetic-type | new-for-vertical | Word stagger dùng `easing.ts` + `stagger.ts` |
| `camera-parallax-push` | (camera, dùng chung nhiều category) | shotcraft-adapted (`PageCam`→`camera2p5d`) | Push-in 2.5D cho ảnh tư liệu/screenshot lớn |
| `camera-handheld-archive` | (camera) | shotcraft-adapted (`shake.ts`) | Dùng tiết chế cho archive-documentary |
| `transition-flash-cut` | transition | shotcraft-adapted (`FlashCut`) | Hard cut có chớp sáng ấm |
| `transition-wipe` | transition | new-for-vertical | Wipe dọc, dùng `easing.ts` |
| `outro-cta-settle` | outro | new-for-vertical | Câu chốt + CTA, dùng `settle.ts` cho hold ≥1s |
| `data-chart-annotation` | data-stat | new-for-vertical | Chart grow → annotation, theo `data-documentary` preset sẵn có |
| `comparison-split-baseline` | before-after | new-for-vertical | Split-screen 2 chủ thể, baseline chung |

(17 card — trong khoảng 15–20 theo yêu cầu.)

## 3. Visual-plan schema v3 (backward-compatible)

Mở rộng `scripts/validate-visual-plan.mjs`: thêm các field TÙY CHỌN (không bắt buộc) ở cấp scene, không đổi field bắt buộc hiện có của schemaVersion 1/2:

```ts
shotCard?: string;            // id tra cứu trong registry.ts, tùy chọn
motionVariant?: string;       // biến thể trong shot card nếu có
compositionPlan?: string;     // ghi chú bố cục bổ sung
cameraMove?: "static" | "push-in" | "parallax-2.5d" | "handheld-light";
transitionIn?: string;
transitionOut?: string;
sfxCues?: Array<{ frame: number; type: "whoosh"|"impact"|"riser"|"sparkle"|"tick"|"none"; gain?: number }>;
holdFrames?: number;          // số khung giữ nghỉ sau beat cuối — validator kiểm tra >= giá trị tối thiểu nếu có mặt
energy?: "low" | "medium" | "high";
visualHierarchy?: string;     // ghi chú lớp nào là focal
safeZoneStrategy?: string;
```

Validator không throw lỗi nếu các field trên vắng mặt (plan v1/v2 cũ chạy y như trước — test cũ trong `validate-visual-plan.test.mjs` không được sửa, chỉ thêm test mới). Khi field xuất hiện, validator kiểm tra kiểu dữ liệu cơ bản + `sfxCues[].frame` tăng dần trong scene + `holdFrames >= 0`.

`schemaVersion` giữ nguyên 1/2 — các field mới là "loose extension" áp dụng bất kể version (không tạo `schemaVersion: 3` để tránh ép mọi plan cũ nâng cấp; đúng tinh thần "backward-compatible" mà user yêu cầu).

## 4. Narration = nguồn sự thật; beat chỉ hỗ trợ

- `durationInFrames` của mỗi scene tiếp tục lấy từ `audio-manifest.json` (không đổi).
- `sfxCues[].frame` là frame cục bộ trong scene, dùng để phát SFX minh họa hành động (VD tiếng "tick" khi số liệu nhảy, "whoosh" khi transition) — không được dùng để kéo dài/rút ngắn scene.
- Nếu dùng nhạc nền có BPM đã biết (người dùng cung cấp), `template/src/motion/audio/beatGrid.ts` cung cấp `beatFrame(bpm, phaseSec, n, fps)` thuần toán học (không cần `librosa`/Python) để căn *thời điểm transition phụ*, không phải để tạo lời thoại lệch nhịp.

## 5. Sound system

`template/src/motion/audio/soundCues.ts`:

```ts
export type SfxType = "whoosh" | "impact" | "riser" | "sparkle" | "tick" | "none";

export const DEFAULT_GAIN: Record<"bgm" | "sfx" | "tts", number> = {
  bgm: 0.28,   // thấp hơn Shotcraft (0.34) vì phải nhường chỗ giọng đọc — TTS luôn ưu tiên
  sfx: 0.5,
  tts: 1.0,
};

/** BGM lùi âm lượng khi TTS đang phát trong khung [start, start+len]; ducking tuyến tính. */
export function duckingEnvelope(frame: number, ttsWindows: Array<[number, number]>, base: number, duckTo: number, rampFrames = 6): number;
```

Giới hạn tần suất theo audit: tối đa 1 riser/impact "toàn khung" mỗi 2 scene (không lặp mỗi chuyển động như Shotcraft cảnh báo ở R4), không phát SFX cho mọi motion nhỏ — chỉ cho hành động có ý nghĩa (transition mạnh, số liệu chốt, reveal chính).

## 6. QA bổ sung

Thêm vào `skills/tao-video-remotion/references/scene-design.md`:
- Luật hold/rest tối thiểu: sau một major focal change, giữ trạng thái ổn định ≥18 khung (~0.6s) trước khi bắt đầu chuyển động tiếp theo hoặc transition — tránh dồn dập không điểm nghỉ (đối lập bổ sung cho luật "không giữ quá 3 giây" đã có).
- Ghi chú Q11 (đọc từ Shotcraft): với text bị scale nhỏ trong preview, kiểm tra chiều cao chữ hiệu dụng ≥ khoảng 5% chiều cao khung ở kích thước hiển thị thực tế, không chỉ theo `fontSize` khai báo trong code.
- Bước still theo frame cụ thể: dùng `npx remotion still <Comp> out/qa/<id>-<frame>.png --frame=<N>` cho các mốc đầu/giữa/cuối mỗi scene mới, bổ sung cho contact-sheet 25/50/75% đã có.

## 7. Composition kiểm chứng

Thư mục mới `template/src/MotionSystemShowcase/` (không đụng SibutraminPhaNaO), 1080×1920@30fps, ~30–40s, gồm:
1. Hook (kinetic headline + camera punch nhẹ)
2. Ảnh có camera 2.5D/parallax push-in
3. Data/diagram (DigitRoll + chart annotation)
4. Montage (2-3 ảnh, cắt nhanh)
5. 2 transition khác nhau (FlashCut + WipeCut)
6. Hold/rest rõ ràng sau một beat mạnh
7. Subtitle safe-zone dùng `subtitleUtils.ts` hiện có (không thay hệ phụ đề)
8. BGM (do người dùng cung cấp file mẫu hợp pháp hoặc silence placeholder) + SFX không lấn giọng
9. Outro settle ≥1s

## 8. Test & bằng chứng

- `npm run lint` (eslint + tsc) trong `template/`.
- `npx remotion compositions` — xác nhận composition cũ (Docker/RE/QuangTri/AiMalware/Sibutramin) + composition mới đều liệt kê.
- `node --test template/src/motion/__tests__/*.test.ts` (hoặc script tương đương) cho helper mới.
- `node scripts/validate-visual-plan.mjs` chạy trên plan cũ (Docker/Sibutramin) — không có lỗi mới sinh ra do field mở rộng.
- Render still 3 mốc + 1 video preview ngắn cho `MotionSystemShowcase`.

## 9. Cập nhật tài liệu

- `skills/tao-video-remotion/SKILL.md`: thêm mục trỏ tới `references/vertical-shot-library.md` và `template/src/motion/`.
- `skills/tao-video-remotion/references/scene-design.md`: bổ sung hold/rest, Q11, still-theo-frame (mục 6 ở trên).
- `README.md` gốc: không đổi trừ khi cần (giữ scope tối thiểu).
