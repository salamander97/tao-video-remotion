// origin: video-shotcraft assets/lib/VerticalTicker.tsx (Apache-2.0). Logic
// unchanged (marginBottom-based seamless loop math); see
// THIRD_PARTY_NOTICES.md for full attribution and change log. Adapted:
// default `columnWidth` 400→320 so 3 columns + gaps fit the 1080px-wide
// vertical frame (the original defaults targeted a 1920-wide horizontal
// frame and would overflow at 1080).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export interface TickerColumn {
  /** Column content — any ReactNode (screenshot-slice divs, <Img>, text cards…) */
  items: React.ReactNode[];
  /** Seconds for one full loop (one copy of items scrolling its own height) */
  durationInSeconds: number;
  /** -1 scrolls up, 1 scrolls down */
  direction: -1 | 1;
}

export interface VerticalTickerProps {
  columns: TickerColumn[];
  backgroundColor?: string;
  maskHeight?: number;
  tiltDeg?: number;
  perspective?: number;
  scale?: number;
  columnWidth?: number;
  gap?: number;
}

/**
 * 3D-perspective multi-column infinite vertical scroll wall. Each column
 * doubles its items `[...items, ...items]` and modulates `translateY` from
 * 0 to -50%: the first half scrolls fully out of view exactly as the loop
 * resets, and the second half is pixel-identical to the first, so the loop
 * point is invisible. The seam-free guarantee requires -50% to equal exactly
 * one copy's period (content height + n gaps) — using `marginBottom` per
 * item (not flex `gap`, which halves incorrectly after doubling to 2n-1
 * gaps) keeps the container height at exactly twice that period.
 */
export const VerticalTicker: React.FC<VerticalTickerProps> = ({
  columns,
  backgroundColor = "#000",
  maskHeight = 200,
  tiltDeg = 20,
  perspective = 1000,
  scale = 1.2,
  columnWidth = 320,
  gap = 30,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          gap,
          transform: `perspective(${perspective}px) rotateX(${tiltDeg}deg) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {columns.map((col, idx) => (
          <Column key={idx} {...col} width={columnWidth} gap={gap} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: maskHeight,
          background: `linear-gradient(to bottom, ${backgroundColor} 0%, transparent 100%)`,
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: maskHeight,
          background: `linear-gradient(to top, ${backgroundColor} 0%, transparent 100%)`,
          zIndex: 10,
        }}
      />
    </AbsoluteFill>
  );
};

const Column: React.FC<TickerColumn & { width: number; gap: number }> = ({ items, durationInSeconds, direction, width, gap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const loopFrames = durationInSeconds * fps;
  const progress = (frame % loopFrames) / loopFrames;
  const translateY = direction === -1 ? progress * -50 : -50 + progress * 50;

  return (
    <div style={{ width, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "column", transform: `translateY(${translateY}%)`, willChange: "transform" }}>
        {[...items, ...items].map((node, i) => (
          <div key={i} style={{ marginBottom: gap }}>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
};
