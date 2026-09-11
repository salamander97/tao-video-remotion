import { dampedSettle } from "./motion";

/**
 * Đảm bảo luật hold/rest tối thiểu: sau `holdFrames` khung giữ nguyên trạng
 * thái ổn định, mới cho phép settle offset chạy tiếp. Bổ sung khoảng trống
 * "giữ tối thiểu" mà scene-design.md hệ đích chưa có (chỉ có giới hạn trên
 * "không giữ quá 3 giây").
 */
export const holdThenSettle = (
  frame: number,
  impactFrame: number,
  holdFrames: number,
  freq = 0.1,
  damping = 0.15,
): number => {
  const t = frame - impactFrame - holdFrames;
  return t <= 0 ? 0 : dampedSettle(t, freq, damping);
};
