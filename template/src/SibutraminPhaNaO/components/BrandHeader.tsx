import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface BrandHeaderProps {
  channelName: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!channelName) return null;

  const opacity = interpolate(frame, [0, 20], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = spring({
    frame,
    fps,
    from: -20,
    to: 0,
    config: { damping: 18, stiffness: 80 },
  });

  return (
    <div
      style={{ opacity, transform: `translateY(${y}px)` }}
      className="absolute left-0 right-0 top-[148px] z-30 flex justify-center"
    >
      <div className="rounded-full border border-teal-600/15 bg-white/80 px-7 py-2.5 shadow-sm backdrop-blur-md">
        <span className="text-[24px] font-bold tracking-wide text-[#0F766E]">
          {channelName}
        </span>
      </div>
    </div>
  );
};
