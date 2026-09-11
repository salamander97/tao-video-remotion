# Third-party notices

Repo này (`tao-video-suite`) phát hành theo giấy phép MIT (xem `LICENSE`). Một số file trong `template/src/motion/` chứa code có nguồn gốc hoặc lấy ý tưởng từ **video-shotcraft** (repo tham khảo tại `/Volumes/SSD_1TB/Video Remotion/video-shotcraft` tại thời điểm tích hợp, 2026-09-10), phát hành theo **Apache License, Version 2.0**, Copyright 2026 Wei Yihao.

Toàn văn Apache-2.0 của video-shotcraft: [`licenses/video-shotcraft/LICENSE-APACHE-2.0.txt`](licenses/video-shotcraft/LICENSE-APACHE-2.0.txt) (bản sao nguyên văn, không chỉnh sửa).

**Kiểm tra NOTICE upstream:** đã kiểm tra thư mục gốc `video-shotcraft` — repo đó chỉ có file `LICENSE`, **không có file `NOTICE`** riêng. Do vậy không có nội dung NOTICE nào cần lan truyền theo điều khoản 4(d) của Apache-2.0; tài liệu này đóng vai trò NOTICE tự nguyện, minh bạch nguồn gốc theo tinh thần điều khoản 4(c).

Việc trộn code Apache-2.0 vào một cây thư mục có LICENSE tổng là MIT là hợp lệ (Apache-2.0 cho phép hạ tầng phân phối dùng giấy phép khác cho phần đóng góp riêng của người phân phối, miễn giữ nguyên thông báo/giấy phép của phần Apache-2.0 gốc — điều khoản 4(a)(c)). Các file liệt kê dưới đây do đó vẫn ràng buộc bởi Apache-2.0 cho phần nội dung có nguồn gốc từ video-shotcraft, tách biệt với MIT của phần còn lại trong repo.

## Nhóm A — Port gần như nguyên vẹn (logic không đổi, chỉ đổi comment/quote style cho khớp ESLint của template)

| File trong repo này | Nguồn (video-shotcraft) | Thay đổi thực tế |
|---|---|---|
| `template/src/motion/rand.ts` | `assets/lib/helpers/rand.ts` | Không đổi logic. Đổi comment đầu file (gắn attribution rõ ràng thay vì "模板片源仓库 helpers"). |
| `template/src/motion/motion.ts` | `assets/lib/helpers/motion.ts` | Không đổi logic. Đổi comment đầu file (gắn attribution thay vì "disney-animation-rule-skill..."). |
| `template/src/motion/shake.ts` | `assets/lib/helpers/shake.ts` | Không đổi logic. Thêm 2 dòng chú thích tiếng Việt khuyến nghị dùng tiết chế (đối chiếu aesthetic-rules Q3 của Shotcraft). |
| `template/src/motion/transitions/FlashCut.tsx` | `assets/lib/FlashCut.tsx` | Không đổi logic. Chuẩn hóa dấu nháy đơn → nháy kép, thêm `import React from "react"` (bắt buộc bởi cấu hình JSX của template đích). |
| `template/src/motion/DigitRoll.tsx` | `assets/lib/DigitRoll.tsx` | **Có đổi hành vi:** giá trị mặc định `color` đổi từ `oklch(52% 0.115 65)` (hổ phách) sang `#0F766E` (xanh teal, khớp palette `clinical-clarity` của template đích). Chuẩn hóa dấu nháy đơn → nháy kép, thêm `import React`. |
| `template/src/motion/ClipCard.tsx` | `assets/lib/ClipCard.tsx` | Không đổi logic (crossfade-loop, envelope opacity/volume bù trừ). Đổi mặc định `captionSize` 17→26px (mono citation-tier theo chuẩn mobile-typography của template đích, không dùng cho narration chính). |
| `template/src/motion/VerticalTicker.tsx` | `assets/lib/VerticalTicker.tsx` | Không đổi logic (seam-free loop math dùng `marginBottom`). Đổi mặc định `columnWidth` 400→320px để 3 cột + gap vừa khung dọc 1080px (bản gốc nhắm khung ngang 1920px). |
| `template/src/motion/Rig.tsx` | `assets/lib/helpers/camera.tsx` | Không đổi logic. Yêu cầu thêm `three`+`@react-three/fiber`+`@remotion/three` (đã thêm vào `template/package.json`, cài đặt sạch, không xung đột). |
| `template/src/motion/FlatPanel.tsx` | `assets/lib/FlatPanel.tsx` | Không đổi logic. |
| `template/src/motion/camera2p5d.tsx` (bổ sung `dof` prop) | `assets/lib/PageCam.tsx` (`dof` prop) | Thêm lại tính năng depth-of-field từng bị bỏ ở vòng 1 — logic gradient-blur band giữ nguyên từ bản gốc. |

