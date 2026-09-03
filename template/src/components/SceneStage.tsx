import React, { ReactNode } from "react";
import { AbsoluteFill } from "remotion";

interface SceneStageProps {
  children: ReactNode;
  background?: ReactNode;
  brand?: ReactNode;
  caption?: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Brand and caption are sibling overlays, so they never shrink the visual. */
export const SceneStage: React.FC<SceneStageProps> = ({
  children,
  background,
  brand,
  caption,
  className = "",
  contentClassName = "",
}) => (
  <AbsoluteFill className={`relative overflow-hidden ${className}`}>
    {background}
    <div
      className={`absolute inset-x-10 top-[180px] bottom-[260px] z-20 flex items-center justify-center ${contentClassName}`}
    >
      {children}
    </div>
    {brand}
    {caption}
  </AbsoluteFill>
);
