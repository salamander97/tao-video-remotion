import React from "react";
import {
  AbsoluteFill,
  Audio,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SubtitleBox } from "../components/SubtitleBox";

export const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const messageScale = spring({
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

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/ReverseEngineering/scene6_outro.mp3")} />

      {/* Key message */}
      <div
        style={{ transform: `scale(${messageScale})` }}
        className="flex max-w-[900px] flex-col items-center gap-6 rounded-3xl border-2 border-emerald-400/50 bg-emerald-500/10 p-12 text-center shadow-[0_0_80px_rgba(52,211,153,0.35)] backdrop-blur-xl"
      >
        <span className="text-7xl">🕵️‍♂️</span>
        <p className="text-5xl font-black leading-tight">
          Muốn thành{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            chuyên gia bảo mật
          </span>
          ?
        </p>
        <p className="text-4xl font-bold text-slate-200">
          Hãy bắt đầu với Reverse Engineer ngay hôm nay!
        </p>
      </div>

      {/* CTA */}
      <div
        style={{ transform: `scale(${ctaScale})` }}
        className="mt-14 flex items-center gap-8"
      >
        <span
          className="text-6xl"
          style={{ transform: `scale(${heartBeat})` }}
        >
          ❤️
        </span>
        <p className="text-4xl font-black text-white">
          LIKE <span className="text-emerald-400">•</span> SHARE{" "}
          <span className="text-emerald-400">•</span> FOLLOW
        </p>
        <span className="text-6xl">🔔</span>
      </div>

      <SubtitleBox
        text="Nhớ thả tim và follow kênh để đón xem video tiếp theo nhé!"
        durationInFrames={200}
      />
    </AbsoluteFill>
  );
};
