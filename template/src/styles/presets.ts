/**
 * Visual style preset registry — theo báo cáo nghiên cứu 2026-09-03
 * (xem skill references/visual-presets.md để biết bố cục & hiệu ứng chi tiết).
 *
 * Preset chỉ điều khiển design token + motion language; nội dung scene đến
 * từ visual-plan của từng topic. KHÔNG hỏi người dùng chọn preset — tự chọn
 * theo domain, chỉ override khi họ chủ động yêu cầu.
 */

export type TopicDomain = "science" | "finance" | "health" | "history" | "general";
export type MotionPreset = "calm" | "precise" | "energetic" | "cinematic";

export interface VisualStylePreset {
  id: string;
  domains: TopicDomain[];
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
    positive?: string;
    negative?: string;
  };
  fonts: { display: string; body: string; mono?: string };
  caption: { active: string; inactive: string; surface: string; maxLines: 1 | 2 };
  effects: string[];
  motion: MotionPreset;
}

export const VISUAL_PRESETS: Record<string, VisualStylePreset> = {
  "cosmic-neon": {
    id: "cosmic-neon",
    domains: ["science"],
    colors: { background: "#050816", surface: "#0B1026", primary: "#7C3AED", secondary: "#22D3EE", accent: "#F472B6", text: "#F8FAFC", muted: "#94A3B8" },
    fonts: { display: "Space Grotesk", body: "Be Vietnam Pro", mono: "Roboto Mono" },
    caption: { active: "#22D3EE", inactive: "#CBD5E1", surface: "rgba(5,8,22,0.9)", maxLines: 2 },
    effects: ["starfield-parallax", "orbit-draw", "radial-glow"],
    motion: "cinematic",
  },
  "lab-blueprint": {
    id: "lab-blueprint",
    domains: ["science"],
    colors: { background: "#061826", surface: "#0B2B40", primary: "#38BDF8", secondary: "#A7F3D0", accent: "#E6F6FF", text: "#E6F6FF", muted: "#7FA6B8" },
    fonts: { display: "Be Vietnam Pro", body: "Be Vietnam Pro", mono: "IBM Plex Mono" },
    caption: { active: "#38BDF8", inactive: "#A7F3D0", surface: "rgba(6,24,38,0.92)", maxLines: 2 },
    effects: ["grid", "node-diagram", "scan-reveal"],
    motion: "precise",
  },
  "data-documentary": {
    id: "data-documentary",
    domains: ["general", "science"],
    colors: { background: "#0F172A", surface: "#1E293B", primary: "#FBBF24", secondary: "#38BDF8", accent: "#FB7185", text: "#F8FAFC", muted: "#94A3B8" },
    fonts: { display: "Montserrat", body: "Inter" },
    caption: { active: "#FBBF24", inactive: "#CBD5E1", surface: "rgba(15,23,42,0.92)", maxLines: 2 },
    effects: ["big-number", "chart-morph", "annotation", "source-line"],
    motion: "energetic",
  },
  "market-terminal": {
    id: "market-terminal",
    domains: ["finance"],
    colors: { background: "#060A0E", surface: "#101820", primary: "#22C55E", secondary: "#EF4444", accent: "#F59E0B", text: "#D1FAE5", muted: "#64748B", positive: "#22C55E", negative: "#EF4444" },
    fonts: { display: "IBM Plex Mono", body: "Be Vietnam Pro", mono: "IBM Plex Mono" },
    caption: { active: "#22C55E", inactive: "#94A3B8", surface: "rgba(6,10,14,0.94)", maxLines: 2 },
    effects: ["ticker", "sparkline", "candlestick", "delta-slide"],
    motion: "energetic",
  },
  "fintech-glass": {
    id: "fintech-glass",
    domains: ["finance"],
    colors: { background: "#07111F", surface: "#0F2742", primary: "#2DD4BF", secondary: "#60A5FA", accent: "#A78BFA", text: "#F8FAFC", muted: "#94A3B8" },
    fonts: { display: "Manrope", body: "Inter" },
    caption: { active: "#2DD4BF", inactive: "#CBD5E1", surface: "rgba(7,17,31,0.9)", maxLines: 2 },
    effects: ["glass-card", "progress-ring", "count-up"],
    motion: "calm",
  },
  "editorial-macro": {
    id: "editorial-macro",
    domains: ["finance"],
    colors: { background: "#F2EFE7", surface: "#FFFFFF", primary: "#111111", secondary: "#C62828", accent: "#1D4ED8", text: "#111111", muted: "#6B6258" },
    fonts: { display: "Roboto Condensed", body: "Noto Serif" },
    caption: { active: "#C62828", inactive: "#6B6258", surface: "rgba(242,239,231,0.94)", maxLines: 2 },
    effects: ["magazine-grid", "duotone-photo", "paper-wipe", "hard-cut"],
    motion: "precise",
  },
  "clinical-clarity": {
    id: "clinical-clarity",
    domains: ["health"],
    colors: { background: "#F7FFFD", surface: "#E6F7F2", primary: "#0F766E", secondary: "#2563EB", accent: "#FB7185", text: "#16302B", muted: "#5B7A73" },
    fonts: { display: "Lexend", body: "Noto Sans" },
    caption: { active: "#0F766E", inactive: "#5B7A73", surface: "rgba(247,255,253,0.94)", maxLines: 2 },
    effects: ["anatomical-svg", "pulse-wave", "step-reveal", "soft-mask"],
    motion: "calm",
  },
  "organic-wellness": {
    id: "organic-wellness",
    domains: ["health"],
    colors: { background: "#F6F1E7", surface: "#DDE8D5", primary: "#52796F", secondary: "#D97757", accent: "#E9B949", text: "#24352F", muted: "#6B7F72" },
    fonts: { display: "Nunito Sans", body: "Be Vietnam Pro" },
    caption: { active: "#E9B949", inactive: "#52796F", surface: "rgba(246,241,231,0.92)", maxLines: 2 },
    effects: ["organic-blob", "breathing-scale", "paper-grain"],
    motion: "calm",
  },
  "archive-documentary": {
    id: "archive-documentary",
    domains: ["history"],
    colors: { background: "#17130F", surface: "#3B2F24", primary: "#D6C3A1", secondary: "#A65A3A", accent: "#E8DDC7", text: "#E8DDC7", muted: "#8C7B63" },
    fonts: { display: "Noto Serif", body: "Roboto Condensed" },
    caption: { active: "#E8DDC7", inactive: "#8C7B63", surface: "rgba(23,19,15,0.94)", maxLines: 2 },
    effects: ["ken-burns", "film-grain", "date-stamp", "timeline-draw", "embers"],
    motion: "cinematic",
  },
  "museum-map": {
    id: "museum-map",
    domains: ["history"],
    colors: { background: "#090B0F", surface: "#1E293B", primary: "#D4AF37", secondary: "#8B1E2D", accent: "#EDE3CF", text: "#EDE3CF", muted: "#7C8794" },
    fonts: { display: "Spectral", body: "Be Vietnam Pro" },
    caption: { active: "#D4AF37", inactive: "#7C8794", surface: "rgba(9,11,15,0.94)", maxLines: 2 },
    effects: ["map-route", "territory-mask", "gold-sweep", "camera-push"],
    motion: "cinematic",
  },
};

