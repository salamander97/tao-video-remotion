/**
 * Bảng easing dùng chung cho pan/highlight/path/reveal — bổ sung cho
 * MOTION_TOKENS (chỉ có spring damping/stiffness) ở src/styles/presets.ts.
 * Nguồn ý tưởng: video-shotcraft demos/_fixtures/Motion.tsx (Apache-2.0);
 * viết lại độc lập bằng công thức easing chuẩn, không copy nguyên văn.
 */

export type EasingFn = (t: number) => number;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export const Easing: Record<string, EasingFn> = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  outElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Chuẩn hóa frame trong [t0,t1] thành progress [0,1] rồi áp easing.
 * Clamp hai đầu theo đúng luật "Always Clamp" của SKILL.md hệ đích.
 */
export const seg = (frame: number, t0: number, t1: number, ease: EasingFn = Easing.linear): number => {
  if (t1 <= t0) return frame >= t1 ? 1 : 0;
  return ease(clamp01((frame - t0) / (t1 - t0)));
};
