# Audit tích hợp Shotcraft → tao-video-remotion

Ngày: 2026-09-10. Nguồn: `skills/tao-video-remotion/` + `template/` (hệ đích, MIT) và `/Volumes/SSD_1TB/Video Remotion/video-shotcraft` (tham khảo, Apache-2.0). Đối chiếu code thật, không suy diễn từ README.

## 1. Kiến trúc hai hệ thống

| | Hệ đích (tao-video-remotion) | Shotcraft |
|---|---|---|
| Định dạng | 1080×1920 @30fps dọc, mọi composition | 1920×1080 @30fps ngang cứng — `template/src/Root.tsx` hardcode `width={1920} height={1080}`; `PageCam.tsx` hardcode hằng số `960/540`; không có cơ chế đổi khung hình ở bất kỳ đâu |
| Input/Output | Topic → script tiếng Việt → TTS (`edge-tts-universal`) → `visual-plan.json` (schemaVersion 1/2) → JSX scene → validator → render MP4 | Product brief → styleframe → shot mapping → storyboard → per-shot TSX → sound pass → QA độc lập → render MP4 (không có TTS, không kịch bản lời đọc — video quảng cáo sản phẩm câm hoặc caption ngắn) |
| Timing | TTS là nguồn thời lượng chính (`audio-manifest.json` → `durationInFrames` thực tế mỗi scene); phụ đề bám câu | BPM nhạc nền là nguồn thời lượng chính (`beatF(n)`); không có giọng đọc dài, caption chỉ là info-strip 22px ngắn |
| Dependency | `remotion 4.0.520`, `react 19.2.3`, `zod 4.4.3`, `tailwindcss 4.0.0`, styling bằng Tailwind class | `remotion 4.0.484` (template) / `4.0.484` (workbench), `react 19.2.7`, `zod 4.3.6` (chỉ ở workbench), **không có Tailwind** — 100% inline `style={{}}` |
| Component tái dùng | `SceneStage`, `VisualBeatSequence`, `EditorialFrame`, `EvidenceImage`, `subtitleUtils.ts`, `presets.ts` (11 preset, motion token damping/stiffness) | `PageCam` (2.5D camera), `FlashCut`, `Caption`, `DigitRoll`, `ClipCard`, `FlatPanel`, `VerticalTicker`, helpers `rand.ts`/`motion.ts`/`shake.ts`/`camera.tsx` |
| Motion primitive thật | Chỉ có bảng `MOTION_TOKENS` (spring damping/stiffness theo 4 tông), không có easing table, không PRNG seed, không velocity/lag/settle, không parallax/2.5D, không shake | `mulberry32` PRNG seed, `velocityAt/lagged/dampedSettle` (motion.ts), `handheld` shake, easing table 11 hàm (`E` trong `Motion.tsx`), `PageCam` 2.5D thật với kỹ thuật CSS `zoom` chống mờ chữ |
| Shot vocabulary | Không có registry shot — mỗi scene viết JSX tự do theo quy tắc văn bản (`scene-design.md`) | 157 shot recipe card có ID, frontmatter, tham số bảng, "known pitfalls", tham chiếu demo TSX |
| Sound design | Không có — chỉ có TTS + (tùy chọn) nhạc nền không hệ thống | Taxonomy SFX 16 category/149 file, cue `{from,src,volume}[]`, gain/ducking đo bằng số, bù lệch audio/video khi render (S5), beat-sync bằng `librosa` |
| QA | Contact sheet still 25/50/75%, preview tốc độ thật, checklist văn bản trong `scene-design.md` | Still theo frame cụ thể, SSIM so khớp video mẫu cho card mới, checklist P/F/V/S/B/D/A/Q, subagent review độc lập, smoke-render CI |
| Deterministic render | Không có luật cấm `Math.random()` tường minh, không PRNG chuẩn | Luật cứng SKILL.md điều 9: cấm `Date.now()/Math.random()`, bắt buộc `mulberry32(seed)` seed theo index, test bằng vitest |
| Workbench | Không có | Vite SPA riêng (port 5198), kéo-thả timeline, parity check pixel-diff, độc lập với Remotion Studio |
| License | MIT (repo), asset ảnh cần tự tìm nguồn có phép | Apache-2.0 (code); audio bundled: chủ yếu Mixkit free-commercial, nhưng 2 file rõ ràng "nguồn chưa xác định"/"cần audit thương mại" (`bgm-tech-house.mp3`, `pop.mp3`) |

## 2. Vì sao Shotcraft "đẹp hơn" — bằng chứng từ code

