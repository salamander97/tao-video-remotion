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

export const Scene6Case: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const brainIn = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const thalamusOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const damagePulse = 0.3 + Math.abs(Math.sin(frame / 6)) * 0.5;
  const hospitalOpacity = interpolate(frame, [180, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const severityOpacity = interpolate(frame, [240, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene6_case.mp3")} />

      {/* Brain with thalamus damage */}
      <div style={{ transform: `scale(${brainIn})` }} className="relative flex h-[480px] w-[580px] items-center justify-center">
        <svg viewBox="0 0 280 280" className="h-full w-full" fill="none">
          {/* Brain outline - sagittal view */}
          <path
            d="M140 30 C60 30 25 80 25 140 C25 200 60 250 140 250 C200 250 240 210 245 160 C250 120 230 70 200 45 C180 30 160 30 140 30Z"
            fill="#E6F7F2"
            stroke="#0F766E"
            strokeWidth="3"
          />
          {/* Brain folds */}
          <path d="M80 70 Q110 50 140 65 Q170 50 200 70" stroke="#0F766E" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M65 100 Q100 80 140 95 Q180 80 215 100" stroke="#0F766E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M60 135 Q95 115 140 130 Q185 115 220 135" stroke="#0F766E" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Thalamus region */}
          <g opacity={thalamusOpacity}>
            <ellipse cx="125" cy="150" rx="22" ry="16" fill="#FB7185" opacity={damagePulse} />
            <ellipse cx="155" cy="150" rx="22" ry="16" fill="#FB7185" opacity={damagePulse} />
            <ellipse cx="125" cy="150" rx="22" ry="16" stroke="#FB7185" strokeWidth="2" fill="none" />
            <ellipse cx="155" cy="150" rx="22" ry="16" stroke="#FB7185" strokeWidth="2" fill="none" />
          </g>

          {/* Label line */}
          <line x1="177" y1="150" x2="230" y2="130" stroke="#FB7185" strokeWidth="1.5" opacity={thalamusOpacity} />
          <text x="232" y="128" fill="#FB7185" fontSize="13" fontWeight="700" opacity={thalamusOpacity}>Đồi thị</text>
          <text x="232" y="145" fill="#FB7185" fontSize="11" fontWeight="600" opacity={thalamusOpacity}>(Thalamus)</text>
        </svg>
      </div>

      {/* Age + city label */}
      <div className="absolute top-[200px] left-[60px]">
        <span className="text-[48px] font-black text-[#16302B]">21</span>
        <span className="ml-2 text-[26px] font-bold text-[#5B7A73]">tuổi · Hà Nội</span>
      </div>

      {/* Hospital stamp */}
      <div style={{ opacity: hospitalOpacity }} className="absolute bottom-[400px] left-[80px]">
        <div className="rounded-lg border-2 border-[#2563EB]/30 bg-[#2563EB]/8 px-5 py-2">
          <span className="text-[22px] font-black text-[#2563EB]">BV Bạch Mai</span>
          <p className="text-[16px] font-bold text-[#5B7A73]">Trung tâm Chống độc</p>
        </div>
      </div>

      {/* Severity label */}
      <div style={{ opacity: severityOpacity }} className="absolute bottom-[370px] right-[80px]">
        <div className="rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 px-6 py-3">
          <span className="text-[26px] font-black text-[#FB7185]">TỔN THƯƠNG NÃO NẶNG</span>
        </div>
      </div>

      <SubtitleBox
        text="Một cô gái 21 tuổi ở Hà Nội mua thuốc giảm cân trên TikTok. Uống hơn một tháng, rồi cô bất tỉnh. Bệnh viện Bạch Mai chẩn đoán: tổn thương não nặng."
        durationInFrames={316}
        highlightKeyword="tổn thương não"
      />
    </AbsoluteFill>
  );
};
