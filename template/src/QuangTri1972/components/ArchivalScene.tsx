import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useVideoConfig,
} from "remotion";
import { SceneTitle } from "./SceneTitle";
import { ArchivalPhoto } from "./ArchivalPhoto";
import { PhotoSlideshow, SlidePhoto } from "./PhotoSlideshow";
import { SubtitleHistory } from "./SubtitleHistory";

interface ArchivalSceneProps {
  audioPath: string;
  subtitleText: string;
  highlightKeyword?: string;
  chapter: string;
  kicker: string;
  title: string;
  /** 1 ảnh = khung Ken Burns đơn; 2+ ảnh = slideshow montage cắt nhanh */
  photos?: SlidePhoto[];
  fit?: "cover" | "contain";
}

/** Cảnh tư liệu tổng quát: tiêu đề chương + ảnh/slideshow + phụ đề */
export const ArchivalScene: React.FC<ArchivalSceneProps> = ({
  audioPath,
  subtitleText,
  highlightKeyword,
  chapter,
  kicker,
  title,
  photos,
  fit,
}) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-10 text-white">
      <Audio src={staticFile(audioPath)} />

      <SceneTitle chapter={chapter} kicker={kicker} title={title} />

      {photos && photos.length > 1 ? (
        <PhotoSlideshow
          photos={photos}
          durationInFrames={durationInFrames - 45}
        />
      ) : photos && photos.length === 1 ? (
        <ArchivalPhoto
          src={photos[0].file}
          caption={photos[0].caption}
          credit={photos[0].credit}
          license={photos[0].license}
          durationInFrames={durationInFrames}
          direction="zoom-in"
          fit={fit}
        />
      ) : null}

      <SubtitleHistory
        text={subtitleText}
        durationInFrames={durationInFrames}
        highlightKeyword={highlightKeyword}
        className="mt-14"
      />
    </AbsoluteFill>
  );
};
