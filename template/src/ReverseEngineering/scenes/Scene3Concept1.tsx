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

export const Scene3Concept1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  // Left (compiled) -> Right (source) flow
  const arrowProgress = interpolate(frame, [20, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leftCardX = spring({
    frame: frame - 8,
    fps,
    from: -120,
    to: 0,
    config: { damping: 14, stiffness: 90 },
  });
  const rightCardX = spring({
    frame: frame - 20,
    fps,
    from: 120,
    to: 0,
    config: { damping: 14, stiffness: 90 },
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/ReverseEngineering/scene3_concept1.mp3")} />

      <h2
        style={{ transform: `scale(${titleScale})` }}
        className="mb-12 text-center text-6xl font-black tracking-tight"
      >
        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          PHÂN TÍCH NGƯỢC
        </span>{" "}
        là gì?
      </h2>

      {/* Two cards + arrow */}
      <div className="flex items-center gap-10">
        {/* Compiled binary */}
        <div
          style={{ transform: `translateX(${leftCardX}px)` }}
          className="flex h-72 w-[380px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-slate-500/50 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl"
        >
          <span className="rounded-xl bg-slate-800 px-4 py-3 font-mono text-2xl font-black text-slate-200">BIN</span>
          <p className="text-3xl font-black text-slate-300">CHƯƠNG TRÌNH</p>
          <p className="text-3xl font-black text-slate-300">ĐÃ BIÊN DỊCH</p>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-400/70">010110...</p>
        </div>

        {/* Reverse arrow */}
        <div className="relative flex flex-col items-center">
          <div className="h-3 w-56 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${arrowProgress * 100}%` }}
            />
          </div>
          <span className="mt-2 text-4xl font-black text-emerald-300">⟵ SUY NGƯỢC</span>
        </div>

        {/* Recovered source */}
        <div
          style={{ transform: `translateX(${rightCardX}px)` }}
          className="flex h-72 w-[380px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-emerald-400/50 bg-emerald-500/10 p-8 shadow-[0_0_60px_rgba(52,211,153,0.35)] backdrop-blur-xl"
        >
          <span className="rounded-xl bg-emerald-500/20 px-4 py-3 font-mono text-2xl font-black text-emerald-200">SRC</span>
          <p className="text-3xl font-black text-emerald-300">LOGIC &amp; THUẬT TOÁN</p>
          <p className="font-mono text-2xl font-bold text-emerald-200">if (key == true)</p>
        </div>
      </div>

      <SubtitleBox
        text="Reverse Engineer là kỹ thuật phân tích ngược: từ chương trình đã biên dịch, suy ngược lại logic, thuật toán và cả mã nguồn ban đầu."
        durationInFrames={232}
        highlightKeyword="phân tích ngược"
      />
    </AbsoluteFill>
  );
};
