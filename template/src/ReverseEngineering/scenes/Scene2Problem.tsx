import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SubtitleBox } from "../components/SubtitleBox";

const BINARY_LINES = [
  "01001000 01101001 00100001",
  "10110010 01001110 11001011",
  "01110001 10010101 00110110",
  "11010010 01011010 10001101",
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });

  const warnScale = spring({
    frame: frame - 12,
    fps,
    config: { damping: 10, stiffness: 90 },
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/ReverseEngineering/scene2_problem.mp3")} />

      <div
        style={{ transform: `scale(${cardScale})` }}
        className="flex w-[880px] flex-col items-center gap-8 rounded-3xl border border-white/20 bg-white/10 p-10 shadow-2xl backdrop-blur-xl"
      >
        {/* Binary card */}
        <div className="w-full rounded-2xl border border-emerald-400/30 bg-slate-950/80 p-8 font-mono">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-red-500" />
            <span className="h-4 w-4 rounded-full bg-amber-400" />
            <span className="h-4 w-4 rounded-full bg-emerald-400" />
            <span className="ml-4 text-2xl font-bold text-slate-400">app_binary.exe</span>
          </div>
          {BINARY_LINES.map((line, i) => (
            <p
              key={i}
              className="text-3xl font-bold tracking-wider text-emerald-300/80"
              style={{
                opacity: interpolate(frame, [10 + i * 6, 20 + i * 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Confusion warning */}
        <div
          style={{ transform: `scale(${warnScale})` }}
          className="flex items-center gap-5 rounded-2xl border-2 border-amber-400/50 bg-amber-500/10 px-8 py-5"
        >
          <span className="text-6xl">😵</span>
          <p className="text-4xl font-extrabold text-amber-300">
            Chỉ toàn 0 và 1... biết nó làm gì đây?
          </p>
        </div>
      </div>

      <SubtitleBox
        text="Khi tải một file app hay exe về, bạn chỉ thấy mã máy 0 và 1 hoàn toàn khó hiểu."
        durationInFrames={261}
        highlightKeyword="mã máy"
        className="mt-64"
      />
    </AbsoluteFill>
  );
};
