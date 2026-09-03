import React from "react";
import {
  AbsoluteFill,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { QuangTriProps } from "./types";
import { audioManifest } from "./audioData";
import { imageManifest } from "./imageData";
import { ArchivalScene } from "./components/ArchivalScene";
import { SlidePhoto } from "./components/PhotoSlideshow";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Map } from "./scenes/Scene2Map";
import { Scene5Stamp } from "./scenes/Scene5Stamp";
import { Scene6Bombardment } from "./scenes/Scene6Bombardment";
import { Scene8River } from "./scenes/Scene8River";
import { Scene10Flag } from "./scenes/Scene10Flag";
import { Scene14Outro } from "./scenes/Scene14Outro";
import { BrandHeaderHistory } from "./components/BrandHeaderHistory";
import { Embers } from "./components/Embers";

type ImgCfg = { imgKey: string; caption: string };
interface SceneConfig {
  id: string;
  chapter: string;
  kicker: string;
  title: string;
  photos?: ImgCfg[];
  keyword?: string;
}

// Cảnh tư liệu montage — mỗi cảnh 2–3 ảnh cắt nhanh (photos), còn lại custom
const SCENES: Record<string, SceneConfig> = {
  scene3_liberation: {
    id: "scene3_liberation", chapter: "03", kicker: "01.05.1972", title: "GIẢI PHÓNG QUẢNG TRỊ",
    photos: [
      { imgKey: "scene3_liberation", caption: "Thành cổ và thị xã Quảng Trị (tư liệu)" },
      { imgKey: "scene3_b_web", caption: "Chiến sĩ ta với cờ trên xe tăng chiếm được" },
    ],
    keyword: "giải phóng",
  },
  scene4_lamson72: {
    id: "scene4_lamson72", chapter: "04", kicker: "Lam Sơn 72", title: "BÃO LỬA TRÚT VỀ THÀNH CỔ",
    photos: [
      { imgKey: "scene4_lamson72", caption: "Máy bay Mỹ cất cánh tham chiến, 1972" },
      { imgKey: "scene4_b", caption: "Biên đội B-52 trước lúc xuất kích, 12/1972" },
    ],
    keyword: "địa ngục",
  },
  scene7_young: {
    id: "scene7_young", chapter: "07", kicker: "Thế hệ tuổi 20", title: "NHỮNG NGƯỜI GIỮ THÀNH",
    photos: [
      { imgKey: "scene7_young", caption: "Chiến sĩ Quân đội nhân dân Việt Nam" },
      { imgKey: "scene7_b_web", caption: "Đại tướng Võ Nguyên Giáp cùng chiến sĩ pháo binh" },
    ],
    keyword: "hai mươi",
  },
  scene9_counterattack: {
    id: "scene9_counterattack", chapter: "09", kicker: "Tháng 9.1972", title: "TỔNG PHẢN CÔNG",
    photos: [
      { imgKey: "scene9_counterattack", caption: "Thiết giáp địch bị phá hủy (tư liệu NARA)" },
      { imgKey: "scene9_b", caption: "Pháo tên lửa của quân ta (tư liệu)" },
      { imgKey: "scene9_c_web", caption: "Pháo thủ cao xạ của quân ta (tư liệu)" },
    ],
    keyword: "phản công",
  },
  scene11_meaning: {
    id: "scene11_meaning", chapter: "11", kicker: "Ý nghĩa lịch sử", title: "ĐẨY MỸ VÀO ĐÀM PHÁN PARIS",
    photos: [
      { imgKey: "scene11_meaning", caption: "Lễ ký Hiệp định Paris, 1973" },
      { imgKey: "scene11_b", caption: "Lê Đức Thọ và Henry Kissinger (tư liệu)" },
    ],
    keyword: "Paris",
  },
  scene12_sacrifice: {
    id: "scene12_sacrifice", chapter: "12", kicker: "Tri ân", title: "HÀNG NGHÌN NGƯỜI CON ƯU TÚ",
    photos: [
      { imgKey: "scene12_sacrifice", caption: "Nghĩa trang Liệt sĩ Trường Sơn" },
      { imgKey: "scene12_b_web", caption: "Trường Sơn nhìn từ trên cao" },
    ],
    keyword: "máu",
  },
  scene13_legacy: {
    id: "scene13_legacy", chapter: "13", kicker: "Hôm nay", title: "DI TÍCH QUỐC GIA ĐẶC BIỆT",
    photos: [
      { imgKey: "scene13_legacy", caption: "Khu tưởng niệm Thành cổ Quảng Trị" },
      { imgKey: "scene13_b", caption: "Thành cổ Quảng Trị — di tích quốc gia đặc biệt" },
    ],
    keyword: "tâm hương",
  },
};

