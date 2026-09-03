import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { chunkSentences, getChunkStartFrames } from "../../lib/subtitleUtils";

interface SubtitleHistoryProps {
  text: string;
  durationInFrames: number;
  highlightKeyword?: string;
  className?: string;
}

/** Phụ đề 1 dòng tông tư liệu lịch sử (pill hổ phách) */
export const SubtitleHistory: React.FC<SubtitleHistoryProps> = ({
  text,
  durationInFrames,
  highlightKeyword,
  className = "mt-14",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1 câu = 1 dòng phụ đề; câu dài tự tách tại dấu phẩy
  const chunks = chunkSentences(text, 12);
  const startFrames = getChunkStartFrames(chunks, durationInFrames);

  let currentChunkIndex = 0;
  for (let i = 0; i < startFrames.length; i++) {
    if (frame >= startFrames[i]) currentChunkIndex = i;
  }
  const activeChunkText = chunks[currentChunkIndex] || "";
  const chunkRelativeFrame = frame - startFrames[currentChunkIndex];

  const scale = spring({
    frame: chunkRelativeFrame,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.6 },
  });
  const opacity = interpolate(chunkRelativeFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{ transform: `scale(${scale})`, opacity }}
      className={`z-40 flex items-center justify-center ${className}`}
    >
      <div className="flex max-w-[980px] items-center gap-4 rounded-[2.5rem] border-2 border-amber-400/45 bg-stone-950/95 px-10 py-5 shadow-[0_15px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        <span className="text-3xl select-none">🕯️</span>
        <p className="text-4xl font-black tracking-wide text-amber-50 leading-snug">
          {activeChunkText.split(" ").map((word, idx) => {
            const isKeyword =
              highlightKeyword &&
              word.toLowerCase().includes(highlightKeyword.toLowerCase());
            return (
              <span
                key={idx}
                className={`inline-block mx-2 ${
                  isKeyword
                    ? "text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]"
                    : "text-amber-50/95"
                }`}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};
