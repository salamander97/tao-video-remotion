/** Độ trễ xác định cho danh sách/montage — thay stagger ngẫu nhiên bằng công thức tuyến tính có seed tùy chọn. */
import { mulberry32 } from "./rand";

export interface StaggerOptions {
  baseDelay?: number; // khung giữa các item liên tiếp
  jitterFrames?: number; // dao động nhỏ quanh baseDelay, xác định theo seed
  seed?: number;
}

export const staggerDelay = (index: number, options: StaggerOptions = {}): number => {
  const { baseDelay = 4, jitterFrames = 0, seed = 1 } = options;
  if (jitterFrames <= 0) return index * baseDelay;
  const rand = mulberry32(seed + index);
  const jitter = (rand() - 0.5) * 2 * jitterFrames;
  return Math.max(0, Math.round(index * baseDelay + jitter));
};
