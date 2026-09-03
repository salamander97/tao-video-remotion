import React from "react";
import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface ArchivalPhotoProps {
  src: string;
  caption: string;
  credit: string;
  license: string;
  durationInFrames: number;
  direction?: "zoom-in" | "zoom-out" | "pan-left" | "pan-right";
  fit?: "cover" | "contain";
}

/**
 * Khung ảnh tư liệu kiểu phim tài liệu: viền giấy cũ, tông sepia,
 * hiệu ứng Ken Burns (zoom/pan chậm) + caption & credit nguồn (đúng luật license).
 */
export const ArchivalPhoto: React.FC<ArchivalPhotoProps> = ({
  src,
  caption,
  credit,
  license,
  durationInFrames,
  direction = "zoom-in",
  fit = "cover",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ken Burns transform
  let scale = 1.08;
  let x = 0;
  let y = 0;
  if (direction === "zoom-in") {
    scale = 1.04 + t * 0.14;
  } else if (direction === "zoom-out") {
    scale = 1.18 - t * 0.14;
  } else if (direction === "pan-left") {
    scale = 1.16;
    x = interpolate(t, [0, 1], [50, -50]);
    y = Math.sin(frame / 40) * 6;
  } else {
    scale = 1.16;
    x = interpolate(t, [0, 1], [-50, 50]);
    y = Math.sin(frame / 40) * 6;
  }

  const entrance = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  void fps;

  return (
    <div
      style={{
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 40}px)`,
      }}
      className="w-[880px] rounded-2xl border-2 border-amber-200/30 bg-amber-100/5 p-3 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-sm"
    >
      {/* Ảnh + Ken Burns */}
      <div className="relative h-[500px] w-full overflow-hidden rounded-xl bg-stone-950">
        <Img
          src={src}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            transform: `scale(${scale}) translate(${x}px, ${y}px)`,
            filter: "sepia(0.18) contrast(1.06) saturate(0.88) brightness(0.96)",
          }}
        />
        {/* Vignette mờ mép cho chất tư liệu */}
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_120px_rgba(20,10,0,0.55)]" />
      </div>

      {/* Caption + credit nguồn (yêu cầu của license CC BY-SA) */}
      <div className="mt-3 flex items-center justify-between gap-6 px-2">
        <p className="text-2xl font-semibold text-amber-100/90">{caption}</p>
        <p className="shrink-0 text-right text-lg leading-tight text-amber-200/50">
          Ảnh: {credit} · {license} · Wikimedia
        </p>
      </div>
    </div>
  );
};
