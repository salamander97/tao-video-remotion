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

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });

  const titleY = spring({
    frame: frame - 6,
    fps,
    from: 60,
    to: 0,
    config: { damping: 14, stiffness: 90 },
  });
  const titleOpacity = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const iconScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10, stiffness: 80 },
  });
  const floatOffset = Math.sin(frame / 12) * 15;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/ReverseEngineering/scene1_hook.mp3")} />

      {/* Top Badge */}
      <div
        style={{ transform: `scale(${badgeScale})` }}
        className="flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-8 py-3.5 backdrop-blur-md"
      >
        <span className="h-4 w-4 animate-ping rounded-full bg-emerald-400" />
        <span className="text-3xl font-black tracking-widest text-emerald-300 uppercase">
          SECURITY EXPLAINER
        </span>
      </div>

      {/* Center Visuals */}
      <div className="mt-10 flex flex-col items-center gap-6">
        {/* Floating Magnifier-over-binary Graphic */}
        <div
          style={{
            transform: `scale(${iconScale}) translateY(${floatOffset}px)`,
          }}
          className="relative flex h-52 w-52 items-center justify-center rounded-3xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/25 via-teal-600/15 to-transparent p-6 shadow-[0_0_90px_rgba(52,211,153,0.45)] backdrop-blur-xl"
        >
          <svg viewBox="0 0 100 100" className="h-36 w-36 drop-shadow-lg" fill="none">
            {/* binary bits */}
            <text x="18" y="30" fill="#6EE7B7" fontSize="11" fontFamily="monospace" fontWeight="bold">01001</text>
            <text x="18" y="44" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="bold">10110</text>
            <text x="18" y="58" fill="#10B981" fontSize="11" fontFamily="monospace" fontWeight="bold">01101</text>
            {/* magnifier */}
            <circle cx="58" cy="52" r="16" stroke="#A7F3D0" strokeWidth="4" />
            <line x1="70" y1="64" x2="84" y2="78" stroke="#A7F3D0" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Main Hook Titles */}
        <div
          style={{ transform: `translateY(${titleY}px)`, opacity: titleOpacity }}
          className="text-center"
        >
          <h1 className="text-7xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              REVERSE
            </span>{" "}
            <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
              ENGINEER
            </span>
          </h1>
          <p className="mt-4 text-4xl font-bold text-slate-200">
            Là gì? Vì sao hacker nào cũng phải biết?
          </p>
        </div>
      </div>

      <SubtitleBox
        text="Bạn có biết các hacker và chuyên gia bảo mật đọc được bên trong một phần mềm đóng gói mà không có mã nguồn không?"
        durationInFrames={256}
        highlightKeyword="bảo mật"
        className="mt-64"
      />
    </AbsoluteFill>
  );
};
