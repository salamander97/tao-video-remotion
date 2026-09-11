import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { holdThenSettle } from "../../motion/settle";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";

/** shotCard: outro-cta-settle — chữ chốt settle vào vị trí rồi giữ ≥30 khung
 * trước khi video kết thúc (aesthetic-rules R1 của Shotcraft: brand hold ≥1s). */
export const Scene7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[6];

  const reveal = seg(frame, 0, 20, Easing.outBack);
  const settleWobble = holdThenSettle(frame, 20, 0, 0.09, 0.2) * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050816", color: "#F8FAFC", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Sequence from={6} layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.sparkle)} volume={0.4} />
      </Sequence>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            textAlign: "center",
            width: 900,
            lineHeight: 1.2,
            opacity: reveal,
            transform: `translateY(${(1 - reveal) * 20 + settleWobble}px)`,
          }}
        >
          Hệ thống chuyển động
          <br />
          <span style={{ color: "#22D3EE" }}>nhất quán</span> cho video kiến thức
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#94A3B8" }}>docs/shotcraft-integration-plan.md</div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="chuyên nghiệp" />
    </AbsoluteFill>
  );
};
