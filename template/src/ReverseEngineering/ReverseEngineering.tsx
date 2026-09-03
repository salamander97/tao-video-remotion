import React from "react";
import {
  AbsoluteFill,
  Series,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ReverseEngineeringProps } from "./types";
import { audioManifest } from "./audioData";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Concept1 } from "./scenes/Scene3Concept1";
import { Scene4Concept2 } from "./scenes/Scene4Concept2";
import { Scene5Impact } from "./scenes/Scene5Impact";
import { Scene6Outro } from "./scenes/Scene6Outro";
import { BrandHeader } from "../DockerExplainer/components/BrandHeader";

export const ReverseEngineering: React.FC<ReverseEngineeringProps> = ({
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
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const opacity = fadeIn * fadeOut;

  // Scene durations dynamically mapped from audioManifest (+3 frames snappy buffer)
  const d1 = audioManifest.scenes[0].durationInFrames + 3; // 259
  const d2 = audioManifest.scenes[1].durationInFrames + 3; // 264
  const d3 = audioManifest.scenes[2].durationInFrames + 3; // 235
  const d4 = audioManifest.scenes[3].durationInFrames + 3; // 245
  const d5 = audioManifest.scenes[4].durationInFrames + 3; // 226
  const d6 = audioManifest.scenes[5].durationInFrames + 10; // 271

  return (
    <AbsoluteFill
      style={{ opacity }}
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black font-sans text-white select-none"
    >
      <BrandHeader channelName={channelName} />

      {/* Background Animated Subtle Glows */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[140px]" />
      <div className="absolute top-1/2 -right-40 h-[700px] w-[700px] rounded-full bg-teal-600/15 blur-[160px]" />
      <div className="absolute -bottom-40 left-1/4 h-[600px] w-[600px] rounded-full bg-cyan-600/15 blur-[140px]" />

      <Series>
        <Series.Sequence durationInFrames={d1}>
          <Scene1Hook />
        </Series.Sequence>

        <Series.Sequence durationInFrames={d2}>
          <Scene2Problem />
        </Series.Sequence>

        <Series.Sequence durationInFrames={d3}>
          <Scene3Concept1 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={d4}>
          <Scene4Concept2 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={d5}>
          <Scene5Impact />
        </Series.Sequence>

        <Series.Sequence durationInFrames={d6}>
          <Scene6Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
