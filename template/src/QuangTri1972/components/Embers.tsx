import React from "react";
import { useCurrentFrame } from "remotion";

const PARTICLE_COUNT = 46;

/**
 * Lớp hạt tàn lửa/tro bay lên toàn video (chất phim tài liệu chiến tranh).
 * Vị trí tính bằng công thức deterministic theo index + frame (không dùng
 * Math.random() để mỗi lần render cùng 1 frame cho cùng kết quả).
 */
export const Embers: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const seed = i * 127.1;
        const xPct = (i * 61.8) % 100;
        const speed = 0.22 + ((i * 37) % 10) / 11; // 0.22..~1.1 %/frame
        const phase = (i * 17) % 100;
        const size = 2 + ((i * 13) % 4); // 2..5px
        const yPct = 108 - (((frame * speed + phase) % 118));
        const xWobble = Math.sin((frame + phase) / 22) * 1.6;
        const opacity = 0.22 + 0.26 * Math.abs(Math.sin(frame / 5 + seed));
        const isOrange = i % 3 === 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${xPct + xWobble}%`,
              top: `${yPct}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: isOrange ? "#fb923c" : "#fcd34d",
              boxShadow: `0 0 ${size * 2.5}px ${isOrange ? "rgba(251,146,60,0.9)" : "rgba(252,211,77,0.8)"}`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
