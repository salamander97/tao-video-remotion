import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface BrandHeaderProps {
  channelName?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hidden entirely when no channel name provided (rendered without --props)
  if (!channelName || channelName.trim() === "") {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "150px",
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
      }}
      className="z-50 flex max-w-[420px] items-center gap-2.5 rounded-full border border-sky-300/30 bg-slate-950/82 px-6 py-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.45)] backdrop-blur-lg"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-sm font-black text-white">
        ⚡
      </div>
      <span className="truncate text-[26px] font-black tracking-wider bg-gradient-to-r from-sky-300 via-white to-blue-300 bg-clip-text text-transparent">
        {channelName}
      </span>
    </div>
  );
};
