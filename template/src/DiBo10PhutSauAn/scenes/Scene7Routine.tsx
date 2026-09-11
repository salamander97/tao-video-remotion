import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

/** shotCard: timeline-process-3step (motionVariant practical-routine-caution) —
 * ăn tối -> đi bộ 10 phút -> hỏi bác sĩ nếu dùng insulin/dễ hạ đường huyết. */
export const Scene7Routine: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[6];

  const step1 = seg(frame, 0, 22, Easing.outBack);
  const step2 = seg(frame, 60, 90, Easing.outBack);
  const step3 = seg(frame, 140, 168, Easing.outBack);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Sequence from={70} layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.tick)} volume={0.4} />
      </Sequence>
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", left: 60, right: 60, top: 170, fontSize: 34, fontWeight: 800, textAlign: "center", color: "#2563EB" }}>
        Áp dụng thế nào?
      </div>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <div style={{ opacity: step1, transform: `translateX(${(1 - step1) * -40}px)`, display: "flex", alignItems: "center", gap: 20, background: "#E6F7F2", borderRadius: 20, padding: "20px 32px", width: 780 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#0F766E", color: "#F7FFFD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900 }}>1</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Ăn tối xong</div>
        </div>

        <div style={{ opacity: step2, transform: `translateX(${(1 - step2) * -40}px)`, display: "flex", alignItems: "center", gap: 20, background: "#E6F7F2", borderRadius: 20, padding: "20px 32px", width: 780 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#0F766E", color: "#F7FFFD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900 }}>2</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Đi bộ thoải mái 10 phút</div>
        </div>

        <div style={{ opacity: step3, transform: `translateX(${(1 - step3) * -40}px)`, display: "flex", alignItems: "center", gap: 20, background: "#FFF1F2", border: "2px solid #FB7185", borderRadius: 20, padding: "20px 32px", width: 780 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FB7185", color: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900 }}>!</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#9F1239" }}>Dùng insulin / dễ hạ đường huyết? Hỏi bác sĩ trước</div>
        </div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="bác sĩ" />
    </AbsoluteFill>
  );
};
