import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { audioManifest } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

/** shotCard: diagram-mechanism-state (motionVariant walk-lowers-peak) —
 * cơ bắp co lại -> dùng thêm glucose -> đỉnh đường huyết sau ăn thấp hơn. */
export const Scene3Walk: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[2];

  const flex = 0.5 + 0.5 * Math.sin(frame * 0.35); // co cơ nhịp nhàng, xác định theo frame
  const glucoseBar = seg(frame, 20, 60, Easing.outQuad);
  const chartReveal = seg(frame, 90, 150, Easing.outQuad);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", left: 60, right: 60, top: 170, fontSize: 34, fontWeight: 800, textAlign: "center", color: "#2563EB" }}>
        Đi bộ làm gì với glucose?
      </div>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
        {/* State 1: cơ bắp co lại (nhịp xác định theo frame, không dùng random) */}
        <svg width={260} height={260} viewBox="0 0 260 260">
          <ellipse cx={130} cy={130} rx={70 + flex * 18} ry={100} fill="#0F766E" opacity={0.9} />
          <ellipse cx={130} cy={130} rx={40 + flex * 10} ry={70} fill="#E6F7F2" opacity={0.6} />
        </svg>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#16302B" }}>Cơ bắp co lại</div>

        {/* State 2: glucose được dùng thêm (thanh giảm dần) */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 100 }}>
          <div style={{ width: 60, height: 100, background: "#DDEDE9", borderRadius: 8, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${(1 - glucoseBar * 0.4) * 100}%`, background: "#FB7185" }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>Glucose được dùng thêm làm nhiên liệu</div>
        </div>

        {/* State 3: đường cong đỉnh thấp hơn */}
        {frame >= 90 && (
          <svg width={700} height={220} viewBox="0 0 700 220" style={{ opacity: chartReveal }}>
            <polyline points="20,180 150,60 300,90 450,150 650,170" fill="none" stroke="#5B7A73" strokeWidth={6} strokeDasharray="6 6" />
            <polyline
              points={`20,180 150,${140 - chartReveal * 30} 300,${130 - chartReveal * 15} 450,150 650,170`}
              fill="none" stroke="#0F766E" strokeWidth={8} strokeLinecap="round"
            />
            <text x={150} y={40} textAnchor="middle" fontSize={24} fontWeight={700} fill="#0F766E">Có đi bộ — đỉnh thấp hơn</text>
            <text x={550} y={45} textAnchor="middle" fontSize={22} fill="#5B7A73">Không đi bộ</text>
          </svg>
        )}
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="giảm đỉnh" />
    </AbsoluteFill>
  );
};
