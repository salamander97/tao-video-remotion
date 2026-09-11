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

const products = [
  { name: "Giảm Cân Siêu Tốc 7 Ngày", claim: "−7kg/7 ngày", price: "350.000đ" },
  { name: "Viên Đốt Mỡ cấp tốc", claim: "Không cần ăn kiêng", price: "290.000đ" },
  { name: "Trà Giảm Cân Herba", claim: "Giảm mỡ bụng 3cm", price: "180.000đ" },
];

export const Scene5Still: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scrollY = interpolate(frame, [0, 80], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const highlightOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const claimScale = spring({ frame: Math.max(0, frame - 120), fps, config: { damping: 10, stiffness: 120 } });
  const redFlagOpacity = interpolate(frame, [190, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const redFlagScale = spring({ frame: Math.max(0, frame - 190), fps, config: { damping: 8, stiffness: 140 } });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-[#F7FFFD]">
      <Audio src={staticFile("audio/SibutraminPhaNaO/scene5_still.mp3")} />

      {/* TikTok-style phone frame */}
      <div className="relative mt-[-30px] w-[400px] rounded-[3rem] border-4 border-[#16302B]/15 bg-white shadow-2xl overflow-hidden" style={{ height: 620 }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#F7FFFD]">
          <span className="text-[18px] font-bold text-[#16302B]">9:41</span>
          <span className="text-[20px] font-black text-[#0F766E]">TikTok</span>
          <span className="text-[18px] font-bold text-[#16302B]">🔋</span>
        </div>

        {/* Feed */}
        <div style={{ transform: `translateY(${scrollY}px)` }} className="flex flex-col gap-3 px-4 pb-4">
          {products.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 p-4 transition-all"
              style={{
                borderColor: i === 0 && highlightOpacity > 0.5 ? "#FB7185" : "#E6F7F2",
                backgroundColor: i === 0 && highlightOpacity > 0.5 ? "#FB7185/5" : "white",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-[#E6F7F2]" />
                <span className="text-[18px] font-bold text-[#16302B]">@giamcan_{p.name.split(" ")[2] || "shop"}</span>
              </div>
              <p className="text-[22px] font-bold text-[#16302B]">{p.name}</p>
              <p className="text-[18px] text-[#FB7185] font-bold">{p.claim}</p>
              <p className="text-[20px] font-black text-[#0F766E] mt-1">{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Claim zoom */}
      <div style={{ opacity: highlightOpacity, transform: `scale(${claimScale})` }} className="absolute top-[260px] right-[60px]">
        <div className="rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 px-5 py-3">
          <span className="text-[24px] font-black text-[#FB7185]">"7 ngày −7kg"</span>
        </div>
      </div>

      {/* Red flag overlay */}
      <div style={{ opacity: redFlagOpacity, transform: `scale(${redFlagScale})` }} className="absolute bottom-[380px]">
        <div className="flex items-center gap-3 rounded-full bg-[#FB7185] px-8 py-3 shadow-lg">
          <span className="text-[28px] font-black text-white">⚠ CHẤT CẤM 15 NĂM</span>
        </div>
      </div>

      <SubtitleBox
        text="Nhưng mở TikTok hôm nay, bạn vẫn thấy: giảm cân siêu tốc, 7 ngày giảm 7 ký. Đằng sau là chất cấm 15 năm."
        durationInFrames={288}
        highlightKeyword="chất cấm"
      />
    </AbsoluteFill>
  );
};
