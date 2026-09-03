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

const formatNumber = (n: number) =>
  n.toLocaleString("vi-VN").replace(/\./g, ".");

/** Cảnh bom đạn: rung máy + chớp lửa + counter đạn pháo đếm lên 3.000/ngày */
export const Scene6Bombardment: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const img = imageManifest["scene6_hellfire"];

  const shells = Math.floor(
    interpolate(frame, [15, 130], [0, 3000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Chớp lửa cam-đỏ nhịp ngắn như đạn rơi
  const cycle = frame % 26;
  const flashOpacity = cycle < 2 ? 0.5 : cycle < 5 ? 0.14 : 0.04;

  const statScale = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 13, stiffness: 100 },
  });

  const areaOpacity = interpolate(frame, [90, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/QuangTri1972/scene6_hellfire.mp3")} />

      <FullBleedPhoto
        src={staticFile(img.file)}
        durationInFrames={durationInFrames}
        dim={0.6}
        direction="zoom-in"
        shake={1}
      />

      {/* Chớp lửa bom đạn */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(251,146,60,0.9), transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(239,68,68,0.8), transparent 50%)",
          opacity: flashOpacity,
        }}
      />

      <div className="relative z-40 flex flex-col items-center gap-8">
        <p className="text-4xl font-black tracking-[0.25em] text-red-300 uppercase">
          Đạn pháo trút xuống mỗi ngày
        </p>

        <div
          style={{ transform: `scale(${statScale})` }}
          className="flex items-baseline gap-4 rounded-3xl border-2 border-red-500/50 bg-black/55 px-16 py-8 backdrop-blur-md"
        >
          <span className="text-[200px] font-black leading-none text-amber-100 tabular-nums [text-shadow:0_0_60px_rgba(239,68,68,0.65)]">
            {formatNumber(shells)}
          </span>
          <span className="text-6xl font-black text-red-400">+</span>
        </div>

        <p
          style={{ opacity: areaOpacity }}
          className="rounded-full border border-amber-300/40 bg-black/50 px-10 py-4 text-4xl font-extrabold text-amber-200"
        >
          trên diện tích chưa đầy 2 km²
        </p>

        <p className="text-xl text-amber-100/50">
          Ảnh tư liệu: {img.credit} · {img.license} · Wikimedia
        </p>
      </div>

      <SubtitleHistory
        text="Mỗi ngày, hàng nghìn quả đạn pháo rơi xuống khu thành cổ chưa đầy hai cây số vuông. Tường thành kiên cố ba thế kỷ bị san phẳng, chỉ còn nền đất đỏ trơ và những hố bom sâu hoắm chồng chất nhau."
        durationInFrames={durationInFrames - 40}
        highlightKeyword="đạn pháo"
      />
    </AbsoluteFill>
  );
};