Đã đối chiếu bằng `diff` trực tiếp giữa file gốc và file port tại thời điểm viết tài liệu này để đảm bảo bảng trên chính xác.

## Nhóm D — Vendored snapshot nguyên văn (vòng 2, 2026-09-11)

`vendor/shotcraft/` là snapshot NGUYÊN VĂN, không chỉnh sửa, của: `gallery/api/library.json` (157 card/214 style), 157 recipe `.md` (+ `ATTRIBUTION.md`) tại `references/shots/**`, 221 demo `.tsx` tại `demos/**`, 12 file helper/component tại `assets/lib/**` (bao gồm cả những file KHÔNG được port sang `template/src/motion/`, giữ lại để đối chiếu), 1 file `sequences/promo-energy-arc.md`, và toàn văn 7 tài liệu quy trình (`SKILL.md`, `pipeline.md`, `aesthetic-rules.md`, `sound-design.md`, `final-review.md`, `music-beat-sync.md`, `guided-free-creation.md`). Chi tiết đầy đủ, lý do, và hướng dẫn re-vendor: xem `vendor/shotcraft/NOTICE.md`.

`/workbench` (repo root) là bản copy nguyên văn mã nguồn Workbench (34 file, ~127KB) từ `workbench/` của video-shotcraft, chỉ thay đổi `package.json` (bump version `remotion`/`react`/`react-dom`/`zod`/`@remotion/*` để khớp pin của repo này) — không sửa bất kỳ file `.ts`/`.tsx` nào trong `workbench/src`.

`vendor/shotcraft/jianying-export/*.py` (5 file, nguyên văn) là CapCut/JianYing (China) draft-file export scripts của video-shotcraft — **đã tích hợp** ở vòng sửa lỗi cuối cùng (KHÔNG còn là "không port" như bản nháp trước của tài liệu này từng ghi nhầm), bọc bởi `scripts/shotcraft/jianying-export-adapter.mjs`: mặc định CHỈ dry-run xác thực tên draft (không đụng thư mục JianYing thật), thao tác `--apply` thật đòi hỏi cờ xác nhận tường minh + validate draft directory — xem `docs/shotcraft-integration-audit.md` cho chi tiết cơ chế bảo vệ và test.

## Nhóm E — Audio nhị phân đã vendor (vòng 2, 2026-09-11)

144 file SFX (`vendor/shotcraft/audio/sfx/**`) + 4 file BGM (`vendor/shotcraft/audio/bgm/**`), toàn bộ Mixkit Sound Effects Free License / Mixkit Stock Music Free License (miễn phí, miễn ghi công, dùng thương mại được) với URL nguồn còn nguyên trong `vendor/shotcraft/audio/manifest.json`. 6 file (5 SFX + 1 BGM) có nguồn không xác định trong `ATTRIBUTION.md` gốc của Shotcraft **KHÔNG được copy** — liệt kê trong `manifest.json` mục `quarantined[]` kèm lý do, theo đúng chính sách "không copy file license mập mờ" đã áp dụng nhất quán từ vòng 1.

## Nhóm B — Adapt có chủ đích (đổi cấu trúc/tham số để phù hợp khung dọc và pipeline TTS-first)

| File trong repo này | Nguồn (video-shotcraft) | Thay đổi thực tế |
|---|---|---|
| `template/src/motion/camera2p5d.tsx` | `assets/lib/PageCam.tsx` | Đổi tâm khung hình từ `960,540` (16:9 ngang) sang `540,960` (9:16 dọc) trong mọi công thức toạ độ/translate/perspective-origin. Đổi tên prop `pageH` → `imageWidth`/`imageHeight` tường minh. **Bỏ** tính năng depth-of-field (`dof` prop) của bản gốc — chưa dùng trong template đích, có thể thêm lại sau nếu cần. Giữ nguyên kỹ thuật lõi: dùng CSS `zoom` thay vì `transform: scale()` để tránh mờ chữ khi phóng to (đã giữ nguyên comment giải thích công thức toạ độ gốc, dịch sang tiếng Việt một phần). |

