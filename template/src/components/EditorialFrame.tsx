import React, { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { VISUAL_PRESETS } from "../styles/presets";

interface EditorialFrameProps {
  headline: string;
  accent?: string;
  category?: string;
  chapter?: string;
  channelName?: string;
  caption: ReactNode;
  source?: ReactNode;
  children: ReactNode;
  captionMode?: "editorial-inline" | "subtitle-pill";
}

/** Editorial shell only: scene children must animate the evidence through its beats. */
export const EditorialFrame: React.FC<EditorialFrameProps> = ({
  headline,
  accent,
  category,
  chapter,
  channelName = "",
  caption,
  source,
  children,
  captionMode = "editorial-inline",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = VISUAL_PRESETS["editorial-news"];
  const reveal = interpolate(frame, [0, Math.max(1, Math.round(fps * 0.4))], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const accentIndex = accent ? headline.indexOf(accent) : -1;
  const coloredHeadline = accent && accentIndex >= 0 ? <>
    {headline.slice(0, accentIndex)}
    <span style={{ color: preset.colors.secondary }}>{accent}</span>
    {headline.slice(accentIndex + accent.length)}
  </> : headline;

  return (
    <AbsoluteFill style={{ backgroundColor: preset.colors.background, color: preset.colors.text, fontFamily: `${preset.fonts.body}, sans-serif` }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 150, height: 65, borderBottom: "2px solid #D6D0C3", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: preset.colors.secondary }}>{category}</span>
        <span style={{ fontSize: 24, color: preset.colors.muted }}>{chapter}</span>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 245, fontFamily: `${preset.fonts.display}, serif`, fontWeight: 800, fontSize: 84, lineHeight: 1.12, opacity: reveal, transform: `translateY(${(1 - reveal) * 20}px)` }}>
        {coloredHeadline}
      </div>
      <div style={captionMode === "editorial-inline"
        ? { position: "absolute", left: 80, right: 80, top: 495, fontSize: 42, lineHeight: 1.25, zIndex: 3 }
        : { position: "absolute", left: 80, right: 80, bottom: 290, fontSize: 42, lineHeight: 1.25, textAlign: "center", zIndex: 3 }}>
        {caption}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 675, height: 690, overflow: "hidden", borderRadius: 16, backgroundColor: preset.colors.surface, boxShadow: "0 12px 30px #22211D18" }}>
        {children}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1390, fontSize: 26, lineHeight: 1.4, color: preset.colors.muted }}>
        {source}
      </div>
      {channelName.trim() && <div style={{ position: "absolute", left: 80, right: 80, top: 1495, fontSize: 24, fontWeight: 700 }}>
        {channelName}
      </div>}
    </AbsoluteFill>
  );
};
