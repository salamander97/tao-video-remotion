import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { seg, Easing } from "../../motion/easing";
import { audioManifest } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";

/** shotCard: focus-highlight-sweep + luật hold/rest tối thiểu (bổ sung ở
 * scene-design.md mục 6.5). Sau khi lời đọc kết thúc (frame 182), giữ
 * nguyên hoàn toàn 40 khung (~1.3s) trước khi scene kết thúc — minh hoạ rõ
 * ràng khoảng nghỉ mà Shotcraft aesthetic-rules R1/R3 nhấn mạnh. */
export const Scene6HoldRest: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[5];
  const narrationEnd = scene.durationInFrames; // 182

  const sweep = seg(Math.min(frame, narrationEnd), 20, narrationEnd - 10, Easing.linear);
  const isHolding = frame >= narrationEnd;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FFFD", color: "#16302B", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Audio src={staticFile(scene.audioPath)} />

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 880, fontSize: 52, fontWeight: 800, lineHeight: 1.3, textAlign: "center" }}>
          <span>Đôi khi hình ảnh cần một khoảng lặng đủ dài</span>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${sweep * 100}%`,
              background: "linear-gradient(90deg, rgba(15,118,110,0.18), rgba(15,118,110,0.05))",
              borderRadius: 12,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {isHolding && (
        <div style={{ position: "absolute", left: 40, right: 40, top: 120, fontSize: 24, color: "#5B7A73", textAlign: "center" }}>
          giữ nghỉ hoàn toàn ({frame - narrationEnd}/40 khung) — không thêm motion mới
        </div>
      )}

      <SubtitleBox text={scene.text} durationInFrames={narrationEnd} highlightKeyword="khoảng lặng" />
    </AbsoluteFill>
  );
};
