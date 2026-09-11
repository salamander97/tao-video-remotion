import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { holdThenSettle } from "../../motion/settle";
import { WipeCut } from "../../motion/transitions/WipeCut";
import { audioManifest } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";

const PATH_LEN = 900;

/** shotCard: diagram-mechanism-state — 3 trạng thái nối bằng path-draw, callout
 * xuất hiện sau khi path vẽ xong (dampedSettle cho hiệu ứng nảy nhẹ). */
export const Scene5Diagram: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[4];

  const drawA = seg(frame, 10, 55, Easing.outQuad); // node A -> B
  const drawB = seg(frame, 60, 105, Easing.outQuad); // node B -> C
  const nodeCActive = frame >= 105;
  const calloutSettle = holdThenSettle(frame, 105, 12, 0.12, 0.18) * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#061826", color: "#E6F6FF", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <WipeCut duration={14} color="#000000" direction="down" />

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={900} height={1100} viewBox="0 0 900 1100">
          <circle cx={450} cy={140} r={60} fill="#38BDF8" />
          <text x={450} y={150} textAnchor="middle" fontSize={30} fontWeight={700} fill="#061826">A</text>

          <path d={`M450,200 L450,470`} stroke="#A7F3D0" strokeWidth={8} fill="none"
            strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - drawA)} />
          <circle cx={450} cy={540} r={60} fill={drawA > 0.95 ? "#A7F3D0" : "#1E3A4A"} />
          <text x={450} y={550} textAnchor="middle" fontSize={30} fontWeight={700} fill="#061826">B</text>

          <path d={`M450,600 L450,870`} stroke="#E6F6FF" strokeWidth={8} fill="none"
            strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - drawB)} />
          <circle cx={450} cy={940} r={60} fill={nodeCActive ? "#E6F6FF" : "#1E3A4A"} />
          <text x={450} y={950} textAnchor="middle" fontSize={30} fontWeight={700} fill="#061826">C</text>

          {nodeCActive && (
            <g transform={`translate(600, ${940 - calloutSettle})`}>
              <rect x={0} y={-40} width={260} height={80} rx={14} fill="#0B2B40" stroke="#38BDF8" strokeWidth={3} />
              <text x={130} y={8} textAnchor="middle" fontSize={26} fill="#E6F6FF">Kết quả cuối</text>
            </g>
          )}
        </svg>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="trạng thái" />
    </AbsoluteFill>
  );
};
