import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { chunkSentences, getChunkStartFrames } from "../../lib/subtitleUtils";

interface SubtitleBoxProps {
  text: string;
  durationInFrames: number;
  highlightKeyword?: string;
}

export const SubtitleBox: React.FC<SubtitleBoxProps> = ({
  text,
  durationInFrames,
  highlightKeyword,
}) => {
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

  const scale = spring({
    frame: chunkRelativeFrame,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.6 },
  });

  const opacity = interpolate(chunkRelativeFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = activeChunkText.split(" ");

  return (
    <div
      style={{ transform: `scale(${scale})`, opacity }}
      className="pointer-events-none absolute inset-x-10 bottom-[290px] z-40 flex items-center justify-center"
    >
      <div className="flex max-w-[900px] items-center rounded-[2rem] border border-teal-600/20 bg-white/92 px-8 py-4 shadow-[0_8px_24px_rgba(15,118,110,0.12)] backdrop-blur-xl">
        <p className="text-center text-[42px] font-bold leading-[1.15] tracking-wide text-[#16302B]">
          {words.map((word, idx) => {
            const isKeyword =
              highlightKeyword &&
              word.toLowerCase().includes(highlightKeyword.toLowerCase());
            return (
              <span
                key={idx}
                className={`inline-block mx-1.5 ${
                  isKeyword
                    ? "text-[#0F766E] font-extrabold drop-shadow-[0_0_10px_rgba(15,118,110,0.4)]"
                    : "text-[#16302B]"
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
