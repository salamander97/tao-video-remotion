import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Camera2p5D } from "../../motion/camera2p5d";
import { audioManifest, SYNTHETIC_AUDIO } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";

// Ảnh gốc 1080x1350 (portrait 4:5); base zoom 1920/1350≈1.422 để "cover" hết
// chiều cao khung 1080x1920 (tránh letterbox đen trên/dưới thấy được ở QA still).
const COVER = 1920 / 1350;
const IMAGES = [
  { src: "images/motion-showcase/montage-1.svg", from: 0, keys: [{ frame: 0, cx: 540, cy: 675, zoom: COVER }, { frame: 44, cx: 540, cy: 675, zoom: COVER * 1.16 }] },
  { src: "images/motion-showcase/montage-2.svg", from: 44, keys: [{ frame: 0, cx: 540, cy: 675, zoom: COVER * 1.16 }, { frame: 44, cx: 540, cy: 675, zoom: COVER }] },
  { src: "images/motion-showcase/montage-3.svg", from: 88, keys: [{ frame: 0, cx: 540, cy: 675, zoom: COVER }, { frame: 44, cx: 540, cy: 675, zoom: COVER * 1.13 }] },
];

/** shotCard: montage-photo-slideshow — cắt nhanh <8s/ảnh, Ken Burns xen kẽ
 * hướng zoom (luật lịch sử scene-design.md). Ảnh SVG tự vẽ, không sourced. */
export const Scene4Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = audioManifest.scenes[3];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile(scene.audioPath)} />
      {IMAGES.map((img, i) => {
        const active = frame >= img.from && frame < img.from + 44;
        if (!active) return null;
        return (
          <React.Fragment key={img.src}>
            <Camera2p5D src={img.src} imageWidth={1080} imageHeight={1350} keys={img.keys} frame={frame - img.from} />
            {i > 0 && (
              <Sequence from={img.from} layout="none">
                <Audio src={staticFile(SYNTHETIC_AUDIO.sparkle)} volume={0.35} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="đứng yên" />
    </AbsoluteFill>
  );
};
