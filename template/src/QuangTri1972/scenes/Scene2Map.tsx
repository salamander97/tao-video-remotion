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

const VIETNAM_PATH =
  "M225 30 C195 62 158 96 165 132 C170 160 202 168 208 196 C214 224 178 244 174 274 C170 304 208 312 222 342 C236 372 268 380 272 410 C276 444 240 456 244 486 C248 518 288 526 304 554 C320 582 308 618 292 644 C276 670 252 690 256 720 C260 750 292 766 316 782";

/** Bản đồ SVG diễn biến: mũi tên quân ta hành quân từ Bắc vào Quảng Trị */
export const Scene2Map: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const mapScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Mũi tên hành quân "chảy" liên tục về phía Nam
  const dashOffset = -frame * 2.6;

  // Vòng xung nhấn nháy quanh Quảng Trị
  const pulse = 0.35 + 0.35 * Math.abs(Math.sin(frame / 9));

  const starScale = spring({
    frame: frame - 35,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  const dmzOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile("audio/QuangTri1972/scene2_context.mp3")} />

      <SceneTitle chapter="02" kicker="Bối cảnh" title="CỬA NGÕ PHÍA BẮC" />

      <div
        style={{ transform: `scale(${mapScale})` }}
        className="relative rounded-2xl border-2 border-amber-200/25 bg-stone-950/70 p-4 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
      >
        <svg width="620" height="800" viewBox="0 0 420 860">
          {/* Lãnh thổ ribbon cách điệu */}
          <path
            d={VIETNAM_PATH}
            fill="none"
            stroke="#3f3a33"
            strokeWidth="58"
            strokeLinecap="round"
          />
          <path
            d={VIETNAM_PATH}
            fill="none"
            stroke="#a8977a"
            strokeWidth="44"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Vĩ tuyến 17 */}
          <g style={{ opacity: dmzOpacity }}>
            <line
              x1="80"
              y1="428"
              x2="350"
              y2="428"
              stroke="#f87171"
              strokeWidth="3"
              strokeDasharray="10 8"
            />
            <text x="86" y="415" fill="#fca5a5" fontSize="17" fontWeight="bold">
              VĨ TUYẾN 17
            </text>
          </g>

          {/* Mũi tên hành quân từ Hà Nội xuống Quảng Trị */}
          {[0, 1, 2].map((k) => (
            <line
              key={k}
              x1={150 + k * 26}
              y1={180 + k * 8}
              x2={232 + k * 18}
              y2={418}
              stroke="#fbbf24"
              strokeWidth={k === 1 ? 7 : 5}
              strokeLinecap="round"
              strokeDasharray="16 14"
              style={{ strokeDashoffset: dashOffset + k * 10 }}
              markerEnd="url(#arrow)"
            />
          ))}
          <defs>
            <marker
              id="arrow"
              markerWidth="9"
              markerHeight="9"
              refX="6"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,0 L9,4.5 L0,9 Z" fill="#fbbf24" />
            </marker>
          </defs>

          {/* Hà Nội */}
          <circle cx="196" cy="140" r="8" fill="#fcd34d" />
          <text x="212" y="134" fill="#fde68a" fontSize="21" fontWeight="bold">
            HÀ NỘI
          </text>

          {/* Quảng Trị: vòng xung + sao */}
          <circle
            cx="252"
            cy="445"
            r={26 + Math.sin(frame / 9) * 9}
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            opacity={pulse}
          />
          <g transform="translate(252,445) scale(1.15)" style={{ transform: `translate(252px,445px) scale(${starScale * 1.15})` }}>
            <polygon
              points="0,-14 3.2,-4.3 13.2,-4.3 5,1.6 8.1,11.3 0,5.3 -8.1,11.3 -5,1.6 -13.2,-4.3 -3.2,-4.3"
              fill="#ef4444"
            />
          </g>
          <text x="272" y="488" fill="#fecaca" fontSize="24" fontWeight="900">
            QUẢNG TRỊ
          </text>

          {/* Chú thích hướng tiến công */}
          <text x="60" y="330" fill="#fbbf24" fontSize="19" fontWeight="bold">
            HƯỚNG TIẾN CÔNG
          </text>
          <text x="60" y="354" fill="#fde68a" fontSize="16">
            XUÂN — HÈ 1972
          </text>
        </svg>
        <p className="mt-1 text-center text-xl text-amber-100/60">
          Sơ đồ diễn biến cách điệu — Chiến dịch Xuân Hè 1972
        </p>
      </div>

      <SubtitleHistory
        text="Xuân hè năm 1972, quân ta mở chiến dịch tiến công chiến lược trên toàn miền Nam, nhằm buộc Mỹ trở lại đàm phán. Quảng Trị, cửa ngõ phía Bắc, trở thành nơi hội tụ của cuộc quyết đấu lớn nhất giữa ta và địch."
        durationInFrames={durationInFrames - 40}
        highlightKeyword="Quảng Trị"
      />
    </AbsoluteFill>
  );
};
