import React, { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface VisualBeat {
  frame: number;
  action: string;
}

interface VisualBeatState {
  activeBeat: number;
  action: string;
  progress: number;
}

interface VisualBeatSequenceProps {
  beats: VisualBeat[];
  children: (state: VisualBeatState) => ReactNode;
}

/** Coordinates meaningful states across the whole scene, not entrance only. */
export const VisualBeatSequence: React.FC<VisualBeatSequenceProps> = ({
  beats,
  children,
}) => {
  const frame = useCurrentFrame();
  const ordered = [...beats].sort((a, b) => a.frame - b.frame);
  let activeBeat = 0;

  for (let index = 0; index < ordered.length; index += 1) {
    if (frame >= ordered[index].frame) activeBeat = index;
  }

  const current = ordered[activeBeat] ?? { frame: 0, action: "idle" };
  const next = ordered[activeBeat + 1];
  const progress = next
    ? interpolate(frame, [current.frame, next.frame], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return <>{children({ activeBeat, action: current.action, progress })}</>;
};
