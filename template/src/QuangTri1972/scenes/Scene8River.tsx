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

/** Sông Thạch Hãn: ảnh full-bleed + dòng chữ khổng lồ trôi lên như tưởng niệm */
export const Scene8River: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const img = imageManifest["scene8_thachhan"];

  const titleY = spring({
    frame: frame - 12,
    fps,
    from: 90,
    to: 0,
    config: { damping: 15, stiffness: 60 },
  });
  const titleOpacity = interpolate(frame, [12, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Float nhẹ như khói hương
  const drift = Math.sin(frame / 26) * 10;

  const line2Opacity = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/QuangTri1972/scene8_thachhan.mp3")} />

      <FullBleedPhoto
        src={staticFile(img.file)}
        durationInFrames={durationInFrames}
        dim={0.58}
        direction="pan-left"
      />

      <div className="relative z-40 flex flex-col items-center">
        <div
          style={{
            transform: `translateY(${titleY + drift}px)`,
            opacity: titleOpacity,
          }}
          className="text-center"
        >
          <p className="text-3xl font-black tracking-[0.4em] text-amber-300/90 uppercase">
            Sông Thạch Hãn
          </p>
          <h2 className="mt-5 text-9xl font-black leading-[1.05] tracking-tight [text-shadow:0_0_70px_rgba(0,0,0,0.9)]">
            <span className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-300/80 bg-clip-text text-transparent">
              MÃI MÃI
              <br />
              TUỔI HAI MƯƠI
            </span>
          </h2>
        </div>

        <p
          style={{ opacity: line2Opacity }}
          className="mt-8 rounded-full border border-amber-200/40 bg-black/45 px-10 py-4 text-3xl font-semibold italic text-amber-100/90 backdrop-blur-sm"
        >
          "Từng người một băng qua lũ lửa đạn..."
        </p>

        <p className="mt-6 text-xl text-amber-100/50">
          Ảnh: {img.credit} · {img.license} · Wikimedia
        </p>
      </div>

      <SubtitleHistory
        text="Phía trước thành cổ là sông Thạch Hãn. Trong lũ đạn pháo, từng người một, các chiến sĩ băng qua dòng sông để vào thành. Nhiều người đã nằm lại mãi mãi bên dòng sông hiền hòa ấy, mãi mãi ở tuổi hai mươi."
        durationInFrames={durationInFrames - 40}
        highlightKeyword="Thạch Hãn"
        className="mt-10"
      />
    </AbsoluteFill>
  );
};
