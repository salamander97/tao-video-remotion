import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Easing, seg } from "../easing";

/**
 * Wipe dọc đơn giản: một dải màu quét từ trên xuống (hoặc dưới lên) che hard
 * cut. Không có sẵn ở Shotcraft dạng component chung (các wipe của Shotcraft
 * nằm rời rạc trong từng demo 16:9) — viết mới cho khung dọc.
 */
export const WipeCut: React.FC<{
  duration?: number;
  color?: string;
  direction?: "down" | "up";
}> = ({ duration = 14, color = "#0B0B0C", direction = "down" }) => {
  const frame = useCurrentFrame();
  const half = duration / 2;
  const enter = seg(frame, 0, half, Easing.outQuart);
  const exit = seg(frame, half, duration, Easing.inQuad);
  const coverage = frame <= half ? enter : 1 - exit;
  const fromTop = direction === "down";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: fromTop ? 0 : undefined,
          bottom: fromTop ? undefined : 0,
          height: `${coverage * 100}%`,
          background: color,
        }}
      />
    </AbsoluteFill>
  );
};