## Nhóm C — Chỉ lấy Ý TƯỞNG, code viết lại độc lập (không phải Derivative Work theo nghĩa copy code, nhưng ghi nhận nguồn cảm hứng vì minh bạch)

| File trong repo này | Ý tưởng tham khảo từ video-shotcraft | Ghi chú |
|---|---|---|
| `template/src/motion/easing.ts` | `demos/_fixtures/Motion.tsx` (bảng easing `E`, hàm `seg`) | Công thức easing (inQuad, outBack, outElastic...) là các công thức toán học kinh điển phổ biến trong ngành animation (không phải sáng tạo riêng của video-shotcraft), viết lại từ đầu bằng TypeScript, không sao chép mã nguồn. |
| `template/src/motion/audio/beatGrid.ts` | `references/music-beat-sync.md` (khái niệm `beatF(n)`) | Chỉ lấy Ý TƯỞNG đặt tên hàm/khái niệm lưới beat; toàn bộ implementation (không dùng librosa, không đo BPM tự động, chỉ nhận BPM thủ công) viết mới hoàn toàn, mục đích khác (đồng bộ SFX/transition phụ, không phải nguồn timing chính). |
| `template/src/motion/audio/soundCues.ts` | `references/sound-design.md` (cue array `{from,src,volume}[]`, hằng số gain kinh nghiệm) | Cấu trúc dữ liệu tương tự (mảng cue khai báo) nhưng giá trị gain, cơ chế `duckingEnvelope` (TTS luôn ưu tiên) là thiết kế mới — video-shotcraft không có TTS nên không có cơ chế ducking tương ứng để tham chiếu. |
| `template/src/motion/shots/registry.ts` | Nhiều shot recipe trong `references/shots/**/*.md` (metadata: category/energy/duration/pitfalls), đặc biệt `before-after-slider-scrub.md`, `crash-zoom-punch.md`, khái niệm chung của `montage`/`camera` category | Toàn bộ 17 card là dữ liệu mới viết cho khung dọc 1080×1920 và pipeline TTS-first; không copy văn bản/tham số gốc (đơn vị, thời lượng, bố cục đều khác vì đổi tỉ lệ khung hình và ngữ cảnh có giọng đọc). Trường `provenance: "shotcraft-adapted"` trong từng card đánh dấu card nào có tham khảo ý tưởng. |

Nhóm C không bắt buộc phải tuân theo Apache-2.0 (không phải bản sao/derivative của mã nguồn cụ thể nào), nhưng được liệt kê ở đây để minh bạch tuyệt đối về nguồn cảm hứng, theo đúng tinh thần audit ở `docs/shotcraft-integration-audit.md`.

## Không port (cập nhật vòng 2 — chỉ còn các mục thật sự không tích hợp)

- Hình ảnh/media nhị phân của video-shotcraft (`gallery/media/*.mp4` preview) — không cần vì resolver đọc code demo `.tsx` thật thay vì video preview đã render.
- 6 file audio (5 SFX + 1 BGM) thiếu nguồn rõ ràng — xem Nhóm E ở trên.
- `Caption.tsx` (22px mono info-strip) — vendor nguyên văn để đối chiếu (Nhóm D) nhưng KHÔNG wire vào pipeline render; quyết định có chủ đích (hệ đích có chuẩn caption 1-dòng riêng đạt Q11 tốt hơn), không phải bỏ sót.

`ClipCard`, `VerticalTicker`, `camera.tsx` (R3F, tên file port: `Rig.tsx`), `FlatPanel.tsx`, và Workbench **ĐÃ được tích hợp ở vòng 2** (xem Nhóm A/D ở trên và `docs/shotcraft-integration-audit.md` mục 6) — quyết định "không tích hợp" ở vòng 1 cho các mục này đã bị đảo ngược sau khi audit lại và xác nhận không có xung đột kỹ thuật thật.

## Cách áp dụng khi phân phối lại

Nếu bạn phân phối lại repo này (hoặc bản build/fork), theo Apache-2.0 điều khoản 4:
1. Giữ nguyên file `licenses/video-shotcraft/LICENSE-APACHE-2.0.txt`.
2. Giữ nguyên tài liệu này (`THIRD_PARTY_NOTICES.md`) hoặc nội dung tương đương.
3. Không xoá comment "origin: video-shotcraft ..." ở đầu các file thuộc Nhóm A/B nêu trên.
