import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";

export interface SlidePhoto {
  file: string;
  caption: string;
  credit: string;
  license: string;
}

interface PhotoSlideshowProps {
  photos: SlidePhoto[];
  durationInFrames: number;
}

/**
 * Slideshow tư liệu N ảnh trong 1 cảnh — cắt dồn dập kiểu montage:
 * mỗi ảnh chiếu 1 slot bằng nhau, chuyển cảnh bằng slide ngang 8 frame,
 * Ken Burns xen kẽ zoom-in / zoom-out để không trùng cảm giác 2 ảnh liền.
 */
export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({
  photos,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const n = photos.length;
  const slot = durationInFrames / n;
  const cross = 8;

  const index = Math.min(Math.floor(frame / slot), n - 1);
  const active = photos[index];
  const localFrame = frame - index * slot;

  // Ảnh cũ trượt ra trái, ảnh mới trượt vào từ phải
  const slideOut = interpolate(localFrame, [slot - cross, slot], [0, -880], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isLast = index === n - 1;
  const outX = isLast ? 0 : slideOut;

  const localP = Math.max(0, Math.min(localFrame / slot, 1));
  const scale = index % 2 === 0 ? 1.05 + localP * 0.12 : 1.17 - localP * 0.12;

  const entrance = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Chấm tiến trình (n ảnh)
  const captionIn = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 40}px)`,
      }}
      className="w-[940px] rounded-2xl border-2 border-amber-200/30 bg-amber-100/5 p-3 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
    >
      <div className="relative h-[700px] w-full overflow-hidden rounded-xl bg-stone-950">
        <Img
          src={active.file}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translateX(${outX}px) scale(${scale})`,
            filter: "sepia(0.18) contrast(1.06) saturate(0.88) brightness(0.96)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_120px_rgba(20,10,0,0.55)]" />
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-6 px-2"
        style={{ opacity: captionIn }}
      >
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i === index ? "bg-amber-300" : "bg-amber-200/25"
                }`}
              />
            ))}
          </div>
          <p className="text-2xl font-semibold text-amber-100/90">
            {active.caption}
          </p>
        </div>
        <p className="shrink-0 text-right text-lg leading-tight text-amber-200/50">
          Ảnh: {active.credit}
        </p>
      </div>
    </div>
  );
};
