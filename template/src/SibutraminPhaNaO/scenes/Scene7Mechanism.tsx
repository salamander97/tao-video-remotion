import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SubtitleBox } from "../components/SubtitleBox";

export const Scene7Mechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const vesselIn = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });

  const constrictProgress = interpolate(frame, [40, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vesselWidth = interpolate(constrictProgress, [0, 1], [40, 12]);

  const o2Opacity = interpolate(frame, [100, 120], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o2Count = Math.round(interpolate(frame, [100, 150], [6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const neuronOpacity = interpolate(frame, [160, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const permanentOpacity = interpolate(frame, [210, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene7_mechanism.mp3")} />

      {/* Blood vessel cross-section */}
      <div style={{ transform: `scale(${vesselIn})` }} className="relative flex h-[320px] w-[800px] items-center justify-center">
        <svg viewBox="0 0 400 160" className="h-full w-full" fill="none">
          {/* Vessel wall */}
          <rect x="20" y="40" width="360" height="80" rx="40" fill="#E6F7F2" stroke="#0F766E" strokeWidth="2" />

          {/* Constricting walls */}
          <rect x="150" y={40 + (40 - vesselWidth / 2)} width="100" height={80 - (80 - vesselWidth)} rx="4" fill="#FB7185" opacity={constrictProgress * 0.5} />

          {/* Blood flow arrows */}
          {[0, 1, 2, 3].map((i) => {
            const xPos = interpolate(frame, [0, 60], [-30 + i * 100, 400 + i * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const inNarrow = xPos > 150 && xPos < 250;
            return (
              <g key={i} opacity={1 - constrictProgress * 0.6}>
                <circle
                  cx={xPos}
                  cy={80}
                  r={inNarrow ? 5 : 8}
                  fill="#FB7185"
                  opacity={0.6}
                />
              </g>
            );
          })}

          {/* Vessel width label */}
          <line x1="200" y1={40} x2="200" y2={40 + (40 - vesselWidth / 2)} stroke="#FB7185" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="215" y={50} fill="#FB7185" fontSize="12" fontWeight="700">
            {Math.round(interpolate(constrictProgress, [0, 1], [100, 30]))}%
          </text>
        </svg>
      </div>

      {/* Label: Co thắt mạch máu */}
      <div className="absolute top-[200px]">
        <span className="text-[28px] font-black text-[#FB7185]">Co thắt mạch máu não</span>
      </div>

      {/* O2 molecules */}
      <div className="absolute top-[520px] flex gap-6">
        {Array.from({ length: o2Count }).map((_, i) => (
          <div key={i} style={{ opacity: o2Opacity }} className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-[#2563EB]/20 border-2 border-[#2563EB]/40 flex items-center justify-center">
              <span className="text-[16px] font-black text-[#2563EB]">O₂</span>
            </div>
          </div>
        ))}
        <span className="ml-3 self-center text-[22px] font-bold text-[#5B7A73]">
          {o2Count <= 2 ? "Thiếu oxy!" : "Oxy bình thường"}
        </span>
      </div>

      {/* Neuron damage */}
      <div style={{ opacity: neuronOpacity }} className="absolute bottom-[400px] left-[80px]">
        <svg viewBox="0 0 120 80" className="h-[80px] w-[120px]" fill="none">
          <circle cx="60" cy="40" r="25" fill="#FB7185" opacity={0.2} stroke="#FB7185" strokeWidth="2" />
          <line x1="35" y1="40" x2="15" y2="25" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
          <line x1="85" y1="40" x2="105" y2="25" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="65" x2="60" y2="80" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
          <text x="60" y="45" textAnchor="middle" fill="#FB7185" fontSize="12" fontWeight="700">✕</text>
        </svg>
        <span className="text-[20px] font-bold text-[#FB7185]">Tế bào thần kinh chết</span>
      </div>

      {/* Permanent label */}
      <div style={{ opacity: permanentOpacity }} className="absolute bottom-[370px] right-[80px]">
        <div className="rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 px-6 py-3">
          <span className="text-[26px] font-black text-[#FB7185]">VĨNH VIỄN</span>
        </div>
      </div>

      <SubtitleBox
        text="Sibutramin gây co thắt mạch máu não, làm thiếu oxy tế bào thần kinh. Vùng đồi thị bị tổn thương vĩnh viễn, không thể hồi phục."
        durationInFrames={258}
        highlightKeyword="vĩnh viễn"
      />
    </AbsoluteFill>
  );
};
