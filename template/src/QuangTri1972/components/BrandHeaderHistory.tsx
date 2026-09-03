import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface BrandHeaderHistoryProps {
  channelName?: string;
}

/** Brand header tông lịch sử (hổ phách + cờ đỏ sao vàng nhỏ), ẩn khi rỗng */
export const BrandHeaderHistory: React.FC<BrandHeaderHistoryProps> = ({
  channelName,
}) => {
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
      className="z-50 flex items-center gap-3.5 rounded-full border-2 border-amber-400/40 bg-stone-950/90 px-8 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-xl"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600 font-black text-amber-300 text-2xl shadow-[0_0_15px_rgba(220,38,38,0.6)]">
        ★
      </div>
      <span className="text-3xl font-black tracking-widest bg-gradient-to-r from-amber-200 via-amber-50 to-amber-300 bg-clip-text text-transparent">
        {channelName}
      </span>
    </div>
  );
};
