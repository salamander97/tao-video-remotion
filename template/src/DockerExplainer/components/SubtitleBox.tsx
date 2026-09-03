import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { chunkSentences, getChunkStartFrames } from "../../lib/subtitleUtils";

interface SubtitleBoxProps {
  text: string;
  durationInFrames: number;
  highlightKeyword?: string;
  className?: string;
}

export const SubtitleBox: React.FC<SubtitleBoxProps> = ({
  text,
  durationInFrames,
  highlightKeyword,
  className = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1 câu = 1 dòng phụ đề; câu dài tự tách tại dấu phẩy
  const chunks = chunkSentences(text, 12);
  const startFrames = getChunkStartFrames(chunks, durationInFrames);

  // Determine current active chunk index
  let currentChunkIndex = 0;
  for (let i = 0; i < startFrames.length; i++) {
    if (frame >= startFrames[i]) currentChunkIndex = i;
  }

  const activeChunkText = chunks[currentChunkIndex] || "";
  const chunkRelativeFrame = frame - startFrames[currentChunkIndex];

  // Spring pop-in for each chunk change
  const scale = spring({
    frame: chunkRelativeFrame,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.6 },
  });

  const opacity = interpolate(
    chunkRelativeFrame,
    [0, 4],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const words = activeChunkText.split(" ");
  const overlayClassName = className.replace(/\bmt-\d+\b/g, "").trim();

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
      className={`pointer-events-none absolute inset-x-10 bottom-[290px] z-40 flex items-center justify-center ${overlayClassName}`}
    >
      <div className="flex max-w-[900px] items-center rounded-[2rem] border border-sky-300/35 bg-slate-950/88 px-8 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <p className="text-center text-[42px] font-black leading-[1.12] tracking-wide text-slate-100">
          {words.map((word, idx) => {
            const isKeyword =
              highlightKeyword &&
              word.toLowerCase().includes(highlightKeyword.toLowerCase());

            return (
              <span
                key={idx}
                className={`inline-block mx-2 ${
                  isKeyword
                    ? "text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]"
                    : "text-sky-100"
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
