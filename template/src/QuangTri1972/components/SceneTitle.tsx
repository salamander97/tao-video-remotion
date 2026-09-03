import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SceneTitleProps {
  chapter: string;
  kicker: string;
  title: string;
}

export const SceneTitle: React.FC<SceneTitleProps> = ({
  chapter,
  kicker,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerX = spring({
    frame: frame - 4,
    fps,
    from: -60,
    to: 0,
    config: { damping: 14, stiffness: 90 },
  });
  const kickerOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({
    frame: frame - 10,
    fps,
    from: 50,
    to: 0,
    config: { damping: 14, stiffness: 85 },
  });
  const titleOpacity = interpolate(frame, [10, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="mb-9 flex flex-col items-center text-center">
      <div
        style={{ transform: `translateX(${kickerX}px)`, opacity: kickerOpacity }}
        className="flex items-center gap-4"
      >
        <span className="h-px w-16 bg-amber-400/60" />
        <span className="text-2xl font-black tracking-[0.3em] text-amber-300 uppercase">
          {chapter} · {kicker}
        </span>
        <span className="h-px w-16 bg-amber-400/60" />
      </div>
      <h2
        style={{ transform: `translateY(${titleY}px)`, opacity: titleOpacity }}
        className="mt-4 text-6xl font-black tracking-tight text-amber-50"
      >
        {title}
      </h2>
    </div>
  );
};
