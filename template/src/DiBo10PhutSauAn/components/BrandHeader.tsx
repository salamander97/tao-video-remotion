import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface BrandHeaderProps {
  channelName?: string;
}

/** Brand overlay theo palette clinical-clarity — teal trên nền sáng, neo top, ẩn khi rỗng. */
export const BrandHeader: React.FC<BrandHeaderProps> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (!channelName || channelName.trim() === "") return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: 420,
        borderRadius: 999,
        border: "1px solid rgba(15,118,110,0.35)",
        background: "rgba(255,255,255,0.88)",
        padding: "10px 24px",
        boxShadow: "0 8px 22px rgba(15,118,110,0.18)",
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#0F766E,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7FFFD", fontWeight: 900, fontSize: 15 }}>?</div>
      <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: 0.4, color: "#0F766E", whiteSpace: "nowrap" }}>{channelName}</span>
    </div>
  );
};
