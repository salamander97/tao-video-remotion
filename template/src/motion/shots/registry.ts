/**
 * Vertical shot registry — metadata máy đọc cho các "shot card" trong
 * skills/tao-video-remotion/references/vertical-shot-library.md. Đây là
 * tra cứu tham số/gợi ý, KHÔNG phải component bắt buộc: agent vẫn tự viết
 * JSX cho scene, chỉ tham chiếu card để không "nghĩ lại motion từ đầu" mỗi
 * topic (đúng khoảng trống nêu ở mục 2.8 của audit).
 *
 * provenance="shotcraft-adapted": ý tưởng/tham số lấy cảm hứng từ một shot
 * recipe trong video-shotcraft (Apache-2.0), thiết kế lại hoàn toàn cho
 * khung dọc 1080x1920 và pipeline TTS-first — không copy nguyên JSX/pixel.
 * provenance="new-for-vertical": thiết kế mới, không có tương ứng trực tiếp.
 */

export type ShotCategory =
  | "hook"
  | "reveal"
  | "before-after"
  | "process-timeline"
  | "data-stat"
  | "diagram"
  | "montage"
  | "focus-highlight"
  | "kinetic-type"
  | "transition"
  | "outro"
  | "camera";

export interface ShotCard {
  id: string;
  category: ShotCategory;
  narrativePurpose: string;
  sceneType: string;
  energy: "low" | "medium" | "high";
  durationFrames: [number, number];
  aspectRatioBehavior: string;
  primaryVisual: string;
  camera: string;
  holdRestFrames: number;
  transitionInOut: [string, string];
  sfxCue?: "whoosh" | "impact" | "riser" | "sparkle" | "tick" | "none";
  pitfalls: string[];
  provenance: "shotcraft-adapted" | "new-for-vertical";
  componentOrAdapter?: string;
}

