import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { audioManifest } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";
import { BrandHeader } from "../components/BrandHeader";

// Chiều cao cột chỉ minh hoạ ĐỊNH TÍNH mức đáp ứng glucose/insulin sau ăn
// (thấp hơn = tốt hơn); KHÔNG phải effect size định lượng từ nghiên cứu.
const BARS = [
  { label: "Ngồi", height: 0.85, color: "#94A3B8", from: 0 },
  { label: "Đứng", height: 0.55, color: "#5B7A73", from: 60 },
  { label: "Đi bộ nhẹ", height: 0.22, color: "#0F766E", from: 120 },
];

/** shotCard: comparison-split-baseline — so sánh 3 cột: ngồi/đứng/đi bộ nhẹ. */
export const Scene6Compare: React.FC<{ channelName?: string }> = ({ channelName }) => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[5];
  const maxBarPx = 460;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Lexend', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <BrandHeader channelName={channelName} />

      <div style={{ position: "absolute", left: 60, right: 60, top: 170, fontSize: 32, fontWeight: 800, textAlign: "center", color: "#2563EB" }}>
        Phân tích 7 thử nghiệm, 2022
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 230, fontSize: 20, fontWeight: 600, textAlign: "center", color: "#5B7A73" }}>
        Minh họa định tính — không phải độ lớn hiệu ứng
      </div>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#5B7A73", marginBottom: 20 }}>Mức đáp ứng glucose/insulin sau ăn (thấp hơn = tốt hơn)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 56, height: maxBarPx + 80 }}>
          {BARS.map((bar) => {
            const grow = seg(frame, bar.from, bar.from + 40, Easing.outQuad);
            const isLowest = bar.label === "Đi bộ nhẹ" && frame >= 120;
            return (
              <div key={bar.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 140, height: maxBarPx, display: "flex", alignItems: "flex-end", background: "#E6F7F2", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ width: "100%", height: `${grow * bar.height * 100}%`, background: bar.color, boxShadow: isLowest ? "0 0 0 4px #0F766E inset" : undefined }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: isLowest ? "#0F766E" : "#16302B" }}>{bar.label}</div>
                {isLowest && <div style={{ fontSize: 20, fontWeight: 700, color: "#0F766E" }}>Đáp ứng thấp hơn</div>}
              </div>
            );
          })}
        </div>
      </div>

      {frame >= 190 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1420, fontSize: 22, color: "#5B7A73", textAlign: "center" }}>
          Nguồn: PMC9325803 — review 7 thử nghiệm crossover cấp tính, 2022
        </div>
      )}

      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="tốt hơn" />
    </AbsoluteFill>
  );
};
