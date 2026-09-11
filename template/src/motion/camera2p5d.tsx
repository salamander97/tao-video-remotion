// origin: video-shotcraft assets/lib/PageCam.tsx (Apache-2.0). Adapted for
// 1080x1920 vertical frames (center 540,960 instead of 960,540); same
// zoom-not-scale technique to avoid blurry text under magnification. Renamed
// `pageH`-only prop to explicit `imageWidth`/`imageHeight`; dropped the
// optional depth-of-field (dof) prop (unused in this template so far).
// See THIRD_PARTY_NOTICES.md for full attribution and change log.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";

export type CamKey = {
  frame: number;
  cx: number;
  cy: number;
  zoom: number;
  rotX?: number; // deg
  rotY?: number; // deg
  rotZ?: number; // deg
  persp?: number; // px, default 1400
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CENTER_X = 540;
const CENTER_Y = 960;

/**
 * Camera 2.5D dọc trên một ảnh/screenshot lớn. (cx, cy) là điểm không gian
 * ảnh (đơn vị CSS px của ảnh gốc) được đặt vào tâm khung 1080x1920; zoom là
 * hệ số phóng. Không có key nào khai báo rotX/rotY/rotZ/persp → xuống chế độ
 * pan/zoom phẳng (giống hệt bản cũ, không có 3D).
 *
 * Kỹ thuật chống mờ chữ: khi có key 3D, phóng đại bằng CSS `zoom` thay vì
 * `transform: scale()` để Chromium rasterize ở kích thước đã phóng to rồi
 * mới downsample, không phải rasterize nhỏ rồi upscale (xem PageCam.tsx gốc).
 */
export const Camera2p5D: React.FC<{
  src: string;
  imageWidth: number; // chiều rộng CSS của ảnh gốc (không phải khung 1080)
  imageHeight: number;
  keys: CamKey[];
  children?: React.ReactNode;
  blur?: number;
  saturate?: number;
  ease?: (t: number) => number;
  /** Screen-space gradient-blur band approximating a focal plane near the
   * top of the frame (far/tilted part of the image reads soft). Ported from
   * PageCam.tsx's `dof` prop, dropped in the initial port — added back for
   * full parity when a scene wants depth-of-field on a 3D-tilted card. */
  dof?: { focusY: number; strength: number };
  frame?: number;
}> = ({ src, imageWidth, imageHeight, keys, children, blur = 0, saturate = 1, ease = Easing.bezier(0.33, 0, 0.15, 1), dof, frame: frameProp }) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame >= keys[i].frame && frame <= keys[i + 1].frame) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const t = a.frame === b.frame ? 1 : interpolate(frame, [a.frame, b.frame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const cx = lerp(a.cx, b.cx, t);
  const cy = lerp(a.cy, b.cy, t);
  const zoom = lerp(a.zoom, b.zoom, t);

  const filters: string[] = [];
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (saturate !== 1) filters.push(`saturate(${saturate})`);

  const has3D = keys.some((k) => k.rotX !== undefined || k.rotY !== undefined || k.rotZ !== undefined || k.persp !== undefined);

  if (!has3D) {
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: imageWidth,
            height: imageHeight,
            transform: `translate(${CENTER_X - cx * zoom}px, ${CENTER_Y - cy * zoom}px) scale(${zoom})`,
            transformOrigin: "0 0",
            filter: filters.length ? filters.join(" ") : undefined,
          }}
        >
          <Img src={staticFile(src)} style={{ position: "absolute", width: imageWidth, height: imageHeight }} alt="" />
          {children}
        </div>
      </AbsoluteFill>
    );
  }

  const rotX = lerp(a.rotX ?? 0, b.rotX ?? 0, t);
  const rotY = lerp(a.rotY ?? 0, b.rotY ?? 0, t);
  const rotZ = lerp(a.rotZ ?? 0, b.rotZ ?? 0, t);
  const persp = lerp(a.persp ?? 1400, b.persp ?? 1400, t);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: `${persp * zoom}px`,
          perspectiveOrigin: `${CENTER_X}px ${CENTER_Y}px`,
        }}
      >
        {/* Toạ độ: zoom phóng không gian cục bộ của phần tử này theo hệ số
            zoom, nên translate(Tx px) hiển thị thành Tx*zoom px thiết bị. Để
            điểm focal (cx,cy) rơi đúng tâm khung (540,960):
              cx*zoom + Tx*zoom = 540  =>  Tx = 540/zoom - cx (tương tự Ty). */}
        <div
          style={{
            position: "absolute",
            width: imageWidth,
            height: imageHeight,
            zoom,
            transform: `translate(${CENTER_X / zoom - cx}px, ${CENTER_Y / zoom - cy}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transformStyle: "preserve-3d",
            filter: filters.length ? filters.join(" ") : undefined,
          }}
        >
          <Img src={staticFile(src)} style={{ position: "absolute", width: imageWidth, height: imageHeight }} alt="" />
          {children}
        </div>
      </div>
      {dof ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: Math.max(0, dof.focusY),
            backdropFilter: `blur(${dof.strength}px)`,
            WebkitBackdropFilter: `blur(${dof.strength}px)`,
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