/** Chọn preset tự động theo domain + tone (không hỏi người dùng) */
export const chooseVisualStyle = (
  domain: TopicDomain,
  tone?: string
): string => {
  if (domain === "science" && tone === "epic") return "cosmic-neon";
  if (domain === "science" && tone === "data") return "data-documentary";
  if (domain === "science") return "lab-blueprint";
  if (domain === "finance" && tone === "premium") return "fintech-glass";
  if (domain === "finance" && tone === "analysis") return "editorial-macro";
  if (domain === "finance") return "market-terminal";
  if (domain === "health" && tone === "wellness") return "organic-wellness";
  if (domain === "health") return "clinical-clarity";
  if (domain === "history" && tone === "epic") return "museum-map";
  if (domain === "history") return "archive-documentary";
  return "data-documentary";
};

/** Motion token dùng chung (frame @ 30fps) */
export const MOTION_TOKENS: Record<
  MotionPreset,
  { enter: number; exit: number; stagger: number; spring: { damping: number; stiffness: number } }
> = {
  calm: { enter: 18, exit: 12, stagger: 5, spring: { damping: 20, stiffness: 90 } },
  precise: { enter: 12, exit: 8, stagger: 3, spring: { damping: 24, stiffness: 130 } },
  energetic: { enter: 8, exit: 6, stagger: 2, spring: { damping: 14, stiffness: 170 } },
  cinematic: { enter: 22, exit: 16, stagger: 6, spring: { damping: 22, stiffness: 75 } },
};

/** Caption token — caption tối đa 2 dòng, nằm trong safe zone dọc */
export const CAPTION_TOKENS = {
  fontSize: 58,
  lineHeight: 1.08,
  maxLines: 2,
  maxCharsPerLine: 24,
  horizontalPadding: 56,
  bottomSafeZone: 260,
  pageDurationMs: [700, 1300],
} as const;
