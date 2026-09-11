// origin: video-shotcraft assets/lib/FlatPanel.tsx (Apache-2.0). Logic
// unchanged; see THIRD_PARTY_NOTICES.md for full attribution and change log.
// Pairs with `Rig.tsx` for R3F-based 3D shot cards (e.g. `basic-3d-scene`,
// `carousel-3d`, `terminal-3d` in the vendored catalog).
import * as THREE from "three";
import { useMemo } from "react";

/** Radial-gradient contact shadow texture, generated once. */
const useShadowTexture = () => {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, "rgba(58,51,42,0.32)");
    g.addColorStop(1, "rgba(58,51,42,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
};

/**
 * A flat card lying on a desk. Plane with the UI texture facing up, soft
 * contact shadow beneath.
 */
export const FlatPanel: React.FC<{
  texture: THREE.Texture | null;
  width: number;
  height: number;
  position?: [number, number, number];
  yaw?: number;
  opacity?: number;
  glow?: number;
  shadow?: boolean;
}> = ({ texture, width, height, position = [0, 0.02, 0], yaw = 0, opacity = 1, glow = 0.3, shadow = true }) => {
  const shadowTex = useShadowTexture();
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fdfcfa", roughness: 0.62, metalness: 0, transparent: true }), []);
  mat.map = texture ?? null;
  mat.emissive = new THREE.Color("#ffffff");
  mat.emissiveMap = texture ?? null;
  mat.emissiveIntensity = glow;
  mat.opacity = opacity;
  mat.needsUpdate = true;

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {shadow ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.05, -0.012, 0.06]}>
          <planeGeometry args={[width * 1.3, height * 1.3]} />
          <meshBasicMaterial map={shadowTex} transparent opacity={0.85 * opacity} depthWrite={false} />
        </mesh>
      ) : null}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  );
};
