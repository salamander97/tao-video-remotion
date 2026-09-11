import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { holdThenSettle } from "../../motion/settle";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

/** shotCard: outro-cta-settle — chữ chốt settle, giữ nghỉ >=30 khung trước khi kết thúc. */
export const Scene8Outro: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[7];

  const reveal = seg(frame, 0, 22, Easing.outBack);
  const settleWobble = holdThenSettle(frame, 22, 0, 0.09, 0.2) * 4;
  const sublineReveal = seg(frame, 40, 60, Easing.outQuad);
  const disclaimerReveal = seg(frame, 200, 220, Easing.outQuad);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Sequence from={6} layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.sparkle)} volume={0.4} />
      </Sequence>
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontSize: 58, fontWeight: 900, textAlign: "center", width: 900, lineHeight: 1.22,
            opacity: reveal, transform: `translateY(${(1 - reveal) * 20 + settleWobble}px)`,
          }}
        >
          Đi bộ <span style={{ color: "#0F766E" }}>không thay thế</span> thuốc hay điều trị
        </div>

        <div style={{ marginTop: 24, fontSize: 34, fontWeight: 700, color: "#2563EB", opacity: sublineReveal, transform: `translateY(${(1 - sublineReveal) * 16}px)` }}>
          Lưu video để thử tối nay 📌
        </div>

        <div style={{ marginTop: 40, fontSize: 22, color: "#5B7A73", textAlign: "center", width: 760, opacity: disclaimerReveal }}>
          Thông tin tham khảo, không thay thế chỉ định bác sĩ.
        </div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="tham khảo" />
    </AbsoluteFill>
  );
};
