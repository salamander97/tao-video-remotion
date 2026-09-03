import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";

interface FullBleedPhotoProps {
  src: string;
  durationInFrames: number;
  dim?: number; // 0..1 độ làm mờ để chữ nổi rõ
  direction?: "zoom-in" | "zoom-out" | "pan-left" | "pan-right";
  shake?: number; // cường độ rung máy (px)
}

/** Ảnh phủ toàn màn hình + Ken Burns + vignette, làm nền cho các cảnh cinematic */
export const FullBleedPhoto: React.FC<FullBleedPhotoProps> = ({
  src,
  durationInFrames,
  dim = 0.55,
  direction = "zoom-in",
  shake = 0,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let scale = 1.1;
  let x = 0;
  if (direction === "zoom-in") scale = 1.06 + t * 0.16;
  else if (direction === "zoom-out") scale = 1.24 - t * 0.16;
  else if (direction === "pan-left") {
    scale = 1.22;
    x = interpolate(t, [0, 1], [70, -70]);
  } else {
    scale = 1.22;
    x = interpolate(t, [0, 1], [-70, 70]);
  }

  // Rung máy (deterministic, tắt dần)
  const amp = shake * interpolate(frame, [0, 90], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dx = Math.sin(frame * 2.13) * 7 * amp;
  const dy = Math.cos(frame * 1.71) * 5 * amp;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${dx}px, ${dy}px)`,
      }}
    >
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: -12,
          width: "calc(100% + 24px)",
          height: "calc(100% + 24px)",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}px, 0)`,
          filter: "sepia(0.2) contrast(1.08) saturate(0.85) brightness(0.9)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(10,6,2,${dim + 0.15}), rgba(10,6,2,${dim * 0.7}) 45%, rgba(10,6,2,${dim + 0.25}))`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 260px rgba(0,0,0,0.8)" }}
      />
    </div>
  );
};
