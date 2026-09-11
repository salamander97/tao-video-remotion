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

const checks = [
  { text: "Số đăng ký Bộ Y tế", frame: 40 },
  { text: "Không mua thuốc online trôi nổi", frame: 90 },
  { text: "Tham vấn bác sĩ trước khi dùng", frame: 140 },
];

export const Scene9Protect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shieldScale = spring({ frame, fps, config: { damping: 10, stiffness: 90 } });
  const shieldPulse = 1 + Math.sin(frame / 12) * 0.03;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene9_protect.mp3")} />

      {/* Shield */}
      <div style={{ transform: `scale(${shieldScale * shieldPulse})` }} className="mt-[-40px]">
        <svg viewBox="0 0 160 180" className="h-[200px] w-[180px]" fill="none">
          <path
            d="M80 10 L150 45 L150 100 Q150 155 80 175 Q10 155 10 100 L10 45 Z"
            fill="#0F766E"
            opacity={0.12}
            stroke="#0F766E"
            strokeWidth="3"
          />
          <path
            d="M80 30 L130 55 L130 95 Q130 140 80 155 Q30 140 30 95 L30 55 Z"
            fill="#0F766E"
            opacity={0.08}
          />
          {/* Check mark */}
          <path d="M55 90 L72 110 L110 65" stroke="#0F766E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Title */}
      <div className="mt-[20px] text-center">
        <span className="text-[36px] font-black text-[#0F766E]">Cách bảo vệ bản thân</span>
      </div>

      {/* Checklist */}
      <div className="mt-[40px] flex flex-col gap-5 px-16 w-full max-w-[800px]">
        {checks.map((c, i) => {
          const opacity = interpolate(frame, [c.frame, c.frame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const x = spring({ frame: Math.max(0, frame - c.frame), fps, from: -40, to: 0, config: { damping: 14, stiffness: 100 } });
          const checkScale = spring({ frame: Math.max(0, frame - c.frame - 10), fps, config: { damping: 8, stiffness: 140 } });

          return (
            <div
              key={i}
              style={{ opacity, transform: `translateX(${x}px)` }}
              className="flex items-center gap-5 rounded-2xl bg-white border-2 border-[#0F766E]/20 px-7 py-4 shadow-sm"
            >
              <div style={{ transform: `scale(${checkScale})` }} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F766E]">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                  <path d="M5 12 L10 17 L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[26px] font-bold text-[#16302B]">{c.text}</span>
            </div>
          );
        })}
      </div>

      <SubtitleBox
        text="Chỉ dùng thuốc có số đăng ký Bộ Y tế. Tuyệt đối không mua thuốc giảm cân rao bán thần tốc trên mạng xã hội."
        durationInFrames={212}
        highlightKeyword="Bộ Y tế"
      />
    </AbsoluteFill>
  );
};
