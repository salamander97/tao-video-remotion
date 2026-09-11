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

export const Scene10Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ctaScale = spring({ frame, fps, config: { damping: 10, stiffness: 90 } });
  const ctaY = spring({ frame, fps, from: 40, to: 0, config: { damping: 14, stiffness: 80 } });

  const disclaimerOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ opacity: fadeOut }}
      className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]"
    >
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene10_outro.mp3")} />

      {/* CTA */}
      <div style={{ transform: `scale(${ctaScale}) translateY(${ctaY}px)` }} className="text-center px-12">
        <div className="mb-8">
          <svg viewBox="0 0 80 80" className="mx-auto h-[100px] w-[100px]" fill="none">
            <circle cx="40" cy="40" r="35" fill="#0F766E" opacity={0.12} stroke="#0F766E" strokeWidth="2.5" />
            <path d="M28 40 L38 50 L55 30" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[52px] font-black leading-tight text-[#16302B]">
          Chia sẻ ngay
        </h2>
        <p className="mt-3 text-[32px] font-bold text-[#5B7A73]">
          Trước khi quá muộn
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ opacity: disclaimerOpacity }} className="absolute bottom-[380px] mx-12 max-w-[840px] rounded-2xl border border-[#5B7A73]/20 bg-white/80 px-8 py-4 backdrop-blur-md">
        <p className="text-center text-[22px] font-bold leading-snug text-[#5B7A73]">
          Thông tin trong video chỉ mang tính tham khảo.
          Hãy tham vấn bác sĩ trước khi dùng bất kỳ loại thuốc nào.
        </p>
      </div>

      <SubtitleBox
        text="Chia sẻ video này cho người thân trước khi quá muộn. Thông tin chỉ mang tính tham khảo, hãy tham vấn bác sĩ."
        durationInFrames={219}
        highlightKeyword="Chia sẻ"
      />
    </AbsoluteFill>
  );
};