const toPhotos = (cfg?: ImgCfg[]): SlidePhoto[] | undefined =>
  cfg
    ?.map((c) => {
      const rec = imageManifest[c.imgKey];
      return rec
        ? {
            file: staticFile(rec.file),
            caption: c.caption,
            credit: rec.credit,
            license: rec.license,
          }
        : null;
    })
    .filter((p): p is SlidePhoto => p !== null);

const archival = (cfg: SceneConfig) => (
  <ArchivalScene
    audioPath={`audio/QuangTri1972/${cfg.id}.mp3`}
    subtitleText={audioManifest.scenes.find((s) => s.id === cfg.id)!.text}
    highlightKeyword={cfg.keyword}
    chapter={cfg.chapter}
    kicker={cfg.kicker}
    title={cfg.title}
    photos={toPhotos(cfg.photos)}
  />
);

export const QuangTri1972: React.FC<QuangTriProps> = ({ channelName }) => {
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
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  const durOf = (id: string, isLast = false) =>
    audioManifest.scenes.find((s) => s.id === id)!.durationInFrames +
    (isLast ? 10 : 3);

  return (
    <AbsoluteFill
      style={{ opacity }}
      className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-black font-sans text-white select-none"
    >
      <BrandHeaderHistory channelName={channelName} />

      {/* Ánh sáng tông tư liệu */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-600/12 blur-[140px]" />
      <div className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-red-800/12 blur-[160px]" />
      <div className="absolute -bottom-40 left-1/4 h-[600px] w-[600px] rounded-full bg-orange-700/10 blur-[140px]" />

      <Series>
        {/* 1. Hook: full-bleed + counter 81 */}
        <Series.Sequence durationInFrames={durOf("scene1_hook")}>
          <Scene1Hook />
        </Series.Sequence>

        {/* 2. Bản đồ diễn biến SVG động */}
        <Series.Sequence durationInFrames={durOf("scene2_context")}>
          <Scene2Map />
        </Series.Sequence>

        {/* 3–4. Montage 2 ảnh/cảnh */}
        <Series.Sequence durationInFrames={durOf("scene3_liberation")}>
          {archival(SCENES.scene3_liberation)}
        </Series.Sequence>
        <Series.Sequence durationInFrames={durOf("scene4_lamson72")}>
          {archival(SCENES.scene4_lamson72)}
        </Series.Sequence>

        {/* 5. Khẩu quyết đóng dấu son (full-bleed) */}
        <Series.Sequence durationInFrames={durOf("scene5_siege")}>
          <Scene5Stamp />
        </Series.Sequence>

        {/* 6. Mưa đạn pháo: rung máy + chớp lửa + counter (full-bleed) */}
        <Series.Sequence durationInFrames={durOf("scene6_hellfire")}>
          <Scene6Bombardment />
        </Series.Sequence>

        {/* 7. Montage 2 ảnh: thế hệ tuổi 20 */}
        <Series.Sequence durationInFrames={durOf("scene7_young")}>
          {archival(SCENES.scene7_young)}
        </Series.Sequence>

        {/* 8. Sông Thạch Hãn — typography cinematic (full-bleed) */}
        <Series.Sequence durationInFrames={durOf("scene8_thachhan")}>
          <Scene8River />
        </Series.Sequence>

        {/* 9. Montage 3 ảnh: tổng phản công */}
        <Series.Sequence durationInFrames={durOf("scene9_counterattack")}>
          {archival(SCENES.scene9_counterattack)}
        </Series.Sequence>

        {/* 10. Lá cờ SVG động */}
        <Series.Sequence durationInFrames={durOf("scene10_flag")}>
          <Scene10Flag />
        </Series.Sequence>

        {/* 11–13. Montage 2 ảnh/cảnh */}
        <Series.Sequence durationInFrames={durOf("scene11_meaning")}>
          {archival(SCENES.scene11_meaning)}
        </Series.Sequence>
        <Series.Sequence durationInFrames={durOf("scene12_sacrifice")}>
          {archival(SCENES.scene12_sacrifice)}
        </Series.Sequence>
        <Series.Sequence durationInFrames={durOf("scene13_legacy")}>
          {archival(SCENES.scene13_legacy)}
        </Series.Sequence>

        {/* 14. Outro tri ân */}
        <Series.Sequence durationInFrames={durOf("scene14_outro", true)}>
          <Scene14Outro />
        </Series.Sequence>
      </Series>

      {/* Hạt tàn lửa phủ toàn video */}
      <Embers />
    </AbsoluteFill>
  );
};
