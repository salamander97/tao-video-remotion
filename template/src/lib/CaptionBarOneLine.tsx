// Caption một dòng — chuẩn mặc định MỚI cho video dùng skill này (xem
// SKILL.md mục caption). Không thay thế SubtitleBox.tsx của các composition
// cũ (DockerExplainer, ReverseEngineering, SibutraminPhaNaO, DiBo10PhutSauAn,
// MotionSystemShowcase) — những file đó tiếp tục dùng chunkSentences như cũ,
// KHÔNG bị composition này chạm vào. Video mới nên copy pattern này (không
// import trực tiếp — mỗi composition tự tách JSX theo palette/preset riêng)
// thay vì tự nghĩ lại chunk-theo-số-từ.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { splitIntoCaptionCues, captionCueStartFrames, fitCaptionFontSize, CAPTION_MAX_WIDTH_PX, CAPTION_MIN_FONT_PX, CAPTION_MAX_FONT_PX, CAPTION_PILL_MAX_HEIGHT_PX } from "./subtitleUtils";

function renderWithEmphasis(text: string, accent: string): React.ReactNode {
  const parts = text.split(/(\S*\d\S*)/g);
  return parts.map((part, i) => (/\d/.test(part) ? <span key={i} style={{ color: accent }}>{part}</span> : <React.Fragment key={i}>{part}</React.Fragment>));
}

/**
 * Caption luôn 1 dòng: `whiteSpace:'nowrap'` cưỡng chế + `splitIntoCaptionCues`
 * đảm bảo mỗi cue vừa đúng 1 dòng ở fontSize 38-46px trước khi render (xem
 * subtitleUtils.ts). Sans font (không mono cho narration).
 */
export const CaptionBarOneLine: React.FC<{
  text: string;
  durationInFrames: number;
  accent: string;
  ink?: string;
  fontFamily: string;
  bottom?: number;
}> = ({ text, durationInFrames, accent, ink = "#F8FAFC", fontFamily, bottom = 300 }) => {
  const frame = useCurrentFrame();
  const cues = splitIntoCaptionCues(text);
  const starts = captionCueStartFrames(cues, durationInFrames);
  let idx = 0;
  for (let i = 0; i < starts.length; i++) if (frame >= starts[i]) idx = i;
  const local = frame - starts[idx];
  const nextStart = starts[idx + 1] ?? durationInFrames;
  const windowLen = Math.max(6, nextStart - starts[idx]);
  const inT = interpolate(local, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outT = interpolate(local, [windowLen - 5, windowLen], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cue = cues[idx] ?? { text: "", words: 1 };
  const { fontSizePx } = fitCaptionFontSize(cue.text, { maxWidthPx: CAPTION_MAX_WIDTH_PX, maxFontPx: CAPTION_MAX_FONT_PX, minFontPx: CAPTION_MIN_FONT_PX });

  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          maxWidth: 960,
          maxHeight: CAPTION_PILL_MAX_HEIGHT_PX,
          background: "rgba(6,10,18,0.74)",
          border: `1px solid ${accent}33`,
          borderRadius: 999,
          padding: "16px 28px",
          opacity: inT * outT,
          transform: `translateY(${(1 - inT) * 8}px)`,
          overflow: "hidden",
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: accent, flex: "none" }} />
        <span style={{ fontFamily, fontSize: fontSizePx, fontWeight: 700, lineHeight: 1, letterSpacing: "0.005em", color: ink, whiteSpace: "nowrap" }}>
          {renderWithEmphasis(cue.text, accent)}
        </span>
      </div>
    </div>
  );
};
