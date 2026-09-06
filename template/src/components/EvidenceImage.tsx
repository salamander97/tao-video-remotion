import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export interface EvidenceFocus {
  frame: number;
  scale: number;
  x: number;
  y: number;
  label?: string;
}

/** Local reviewed media; x/y are viewport percentages, focus times are local scene frames. */
export const EvidenceImage: React.FC<{
  file: string;
  alt: string;
  focus: EvidenceFocus[];
  fit?: "cover" | "contain";
}> = ({ file, alt, focus, fit = "contain" }) => {
  const frame = useCurrentFrame();
  const points = [...focus].sort((a, b) => a.frame - b.frame);
  if (!points.length || points.some((point, index) =>
    !Number.isFinite(point.frame) || point.frame < 0 || point.scale < 1 ||
    ![point.scale, point.x, point.y].every(Number.isFinite) ||
    (index > 0 && point.frame <= points[index - 1].frame))) {
    throw new Error("EvidenceImage cần focus hợp lệ, frame tăng dần và scale >= 1");
  }
  const value = (key: "scale" | "x" | "y") => points.length === 1 ? points[0][key] : interpolate(
    frame, points.map((p) => p.frame), points.map((p) => p[key]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const reached = points.filter((p) => p.frame <= frame);
  const active = reached[reached.length - 1] ?? points[0];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img src={staticFile(file)} alt={alt} style={{ width: "100%", height: "100%", objectFit: fit, transform: `translate(${value("x")}%, ${value("y")}%) scale(${value("scale")})`, transformOrigin: "center" }} />
      {active.label && <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, fontSize: 34, lineHeight: 1.25, padding: "14px 20px", background: "#FFFCF5F2", color: "#22211D", borderLeft: "5px solid #B94132" }}>{active.label}</div>}
    </div>
  );
};
