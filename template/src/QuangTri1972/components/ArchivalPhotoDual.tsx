import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";

export interface DualPhoto {
  file: string;
  caption: string;
  credit: string;
  license: string;
}

interface ArchivalPhotoDualProps {
  photoA: DualPhoto;
  photoB: DualPhoto;
  durationInFrames: number;
}

/**
 * Hai ảnh tư liệu trong cùng một cảnh: ảnh A chiếu nửa đầu, ảnh B trượt vào
 * ở nửa sau (Ken Burns riêng từng ảnh) — kiểu dựng phim tài liệu thật.
 */
export const ArchivalPhotoDual: React.FC<ArchivalPhotoDualProps> = ({
  photoA,
  photoB,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const half = durationInFrames / 2;
  const cross = 14; // frame chuyển cảnh

  const localA = Math.min(frame, half + cross);
  const localB = frame - (half - cross);

  // Trượt khung: A dịch trái ra, B dịch từ phải vào
  const slideA = interpolate(frame, [half - cross, half + cross], [0, -900], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slideB = interpolate(frame, [half - cross, half + cross], [900, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ken = (local: number, dir: 0 | 1) => {
    const p = Math.max(0, Math.min(local / (half + cross), 1));
    const scale = dir === 0 ? 1.05 + p * 0.13 : 1.18 - p * 0.13;
    return scale;
  };

  const frameUi = (photo: DualPhoto, localFrame: number, dir: 0 | 1, slide: number) => (
    <div
      style={{ transform: `translateX(${slide}px)` }}
      className="absolute inset-0 w-[880px] rounded-2xl border-2 border-amber-200/30 bg-amber-100/5 p-3 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
    >
      <div className="relative h-[500px] w-full overflow-hidden rounded-xl bg-stone-950">
        <Img
          src={photo.file}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${ken(localFrame, dir)})`,
            filter: "sepia(0.18) contrast(1.06) saturate(0.88) brightness(0.96)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_120px_rgba(20,10,0,0.55)]" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-6 px-2">
        <p className="text-2xl font-semibold text-amber-100/90">{photo.caption}</p>
        <p className="shrink-0 text-right text-lg leading-tight text-amber-200/50">
          Ảnh: {photo.credit} · {photo.license}
        </p>
      </div>
    </div>
  );

  const entrance = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        height: 596,
        width: 880,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 40}px)`,
      }}
    >
      {frameUi(photoA, localA, 0, slideA)}
      {frame > half - cross - 1 ? frameUi(photoB, localB, 1, slideB) : null}
    </div>
  );
};
