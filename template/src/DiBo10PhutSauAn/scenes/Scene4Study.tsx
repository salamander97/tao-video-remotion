import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

/** shotCard: timeline-process-3step (motionVariant study-design-card) —
 * năm 2016 -> 41 người tiểu đường type 2 -> thiết kế crossover so sánh 2 cách đi bộ. */
export const Scene4Study: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[3];

  const step1 = seg(frame, 0, 20, Easing.outBack);
  const step2 = seg(frame, 60, 85, Easing.outBack);
  const step3 = seg(frame, 130, 158, Easing.outBack);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Sequence from={70} layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.tick)} volume={0.45} />
      </Sequence>
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", left: 60, right: 60, top: 170, fontSize: 34, fontWeight: 800, textAlign: "center", color: "#2563EB" }}>
        Bằng chứng khoa học
      </div>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <div style={{ opacity: step1, transform: `translateY(${(1 - step1) * 20}px)`, display: "flex", alignItems: "center", gap: 20, background: "#E6F7F2", borderRadius: 20, padding: "20px 32px", width: 780 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#0F766E" }}>2016</div>
          <div style={{ fontSize: 26, fontWeight: 600 }}>Nghiên cứu công bố</div>
        </div>

        <div style={{ opacity: step2, transform: `translateY(${(1 - step2) * 20}px)`, display: "flex", alignItems: "center", gap: 20, background: "#E6F7F2", borderRadius: 20, padding: "20px 32px", width: 780 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#0F766E" }}>41</div>
          <div style={{ fontSize: 26, fontWeight: 600 }}>Người tiểu đường type 2 — thiết kế crossover</div>
        </div>

        <div style={{ opacity: step3, transform: `translateY(${(1 - step3) * 20}px)`, display: "flex", flexDirection: "column", gap: 12, background: "#E6F7F2", borderRadius: 20, padding: "24px 32px", width: 780 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0F766E" }}>So sánh 2 cách đi bộ</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 600 }}>
            <span>Đi bộ 1 lần/ngày</span>
            <span style={{ color: "#5B7A73" }}>vs</span>
            <span style={{ color: "#0F766E" }}>Đi bộ ngắn sau mỗi bữa</span>
          </div>
        </div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="41" />
    </AbsoluteFill>
  );
};
