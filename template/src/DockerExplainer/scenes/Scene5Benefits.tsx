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

export const Scene5Benefits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Benefit 1
  const b1X = spring({
    frame: frame - 6,
    fps,
    from: -80,
    to: 0,
    config: { damping: 13, stiffness: 100 },
  });

  // Benefit 2
  const b2X = spring({
    frame: frame - 16,
    fps,
    from: -80,
    to: 0,
    config: { damping: 13, stiffness: 100 },
  });

  // Benefit 3
  const b3X = spring({
    frame: frame - 26,
    fps,
    from: -80,
    to: 0,
    config: { damping: 13, stiffness: 100 },
  });
  const activeBenefit = frame < 82 ? 0 : frame < 158 ? 1 : 2;
  const benefitStyle = (index: number, x: number) => ({
    opacity: activeBenefit === index ? 1 : 0.58,
    transform: `translateX(${x}px) scale(${activeBenefit === index ? 1.035 : 0.985})`,
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/DockerExplainer/scene5_benefits.mp3")} />

      {/* Top Header Badge */}
      <div
        style={{ transform: `scale(${badgeScale})` }}
        className="flex items-center gap-3 rounded-full border-2 border-emerald-400/50 bg-emerald-500/15 px-8 py-3.5 backdrop-blur-md"
      >
        <span className="text-3xl font-black tracking-wider text-emerald-300 uppercase">
          🏆 LÝ DO DOCKER CHIẾM LĨNH THẾ GIỚI
        </span>
      </div>

      {/* 3 Key Benefits */}
      <div className="mt-8 flex w-full max-w-[920px] flex-col gap-5">
        {/* Benefit 1 */}
        <div
          style={benefitStyle(0, b1X)}
          className="flex items-center gap-5 rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/40 p-5 shadow-xl backdrop-blur-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 font-mono text-lg font-black text-emerald-200">
            10×
          </div>
          <div>
            <h3 className="text-3xl font-black text-emerald-300">Nhẹ hơn Máy ảo 10x</h3>
            <p className="text-xl font-medium text-slate-300 mt-1">Dùng chung kernel OS, khởi động 1 giây</p>
          </div>
        </div>

        {/* Benefit 2 */}
        <div
          style={benefitStyle(1, b2X)}
          className="flex items-center gap-5 rounded-3xl border-2 border-sky-500/40 bg-sky-950/40 p-5 shadow-xl backdrop-blur-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/20 font-mono text-lg font-black text-sky-200">
            RAM
          </div>
          <div>
            <h3 className="text-3xl font-black text-sky-300">Tiết kiệm RAM &amp; CPU</h3>
            <p className="text-xl font-medium text-slate-300 mt-1">Tối ưu chi phí máy chủ hạ tầng</p>
          </div>
        </div>

        {/* Benefit 3 */}
        <div
          style={benefitStyle(2, b3X)}
          className="flex items-center gap-5 rounded-3xl border-2 border-purple-500/40 bg-purple-950/40 p-5 shadow-xl backdrop-blur-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 font-mono text-lg font-black text-purple-200">
            ANY
          </div>
          <div>
            <h3 className="text-3xl font-black text-purple-300">Deploy Mọi Nơi</h3>
            <p className="text-xl font-medium text-slate-300 mt-1">Chạy đồng nhất trên AWS, GCP, Azure, VPS</p>
          </div>
        </div>
      </div>

      {/* Subtitle 1 line right below benefits */}
      <SubtitleBox
        text="Nhẹ hơn máy ảo gấp 10 lần, tiết kiệm tài nguyên và dễ dàng deploy lên bất kỳ hệ thống đám mây nào như AWS hay GCP."
        durationInFrames={229}
        highlightKeyword="10 lần"
      />
    </AbsoluteFill>
  );
};
