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

export const Scene2What: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const brainIn = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const synapseOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const synapseScale = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 14, stiffness: 100 } });

  const blockProgress = interpolate(frame, [110, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [180, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fdaOpacity = interpolate(frame, [250, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fdaScale = spring({ frame: Math.max(0, frame - 250), fps, config: { damping: 10, stiffness: 120 } });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-gradient-to-b from-[#F7FFFD] via-[#E6F7F2] to-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene2_what.mp3")} />

      {/* Brain + Synapse Diagram */}
      <div style={{ transform: `scale(${brainIn})` }} className="relative flex h-[520px] w-[880px] items-center justify-center">
        <svg viewBox="0 0 400 260" className="h-full w-full" fill="none">
          {/* Brain outline */}
          <ellipse cx="130" cy="130" rx="95" ry="105" fill="#E6F7F2" stroke="#0F766E" strokeWidth="2.5" />
          <path d="M65 80 Q95 55 130 70 Q165 55 195 80" stroke="#0F766E" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M60 110 Q90 90 130 100 Q170 90 200 110" stroke="#0F766E" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Hypothalamus region */}
          <ellipse cx="130" cy="155" rx="28" ry="18" fill="#0F766E" opacity={labelOpacity * 0.25} stroke="#0F766E" strokeWidth="2" strokeDasharray="4 3" />
          <text x="130" y="195" textAnchor="middle" fill="#0F766E" fontSize="14" fontWeight="700" opacity={labelOpacity}>Vùng dưới đồi</text>

          {/* Synapse zoom area */}
          <g opacity={synapseOpacity} style={{ transform: `scale(${synapseScale})`, transformOrigin: "310px 130px" }}>
            <rect x="240" y="50" width="140" height="160" rx="20" fill="white" stroke="#0F766E" strokeWidth="2" />
            {/* Neuron 1 */}
            <line x1="260" y1="80" x2="310" y2="120" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
            <circle cx="310" cy="120" r="6" fill="#2563EB" />
            {/* Neurotransmitters */}
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={318 + i * 8}
                cy={128 + i * 5}
                r="4"
                fill="#0F766E"
                opacity={interpolate(frame, [120 + i * 15, 140 + i * 15], [0, 1 - blockProgress * 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              />
            ))}
            {/* Block indicator */}
            <line x1="330" y1="110" x2="330" y2="155" stroke="#FB7185" strokeWidth="3" opacity={blockProgress} strokeLinecap="round" />
            <text x="345" y="138" fill="#FB7185" fontSize="11" fontWeight="700" opacity={blockProgress}>BLOCK</text>
            {/* Neuron 2 */}
            <line x1="310" y1="140" x2="350" y2="180" stroke="#5B7A73" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Connector line */}
          <line x1="200" y1="130" x2="240" y2="130" stroke="#0F766E" strokeWidth="1.5" strokeDasharray="4 3" opacity={synapseOpacity} />
        </svg>
      </div>

      {/* FDA stamp */}
      <div style={{ opacity: fdaOpacity, transform: `scale(${fdaScale})` }} className="absolute bottom-[370px] right-[100px]">
        <div className="rounded-xl border-2 border-[#0F766E] bg-[#0F766E]/10 px-6 py-3">
          <span className="text-[28px] font-black text-[#0F766E]">FDA 1997</span>
        </div>
      </div>

      {/* Label */}
      <div style={{ opacity: labelOpacity }} className="absolute top-[200px] left-[60px]">
        <span className="text-[26px] font-bold text-[#0F766E]">SNRI</span>
        <p className="text-[20px] text-[#5B7A73] max-w-[200px]">Ức chế tái hấp thu serotonin</p>
      </div>

      <SubtitleBox
        text="Sibutramin là chất ức chế serotonin và norepinephrine, đánh lừa vùng dưới đồi khiến bạn mất hoàn toàn cảm giác đói. FDA từng phê duyệt nó năm 1997."
        durationInFrames={320}
        highlightKeyword="Sibutramin"
      />
    </AbsoluteFill>
  );
};
