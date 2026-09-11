import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { holdThenSettle } from "../../motion/settle";
import { FlashCut } from "../../motion/transitions/FlashCut";
import { audioManifest } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

const PATH_LEN = 700;

/** shotCard: diagram-mechanism-state (motionVariant eat-glucose-insulin) —
 * 3 trạng thái: ăn carb -> glucose trong máu tăng -> insulin đưa vào tế bào. */
export const Scene2Eat: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[1];

  const drawA = seg(frame, 10, 60, Easing.outQuad); // carb -> glucose
  const drawB = seg(frame, 85, 145, Easing.outQuad); // glucose -> insulin/cell
  const nodeCActive = frame >= 150;
  const calloutSettle = holdThenSettle(frame, 150, 10, 0.12, 0.18) * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <FlashCut duration={10} />
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", left: 60, right: 60, top: 170, fontSize: 34, fontWeight: 800, textAlign: "center", color: "#2563EB" }}>
        Chuyện gì xảy ra khi ăn?
      </div>

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={860} height={1100} viewBox="0 0 860 1100">
          {/* Node 1: Carb / bữa ăn */}
          <circle cx={430} cy={140} r={68} fill="#0F766E" />
          <path d="M400 130 h60 M400 150 h60 M400 170 h40" stroke="#F7FFFD" strokeWidth={7} strokeLinecap="round" />
          <text x={430} y={245} textAnchor="middle" fontSize={30} fontWeight={700} fill="#16302B">Carbohydrate</text>

          <path d="M430,208 L430,470" stroke="#5B7A73" strokeWidth={8} fill="none" strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - drawA)} />

          {/* Node 2: Glucose tăng */}
          <circle cx={430} cy={540} r={68} fill={drawA > 0.9 ? "#FB7185" : "#DDEDE9"} />
          <polyline points="400,555 415,530 430,545 445,510 460,525" fill="none" stroke="#16302B" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={drawA > 0.9 ? 1 : 0.3} />
          <text x={430} y={645} textAnchor="middle" fontSize={30} fontWeight={700} fill="#16302B">Glucose trong máu ↑</text>

          <path d="M430,608 L430,870" stroke="#5B7A73" strokeWidth={8} fill="none" strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - drawB)} />

          {/* Node 3: Insulin -> tế bào */}
          <circle cx={430} cy={940} r={68} fill={nodeCActive ? "#2563EB" : "#DDEDE9"} />
          <rect x={405} y={915} width={50} height={50} rx={10} fill="none" stroke="#F7FFFD" strokeWidth={5} opacity={nodeCActive ? 1 : 0.3} />
          <text x={430} y={1045} textAnchor="middle" fontSize={30} fontWeight={700} fill="#16302B">Insulin đưa vào tế bào</text>

          {nodeCActive && (
            <g transform={`translate(600, ${940 - calloutSettle})`}>
              <rect x={0} y={-40} width={230} height={80} rx={14} fill="#E6F7F2" stroke="#0F766E" strokeWidth={3} />
              <text x={115} y={8} textAnchor="middle" fontSize={24} fill="#0F766E">Năng lượng tế bào</text>
            </g>
          )}
        </svg>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="glucose" />
    </AbsoluteFill>
  );
};
