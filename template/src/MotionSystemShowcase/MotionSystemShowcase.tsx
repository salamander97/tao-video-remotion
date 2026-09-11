import React from "react";
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { MotionSystemShowcaseProps } from "./types";
import { audioManifest, SYNTHETIC_AUDIO } from "./audioData";
import { duckingEnvelope, DEFAULT_GAIN } from "../motion/audio/soundCues";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Parallax } from "./scenes/Scene2Parallax";
import { Scene3DataStat } from "./scenes/Scene3DataStat";
import { Scene4Montage } from "./scenes/Scene4Montage";
import { Scene5Diagram } from "./scenes/Scene5Diagram";
import { Scene6HoldRest } from "./scenes/Scene6HoldRest";
import { Scene7Outro } from "./scenes/Scene7Outro";

// Scene durations = audio thực tế (audioManifest) + buffer chuyển cảnh, cộng
// thêm hold pad tường minh ở scene 6 (demo rest) và scene 7 (outro, luật R1).
const d1 = audioManifest.scenes[0].durationInFrames + 3; // 176
const d2 = audioManifest.scenes[1].durationInFrames + 3; // 176
const d3 = audioManifest.scenes[2].durationInFrames + 3; // 145
const d4 = audioManifest.scenes[3].durationInFrames + 3; // 132
const d5 = audioManifest.scenes[4].durationInFrames + 3; // 174
const d6 = audioManifest.scenes[5].durationInFrames + 40 + 3; // 225 — +40 hold demo
const d7 = audioManifest.scenes[6].durationInFrames + 30 + 10; // 216 — +30 hold (R1), +10 buffer cuối

// Cửa sổ TTS tuyệt đối trong toàn timeline — dùng để duck BGM đúng lúc giọng
// đọc đang phát (soundCues.ts: TTS luôn ưu tiên, không bao giờ bị che).
const starts = [0, d1, d1 + d2, d1 + d2 + d3, d1 + d2 + d3 + d4, d1 + d2 + d3 + d4 + d5, d1 + d2 + d3 + d4 + d5 + d6];
const ttsWindows: Array<[number, number]> = audioManifest.scenes.map((s, i) => [starts[i], starts[i] + s.durationInFrames]);

export const MotionSystemShowcase: React.FC<MotionSystemShowcaseProps> = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* BGM tổng hợp bằng ffmpeg (sine pad), duck khi TTS đang phát — xem
          template/src/motion/audio/soundCues.ts (duckingEnvelope). */}
      <Audio
        src={staticFile(SYNTHETIC_AUDIO.bgm)}
        volume={(frame) => duckingEnvelope(frame, ttsWindows, DEFAULT_GAIN.bgm)}
      />

      <Series>
        <Series.Sequence durationInFrames={d1}>
          <Scene1Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d2}>
          <Scene2Parallax />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d3}>
          <Scene3DataStat />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d4}>
          <Scene4Montage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d5}>
          <Scene5Diagram />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d6}>
          <Scene6HoldRest />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d7}>
          <Scene7Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

export const MOTION_SYSTEM_SHOWCASE_TOTAL_FRAMES = d1 + d2 + d3 + d4 + d5 + d6 + d7; // 1244
