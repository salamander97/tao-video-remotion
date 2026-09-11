// origin: video-shotcraft assets/lib/ClipCard.tsx (Apache-2.0). Logic
// unchanged (crossfade-loop math, complementary opacity/volume envelopes);
// see THIRD_PARTY_NOTICES.md for full attribution and change log. Adapted:
// default `captionSize` raised 17→26 (mono "citation/label" tier per this
// template's mobile-typography floor — never use this default for primary
// narration text, which must go through `subtitleUtils.ts` at ≥32px).
import React from "react";
import { OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const ACCENT = "#4da3ff";

/**
 * Each loop layer crossfades BOTH its audio and its opacity at its edges: an
 * incoming fade 0→1 over `fadeIn` frames at the layer start, a steady body,
 * then an outgoing fade 1→0 over `fadeOut` frames ending at `step` — the
 * frame where the NEXT layer starts. Adjacent layers therefore overlap for
 * exactly `crossfade` frames and their envelopes are complementary (sum to
 * 1), so an unmuted loop never stacks two full-volume tracks.
 */
const LoopLayer: React.FC<{
  src: string;
  size: number;
  muted: boolean;
  startFrom: number;
  fadeIn: number;
  fadeOut: number;
  step: number;
}> = ({ src, size, muted, startFrom, fadeIn, fadeOut, step }) => {
  const frame = useCurrentFrame();

  let envelope: number;
  if (frame <= fadeIn) {
    envelope = fadeIn === 0 ? 1 : interpolate(frame, [0, fadeIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  } else if (frame <= step) {
    envelope = 1;
  } else {
    envelope = interpolate(frame, [step, step + fadeOut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }

  const opacity = Math.max(0, Math.min(1, envelope));
  const volume = muted ? 1 : opacity;

  return (
    <OffthreadVideo
      src={staticFile(src)}
      muted={muted}
      volume={volume}
      startFrom={startFrom}
      style={{ position: "absolute", inset: 0, width: size, height: size, objectFit: "cover", opacity }}
    />
  );
};

/**
 * Wraps a real mp4 clip into a "card hero" that shot recipes designed for
 * DOM/SVG subjects can drive directly — fills the gap where every vertical
 * shot card in `shots/registry.ts` assumes generated DOM content, never real
 * footage. `loopDurationInFrames` enables a seamless crossfade loop, since
 * `OffthreadVideo` (as of Remotion 4.0.x) has no native `loop` and freezes
 * past media end.
 */
export const ClipCard: React.FC<{
  src: string;
  caption?: string;
  size?: number;
  radius?: number;
  muted?: boolean;
  captionSize?: number;
  startFrom?: number;
  style?: React.CSSProperties;
  loopDurationInFrames?: number;
  loopCrossfadeInFrames?: number;
  durationInFrames?: number;
}> = ({
  src,
  caption,
  size = 560,
  radius = 20,
  muted = true,
  startFrom = 0,
  style,
  captionSize = 26,
  loopDurationInFrames,
  loopCrossfadeInFrames = 8,
  durationInFrames,
}) => {
  const { durationInFrames: compDuration } = useVideoConfig();
  const capH = caption ? Math.round(captionSize * 2.6) : 0;

  let video: React.ReactNode;
  const step = loopDurationInFrames ? loopDurationInFrames - startFrom - loopCrossfadeInFrames : 0;
  const canLoop = !!loopDurationInFrames && loopDurationInFrames > loopCrossfadeInFrames && step >= loopCrossfadeInFrames;
  if (canLoop) {
    const shotFrames = durationInFrames ?? compDuration;
    const n = Math.max(1, Math.ceil(shotFrames / step));
    video = (
      <div style={{ position: "relative", width: size, height: size }}>
        {Array.from({ length: n }, (_, i) => (
          <Sequence key={i} from={i * step} durationInFrames={loopDurationInFrames} layout="none">
            <LoopLayer src={src} size={size} muted={muted} startFrom={startFrom} fadeIn={i === 0 ? 0 : loopCrossfadeInFrames} fadeOut={loopCrossfadeInFrames} step={step} />
          </Sequence>
        ))}
      </div>
    );
  } else {
    video = <OffthreadVideo src={staticFile(src)} muted={muted} startFrom={startFrom} style={{ width: size, height: size, objectFit: "cover", display: "block" }} />;
  }

  return (
    <div
      style={{
        width: size,
        height: size + capH,
        borderRadius: radius,
        background: "#111116",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
        overflow: "hidden",
        ...style,
      }}
    >
      {video}
      {caption ? (
        <div
          style={{
            height: capH,
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: captionSize,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: 0.5,
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <span style={{ color: ACCENT, marginRight: 10 }}>▸</span>
          {caption}
        </div>
      ) : null}
    </div>
  );
};
