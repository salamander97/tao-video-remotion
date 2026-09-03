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
import { SceneTitle } from "../components/SceneTitle";
import { SubtitleHistory } from "../components/SubtitleHistory";

// Ngôi sao 5 cánh vàng (tâm 0,0, bán kính ngoài 54)
const STAR_POINTS =
  "0,-54 12.05,-16.58 51.4,-16.7 19.5,6.33 31.8,43.7 0,20.5 -31.8,43.7 -19.5,6.33 -51.4,-16.7 -12.05,-16.58";

/** Cảnh 16/9/1972: lá cờ đỏ sao vàng vẽ bằng SVG, phất nhẹ như đang tung bay */
export const Scene10Flag: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const flagScale = spring({
    frame: frame - 12,
    fps,
    config: { damping: 12, stiffness: 70, mass: 1 },
  });

  // Phất cờ: lệch nhẹ qua lại + gợn sóng bằng scaleY
  const wave = Math.sin(frame / 9);
  const skew = wave * 2.2;
  const ripple = 1 + Math.sin(frame / 7) * 0.015;

  const glow = interpolate(frame, [20, 60], [0.3, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dateScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/QuangTri1972/scene10_flag.mp3")} />

      <SceneTitle chapter="10" kicker="16.09.1972" title="LÁ CỜ TRỞ LẠI NÓC THÀNH" />

      {/* Cờ đỏ sao vàng */}
      <div
        style={{
          transform: `scale(${flagScale})`,
          filter: `drop-shadow(0 0 ${60 * glow}px rgba(239,68,68,0.8))`,
        }}
        className="relative"
      >
        <svg width="560" height="500" viewBox="0 0 560 500">
          {/* Bóng đổ dưới đất */}
          <ellipse cx="300" cy="470" rx="190" ry="18" fill="rgba(0,0,0,0.55)" />
          {/* Cột cờ */}
          <rect x="70" y="20" width="12" height="440" rx="4" fill="#d6d3d1" />
          <circle cx="76" cy="18" r="12" fill="#fbbf24" />
          {/* Lá cờ (nhóm wave) */}
          <g
            transform="translate(82, 40)"
            style={{
              transformBox: "fill-box",
              transformOrigin: "left center",
            }}
          >
            <g transform={`skewY(${skew}) scale(1, ${ripple})`}>
              <path
                d="M0 0 L460 0 L460 300 L0 300 Z"
                fill="#dc2626"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="2"
              />
              <g transform="translate(170, 150)">
                <polygon points={STAR_POINTS} fill="#fde047" />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Ngày tháng nổi bật */}
      <div
        style={{ transform: `scale(${dateScale})` }}
        className="mt-8 rounded-2xl border-2 border-amber-300/50 bg-red-950/60 px-12 py-6 backdrop-blur-md"
      >
        <p className="text-center text-7xl font-black tracking-widest text-amber-100">
          16 · 09 · 1972
        </p>
        <p className="mt-2 text-center text-3xl font-bold text-amber-200/80">
          Quyết chiến · Quyết thắng
        </p>
      </div>

      <SubtitleHistory
        text="Chiều mười sáu tháng Chín năm 1972, lá cờ quyết chiến quyết thắng lại tung bay trên nóc thành cổ. Tám mươi mốt ngày đêm thép khép lại trong vinh quang, làm rạng rỡ lịch sử dân tộc."
        durationInFrames={durationInFrames - 40}
        highlightKeyword="cờ"
        className="mt-10"
      />
    </AbsoluteFill>
  );
};
