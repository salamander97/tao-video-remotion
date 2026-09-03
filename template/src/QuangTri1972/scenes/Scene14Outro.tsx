import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SubtitleHistory } from "../components/SubtitleHistory";
import { imageManifest } from "../imageData";

export const Scene14Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const img = imageManifest["scene14_outro"];

  const cardScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const ctaScale = spring({
    frame: frame - 25,
    fps,
    config: { damping: 11, stiffness: 100, mass: 0.9 },
  });
  const heartBeat = 1 + Math.sin(frame / 6) * 0.08;
  const photoShift = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/QuangTri1972/scene14_outro.mp3")} />

      {/* Ảnh thành cổ hôm nay (pan chậm) */}
      <div
        style={{ transform: `scale(${cardScale})` }}
        className="relative h-[430px] w-[820px] overflow-hidden rounded-2xl border-2 border-amber-200/30 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
      >
        <Img
          src={staticFile(img.file)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${1.05 + photoShift * 0.1})`,
            filter: "sepia(0.15) contrast(1.05) saturate(0.9)",
          }}
          alt="Thành cổ Quảng Trị"
        />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(20,10,0,0.55)]" />
        <p className="absolute bottom-4 left-0 right-0 text-center text-2xl font-semibold text-amber-100/90">
          Thành cổ Quảng Trị hôm nay
        </p>
      </div>

      {/* Thông điệp tri ân */}
      <div
        style={{ transform: `scale(${ctaScale})` }}
        className="mt-10 flex max-w-[900px] flex-col items-center gap-5 rounded-3xl border-2 border-amber-400/50 bg-amber-500/10 p-9 text-center shadow-[0_0_80px_rgba(251,191,36,0.25)] backdrop-blur-xl"
      >
        <p className="text-5xl font-black leading-tight text-amber-50">
          TÔN VINH —{" "}
          <span className="bg-gradient-to-r from-amber-300 to-red-400 bg-clip-text text-transparent">
            TRI ÂN CÁC ANH
          </span>
        </p>
        <div className="flex items-center gap-8">
          <span className="text-5xl" style={{ transform: `scale(${heartBeat})` }}>
            ❤️
          </span>
          <p className="text-4xl font-black text-white">
            LIKE <span className="text-amber-400">•</span> SHARE{" "}
            <span className="text-amber-400">•</span> FOLLOW
          </p>
          <span className="text-5xl">🔔</span>
        </div>
      </div>

      <SubtitleHistory
        text="Nếu bạn thấy biết ơn thế hệ cha anh đã ngã xuống vì độc lập tự do của đất nước, hãy thả tim và follow kênh Lịch Sử Việt Nam."
        durationInFrames={durationInFrames - 30}
        className="mt-10"
      />
    </AbsoluteFill>
  );
};
