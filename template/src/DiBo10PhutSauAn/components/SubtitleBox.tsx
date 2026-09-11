import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { chunkSentences, getChunkStartFrames } from "../../lib/subtitleUtils";

interface SubtitleBoxProps {
  text: string;
  durationInFrames: number;
  highlightKeyword?: string;
}

/** Phụ đề clinical-clarity: pill sáng, chữ đậm tối màu, active teal — giữ nguyên
 * hệ ngắt câu tiếng Việt dùng chung (subtitleUtils.ts), không dùng Caption.tsx
 * 22px của Shotcraft (đã REJECT trong docs/shotcraft-integration-audit.md). */
export const SubtitleBox: React.FC<SubtitleBoxProps> = ({ text, durationInFrames, highlightKeyword }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chunks = chunkSentences(text, 12);
  const startFrames = getChunkStartFrames(chunks, durationInFrames);

  let currentChunkIndex = 0;
  for (let i = 0; i < startFrames.length; i++) {
    if (frame >= startFrames[i]) currentChunkIndex = i;
  }

  const activeChunkText = chunks[currentChunkIndex] || "";
  const chunkRelativeFrame = frame - startFrames[currentChunkIndex];

  const scale = spring({ frame: chunkRelativeFrame, fps, config: { damping: 14, stiffness: 140, mass: 0.6 } });
  const opacity = interpolate(chunkRelativeFrame, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const words = activeChunkText.split(" ");

  return (
    <div style={{ transform: `scale(${scale})`, opacity, position: "absolute", left: 40, right: 40, bottom: 290, zIndex: 40, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 900, borderRadius: 32, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(15,118,110,0.3)", padding: "16px 32px", boxShadow: "0 12px 28px rgba(22,48,43,0.18)" }}>
        <p style={{ textAlign: "center", fontSize: 42, fontWeight: 800, lineHeight: 1.12, color: "#16302B" }}>
          {words.map((word, idx) => {
            const isKeyword = highlightKeyword && word.toLowerCase().includes(highlightKeyword.toLowerCase());
            return (
              <span key={idx} style={{ display: "inline-block", margin: "0 6px", color: isKeyword ? "#0F766E" : "#16302B" }}>
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};
