import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

/** shotCard: hook-kinetic-punch — headline + camera punch nhẹ, hold 18f. */
export const Scene1Hook: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[0];

  const punch = seg(frame, 0, 16, Easing.outExpo);
  const zoom = 1 + punch * 0.06;
  const reveal = seg(frame, 4, 24, Easing.outBack);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Sequence layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.whoosh)} volume={0.5} />
      </Sequence>
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${zoom})` }}>
        <div style={{ width: 920, textAlign: "center", opacity: reveal, transform: `translateY(${(1 - reveal) * 24}px)` }}>
          <div style={{ fontSize: 28, letterSpacing: 3, color: "#2563EB", fontWeight: 700, marginBottom: 20, textTransform: "uppercase" }}>
            Thật Hay Thôi?
          </div>
          <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 1.1 }}>
            Đi bộ <span style={{ color: "#0F766E" }}>10 phút</span>
            <br />
            sau ăn — đường huyết
            <br />
            đổi thế nào?
          </div>
        </div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="mười phút" />
    </AbsoluteFill>
  );
};
