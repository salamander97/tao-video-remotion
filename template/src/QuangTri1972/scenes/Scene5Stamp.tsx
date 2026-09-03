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
import { FullBleedPhoto } from "../components/FullBleedPhoto";
import { SubtitleHistory } from "../components/SubtitleHistory";
import { imageManifest } from "../imageData";

/** Khẩu quyết "Sống bám thành — chết kiên quyết" đóng dấu son đập xuống */
export const Scene5Stamp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const img = imageManifest["scene5_siege"];

  // Con dấu đập xuống ở frame ~30 với độ nảy mạnh
  const stampScale = spring({
    frame: frame - 28,
    fps,
    config: { damping: 9, stiffness: 210, mass: 1.6 },
  });
  const stampRotate = interpolate(frame, [28, 45], [-18, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Rung màn hình lúc dấu chạm đất
  const impact = frame > 30 && frame < 36 ? 1 : 0;

  const dateOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/QuangTri1972/scene5_siege.mp3")} />

      <FullBleedPhoto
        src={staticFile(img.file)}
        durationInFrames={durationInFrames}
        dim={0.66}
        direction="pan-right"
        shake={impact * 0.8}
      />

      <div className="relative z-40 flex flex-col items-center">
        {/* Con dấu son */}
        <div
          style={{
            transform: `rotate(${stampRotate}deg) scale(${stampScale})`,
          }}
          className="flex h-[420px] w-[420px] flex-col items-center justify-center rounded-[28px] border-[10px] border-red-600 bg-red-950/25 backdrop-blur-[2px]"
        >
          <p className="px-8 text-center text-6xl font-black leading-tight tracking-wide text-red-500 [text-shadow:0_0_30px_rgba(239,68,68,0.6)]">
            SỐNG
            <br />
            BÁM THÀNH
          </p>
          <div className="my-4 h-1.5 w-40 bg-red-500/80" />
          <p className="px-8 text-center text-6xl font-black leading-tight tracking-wide text-red-500 [text-shadow:0_0_30px_rgba(239,68,68,0.6)]">
            CHẾT
            <br />
            KIÊN QUYẾT
          </p>
        </div>

        <p
          style={{ opacity: dateOpacity }}
          className="mt-10 text-5xl font-black tracking-[0.2em] text-amber-100"
        >
          28 · 06 · 1972
        </p>
        <p
          style={{ opacity: creditOpacity(frame) }}
          className="mt-4 text-xl text-amber-100/50"
        >
          Ảnh tư liệu: {img.credit} · {img.license} · Wikimedia
        </p>
      </div>

      <SubtitleHistory
        text="Từ ngày hai mươi tám tháng Sáu, địch ồ ạt đánh chiếm thành cổ. Bộ đội của ta với quyết tâm sống bám thành, chết kiên quyết, bắt đầu cuộc phòng ngự tám mươi mốt ngày đêm đi vào lịch sử dân tộc."
        durationInFrames={durationInFrames - 40}
        highlightKeyword="kiên quyết"
        className="mt-10"
      />
    </AbsoluteFill>
  );
};

function creditOpacity(frame: number) {
  return interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}
