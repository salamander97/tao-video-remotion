# Thư viện shot dọc (vertical shot library)

> **Cập nhật 2026-09-11**: đây là 17 card **tự thiết kế cho khung dọc**, KHÔNG phải toàn bộ catalog Shotcraft. Để dùng đúng 1 trong 157 card thật của Shotcraft (với traceability đầy đủ tới recipe+demo gốc), dùng `scripts/shotcraft-lookup.mjs` (xem SKILL.md mục "Bước BẮT BUỘC: resolve shot card thật") — KHÔNG memorize card name từ tài liệu rồi tự bịa `sourceCard`.

Đọc file này khi lập visual-plan để tra cứu motion/timing đã được kiểm chứng thay vì nghĩ lại từ đầu mỗi topic. Đây là phần bổ sung sau khi tích hợp có chọn lọc từ `video-shotcraft` (Apache-2.0) — xem `docs/shotcraft-integration-audit.md` cho toàn bộ quyết định tích hợp/quarantine/không tương thích.

Registry máy đọc tương ứng: `template/src/motion/shots/registry.ts` (`VERTICAL_SHOT_REGISTRY`, `getShotCard(id)`).

**Lưu ý bắt buộc:** shot card chỉ là gợi ý tham số, KHÔNG thay thế visual-plan bắt buộc ở `scene-design.md`. `narration`/`durationInFrames` luôn lấy từ audio-manifest thực tế (TTS là nguồn thời lượng chính) — không bao giờ để shot card ép duration khác với audio thật.

## Cách dùng

1. Chọn `sceneType`/`primaryVisualType` như bình thường theo `scene-design.md`.
2. Nếu có shot card phù hợp trong bảng dưới, gán `scene.shotCard = "<id>"` trong visual-plan (field tùy chọn, schema v3 mở rộng — không bắt buộc, không phá plan cũ).
3. Đọc `pitfalls` trước khi code JSX để tránh lỗi đã biết.
4. Dùng `componentOrAdapter` (nếu có) từ `template/src/motion/` làm điểm khởi đầu — vẫn phải tự viết JSX scene, component chỉ cấp cơ chế.

## Danh sách 17 shot card

| ID | Category | Energy | Duration (frame@30fps) | Camera | Hold/rest | Transition in/out | SFX | Provenance |
|---|---|---|---|---|---|---|---|---|
| `hook-kinetic-punch` | hook | high | 120-180 | static + zoom nhẹ | 18 | cut / flash-cut | whoosh | new-for-vertical |
| `hook-reveal-mask` | hook | high | 120-150 | static | 18 | mask-reveal / cut | whoosh | new-for-vertical |
| `image-reveal-crop` | reveal | medium | 180-300 | parallax-2.5d | 20 | cut / wipe-cut | tick | shotcraft-adapted |
| `before-after-slider` | before-after | medium | 120-150 | static | 40 | cut / cut | whoosh | shotcraft-adapted |
| `timeline-process-3step` | process-timeline | medium | 210-360 | static | 20 | cut / cut | tick | new-for-vertical |
| `data-stat-counter` | data-stat | medium | 120-180 | static | 24 | cut / cut | tick | shotcraft-adapted |
| `diagram-mechanism-state` | diagram | medium | 210-330 | static | 20 | cut / cut | none | new-for-vertical |
| `montage-photo-slideshow` | montage | high | 180-300 | parallax-2.5d xen kẽ | 8 | flash-cut / flash-cut | sparkle | shotcraft-adapted |
| `focus-highlight-sweep` | focus-highlight | low | 90-150 | static | 18 | cut / cut | none | new-for-vertical |
| `kinetic-headline-stagger` | kinetic-type | medium | 90-150 | static | 20 | cut / cut | tick | new-for-vertical |
| `camera-parallax-push` | camera | medium | 90-240 | parallax-2.5d | 18 | cut / cut | none | shotcraft-adapted |
| `camera-handheld-archive` | camera | low | 90-240 | handheld-light | 0 | cut / cut | none | shotcraft-adapted |
| `transition-flash-cut` | transition | high | 8-12 | static | 0 | flash-cut / flash-cut | whoosh | shotcraft-adapted |
| `transition-wipe` | transition | medium | 12-16 | static | 0 | wipe-cut / wipe-cut | whoosh | new-for-vertical |
| `outro-cta-settle` | outro | low | 180-240 | static | 30 | cut / hold | sparkle | shotcraft-adapted |
| `data-chart-annotation` | data-stat | medium | 180-300 | static | 24 | cut / cut | tick | new-for-vertical |
| `comparison-split-baseline` | before-after | medium | 150-240 | static | 20 | cut / cut | none | new-for-vertical |

Chi tiết đầy đủ từng field (`narrativePurpose`, `aspectRatioBehavior`, `pitfalls`...) xem trực tiếp trong `template/src/motion/shots/registry.ts` — giữ một nguồn sự thật duy nhất, không lặp lại toàn văn ở đây để tránh lệch khi cập nhật.

## Ranh giới không lấy từ Shotcraft (cập nhật 2026-09-11 — xem `docs/shotcraft-integration-audit.md` cho bảng đầy đủ)

- Không dùng `Caption.tsx` (22px mono info-strip) của Shotcraft cho narration — hệ đích dùng chuẩn caption 1-dòng riêng (`subtitleUtils.ts` mục `splitIntoCaptionCues`/`CaptionBarOneLine.tsx`, xem SKILL.md). File gốc `Caption.tsx` vẫn được vendor tại `vendor/shotcraft/lib/Caption.tsx` để tham khảo, không import trực tiếp.
- Không dùng beat nhạc nền làm nguồn thời lượng scene — TTS/audio-manifest luôn là nguồn `durationInFrames`; `template/src/motion/audio/beatGrid.ts` chỉ căn SFX/transition phụ khi có BPM đã biết.
- **Đã tích hợp** (khác với quyết định DEFER ban đầu): 144 file SFX + 4 BGM Mixkit có attribution rõ ràng đã vendor tại `vendor/shotcraft/audio/` + `template/public/audio/shotcraft/`, tra qua `template/src/motion/audio/shotcraftAudio.ts`. 6 file thiếu nguồn gốc rõ ràng (`keyboard.mp3`, `pop.mp3`, `riser-cine.mp3`, `sparkle.mp3`, `whoosh-big.mp3`, `bgm-tech-house.mp3`) bị **quarantine vĩnh viễn** cho tới khi ai đó xác minh lại nguồn — xem `audio/manifest.json` mục `quarantined[]`.
- **Đã tích hợp** (khác với quyết định "không tích hợp" ban đầu): Workbench port sang `/workbench` (package riêng, đã cài đặt + build sạch với Remotion 4.0.520/React 19.2.3) — không còn lý do kỹ thuật để loại trừ sau khi bump version.
- **Đã port thêm** so với bản 17-card đầu tiên: `ClipCard.tsx` (video thật/mp4), `VerticalTicker.tsx`, `Rig.tsx`+`FlatPanel.tsx` (3D, `@react-three/fiber`+`@remotion/three`), `dof` prop cho `camera2p5d.tsx`.
