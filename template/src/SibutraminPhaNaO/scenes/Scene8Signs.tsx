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

const symptoms = [
  { label: "Tim đập nhanh", y: 340, x: 260, icon: "♥", frame: 30 },
  { label: "Chóng mặt", y: 230, x: 340, icon: "◎", frame: 75 },
  { label: "Mất ngủ", y: 210, x: 340, icon: "☾", frame: 120 },
  { label: "Khô miệng", y: 260, x: 340, icon: "◊", frame: 165 },
];

export const Scene8Signs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bodyIn = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const bodyPulse = 1 + Math.sin(frame / 10) * 0.015;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene8_signs.mp3")} />

      {/* Title */}
      <div className="absolute top-[190px]">
        <span className="text-[32px] font-black text-[#16302B]">Dấu hiệu cảnh báo</span>
      </div>

      {/* Body silhouette */}
      <div style={{ transform: `scale(${bodyIn * bodyPulse})` }} className="relative mt-[20px]">
        <svg viewBox="0 0 200 360" className="h-[440px] w-[240px]" fill="none">
          {/* Head */}
          <circle cx="100" cy="50" r="35" fill="#E6F7F2" stroke="#0F766E" strokeWidth="2.5" />
          {/* Neck */}
          <rect x="88" y="85" width="24" height="20" rx="8" fill="#E6F7F2" stroke="#0F766E" strokeWidth="2" />
          {/* Torso */}
          <path d="M55 105 Q50 105 48 115 L40 220 Q38 240 55 245 L145 245 Q162 240 160 220 L152 115 Q150 105 145 105 Z" fill="#E6F7F2" stroke="#0F766E" strokeWidth="2.5" />
          {/* Arms */}
          <path d="M48 115 Q25 130 20 180 Q18 200 25 210" stroke="#0F766E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M152 115 Q175 130 180 180 Q182 200 175 210" stroke="#0F766E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Legs */}
          <path d="M70 245 L60 340 Q58 355 70 355" stroke="#0F766E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M130 245 L140 340 Q142 355 130 355" stroke="#0F766E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Heart area pulse */}
          <circle cx="110" cy="150" r="15" fill="#FB7185" opacity={interpolate(frame, [30, 45], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (0.5 + Math.abs(Math.sin(frame / 4)) * 0.5)} />
        </svg>
      </div>

      {/* Symptom callouts */}
      {symptoms.map((s, i) => {
        const opacity = interpolate(frame, [s.frame, s.frame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const scale = spring({ frame: Math.max(0, frame - s.frame), fps, config: { damping: 10, stiffness: 120 } });
        const isLeft = i % 2 === 0;

        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `scale(${scale})`,
              position: "absolute",
              top: s.y,
              ...(isLeft ? { left: 60 } : { right: 60 }),
            }}
          >
            <div className={`flex items-center gap-3 rounded-xl bg-white border-2 border-[#FB7185]/30 px-5 py-3 shadow-sm ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
              <span className="text-[32px] text-[#FB7185]">{s.icon}</span>
              <span className="text-[24px] font-bold text-[#16302B]">{s.label}</span>
            </div>
          </div>
        );
      })}

      {/* Bottom message */}
      <div style={{ opacity: interpolate(frame, [200, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} className="absolute bottom-[370px]">
        <div className="rounded-full bg-[#FB7185]/10 border border-[#FB7185]/25 px-8 py-3">
          <span className="text-[26px] font-black text-[#FB7185]">Cơ thể đang KÊU CỨU</span>
        </div>
      </div>

      <SubtitleBox
        text="Tim đập nhanh, chóng mặt, mất ngủ triền miên, khô miệng. Đó không phải giảm cân, đó là cơ thể đang kêu cứu."
        durationInFrames={239}
        highlightKeyword="kêu cứu"
      />
    </AbsoluteFill>
  );
};
