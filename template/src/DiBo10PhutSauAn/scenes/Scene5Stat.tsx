import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { DigitRoll } from "../../motion/DigitRoll";
import { WipeCut } from "../../motion/transitions/WipeCut";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

/** shotCard: data-stat-counter — number reveal 12% (tổng thể) rồi 22% (buổi tối), có nguồn. */
export const Scene5Stat: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[4];

  const eveningShift = seg(frame, 150, 175, Easing.outQuad); // 12% thu nhỏ, 22% nổi bật

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <WipeCut duration={14} color="#0F766E" direction="down" />
      <Sequence from={60} layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.tick)} volume={0.5} />
      </Sequence>
      <Sequence from={150} layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.tick)} volume={0.5} />
      </Sequence>
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 28, color: "#5B7A73", letterSpacing: 2, marginBottom: 20 }}>ĐƯỜNG HUYẾT SAU ĂN THẤP HƠN</div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10, transform: `scale(${1 - eveningShift * 0.4}) translateY(${-eveningShift * 40}px)` }}>
          <DigitRoll value="12" delay={60} fontSize={eveningShift > 0 ? 100 : 200} color="#0F766E" />
          <span style={{ fontSize: eveningShift > 0 ? 60 : 110, fontWeight: 800, color: "#0F766E" }}>%</span>
        </div>
        <div style={{ fontSize: 24, color: "#5B7A73", marginTop: 4 }}>tổng thể, mọi bữa ăn</div>

        {frame >= 150 && (
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", opacity: seg(frame, 150, 168, Easing.outQuad) }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <DigitRoll value="22" delay={150} fontSize={200} color="#FB7185" />
              <span style={{ fontSize: 110, fontWeight: 800, color: "#FB7185" }}>%</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#FB7185" }}>riêng bữa tối</div>
          </div>
        )}

        <div style={{ marginTop: 28, fontSize: 22, color: "#5B7A73", textAlign: "center", width: 700 }}>
          Nguồn: PubMed 27747394 — thử nghiệm crossover 2016
        </div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="hai mươi hai" />
    </AbsoluteFill>
  );
};