1. **Camera/2.5D có kỹ thuật chống mờ chữ thật** — `PageCam.tsx` dùng CSS `zoom` thay vì `transform: scale()` để tránh Chromium rasterize ở layout-width gốc rồi upscale (comment giải thích công thức `Tx = 960/zoom − cx`). Hệ đích không có bất kỳ camera/parallax component nào; mọi ảnh chỉ pan/zoom qua `interpolate()` trực tiếp trên `transform`, tức **có nguy cơ đúng lỗi mờ chữ mà Shotcraft đã giải quyết** nếu scale ảnh có text lớn.
2. **Timing có easing vocabulary thật, không chỉ spring damping** — `Motion.tsx` có bảng 11 easing (`inQuad…outElastic`) và `seg(t,t0,t1,ease)` chuẩn hóa; hệ đích chỉ có 4 spring config trong `MOTION_TOKENS`, thiếu easing cho pan/highlight/path (SKILL.md hệ đích thực ra đã ghi chú "dùng interpolate()/easing phù hợp... không ép mọi vật nảy" nhưng không cung cấp hàm nào).
3. **Composition/hierarchy có "known pitfalls" định lượng** — mỗi shot recipe ghi rõ ngưỡng cảm nhận được (VD `crash-zoom-punch`: rung màn hình biên độ >20px "đọc như lỗi", zoom đích 2.4–2.8 để chủ thể chiếm 60–75% khung). Hệ đích có nguyên tắc định tính tương đương (`visualCoverage`, `scene-design.md` mục 4) nhưng thiếu bảng tham số cụ thể/ngưỡng cảm nhận cho từng loại chuyển động.
4. **Hold/rest được luật hóa bằng số cứng** — `aesthetic-rules.md` R1: "brand hold ≥1s", R3: "opening action ≥3s", `before-after-slider-scrub.md`: "định dạng cuối ≥40f giữ tĩnh thật". Hệ đích có "Không giữ primary visual quá 3 giây" (giới hạn trên) nhưng **không có luật giữ nghỉ tối thiểu** sau một chuyển động mạnh — dễ sinh cảm giác dồn dập liên tục không có điểm nghỉ.
5. **Deterministic random là luật cứng có test** — Shotcraft cấm `Math.random()`, dùng `mulberry32(seed)`, test bằng vitest. Hệ đích chỉ nói "random phải có seed" trong một câu ở `scene-design.md`, không có hàm PRNG chuẩn nào được cung cấp — mỗi scene tự chế nếu cần, dễ lệch chuẩn.
6. **Sound design có mô hình gain/ducking bằng số đo thật** — `sound-design.md` cho hằng số kinh nghiệm (BGM 0.34, SFX 0.2–0.6) và quy trình đo peak thật (`ffmpeg loudnorm`) khi file quá nhỏ so với BGM. Hệ đích **không có bất kỳ cơ chế trộn âm lượng TTS/nhạc nền/SFX nào** — mỗi topic tự làm nếu có nhạc nền, không có convention.
7. **QA có ngưỡng máy đo, không chỉ "xem bằng mắt"** — Shotcraft: SSIM ≥0.97 so khớp video mẫu cho card mới, sai số beat-cut ≤3 khung hình đo bằng cross-correlation thực tế. Hệ đích: "kiểm tra bằng mắt" (`scene-design.md` mục 7) — không sai, nhưng thiếu lớp đo lường tự động có thể tái dùng.
8. **Reuse qua shot registry có metadata tra cứu** — 157 card tra theo category/tag/duration/energy trong `gallery/api/library.json`. Hệ đích không có registry nào; agent phải tự nghĩ lại motion mỗi scene từ đầu, dẫn tới rủi ro lặp/không nhất quán giữa các topic khác nhau (đúng như AGENTS.md ghi nhận việc phải tránh lặp).

## 3. Ma trận quyết định ADOPT / ADAPT / DEFER / REJECT

Chú thích cột File nguồn dùng đường dẫn tương đối trong Shotcraft trừ khi ghi rõ khác.

