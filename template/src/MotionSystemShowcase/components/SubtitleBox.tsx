import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { chunkSentences, getChunkStartFrames } from "../../lib/subtitleUtils";

interface SubtitleBoxProps {
  text: string;
  durationInFrames: number;
  highlightKeyword?: string;
}

/** Giữ nguyên hệ phụ đề hiện có (ngắt câu tiếng Việt, safe-zone đáy) — không
 * dùng Caption.tsx 22px của Shotcraft (đã REJECT trong audit, mục 3 #8). */
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
    <div
      style={{ transform: `scale(${scale})`, opacity, position: "absolute", left: 40, right: 40, bottom: 290, zIndex: 40, display: "flex", justifyContent: "center" }}
    >
      <div style={{ maxWidth: 900, borderRadius: 32, background: "rgba(2,6,23,0.88)", border: "1px solid rgba(125,211,252,0.35)", padding: "16px 32px", boxShadow: "0 12px 28px rgba(0,0,0,0.55)" }}>
        <p style={{ textAlign: "center", fontSize: 42, fontWeight: 800, lineHeight: 1.12, color: "#E0F2FE" }}>
          {words.map((word, idx) => {
            const isKeyword = highlightKeyword && word.toLowerCase().includes(highlightKeyword.toLowerCase());
            return (
              <span key={idx} style={{ display: "inline-block", margin: "0 6px", color: isKeyword ? "#FCD34D" : "#E0F2FE" }}>
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};