export const VERTICAL_SHOT_REGISTRY: ShotCard[] = [
  {
    id: "hook-kinetic-punch",
    category: "hook",
    narrativePurpose: "Mở đầu gây chú ý tức thì bằng tiêu đề lớn + camera punch nhẹ",
    sceneType: "hook",
    energy: "high",
    durationFrames: [120, 180],
    aspectRatioBehavior: "Headline căn giữa focal stage 880-1000px, không chạm safe-zone 260px đáy",
    primaryVisual: "kineticType",
    camera: "static, zoom nhẹ 1.0->1.06 outExpo",
    holdRestFrames: 18,
    transitionInOut: ["cut", "flash-cut"],
    sfxCue: "whoosh",
    pitfalls: ["Không lặp motion punch quá 2 scene", "Không để headline đứng yên quá 3s sau reveal"],
    provenance: "new-for-vertical",
    componentOrAdapter: "template/src/motion/easing.ts",
  },
  {
    id: "hook-reveal-mask",
    category: "hook",
    narrativePurpose: "Mask reveal ảnh/footage mở đầu, tạo cảm giác 'vén màn'",
    sceneType: "hook",
    energy: "high",
    durationFrames: [120, 150],
    aspectRatioBehavior: "Mask quét dọc từ tâm ra 2 bên, không cắt mất phần đầu/chân chủ thể",
    primaryVisual: "photo",
    camera: "static",
    holdRestFrames: 18,
    transitionInOut: ["mask-reveal", "cut"],
    sfxCue: "whoosh",
    pitfalls: ["Mask quá nhanh (<8f) làm mất cảm giác vén màn"],
    provenance: "new-for-vertical",
  },
  {
    id: "image-reveal-crop",
    category: "reveal",
    narrativePurpose: "Document focus: screenshot/ảnh tư liệu thật, crop rồi highlight chi tiết liên quan lời đọc",
    sceneType: "evidence",
    energy: "medium",
    durationFrames: [180, 300],
    aspectRatioBehavior: "Evidence rộng 0.75-0.88 khung ngang, không co chữ tài liệu để ép vừa card",
    primaryVisual: "photo",
    camera: "parallax-2.5d push nhẹ vào chi tiết",
    holdRestFrames: 20,
    transitionInOut: ["cut", "wipe-cut"],
    sfxCue: "tick",
    pitfalls: ["Không highlight sai ngữ nghĩa nguồn", "Zoom đều 1 ảnh suốt cảnh không đủ diễn biến"],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/camera2p5d.tsx",
  },
  {
    id: "before-after-slider",
    category: "before-after",
    narrativePurpose: "So sánh trước/sau bằng thanh chia dọc: quét nhanh rồi quét chậm để đọc khác biệt",
    sceneType: "comparison",
    energy: "medium",
    durationFrames: [120, 150],
    aspectRatioBehavior: "Thanh chia dọc chạy hết chiều cao focal stage, nhãn BEFORE/AFTER trong safe-zone",
    primaryVisual: "photo",
    camera: "static",
    holdRestFrames: 40,
    transitionInOut: ["cut", "cut"],
    sfxCue: "whoosh",
    pitfalls: [
      "Tỉ lệ tốc độ quét nhanh:chậm phải >=3:1 mới cảm nhận được nhịp tương phản",
      "Hai bản before/after phải cùng bố cục/góc chụp",
      "Điểm dừng cuối nên ở ~40% chứ không phải 0% để giữ đối chứng nhìn thấy",
    ],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/easing.ts",
  },
  {
    id: "timeline-process-3step",
    category: "process-timeline",
    narrativePurpose: "Quy trình 3 bước xuất hiện lần lượt, mỗi bước focus rõ trước khi qua bước sau",
    sceneType: "process",
    energy: "medium",
    durationFrames: [210, 360],
    aspectRatioBehavior: "3 node xếp dọc, connector nối bằng SVG path-draw",
    primaryVisual: "svgDiagram",
    camera: "static",
    holdRestFrames: 20,
    transitionInOut: ["cut", "cut"],
    sfxCue: "tick",
    pitfalls: ["Không hiện cả 3 bước cùng lúc rồi mới tô đậm — phải build tuần tự"],
    provenance: "new-for-vertical",
    componentOrAdapter: "template/src/motion/stagger.ts",
  },
  {
    id: "data-stat-counter",
    category: "data-stat",
    narrativePurpose: "Number reveal có đơn vị/nguồn, dùng odometer roll cho số liệu ấn tượng",
    sceneType: "metric",
    energy: "medium",
    durationFrames: [120, 180],
    aspectRatioBehavior: "Số lớn căn giữa, unit + nguồn nhỏ ngay dưới trong safe-zone",
    primaryVisual: "dataViz",
    camera: "static",
    holdRestFrames: 24,
    transitionInOut: ["cut", "cut"],
    sfxCue: "tick",
    pitfalls: ["Không bịa số liệu để đẹp cảnh — mọi số phải có sourceCredit"],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/DigitRoll.tsx",
  },
  {
    id: "diagram-mechanism-state",
    category: "diagram",
    narrativePurpose: "Diagram nhiều trạng thái nối bằng path, callout xuất hiện sau khi path vẽ xong",
    sceneType: "mechanism",
    energy: "medium",
    durationFrames: [210, 330],
    aspectRatioBehavior: "Diagram rộng 880-1000px, callout không che node đang active",
    primaryVisual: "svgDiagram",
    camera: "static",
    holdRestFrames: 20,
    transitionInOut: ["cut", "cut"],
    sfxCue: "none",
    pitfalls: ["Icon đơn lẻ không đủ — diagram phải thể hiện quan hệ thực giữa các phần"],
    provenance: "new-for-vertical",
    componentOrAdapter: "template/src/motion/settle.ts",
  },
  {
    id: "montage-photo-slideshow",
    category: "montage",
    narrativePurpose: "Cắt nhanh nhiều ảnh tư liệu, Ken Burns xen kẽ zoom-in/out, không ảnh nào đứng quá 8s",
    sceneType: "montage",
    energy: "high",
    durationFrames: [180, 300],
    aspectRatioBehavior: "Full-bleed, mỗi ảnh giữ đúng safe-zone caption đáy",
    primaryVisual: "archival",
    camera: "parallax-2.5d nhẹ mỗi ảnh, hướng zoom xen kẽ",
    holdRestFrames: 8,
    transitionInOut: ["flash-cut", "flash-cut"],
    sfxCue: "sparkle",
    pitfalls: ["Không lặp cùng hướng zoom liên tiếp quá 2 ảnh"],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/camera2p5d.tsx",
  },
  {
    id: "focus-highlight-sweep",
    category: "focus-highlight",
    narrativePurpose: "Highlight sweep chạy qua dòng/số liệu đang được đọc trên evidence editorial",
    sceneType: "evidence",
    energy: "low",
    durationFrames: [90, 150],
    aspectRatioBehavior: "Sweep nằm trong vùng evidence editorial (x=80..1000)",
    primaryVisual: "photo",
    camera: "static",
    holdRestFrames: 18,
    transitionInOut: ["cut", "cut"],
    sfxCue: "none",
    pitfalls: ["Highlight phải bám đúng ý đang đọc, không chạy trước/sau lời thoại"],
    provenance: "new-for-vertical",
  },
  {
    id: "kinetic-headline-stagger",
    category: "kinetic-type",
    narrativePurpose: "Từ/cụm từ stagger vào khung, nhấn 1 từ khóa bằng punch nhỏ",
    sceneType: "quote",
    energy: "medium",
    durationFrames: [90, 150],
    aspectRatioBehavior: "Tối đa 2 dòng, không tràn max-width 900px",
    primaryVisual: "kineticType",
    camera: "static",
    holdRestFrames: 20,
    transitionInOut: ["cut", "cut"],
    sfxCue: "tick",
    pitfalls: ["Stagger quá nhanh (<3f/từ) đọc như glitch chứ không phải nhịp"],
    provenance: "new-for-vertical",
    componentOrAdapter: "template/src/motion/stagger.ts",
  },
  {
    id: "camera-parallax-push",
    category: "camera",
    narrativePurpose: "Push-in 2.5D vào chi tiết ảnh tư liệu/screenshot lớn, dùng chung nhiều category",
    sceneType: "evidence",
    energy: "medium",
    durationFrames: [90, 240],
    aspectRatioBehavior: "Điểm focal luôn trong focal stage x=40..1040",
    primaryVisual: "photo",
    camera: "parallax-2.5d",
    holdRestFrames: 18,
    transitionInOut: ["cut", "cut"],
    sfxCue: "none",
    pitfalls: ["Push quá nhanh (<20f cho toàn hành trình) gây chóng mặt trên mobile"],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/camera2p5d.tsx",
  },
  {
    id: "camera-handheld-archive",
    category: "camera",
    narrativePurpose: "Rung máy cầm tay rất nhẹ cho không khí tư liệu lịch sử/archive",
    sceneType: "archival",
    energy: "low",
    durationFrames: [90, 240],
    aspectRatioBehavior: "Biên độ rung không vượt quá làm lệch subject khỏi focal stage",
    primaryVisual: "archival",
    camera: "handheld-light, amp<=0.015",
    holdRestFrames: 0,
    transitionInOut: ["cut", "cut"],
    sfxCue: "none",
    pitfalls: ["Không dùng cho video sản phẩm/tin tức sáng màu — chỉ cho archive-documentary"],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/shake.ts",
  },
  {
    id: "transition-flash-cut",
    category: "transition",
    narrativePurpose: "Hard cut có chớp sáng ấm phủ 2 phía, dùng cho chuyển cảnh mạnh",
    sceneType: "transition",
    energy: "high",
    durationFrames: [8, 12],
    aspectRatioBehavior: "Full-bleed overlay, không ảnh hưởng safe-zone",
    primaryVisual: "kineticType",
    camera: "static",
    holdRestFrames: 0,
    transitionInOut: ["flash-cut", "flash-cut"],
    sfxCue: "whoosh",
    pitfalls: ["Không dùng liên tiếp 2 scene liền — mất cảm giác nhấn mạnh"],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/transitions/FlashCut.tsx",
  },
  {
    id: "transition-wipe",
    category: "transition",
    narrativePurpose: "Wipe dọc che hard cut khi chuyển chương/nhóm nội dung",
    sceneType: "transition",
    energy: "medium",
    durationFrames: [12, 16],
    aspectRatioBehavior: "Wipe full-bleed theo chiều dọc khung 1080x1920",
    primaryVisual: "kineticType",
    camera: "static",
    holdRestFrames: 0,
    transitionInOut: ["wipe-cut", "wipe-cut"],
    sfxCue: "whoosh",
    pitfalls: ["Không đặt caption/text quan trọng ngay lúc wipe che nửa khung"],
    provenance: "new-for-vertical",
    componentOrAdapter: "template/src/motion/transitions/WipeCut.tsx",
  },
  {
    id: "outro-cta-settle",
    category: "outro",
    narrativePurpose: "Câu chốt + CTA, giữ nghỉ đủ lâu (>=1s) trước khi kết thúc video",
    sceneType: "outro",
    energy: "low",
    durationFrames: [180, 240],
    aspectRatioBehavior: "CTA/brand nằm trên vùng an toàn, không sát mép 260px đáy",
    primaryVisual: "kineticType",
    camera: "static",
    holdRestFrames: 30,
    transitionInOut: ["cut", "hold"],
    sfxCue: "sparkle",
    pitfalls: ["Không dành nhiều giây cho một card đứng yên không có settle motion nào"],
    provenance: "shotcraft-adapted",
    componentOrAdapter: "template/src/motion/settle.ts",
  },
  {
    id: "data-chart-annotation",
    category: "data-stat",
    narrativePurpose: "Chart mọc lên rồi annotation xuất hiện giải thích insight chính",
    sceneType: "metric",
    energy: "medium",
    durationFrames: [180, 300],
    aspectRatioBehavior: "Chart rộng 880-1000px, annotation không che trục/label",
    primaryVisual: "dataViz",
    camera: "static",
    holdRestFrames: 24,
    transitionInOut: ["cut", "cut"],
    sfxCue: "tick",
    pitfalls: ["Tối đa 5-7 mark/series nhìn thấy cùng lúc trên khung dọc"],
    provenance: "new-for-vertical",
  },
  {
    id: "comparison-split-baseline",
    category: "before-after",
    narrativePurpose: "Split-screen 2 chủ thể cùng baseline để so sánh trực tiếp",
    sceneType: "comparison",
    energy: "medium",
    durationFrames: [150, 240],
    aspectRatioBehavior: "Chia đôi theo chiều ngang (trên/dưới) vì khung dọc hẹp ngang",
    primaryVisual: "photo",
    camera: "static",
    holdRestFrames: 20,
    transitionInOut: ["cut", "cut"],
    sfxCue: "none",
    pitfalls: ["Hai nửa phải cùng góc chụp/tỉ lệ, khác góc đọc như hai ảnh không liên quan"],
    provenance: "new-for-vertical",
  },
];

export const getShotCard = (id: string): ShotCard | undefined =>
  VERTICAL_SHOT_REGISTRY.find((card) => card.id === id);
