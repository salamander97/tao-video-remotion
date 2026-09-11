import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";

/** shotCard: hook-kinetic-punch — headline + camera punch nhẹ, hold 18f. */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[0];

  const punch = seg(frame, 0, 16, Easing.outExpo); // 16f punch, trong khoảng gợi ý card
  const zoom = 1 + punch * 0.06;
  const reveal = seg(frame, 4, 24, Easing.outBack);
  const holdStable = frame >= 16 + 18; // luật hold/rest tối thiểu 18f sau major focal change

  return (
    <AbsoluteFill style={{ backgroundColor: "#050816", color: "#F8FAFC", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Sequence layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.whoosh)} volume={0.5} />
      </Sequence>

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${zoom})` }}>
        <div
          style={{
            width: 920,
            textAlign: "center",
            opacity: reveal,
            transform: `translateY(${(1 - reveal) * 24}px)`,
          }}
        >
          <div style={{ fontSize: 30, letterSpacing: 4, color: "#7C3AED", fontWeight: 700, marginBottom: 24 }}>
            MOTION SYSTEM
          </div>
          <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.08, color: "#F8FAFC" }}>
            Một hệ thống
            <br />
            <span style={{ color: "#22D3EE" }}>chuyển động</span> nhất quán
          </div>
          {holdStable && (
            <div style={{ marginTop: 32, fontSize: 26, color: "#94A3B8" }}>giữ nghỉ ≥18 khung trước khi tiếp tục</div>
          )}
        </div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="chuyển động" />
    </AbsoluteFill>
  );
};
