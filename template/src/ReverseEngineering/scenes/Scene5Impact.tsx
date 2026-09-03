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

const USE_CASES = [
  { icon: "CVE", label: "Tìm lỗ hổng bảo mật" },
  { icon: "MAL", label: "Phân tích malware" },
  { icon: "KEY", label: "Nghiên cứu crack phần mềm" },
  { icon: "APK", label: "Reverse game mobile" },
];

export const Scene5Impact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/ReverseEngineering/scene5_impact.mp3")} />

      <h2
        style={{ transform: `scale(${titleScale})` }}
        className="mb-14 text-center text-6xl font-black tracking-tight"
      >
        ỨNG DỤNG{" "}
        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          THỰC TẾ
        </span>
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {USE_CASES.map((useCase, i) => {
          const cardScale = spring({
            frame: frame - 10 - i * 14,
            fps,
            config: { damping: 12, stiffness: 110, mass: 0.8 },
          });

          return (
            <div
              key={useCase.label}
              style={{ transform: `scale(${cardScale})` }}
              className="flex h-64 w-[430px] flex-col items-center justify-center gap-5 rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <span className="rounded-2xl bg-emerald-500/15 px-5 py-4 font-mono text-3xl font-black tracking-wider text-emerald-200">{useCase.icon}</span>
              <p className="text-center text-3xl font-extrabold text-slate-100">
                {useCase.label}
              </p>
            </div>
          );
        })}
      </div>

      <SubtitleBox
        text="Kỹ thuật này được dùng để tìm lỗ hổng bảo mật, phân tích malware, crack phần mềm và cả reverse game mobile."
        durationInFrames={223}
        highlightKeyword="malware"
      />
    </AbsoluteFill>
  );
};
