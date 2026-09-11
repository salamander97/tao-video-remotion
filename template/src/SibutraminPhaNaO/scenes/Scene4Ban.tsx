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

export const Scene4Ban: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineProgress = interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fdaOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fdaScale = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 12, stiffness: 100 } });

  const vnOpacity = interpolate(frame, [130, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vnScale = spring({ frame: Math.max(0, frame - 130), fps, config: { damping: 12, stiffness: 100 } });

  const stampFrame = Math.max(0, frame - 220);
  const stampOpacity = interpolate(stampFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampScale = spring({ frame: stampFrame, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } });
  const stampRotate = interpolate(stampFrame, [0, 10], [-25, -8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lawOpacity = interpolate(frame, [290, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene4_ban.mp3")} />

      {/* Timeline */}
      <div className="relative flex h-[500px] w-[880px] items-center justify-center">
        <svg viewBox="0 0 440 250" className="h-full w-full" fill="none">
          {/* Timeline line */}
          <line x1="60" y1="125" x2={60 + 320 * lineProgress} y2="125" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" />

          {/* FDA node */}
          <g opacity={fdaOpacity} style={{ transform: `scale(${fdaScale})`, transformOrigin: "120px 125px" }}>
            <circle cx="120" cy="125" r="14" fill="#2563EB" />
            <circle cx="120" cy="125" r="8" fill="white" />
            <text x="120" y="95" textAnchor="middle" fill="#2563EB" fontSize="16" fontWeight="800">FDA</text>
            <text x="120" y="160" textAnchor="middle" fill="#16302B" fontSize="13" fontWeight="600">10/2010</text>
            <text x="120" y="178" textAnchor="middle" fill="#5B7A73" fontSize="11">Rút Meridia</text>
          </g>

          {/* Vietnam node */}
          <g opacity={vnOpacity} style={{ transform: `scale(${vnScale})`, transformOrigin: "300px 125px" }}>
            <circle cx="300" cy="125" r="14" fill="#0F766E" />
            <circle cx="300" cy="125" r="8" fill="white" />
            <text x="300" y="95" textAnchor="middle" fill="#0F766E" fontSize="16" fontWeight="800">VIỆT NAM</text>
            <text x="300" y="160" textAnchor="middle" fill="#16302B" fontSize="13" fontWeight="600">04/2011</text>
            <text x="300" y="178" textAnchor="middle" fill="#5B7A73" fontSize="11">Đình chỉ toàn quốc</text>
          </g>
        </svg>
      </div>

      {/* BAN stamp */}
      <div
        style={{
          opacity: stampOpacity,
          transform: `scale(${stampScale}) rotate(${stampRotate}deg)`,
        }}
        className="absolute top-[340px]"
      >
        <div className="rounded-xl border-4 border-[#FB7185] bg-[#FB7185]/10 px-10 py-4">
          <span className="text-[56px] font-black tracking-[0.2em] text-[#FB7185]">CẤM</span>
        </div>
      </div>

      {/* Law reference */}
      <div style={{ opacity: lawOpacity }} className="absolute bottom-[370px]">
        <span className="text-[20px] font-bold text-[#5B7A73]">Công văn 5149/QLD-CL · Thông tư 10/2021/TT-BYT</span>
      </div>

      <SubtitleBox
        text="Thế giới phản ứng ngay. FDA rút thuốc tháng 10 năm 2010. Việt Nam đình chỉ toàn quốc tháng 4 năm 2011."
        durationInFrames={359}
        highlightKeyword="CẤM"
      />
    </AbsoluteFill>
  );
};
