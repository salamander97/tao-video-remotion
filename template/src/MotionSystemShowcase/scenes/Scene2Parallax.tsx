import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Camera2p5D, type CamKey } from "../../motion/camera2p5d";
import { FlashCut } from "../../motion/transitions/FlashCut";
import { audioManifest } from "../audioData";
import { SubtitleBox } from "../components/SubtitleBox";

const CAM_KEYS: CamKey[] = [
  { frame: 0, cx: 800, cy: 1150, zoom: 0.675 },
  { frame: 55, cx: 800, cy: 1150, zoom: 0.675 },
  { frame: 140, cx: 430, cy: 950, zoom: 2.3, rotY: 6, persp: 1600 },
  { frame: 176, cx: 430, cy: 950, zoom: 2.3, rotY: 6, persp: 1600 },
];

/** shotCard: image-reveal-crop + camera-parallax-push — port từ PageCam
 * (video-shotcraft), tâm khung đổi sang 540x960 cho dọc (xem camera2p5d.tsx). */
export const Scene2Parallax: React.FC = () => {
  const scene = audioManifest.scenes[1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0B0C" }}>
      <Audio src={staticFile(scene.audioPath)} />
      <Camera2p5D src="images/motion-showcase/document.svg" imageWidth={1600} imageHeight={2400} keys={CAM_KEYS} />
      <FlashCut duration={10} />
      <SubtitleBox text={scene.text} durationInFrames={scene.durationInFrames} highlightKeyword="chi tiết" />
    </AbsoluteFill>
  );
};
