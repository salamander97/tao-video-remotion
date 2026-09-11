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

export const Scene3Scout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numScale = spring({ frame, fps, config: { damping: 10, stiffness: 100 } });
  const numValue = Math.round(interpolate(frame, [0, 40], [0, 10742], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const percentOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const percentScale = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 8, stiffness: 130 } });
  const percentValue = Math.round(interpolate(frame, [50, 80], [0, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const barProgress = interpolate(frame, [110, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nejmOpacity = interpolate(frame, [180, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene3_scout.mp3")} />

      {/* SCOUT label */}
      <div className="absolute top-[200px]">
        <span className="text-[32px] font-black tracking-[0.3em] text-[#5B7A73] uppercase">Thử nghiệm SCOUT</span>
      </div>

      {/* Big number: patients */}
      <div style={{ transform: `scale(${numScale})` }} className="mt-[40px] text-center">
        <span className="text-[120px] font-black tabular-nums text-[#16302B] leading-none">
          {numValue.toLocaleString()}
        </span>
        <p className="mt-2 text-[30px] font-bold text-[#5B7A73]">bệnh nhân tham gia</p>
      </div>

      {/* 16% risk */}
      <div style={{ opacity: percentOpacity, transform: `scale(${percentScale})` }} className="mt-[30px] text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-[96px] font-black text-[#FB7185] leading-none">+{percentValue}%</span>
        </div>
        <p className="mt-1 text-[28px] font-bold text-[#16302B]">nguy cơ biến cố tim mạch</p>
      </div>

      {/* Bar chart */}
      <div className="mt-[30px] flex items-end gap-8">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-[80px] rounded-t-lg bg-[#0F766E]/30"
            style={{ height: `${barProgress * 100}px` }}
          />
          <span className="text-[20px] font-bold text-[#5B7A73]">Giả dược</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-[80px] rounded-t-lg bg-[#FB7185]"
            style={{ height: `${barProgress * 140}px` }}
          />
          <span className="text-[20px] font-bold text-[#FB7185]">Sibutramin</span>
        </div>
      </div>

      {/* NEJM stamp */}
      <div style={{ opacity: nejmOpacity }} className="absolute bottom-[370px] right-[80px]">
        <div className="rounded-lg border-2 border-[#2563EB]/30 bg-[#2563EB]/8 px-5 py-2">
          <span className="text-[22px] font-black text-[#2563EB]">NEJM 2010</span>
        </div>
      </div>

      <SubtitleBox
        text="Nhưng thử nghiệm SCOUT trên 10.742 bệnh nhân đã vạch trần: Sibutramin tăng 16 phần trăm nguy cơ nhồi máu cơ tim và đột quỵ."
        durationInFrames={248}
        highlightKeyword="16"
      />
    </AbsoluteFill>
  );
};
