import React from "react";
import {
  AbsoluteFill,
  Series,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SibutraminPhaNaOProps } from "./types";
import { audioManifest } from "./audioData";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2What } from "./scenes/Scene2What";
import { Scene3Scout } from "./scenes/Scene3Scout";
import { Scene4Ban } from "./scenes/Scene4Ban";
import { Scene5Still } from "./scenes/Scene5Still";
import { Scene6Case } from "./scenes/Scene6Case";
import { Scene7Mechanism } from "./scenes/Scene7Mechanism";
import { Scene8Signs } from "./scenes/Scene8Signs";
import { Scene9Protect } from "./scenes/Scene9Protect";
import { Scene10Outro } from "./scenes/Scene10Outro";
import { BrandHeader } from "./components/BrandHeader";

export const SibutraminPhaNaO: React.FC<SibutraminPhaNaOProps> = ({
  channelName,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  const d1 = audioManifest.scenes[0].durationInFrames + 3;
  const d2 = audioManifest.scenes[1].durationInFrames + 3;
  const d3 = audioManifest.scenes[2].durationInFrames + 3;
  const d4 = audioManifest.scenes[3].durationInFrames + 3;
  const d5 = audioManifest.scenes[4].durationInFrames + 3;
  const d6 = audioManifest.scenes[5].durationInFrames + 3;
  const d7 = audioManifest.scenes[6].durationInFrames + 3;
  const d8 = audioManifest.scenes[7].durationInFrames + 3;
  const d9 = audioManifest.scenes[8].durationInFrames + 3;
  const d10 = audioManifest.scenes[9].durationInFrames + 10;

  return (
    <AbsoluteFill
      style={{ opacity }}
      className="relative overflow-hidden bg-[#F7FFFD] font-sans text-[#16302B] select-none"
    >
      <BrandHeader channelName={channelName} />

      <Series>
        <Series.Sequence durationInFrames={d1}>
          <Scene1Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d2}>
          <Scene2What />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d3}>
          <Scene3Scout />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d4}>
          <Scene4Ban />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d5}>
          <Scene5Still />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d6}>
          <Scene6Case />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d7}>
          <Scene7Mechanism />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d8}>
          <Scene8Signs />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d9}>
          <Scene9Protect />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d10}>
          <Scene10Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
