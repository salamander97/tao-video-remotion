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

/** Hook cinematic: ảnh thành cổ phủ full màn + counter đếm 1→81 khổng lồ */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const img = imageManifest["scene1_hook"];

  const count = Math.floor(
    interpolate(frame, [18, 100], [1, 81], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const titleScale = spring({
    frame: frame - 8,
    fps,
    config: { damping: 13, stiffness: 90 },
  });
  const glow = 0.5 + 0.3 * Math.sin(frame / 10);

  const creditOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/QuangTri1972/scene1_hook.mp3")} />

      <FullBleedPhoto
        src={staticFile(img.file)}
        durationInFrames={durationInFrames}
        dim={0.62}
        direction="zoom-out"
      />

      <div className="relative z-40 flex flex-col items-center">
        {/* Số 81 đếm lên */}
        <div
          style={{
            transform: `scale(${titleScale})`,
            textShadow: `0 0 ${90 * glow}px rgba(251,191,36,0.55)`,
          }}
          className="flex items-baseline gap-4"
        >
          <span className="text-[340px] font-black leading-none text-amber-100 tabular-nums">
            {count}
          </span>
          <span className="text-7xl font-black leading-tight text-amber-300">
            NGÀY
            <br />
            ĐÊM
          </span>
        </div>

        <h1
          style={{ transform: `scale(${titleScale})` }}
          className="mt-6 text-center text-7xl font-black tracking-tight"
        >
          <span className="bg-gradient-to-r from-amber-200 via-amber-50 to-red-300 bg-clip-text text-transparent">
            TRẬN THÀNH CỔ QUẢNG TRỊ
          </span>
        </h1>
        <p className="mt-3 text-4xl font-bold tracking-[0.35em] text-amber-200/80">
          MÙA HÈ ĐỎ LỬA 1972
        </p>

        <p
          style={{ opacity: creditOpacity }}
          className="mt-4 text-xl text-amber-100/50"
        >
          Ảnh tư liệu: {img.credit} · {img.license} · Wikimedia
        </p>
      </div>

      <SubtitleHistory
        text="Tám mươi mốt ngày đêm. Một tòa thành cổ ba trăm năm tuổi bị bom đạn san phẳng, nhưng lá cờ vẫn tung bay trên nóc thành. Đây là câu chuyện về trận Thành cổ Quảng Trị, mùa hè đỏ lửa năm 1972."
        durationInFrames={durationInFrames - 40}
        highlightKeyword="81"
      />
    </AbsoluteFill>
  );
};
