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

  const brainPulse = 1 + Math.sin(frame / 8) * 0.04;
  const brainScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });

  const titleY = spring({ frame: frame - 20, fps, from: 60, to: 0, config: { damping: 14, stiffness: 90 } });
  const titleOpacity = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const warningOpacity = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const warningScale = spring({ frame: Math.max(0, frame - 80), fps, config: { damping: 10, stiffness: 120 } });

  const ageScale = spring({ frame: Math.max(0, frame - 140), fps, config: { damping: 8, stiffness: 150, mass: 0.6 } });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene1_hook.mp3")} />

      {/* Brain SVG */}
      <div
        style={{ transform: `scale(${brainScale * brainPulse})` }}
        className="relative mt-[-60px] flex h-[420px] w-[420px] items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="h-[380px] w-[380px]" fill="none">
          <ellipse cx="100" cy="95" rx="72" ry="78" fill="#E6F7F2" stroke="#0F766E" strokeWidth="3" />
          <path d="M60 60 Q80 40 100 55 Q120 40 140 60" stroke="#0F766E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55 85 Q75 70 100 80 Q125 70 145 85" stroke="#0F766E" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M60 110 Q80 95 100 105 Q120 95 140 110" stroke="#0F766E" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M100 55 L100 140" stroke="#FB7185" strokeWidth="2" strokeDasharray="6 4" opacity={0.7} />
          <circle cx="85" cy="90" r="12" fill="#FB7185" opacity={interpolate(frame, [60, 80], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          <circle cx="115" cy="90" r="12" fill="#FB7185" opacity={interpolate(frame, [60, 80], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </svg>
      </div>

      {/* Title */}
      <div style={{ transform: `translateY(${titleY}px)`, opacity: titleOpacity }} className="text-center px-12">
        <h1 className="text-[72px] font-black leading-[1.05] tracking-tight text-[#16302B]">
          <span className="text-[#FB7185]">PHÁ NÃO</span>
        </h1>
        <p className="mt-3 text-[38px] font-bold text-[#5B7A73]">
          Viên thuốc giảm cân TikTok
        </p>
      </div>

      {/* Warning badge */}
      <div style={{ opacity: warningOpacity, transform: `scale(${warningScale})` }} className="absolute top-[380px]">
        <div className="flex items-center gap-3 rounded-full bg-[#FB7185]/15 border border-[#FB7185]/30 px-7 py-3">
          <span className="h-3 w-3 rounded-full bg-[#FB7185]" style={{ opacity: 0.5 + Math.abs(Math.sin(frame / 6)) * 0.5 }} />
          <span className="text-[26px] font-black tracking-wider text-[#FB7185] uppercase">Cảnh báo y tế</span>
        </div>
      </div>

      {/* Age punch */}
      <div style={{ transform: `scale(${ageScale})` }} className="absolute bottom-[380px]">
        <span className="text-[96px] font-black text-[#0F766E]">21</span>
        <span className="ml-3 text-[36px] font-bold text-[#5B7A73]">tuổi</span>
      </div>

      <SubtitleBox
        text="Viên thuốc giảm 7 ký trong 7 ngày đang bán tràn lan trên TikTok. Và nó đã phá não một cô gái 21 tuổi."
        durationInFrames={228}
        highlightKeyword="phá não"
      />
    </AbsoluteFill>
  );
};
