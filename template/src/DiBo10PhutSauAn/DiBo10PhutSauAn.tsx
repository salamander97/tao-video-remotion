import React from "react";
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { DiBo10PhutSauAnProps } from "./types";
import { audioManifest, SYNTHETIC_AUDIO } from "./audioData";
import { duckingEnvelope, DEFAULT_GAIN } from "../motion/audio/soundCues";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Eat } from "./scenes/Scene2Eat";
import { Scene3Walk } from "./scenes/Scene3Walk";
import { Scene4Study } from "./scenes/Scene4Study";
import { Scene5Stat } from "./scenes/Scene5Stat";
import { Scene6Compare } from "./scenes/Scene6Compare";
import { Scene7Routine } from "./scenes/Scene7Routine";
import { Scene8Outro } from "./scenes/Scene8Outro";

// Scene durations = audio thực tế (audioManifest) + buffer chuyển cảnh snappy
// (+3/cảnh, +10 cảnh cuối) — theo đúng quy ước AGENTS.md/SKILL.md, không thêm
// hold padding giả tạo; hold/rest nằm trong phần đuôi tự nhiên của mỗi scene.
const d1 = audioManifest.scenes[0].durationInFrames + 3; // 178
const d2 = audioManifest.scenes[1].durationInFrames + 3; // 236
const d3 = audioManifest.scenes[2].durationInFrames + 3; // 173
const d4 = audioManifest.scenes[3].durationInFrames + 3; // 195
const d5 = audioManifest.scenes[4].durationInFrames + 3; // 232
const d6 = audioManifest.scenes[5].durationInFrames + 3; // 244
const d7 = audioManifest.scenes[6].durationInFrames + 3; // 220
const d8 = audioManifest.scenes[7].durationInFrames + 10; // 267

const starts = [0, d1, d1 + d2, d1 + d2 + d3, d1 + d2 + d3 + d4, d1 + d2 + d3 + d4 + d5, d1 + d2 + d3 + d4 + d5 + d6, d1 + d2 + d3 + d4 + d5 + d6 + d7];
const ttsWindows: Array<[number, number]> = audioManifest.scenes.map((s, i) => [starts[i], starts[i] + s.durationInFrames]);

export const DiBo10PhutSauAn: React.FC<DiBo10PhutSauAnProps> = ({ channelName }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD" }}>
      {/* BGM tổng hợp bằng ffmpeg (sine pad), duck khi TTS đang phát — TTS luôn
          ưu tiên, xem template/src/motion/audio/soundCues.ts. */}
      <Audio
        src={staticFile(SYNTHETIC_AUDIO.bgm)}
        volume={(frame) => duckingEnvelope(frame, ttsWindows, DEFAULT_GAIN.bgm)}
      />

      <Series>
        <Series.Sequence durationInFrames={d1}>
          <Scene1Hook channelName={channelName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d2}>
          <Scene2Eat channelName={channelName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d3}>
          <Scene3Walk channelName={channelName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d4}>
          <Scene4Study channelName={channelName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d5}>
          <Scene5Stat channelName={channelName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d6}>
          <Scene6Compare channelName={channelName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d7}>
          <Scene7Routine channelName={channelName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d8}>
          <Scene8Outro channelName={channelName} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

export const DIBO_10_PHUT_SAU_AN_TOTAL_FRAMES = d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8; // 1745
