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

const STEPS = [
  {
    icon: "🔩",
    title: "DISASSEMBLY",
    desc: "Đọc code Assembly",
  },
  {
    icon: "🧠",
    title: "DECOMPILE",
    desc: "Dịch ngược thành pseudocode",
  },
  {
    icon: "🔍",
    title: "DEBUG ĐỘNG",
    desc: "Theo dõi chương trình chạy thật",
  },
];

export const Scene4Concept2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/ReverseEngineering/scene4_concept2.mp3")} />

      <h2
        style={{ transform: `scale(${titleScale})` }}
        className="mb-14 text-center text-6xl font-black tracking-tight"
      >
        QUY TRÌNH{" "}
        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          3 BƯỚC
        </span>
      </h2>

      <div className="flex flex-col gap-8">
        {STEPS.map((step, i) => {
          const stepX = spring({
            frame: frame - 10 - i * 18,
            fps,
            from: -140,
            to: 0,
            config: { damping: 14, stiffness: 90 },
          });
          const stepOpacity = interpolate(
            frame,
            [10 + i * 18, 22 + i * 18],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={step.title}
              style={{ transform: `translateX(${stepX}px)`, opacity: stepOpacity }}
              className="flex w-[860px] items-center gap-8 rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-600/20 text-5xl">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-3xl font-black text-slate-950">
                    {i + 1}
                  </span>
                  <p className="text-4xl font-black tracking-wide text-emerald-300">
                    {step.title}
                  </p>
                </div>
                <p className="mt-2 text-3xl font-semibold text-slate-200">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <SubtitleBox
        text="Quy trình gồm ba bước: disassembly để đọc assembly, decompile dịch ngược thành pseudocode, rồi debug động để theo dõi chương trình chạy thật."
        durationInFrames={242}
        highlightKeyword="decompile"
        className="mt-40"
      />
    </AbsoluteFill>
  );
};