| # | Tính năng | File nguồn | Tương ứng hiện có | Trùng lặp/Conflict | Quyết định | Lý do | File đích | Dependency/License | Rủi ro | Test |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | PRNG seed `mulberry32` | `assets/lib/helpers/rand.ts` | Không có | Không trùng | **ADOPT** | Code thuần, không phụ thuộc Remotion version, đúng nhu cầu "random có seed" đã ghi trong `scene-design.md` | `template/src/motion/rand.ts` | Không có dep mới; Apache-2.0 giữ header origin | Thấp | unit test giá trị cố định theo seed |
| 2 | `velocityAt/lagged/dampedSettle` | `assets/lib/helpers/motion.ts` | Không có | Không trùng | **ADOPT** | Pure function of frame, không đổi API Remotion, hữu ích cho settle/hold sau chuyển động mạnh | `template/src/motion/motion.ts` | Không | Thấp | unit test số |
| 3 | `handheld` shake | `assets/lib/helpers/shake.ts` | Không có | Không trùng | **ADOPT** | Nhỏ, xác định, dùng tiết chế cho archive-documentary/history đúng gu hệ đích | `template/src/motion/shake.ts` | Không | Thấp | unit test biên độ |
| 4 | Easing table (`E`) + `seg()` | `demos/_fixtures/Motion.tsx` | `MOTION_TOKENS` (chỉ spring) | Bổ sung, không trùng | **ADOPT** | Hệ đích thiếu easing cho pan/highlight/path — đúng khoảng trống đã nêu ở `scene-design.md`/`SKILL.md` (khuyên dùng easing nhưng không cấp hàm) | `template/src/motion/easing.ts` | Không | Thấp | unit test giá trị biên t=0/1 |
| 5 | `PageCam` 2.5D camera | `assets/lib/PageCam.tsx` | Không có (chỉ pan/zoom tay trong từng scene) | Không trùng nhưng cần **port tọa độ** 1920×1080→1080×1920 | **ADAPT** | Kỹ thuật chống mờ chữ (`zoom` thay `scale`) rất giá trị cho hệ đích (ảnh tư liệu lịch sử, screenshot editorial phóng to); nhưng phải đổi hằng số `960/540` → `540/960` và bỏ giả định "full-page screenshot 1920 rộng" | `template/src/motion/camera2p5d.tsx` | Không thêm dep | Trung bình — sai công thức tâm điểm nếu port ẩu | render still so khớp trước/sau khi rotX=rotY=rotZ=0 |
| 6 | `FlashCut` transition | `assets/lib/FlashCut.tsx` | Không có transition component nào (chỉ có "chuyển cảnh +3-4 frame" qua Series) | Không trùng | **ADOPT** | 20 dòng, không phụ thuộc, bổ sung đúng "transition" còn thiếu trong SKILL.md hệ đích | `template/src/motion/transitions/FlashCut.tsx` | Không | Thấp | still test tại frame giữa |
| 7 | Easing/parameter table riêng cho crash-zoom, before/after slider... (157 shot recipe) | `references/shots/**/*.md` | Không có registry | Không trùng — đây chính là khoảng trống lớn nhất | **ADAPT** (chọn lọc 15–20 card phù hợp explainer dọc, không lấy nguyên 157) | Toàn bộ 157 card thiết kế cho quảng cáo sản phẩm SaaS ngang 16:9 (UI carousel, cursor demo, command palette...) — phần lớn không hợp video kiến thức/lịch sử/y tế dọc; chỉ port **nguyên lý tham số** (timing/easing/pitfalls) của các card tổng quát: camera (crash-zoom, tension-camera), transition (wipe, iris, flash), data (before-after, counter, chart), typography (kinetic reveal), rhythm (montage) | `template/src/motion/shots/*.ts` + `skills/tao-video-remotion/references/vertical-shot-library.md` | Không | Trung bình — phải tự thiết kế lại card cho dọc, không có sẵn | contact-sheet still cho mỗi card mới |
| 8 | `Caption.tsx` info-strip 22px | `assets/lib/Caption.tsx` | `subtitleUtils.ts` + `CAPTION_TOKENS` (48-58px, ngắt câu tiếng Việt) | **Conflict thật**: chính comment trong Caption.tsx tự ghi "22px thấp hơn ngưỡng Q11 (≥56px)" | **REJECT** | Hệ đích đã có giải pháp caption tốt hơn (ngắt câu tiếng Việt, 48-58px, đúng Q11 mà chính Shotcraft đề ra); dùng Caption.tsx sẽ tạo racing giữa 2 hệ phụ đề | — | — | — | — |
| 9 | `DigitRoll` odometer | `assets/lib/DigitRoll.tsx` | Không có | Không trùng | **ADOPT** | Hữu ích cho scene data/stat (tài chính, số liệu y tế/lịch sử), không phụ thuộc gì đặc biệt | `template/src/motion/DigitRoll.tsx` | Không | Thấp | still test giá trị đích |
| 10 | `ClipCard` (video thật mp4) | `assets/lib/ClipCard.tsx` | Không có adapter cho mp4 footage | Không trùng | **DEFER** | Hệ đích hiện dùng ảnh tĩnh/SVG là chính (asset-sourcing.md); chưa có nhu cầu rõ cho footage mp4 trong luồng hiện tại — để dành khi có yêu cầu cụ thể dùng video tư liệu động | (tương lai) `template/src/motion/ClipCard.tsx` | Cần kiểm tra `@remotion/motion-blur` version khi dùng | — | — |
| 11 | `VerticalTicker` | `assets/lib/VerticalTicker.tsx` | Không có | Không trùng, TÊN GÂY NHẦM (không phải "vertical video", là ticker chữ chạy dọc) | **DEFER** | Không có shot recipe nào trong danh sách ưu tiên 15-20 card cần ticker; ghi nhận cho vòng sau | — | — | — | — |
| 12 | `beatF(n)` beat-sync + `librosa` pipeline | `references/music-beat-sync.md` | Không có beat-sync nào (TTS timing only) | **Conflict nguyên tắc**: Shotcraft coi beat là nguồn thời lượng chính; hệ đích bắt buộc TTS là nguồn thời lượng chính (ràng buộc #4 của user) | **ADAPT** (đảo vai trò) | Không thể dùng beat làm nguồn timing — vi phạm luật "TTS bám lời đọc". Chỉ lấy **khái niệm** `beatF(n)` để đồng bộ SFX/transition phụ với nhạc nền, còn scene duration vẫn từ audio-manifest | `template/src/audio/beatGrid.ts` (tùy chọn, không bắt buộc chạy `librosa`— dùng BPM nhập tay hoặc ước lượng đơn giản) | Không cần `librosa`/Python trong Node pipeline | Trung bình — nếu không đo BPM thật, chỉ nên dùng khi user cung cấp BPM nhạc nền | validator kiểm tra beat không đẩy lệch scene duration |
| 13 | Sound cue array `{from,src,volume}[]` + gain constants | `references/sound-design.md`, `template/src/aifl/Main.tsx` (pattern) | Không có | Không trùng | **ADAPT** | Convention đơn giản, phù hợp thêm vào visual-plan mới (`sfxCues`) mà không phá schema cũ; hằng số gain (BGM 0.34, SFX 0.2-0.6) dùng làm default nhưng phải tính thêm ducking khi có TTS (Shotcraft không có giọng đọc nên không có ví dụ ducking TTS — phần này tự thiết kế) | `template/src/audio/soundCues.ts` + mở rộng `visual-plan` schema | Không | Trung bình — ducking TTS là phần tự thiết kế, cần review kỹ để không lấn giọng | render RMS/peak check thủ công (không có audio decode lib sẵn) |
| 14 | 149 file SFX + 5 BGM thật | `assets/audio/**` | Không có audio asset nào | Không trùng nhưng **rủi ro license**: 2 file "nguồn chưa xác định" | **DEFER toàn bộ audio nhị phân** | Ràng buộc #5 (license) + #6 của user: chỉ lấy audio được phép; `bgm-tech-house.mp3` và `pop.mp3` bị chính Shotcraft gắn cờ "cần audit thương mại"/"nguồn chưa xác định" → không đủ điều kiện copy an toàn. Các file Mixkit khác về lý thuyết có thể dùng nhưng cần audit từng file trước, ngoài phạm vi phiên làm việc này | — | Mixkit free-commercial cho phần lớn, KHÔNG rõ cho 2 file | Cao nếu copy nhầm 2 file có vấn đề | — |
| 15 | Aesthetic rules R1-R4 (hold ≥1s, opening ≥3s, ≤3 impact toàn phim) | `references/aesthetic-rules.md` | Có "không giữ quá 3s" nhưng thiếu "giữ tối thiểu" | Bổ sung, không trùng | **ADOPT** (as design guideline, không phải code) | Lấp khoảng trống hold/rest tối thiểu đã nêu ở mục 2.4 | `skills/tao-video-remotion/references/scene-design.md` (bổ sung mục hold/rest) | — | Thấp | review thủ công khi viết scene |
| 16 | Q11 readability rule (chữ ≥5.2% chiều cao khung, đo trên frame thật) | `references/aesthetic-rules.md` | `CAPTION_TOKENS.fontSize=58` cố định px, không đo theo % khung hoặc theo scale cha | Bổ sung | **ADOPT** (nguyên tắc, ghi vào reference, không đổi code hiện có vì đã đạt ngưỡng ở scale 1) | 58px/1920 chiều cao dọc ≈ 3% — thấp hơn ngưỡng Q11 nhưng đây là ngưỡng cho video 16:9 quảng cáo xem gần; hệ đích ưu tiên chuẩn mobile riêng, ghi chú tham khảo để cảnh báo khi component bị scale nhỏ | `skills/tao-video-remotion/references/scene-design.md` | — | Thấp | — |
| 17 | Deterministic-render CI test (vitest cho helper) | root `package.json`/`__tests__` | Không có test cho motion helper | Không trùng | **ADOPT** | Khớp ràng buộc "render deterministic" của user; port cùng lúc với helper | `template/src/motion/__tests__/*.test.ts` (cần thêm `vitest` hoặc dùng node test runner có sẵn — xem rủi ro) | **Cần thêm devDependency `vitest` hoặc dùng `node:test` built-in để tránh dep mới** | Trung bình — tránh thêm test framework mới nếu có thể dùng `node --test` | chạy được qua `npm run lint`/script riêng |
| 18 | Motion Workbench (Vite SPA kéo-thả) | `workbench/` | Không có | Không trùng, chi phí tích hợp rất cao | **DEFER** | Cần chạy service Vite riêng port 5198, symlink project, phụ thuộc `zustand/@react-three/fiber/three` không nằm trong stack hệ đích; rủi ro vượt quá "tích hợp có kiểm soát"; ghi adapter tương lai | — | zustand, three, @react-three/fiber — dep mới lớn | Cao nếu ép tích hợp ngay | — |
| 19 | `camera.tsx` R3F `Rig` (3D full) | `assets/lib/helpers/camera.tsx` | Không có 3D | Không trùng | **DEFER** | Cần `@react-three/fiber`+`three` (dep mới, không có trong stack); hệ đích có `threeObject` là 1 trong các `primaryVisualType` hợp lệ nhưng chưa có scene nào dùng 3D thật — để dành khi có nhu cầu cụ thể | (tương lai) `template/src/motion/Rig.tsx` | `@react-three/fiber`, `three` | — | — |
| 20 | `gallery/api/library.json` — registry có metadata tra cứu | `gallery/api/library.json` | Không có | Không trùng | **ADAPT** | Lấy Ý TƯỞNG cấu trúc (category/tags/energy/duration/media) để thiết kế `vertical-shot-library.json`, không copy nội dung 157 card (không hợp bối cảnh dọc/không có TTS) | `skills/tao-video-remotion/references/vertical-shot-library.md` + `template/src/motion/shots/registry.ts` | — | Thấp | validator kiểm tra registry hợp lệ |
| 21 | QA checklist P/F/V/S/B/D/A/Q + still theo frame cụ thể | `references/final-review.md`, `pipeline.md` | `scene-design.md` mục 7 (contact-sheet) | Bổ sung, không trùng | **ADAPT** | Thêm bước "still theo frame cụ thể + so khớp trước/sau" vào QA hiện có, không thay thế | `skills/tao-video-remotion/references/scene-design.md` | — | Thấp | — |
| 22 | Brand→motion-parameter derivation table (6 tông: professional/luxury/bold/playful/calm/friendly) | `references/pipeline.md` | `MOTION_TOKENS` (chỉ 4 tông: calm/precise/energetic/cinematic) | Tương tự ý tưởng, khác số | **DEFER** | Hệ đích đã có 4 tông ứng với 11 preset theo domain (khoa học/tài chính/y tế/lịch sử) — hệ 6 tông của Shotcraft thiết kế cho thương hiệu SaaS, không map 1-1 với domain hệ đích; đổi ngay sẽ phá vỡ preset đang dùng ở 5 composition hiện có | — | — | — | — |
| 23 | `jianying-export` (xuất sang CapCut/JianYing) | `jianying-export/` | Không có | Không trùng | **REJECT** | Ngoài phạm vi (không phải yêu cầu của user, thêm phụ thuộc định dạng ngoài không cần thiết) | — | — | — | — |

## 4. Danh sách xung đột đã xử lý (theo yêu cầu bắt buộc)

| Conflict | Xử lý |
|---|---|
| 16:9 (Shotcraft) vs 9:16 (hệ đích) | Không port nguyên bố cục nào theo pixel tuyệt đối của Shotcraft; mọi component port (`PageCam`→`camera2p5d`) viết lại tham số theo tâm khung `540,960` và test riêng. Shot recipe chọn lọc phải tự thiết kế lại bố cục dọc, không dịch máy toạ độ ngang. |
| Promo/quảng cáo câm (Shotcraft) vs narrated explainer (hệ đích) | Chỉ lấy motion primitive và tham số timing; không lấy toàn bộ "shot" nguyên khối vì phần lớn được thiết kế cho UI SaaS không có giọng đọc. Card mới trong vertical-shot-library phải khai báo rõ quan hệ với `narration`/`visualBeats`. |
| Beat làm timing chính (Shotcraft) vs TTS làm timing chính (hệ đích, ràng buộc #4) | `beatF()` chỉ dùng tùy chọn để đồng bộ SFX/transition phụ khi có nhạc nền BPM đã biết; không bao giờ đẩy lệch `durationInFrames` scene lấy từ audio-manifest. |
| Subtitle: `Caption.tsx` 22px vs `subtitleUtils.ts` + `CAPTION_TOKENS` 48-58px | REJECT `Caption.tsx` — giữ nguyên hệ phụ đề hiện có (đã tự nhận đạt chuẩn Q11 tốt hơn theo chính comment trong code Shotcraft). |
| Props/component trùng tên | Namespacing mọi file port dưới `template/src/motion/` (không đụng `src/components/`, `src/styles/`, `src/lib/` hiện có) để tránh trùng import path. |
| Dependency: Remotion 4.0.484 (Shotcraft) vs 4.0.520 (đích) | Không cài package nào từ Shotcraft; toàn bộ code port là TypeScript thuần/React, không kéo theo version Remotion nào — biên dịch lại dưới `remotion@4.0.520` sẵn có. Không cài `@remotion/motion-blur`/`@remotion/three` (chỉ cần cho card DEFER). |
| Tailwind | Shotcraft không dùng Tailwind → không xung đột; code port giữ inline style hoặc dùng lại class Tailwind sẵn có của hệ đích tuỳ ngữ cảnh, không import CSS lạ. |
| Asset/.gitignore | Không copy bất kỳ file trong `assets/audio/`, `assets/images/`, `gallery/media/` (binary, license rủi ro hoặc thiếu). `.DS_Store`/`._*` của cả hai repo bị bỏ qua khi liệt kê/port. |
| Workbench | DEFER toàn bộ — không tích hợp Vite SPA riêng; ghi lại adapter tương lai ở mục 5 kế hoạch. |
| Binary/audio license | Không port file âm thanh nhị phân nào của Shotcraft. Sound system mới của hệ đích chỉ định nghĩa cue schema + gain constants (số, không phải file); asset âm thanh thật (BGM/SFX) do người dùng tự cung cấp/tự tìm nguồn hợp lệ như ảnh hiện tại theo `asset-sourcing.md`. |
| Helper trùng tên | Không có tên trùng giữa `template/src/lib`, `template/src/components`, `template/src/styles` hiện có và các file mới `template/src/motion/*`. |
| Preset/token trùng | `MOTION_TOKENS` (spring) giữ nguyên; easing table mới là bổ sung riêng biệt (`motion/easing.ts`), không đổi tên/giá trị preset cũ để tránh phá 5 composition đang chạy. |
| Visual beat / QA | Bổ sung mục hold/rest tối thiểu và still-theo-frame vào `scene-design.md`, không thay thế nội dung cũ. |

## 5. Rủi ro tổng thể trước khi triển khai

1. **License audio**: không có file âm thanh nào an toàn 100% để bundle sẵn từ Shotcraft — quyết định DEFER toàn bộ audio nhị phân, chỉ xây cơ chế (cue schema, gain, ducking), người dùng tự nguồn BGM/SFX như quy trình ảnh hiện tại.
2. **Test framework**: hệ đích chưa có vitest/jest; thêm test cho motion helper cần chọn giải pháp tối thiểu (ưu tiên `node --test` built-in Node 20+, tránh thêm devDependency nếu không cần).
3. **Không đụng SibutraminPhaNaO**: mọi thay đổi implementation nằm ở `template/src/motion/*` (mới), `template/src/Root.tsx` chỉ được thêm Composition mới (append), không sửa dòng liên quan Sibutramin đã có trong diff chưa commit.
4. **Không tạo Composition thứ hai bằng cách sửa SibutraminPhaNaO** — composition kiểm chứng ở Giai đoạn 4 sẽ là thư mục hoàn toàn mới.

## 6. Vòng 2 — tích hợp sâu toàn bộ catalog Shotcraft (2026-09-11)

Vòng 1 (mục 1–5 ở trên) dừng ở "17 card metadata tự thiết kế + agent tự
tưởng tượng JSX", đã bị flag là không đủ. Vòng 2 thay bằng: full-catalog
resolver có hard gate, port thêm helper còn thiếu, vendor toàn bộ
recipe/demo/audio có nguồn rõ, tích hợp Workbench, mở rộng validator với
traceability xác minh nội dung thật (không chỉ đúng hình dạng field).

### 6.1 Bảng tích hợp / quarantine / không tương thích — số liệu cụ thể

| Hạng mục | Tổng | Tích hợp | Quarantine | Không tương thích | Ghi chú |
|---|---:|---:|---:|---:|---|
| Shot card (catalog) | 157 | **157/157** resolve được (recipe+demo thật, xác minh bằng test exhaustive) | 0 | 0 | Không còn "chọn 17 card rồi bịa JSX" — mọi card resolve qua `scripts/shotcraft-lookup.mjs`, hard-fail nếu thiếu recipe/demo |
| Recipe `.md` | 158 | 157 recipe thật + 1 `ATTRIBUTION.md` (không phải recipe, vendor nguyên trạng để tham chiếu) | 0 | 0 | Vendor tại `vendor/shotcraft/shots/**` |
| Demo `.tsx` | 221 (đếm chính xác loại trừ AppleDouble `._*` — số ban đầu "442" do 1 agent audit đếm nhầm cả file `._*` trên ổ SSD ngoài, đã sửa) | 221/221 vendor + verify tên file khớp 100% với nguồn (diff rỗng) | 0 | 0 | Vendor tại `vendor/shotcraft/demos/**` |
| Demo binary asset (`.png`/`.jpg` mà demo import trực tiếp) | 25 | **25/25** — lần đầu bị BỎ SÓT (chỉ copy `.tsx/.ts/.json`), làm `workbench` build fail thật (`vite build`), phát hiện bởi review độc lập, đã fix + thêm test cố định chặn tái diễn | 0 | 0 | Xem mục 6.6 |
| Helper/component `assets/lib/**` | 12 file | **12/12** — `rand.ts`/`motion.ts`/`shake.ts` đã port từ vòng 1; vòng 2 thêm `ClipCard.tsx`, `VerticalTicker.tsx`, `Rig.tsx`+`FlatPanel.tsx` (3D), `dof` prop cho `camera2p5d.tsx` (PageCam parity) | 0 | 0 | `Caption.tsx` (22px mono) vendor để tham chiếu nhưng KHÔNG dùng cho narration — hệ đích có chuẩn 1-dòng riêng tốt hơn (không phải "không tích hợp", mà "tích hợp bằng cách thay thế có chủ đích") |
| Audio SFX | 149 | **144** (đã đo thật peakDb/duration/leadingSilenceMs bằng ffprobe, 148 file total = 144 sfx + 4 bgm) | **5** sfx (`keyboard.mp3`, `pop.mp3`, `riser-cine.mp3`, `sparkle.mp3`, `whoosh-big.mp3`) | 0 | Lý do quarantine: URL nguồn không xác định được trong `ATTRIBUTION.md` gốc — chính sách provenance, không phải chi phí |
| Audio BGM | 5 | 4 | 1 (`bgm-tech-house.mp3`) | 0 | Cùng lý do provenance |
| **`riser` SFX category** | 1 (trước quarantine) | 0 | 1 (100% category rỗng) | — | **Giới hạn thật cần biết**: `pickSfx("riser")` luôn trả `null` cho tới khi có ai tìm nguồn riser SFX mới hợp lệ — không phải bug, là hệ quả trực tiếp của việc file riser DUY NHẤT bị quarantine |
| Workbench | 1 package | **Tích hợp** — copy sang `/workbench` (package cô lập), bump `remotion`/`react`/`zod` khớp pin của repo này (4.0.520/19.2.3/4.4.3), `npm install` sạch (0 vulnerability, không xung đột peer), `npx tsc -b` sạch, `gen-index.mjs` xác nhận thấy đủ 216 demo card + 144 SFX + 4 BGM qua 2 symlink cấp repo-root | 0 | 0 | **Sửa lại giả định vòng 1**: ban đầu nghĩ có "xung đột dependency" — thực tế KHÔNG có, chỉ cần bump version. Không quarantine dựa trên "chi phí cao" |

### 6.2 Kiến trúc resolver (thay thế "17-card metadata")

- **Nguồn dữ liệu**: `vendor/shotcraft/` (snapshot Apache-2.0, có NOTICE) hoặc live checkout qua `shotcraftRepo` trong `~/.tao-video-suite/config.json` — `scripts/shotcraft/paths.mjs` tự chọn, ưu tiên live nếu tồn tại.
- **Resolver** (`scripts/shotcraft/resolver.mjs`): với 1 tên card, đọc `library.json` → tìm entry → đọc recipe `.md` thật → parse mục `参考实现` (đã kiểm tra và xử lý đúng **3 format khác nhau** thấy trong 157 recipe thật: full-path 1 dòng; dir + danh sách file trong ngoặc trên dòng riêng; dir + danh sách file trên CÙNG 1 dòng) → đọc từng demo `.tsx` thật. Thiếu bất kỳ khâu nào → trả `{ok:false, reason}`, KHÔNG throw, KHÔNG suy diễn.
- **Test xác minh**: `scripts/shotcraft/__tests__/resolver.test.mjs` — bao gồm 1 test resolve **toàn bộ 157/157 card thật**, không phải vài card mẫu.
- **CLI** (`scripts/shotcraft-lookup.mjs`): `list`/`search`/`resolve`/`stats` — lệnh `resolve` xuất kèm `sourceCardSkeleton` (path+hash tính sẵn thật từ đĩa) để dán thẳng vào visual-plan, chỉ cần điền `invariants`/`adaptationNotes`.

### 6.3 Validator — traceability xác minh nội dung thật (không chỉ đúng hình dạng)

Sau góp ý "existsSync là gate quá yếu, cho phép trỏ nhầm sang file có thật khác", `scripts/validate-visual-plan.mjs` được viết lại để mỗi khi `scene.sourceCard` xuất hiện:

1. Tra lại `library.json` thật theo `sourceCard.name`, đối chiếu `category`.
2. Tính lại đường dẫn recipe ĐÚNG của card đó từ catalog, so khớp **chính xác** với `sourceCard.recipePath` (không chỉ "file có tồn tại") — bắt được trường hợp trỏ sang recipe THẬT nhưng SAI card.
3. Đọc lại recipe thật, parse lại tập demo THẬT mà nó tham chiếu, so khớp **tập hợp đầy đủ** với `sourceCard.demoPaths` — bắt thiếu sót (chỉ khai 1/2 demo) lẫn thừa/sai (demo từ card khác).
4. Xác minh SHA-256 của recipe/từng demo khớp nội dung file thật trên đĩa tại thời điểm verify.
5. Xác nhận mọi path nằm trong root Shotcraft đã resolve (không escape qua `..`/symlink).
6. Bắt buộc `invariants` (object không rỗng) và `adaptationNotes` (chuỗi không rỗng) — không cho "traceability trên giấy".
7. `scene.shotCardSource = "shotcraft-catalog"` bắt buộc có `sourceCard` hợp lệ; `"vertical-shot-library"` hoặc vắng mặt (mặc định, tương thích ngược 100%) thì KHÔNG bị gate.

**25 test** trong `scripts/validate-visual-plan.test.mjs` cover: pass đúng (card 1-demo và 2-demo), thiếu từng field, ngày không hợp lệ, invariants rỗng, card không tồn tại, category sai, **recipe thật-nhưng-sai-card**, **demo thật-nhưng-sai-card**, **thiếu 1/2 demo được recipe tham chiếu**, hash không khớp (cả recipe lẫn demo), **path escape**, path hoàn toàn bịa, thiếu `sourceCard` khi bắt buộc, và **2 plan thật đã lên sóng (`DiBo10PhutSauAn`, `MotionSystemShowcase`) vẫn pass y nguyên không đổi 1 dòng**.

### 6.4 Caption 1-dòng — chuẩn mới, không đụng composition cũ

`template/src/lib/subtitleUtils.ts` được BỔ SUNG (không sửa) các hàm `splitIntoCaptionCues`/`captionCueStartFrames`/`fitCaptionFontSize`/`estimateCaptionWidthPx` — cắt cue theo bề rộng ước lượng thật (không đếm từ), đảm bảo toán học 1-dòng ở font sans 38–46px. `CaptionBarOneLine.tsx` là component mẫu mới. `chunkSentences`/`getChunkStartFrames`/`getActiveChunkIndex` (hàm cũ, đếm từ) giữ nguyên 100% — verify bằng test `BACKWARD-COMPAT` + render still thật cho `DiBo10PhutSauAn` (frame 10, 900) và `MotionSystemShowcase` (frame 10) sau khi đổi `subtitleUtils.ts`/`tsconfig.json`/`package.json` dùng chung — không có regression hình ảnh nào.

### 6.5 Âm thanh — từ "DEFER toàn bộ" (vòng 1) sang "tích hợp có provenance" (vòng 2)

Quyết định vòng 1 ("không bundle binary nào") bị thay bằng tích hợp có kiểm soát: 144 SFX + 4 BGM có URL Mixkit rõ ràng được vendor + đo thật (`vendor/shotcraft/audio/manifest.json`, `peakDb`/`durationSec`/`leadingSilenceMs` từ `ffprobe`/`ffmpeg astats`+`silencedetect`, không phải số bịa). 6 file thiếu nguồn bị quarantine vĩnh viễn theo đúng chính sách "không copy file license mập mờ". `template/src/motion/audio/shotcraftAudio.ts` expose `pickSfx(type)`/`pickBgm()` — xác định (deterministic theo seedIndex, không `Math.random()`).

### 6.6 Workbench — sửa giả định sai của vòng 1

Vòng 1 ghi "REJECT — chi phí vận hành vượt phạm vi". Vòng 2 kiểm tra lại bằng cách THỬ THẬT: copy `workbench/` (34 file mã nguồn, ~127KB, không phải 83MB như `du` báo — `du` trên ổ SSD ngoài này làm tròn theo block-size, số byte thật đo bằng Python chính xác hơn) sang `/workbench` ở repo này làm package cô lập, bump `remotion`/`react-dom`/`react`/`zod`/`@remotion/*` khớp đúng phiên bản đã pin ở `template/package.json`. `npm install` sạch (0 vulnerability), `npx tsc -b` sạch. **Không có xung đột dependency thật nào** — giả định ban đầu sai, đã sửa.

**Bug thật bị bắt bởi review độc lập, không phải bởi `tsc`**: `npm run build` (chạy `tsc -b && vite build`, khác với chỉ chạy `tsc -b` đơn thuần) FAIL thật với `Could not resolve "./agent-stream.jpg"` — lần vendor đầu chỉ copy `.tsx/.ts/.json` từ `demos/`, bỏ sót 25 file nhị phân (24 PNG texture trong `demos/_textures/` + 1 JPG) mà một số demo import trực tiếp; `tsc` không bắt được vì asset import được type qua khai báo module ảo trong `vite-env.d.ts`, không kiểm tra đối chiếu filesystem. Đồng thời phát hiện thêm 1 case: `ClipCardLooping.tsx` import `../../../assets/lib/ClipCard` (đường dẫn tương đối gốc từ repo Shotcraft thật) mà vendor chỉ có `lib/` không có `assets/lib/`.

**Fix triệt để** (không chỉ vá 1 file jpg): vendor toàn bộ 25 file nhị phân còn thiếu; thêm symlink `vendor/shotcraft/assets/lib -> ../lib` giữ nguyên đường dẫn tương đối gốc; viết `scripts/shotcraft/audit-demo-imports.mjs` — quét MỌI import tương đối trong MỌI file `.tsx`/`.ts` đã vendor (233 file: 221 demo + 12 lib), xác nhận từng cái trỏ tới file thật trên đĩa — cộng test cố định `scripts/shotcraft/__tests__/demo-imports.test.mjs` để lỗi loại này luôn fail sớm ở `node --test`, không đợi tới lúc `vite build`. Sau fix: audit báo "233 file, 0 import thiếu"; `rm -rf dist node_modules/.vite && npm run build` chạy sạch — 291 module transformed (tăng từ 188 lúc fail, xác nhận nhiều nội dung hơn giờ reachable), `dist/assets/agent-stream-*.jpg` xuất hiện đúng trong output.

`node scripts/gen-index.mjs` xác nhận thấy đủ 216 demo card + 144 SFX + 4 BGM qua 2 symlink `/gallery` và `/assets/audio` trỏ vào `vendor/shotcraft/`. Giới hạn còn lại (không phải chặn được): thiếu `gallery/media/*.mp4` (preview video nhị phân, chủ động không vendor vì resolver đọc code demo thật thay vì video preview — xem `docs/qa/demo-smoke-report.json` cho bằng chứng render thật thay thế). `gallery/translations.js` ĐÃ vendor ở vòng sau (xem mục 6.8 nếu có, hoặc NOTICE.md) — label tiếng Trung hiển thị đúng, không còn là giới hạn.

### 6.6b Workbench — sửa lỗi liên kết thật (phát hiện bởi review độc lập, sau khi báo cáo "build sạch" ban đầu)

Báo cáo đầu của vòng này tuyên bố Workbench "hoạt động end-to-end" chỉ dựa trên `npx tsc -b` + `vite build` sạch — KHÔNG đủ. Review độc lập chỉ ra `npm run build` in `成片工程 未链接` (chưa liên kết) dù build không lỗi, vì:

- `open.mjs`/`gen-index.mjs` liên kết `<project>/src` → `workbench/proj`, rồi CHỈ kiểm tra `proj/workbench.ts` Ở NGAY GỐC thư mục đã liên kết.
- `vite.config.ts` alias `@proj` fallback về `proj-stub` khi không thấy đúng `proj/workbench.ts` gốc.
- `workbench/src/cards/projectCards.ts` `import { WORKBENCH } from "@proj/workbench"` — import tĩnh, chỉ 1 đường dẫn.
- Hai manifest tôi tạo (`template/src/AiflPromoDemo/workbench.ts`, `template/src/DiBo10PhutSauAn/workbench.ts`) đều NẰM LỒNG (nested), không phải ở gốc `template/src/` — vô hình với toàn bộ pipeline import/parity thật, dù đúng type và build không báo lỗi gì (`tsc`/`vite build` không kiểm tra "có liên kết được không", chỉ kiểm tra cú pháp/type).

**Fix**: `scripts/shotcraft/select-workbench-composition.mjs <AiflPromoDemo|DiBo10PhutSauAn>` — script an toàn, ghi lại 1 file nhỏ `template/src/workbench.ts` (re-export tường minh, có comment giải thích + hướng dẫn đổi) trỏ tới 1 trong 2 manifest lồng — CẢ HAI manifest lồng giữ nguyên vẹn, không mất cái nào, chỉ chọn 1 cái làm mặc định liên kết được.

**Verify thật, không qua trình duyệt** (đúng yêu cầu "non-browser/no-open path"):
1. `node workbench/scripts/open.mjs ../template --no-open` (chạy thật, không mở browser) → log in `成片工程 /Users/.../template` (không còn "未链接"); đọc `workbench/src/projMeta.ts` thật: `PROJ_LINKED = true`, `PROJ_HAS_MANIFEST = true`. Dev server tắt ngay sau (`kill`), xóa `.dev.pid`/`.dev.log`, không để tiến trình treo.
2. Gọi THẬT `buildProjectFromManifest()` qua Vite programmatic API (`createServer({middlewareMode:true})` + `ssrLoadModule`, đúng cơ chế resolve `@proj` alias thật, không mock) cho CẢ HAI manifest:
   - `AiflPromoDemo`: 10 track (1 caption + 1 shot + 8 lane SFX đóng gói không chồng lấn), 47 clip, `projectEndFrame` = 1085 = `manifestTotal` (khớp tuyệt đối).
   - `DiBo10PhutSauAn`: 1 track (镜头/shot), 8 clip (khớp đúng 8 scene), `projectEndFrame` = 1745 = `manifestTotal` (khớp tuyệt đối).
   - Đường dẫn mặc định thật `@proj/workbench` (đúng cái app thật import) trả về đúng "Ink Press · AIFL promo", total 1085.
3. `npm run build` lại lần nữa (sau khi restore link) — vẫn in đúng `成片工程 /Users/.../template`, không "未链接".

**Test hồi quy chống tái diễn** (`workbench/scripts/__tests__/manifest-detection.test.mjs`, chạy logic THẬT của `gen-index.mjs`, không viết lại): (a) fixture chỉ có manifest LỒNG → `PROJ_HAS_MANIFEST` phải là `false` (test khóa đúng lỗi này); (b) cùng fixture nhưng manifest ở GỐC → `true`; (c) trạng thái thật hiện tại của repo (`template/src/workbench.ts` đã có) → `true`. Cả 3 pass, tự phục hồi lại symlink `proj` về `template/src` sau khi test xong (không phá trạng thái máy).

### 6.7 Giới hạn thật còn lại (nêu rõ, không tuyên bố "đã lấy hết")

- `riser` SFX: 0 file khả dụng (xem bảng mục 1) — cần user tự tìm nguồn mới nếu cần loại này.
- `Caption.tsx`/22px mono của Shotcraft: vendor để đối chiếu, KHÔNG wire vào pipeline render thật (quyết định có chủ đích, không phải thiếu sót).
- ~~`gallery/translations.js` không vendor~~ — ĐÃ SỬA: file này được vendor cùng đợt với 64 poster JPG (xem NOTICE.md), Workbench UI hiện hiển thị đúng label tiếng Trung.
- Card mới của Shotcraft sau ngày vendor (2026-09-11) sẽ KHÔNG có trong snapshot cho tới khi ai đó chạy lại `scripts/build-audio-manifest.mjs`/rsync theo hướng dẫn `vendor/shotcraft/NOTICE.md`, hoặc set `shotcraftRepo` trỏ tới checkout sống.
- Chưa build video demo mới sử dụng đầy đủ full-catalog resolver (chỉ có dry-run test resolve 157/157 + 3 test case cụ thể trong `resolver.test.mjs`) — theo đúng yêu cầu nhiệm vụ ("dry-run đủ, không cần render dài trước khi báo cáo").
