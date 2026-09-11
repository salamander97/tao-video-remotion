import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { DigitRoll } from "../../motion/DigitRoll";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";

/** shotCard: data-stat-counter — number reveal có unit/nguồn, DigitRoll port từ Shotcraft. */
export const Scene3DataStat: React.FC = () => {
  const scene = audioManifest.scenes[2];
  const tickAt = 40; // sfxCue tick khi số bắt đầu nhảy

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F172A", color: "#F8FAFC", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Sequence from={tickAt} layout="none">
        <Audio src={staticFile(SYNTHETIC_AUDIO.tick)} volume={0.5} />
      </Sequence>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 28, color: "#94A3B8", letterSpacing: 3, marginBottom: 16 }}>ĐO LƯỜNG THỰC TẾ</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <DigitRoll value="87" delay={tickAt} fontSize={220} color="#FBBF24" />
          <span style={{ fontSize: 120, fontWeight: 800, color: "#FBBF24" }}>%</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#E2E8F0" }}>cải thiện hiệu suất render</div>
        <div style={{ marginTop: 12, fontSize: 24, color: "#64748B" }}>Nguồn: dữ liệu tự tổng hợp minh hoạ hệ thống</div>
      </div>

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="nguồn" />
    </AbsoluteFill>
  );
};
