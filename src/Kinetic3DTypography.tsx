import { ThreeCanvas } from "@remotion/three";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  spring,
} from "remotion";
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Word data ───

interface WordConfig {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  enterFrame: number;
}

// Diagonal cascade, positions in "pixel space" — converted to 3D at render time
const WORDS: WordConfig[] = [
  { text: "animating", x: 400, y: 200, fontSize: 90, color: "#111111", enterFrame: 0 },
  { text: "text", x: 730, y: 280, fontSize: 90, color: "#111111", enterFrame: 8 },
  { text: "like", x: 950, y: 180, fontSize: 110, color: "#22c55e", enterFrame: 25 },
  { text: "this", x: 800, y: 450, fontSize: 220, color: "#222222", enterFrame: 45 },
  { text: "can", x: 1100, y: 640, fontSize: 180, color: "#222222", enterFrame: 65 },
  { text: "be", x: 850, y: 800, fontSize: 220, color: "#222222", enterFrame: 82 },
  { text: "challenging", x: 450, y: 1020, fontSize: 190, color: "#222222", enterFrame: 100 },
  { text: "but", x: 280, y: 1250, fontSize: 240, color: "#22c55e", enterFrame: 122 },
  { text: "this", x: 680, y: 1280, fontSize: 210, color: "#222222", enterFrame: 130 },
  { text: "tutorial", x: 550, y: 1500, fontSize: 230, color: "#222222", enterFrame: 150 },
  { text: "will", x: 300, y: 1750, fontSize: 300, color: "#222222", enterFrame: 172 },
  { text: "help", x: 280, y: 2050, fontSize: 250, color: "#222222", enterFrame: 195 },
  { text: "you", x: 850, y: 2080, fontSize: 250, color: "#22c55e", enterFrame: 203 },
];

// Pixel-space → 3D world conversion
const S = 0.01; // 1 px = 0.01 world units
const OX = 640; // horizontal origin (center of 1280 viewport)

// ─── Camera keyframes (2D → will be projected to 3D camera position) ───

interface CamKF {
  frame: number;
  x: number;
  y: number;
  scale: number;
}

const CAM: CamKF[] = [
  { frame: 0, x: 540, y: 220, scale: 3.2 },
  { frame: 15, x: 700, y: 260, scale: 3.0 },
  { frame: 30, x: 920, y: 200, scale: 2.6 },
  { frame: 50, x: 800, y: 420, scale: 1.8 },
  { frame: 70, x: 1050, y: 600, scale: 1.55 },
  { frame: 88, x: 850, y: 770, scale: 1.35 },
  { frame: 108, x: 520, y: 970, scale: 1.1 },
  { frame: 128, x: 400, y: 1200, scale: 0.95 },
  { frame: 140, x: 600, y: 1300, scale: 0.88 },
  { frame: 158, x: 550, y: 1460, scale: 0.8 },
  { frame: 180, x: 380, y: 1700, scale: 0.68 },
  { frame: 205, x: 480, y: 2030, scale: 0.6 },
  { frame: 225, x: 480, y: 2030, scale: 0.6 },
  { frame: 265, x: 600, y: 1100, scale: 0.35 },
  { frame: 300, x: 600, y: 1100, scale: 0.35 },
];

// ─── Tilt keyframes (camera orbit oscillation) ───

interface TiltKF {
  frame: number;
  rotY: number; // lateral orbit angle in degrees
}

const TILT: TiltKF[] = [
  { frame: 0, rotY: 0 },
  { frame: 20, rotY: -18 },
  { frame: 40, rotY: 5 },
  { frame: 50, rotY: 16 },
  { frame: 62, rotY: 4 },
  { frame: 72, rotY: -15 },
  { frame: 85, rotY: 14 },
  { frame: 100, rotY: 17 },
  { frame: 115, rotY: 4 },
  { frame: 125, rotY: -16 },
  { frame: 138, rotY: 13 },
  { frame: 155, rotY: -14 },
  { frame: 175, rotY: 16 },
  { frame: 195, rotY: -15 },
  { frame: 210, rotY: 10 },
  { frame: 225, rotY: 10 },
  { frame: 265, rotY: -3 },
  { frame: 300, rotY: -3 },
];

// ─── Interpolation ───

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function interp<T extends { frame: number }>(
  kfs: T[],
  frame: number,
  get: (k: T) => number,
): number {
  if (frame <= kfs[0].frame) return get(kfs[0]);
  const last = kfs[kfs.length - 1];
  if (frame >= last.frame) return get(last);
  let i = 0;
  while (i < kfs.length - 2 && kfs[i + 1].frame <= frame) i++;
  const a = kfs[i];
  const b = kfs[i + 1];
  const t = easeInOutCubic((frame - a.frame) / (b.frame - a.frame));
  return get(a) + (get(b) - get(a)) * t;
}

// ─── Canvas text → Three.js texture ───

function makeTextTexture(
  text: string,
  fontSize: number,
  color: string,
): { tex: THREE.CanvasTexture; w: number; h: number } {
  const DPR = 3; // high-res for close-up zoom
  const px = fontSize * DPR;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const font = `900 ${px}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.font = font;
  const metrics = ctx.measureText(text);

  const pad = px * 0.15;
  canvas.width = Math.ceil(metrics.width + pad * 2);
  canvas.height = Math.ceil(px * 1.2 + pad * 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(text, pad, pad);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;

  return { tex, w: canvas.width / DPR, h: canvas.height / DPR };
}

// ─── Single word as a textured plane on the ground ───

function WordPlane({
  word,
  frame,
  fps,
}: {
  word: WordConfig;
  frame: number;
  fps: number;
}) {
  const { tex, w, h } = useMemo(
    () => makeTextTexture(word.text, word.fontSize, word.color),
    [word.text, word.fontSize, word.color],
  );

  const local = frame - word.enterFrame;
  if (local < 0) return null;

  const sp = spring({
    frame: local,
    fps,
    config: { damping: 12, stiffness: 110, mass: 0.9 },
  });
  const opacity = sp;
  const scl = interpolate(sp, [0, 1], [0.4, 1]);
  const lift = interpolate(sp, [0, 1], [0.5, 0]); // rises from below then settles

  if (opacity <= 0.01) return null;

  // Position on the ground plane (Y = 0), using XZ for horizontal layout
  const posX = (word.x - OX) * S;
  const posZ = word.y * S;

  // Plane size in world units
  const planeW = w * S;
  const planeH = h * S;

  return (
    <mesh
      position={[posX, lift, posZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[scl, scl, 1]}
    >
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── 3D Scene — camera flies through text on the ground ───

function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { camera } = useThree();

  // Interpolate 2D camera focus + zoom
  const cx = interp(CAM, frame, (k) => k.x);
  const cy = interp(CAM, frame, (k) => k.y);
  const cScale = interp(CAM, frame, (k) => k.scale);

  // Interpolate lateral tilt
  const tiltY = interp(TILT, frame, (k) => k.rotY);

  // ── Map to 3D camera position ──
  // Focus point on the ground
  const focusX = (cx - OX) * S;
  const focusZ = cy * S;

  // Camera distance from focus (inversely proportional to zoom)
  const baseDist = 6.5;
  const dist = baseDist / cScale;

  // Camera orbits the focus point at a fixed elevation angle
  const elevation = 28 * (Math.PI / 180); // 28° above the ground plane

  // Lateral orbit (the "tilt" = camera slides left/right around focus)
  const orbitAngle = tiltY * (Math.PI / 180);

  // Spherical → Cartesian (orbit around focus point)
  const camX = focusX + Math.sin(orbitAngle) * dist * Math.cos(elevation);
  const camY = dist * Math.sin(elevation);
  const camZ = focusZ + Math.cos(orbitAngle) * dist * Math.cos(elevation);

  // Subtle handheld shake
  const shk = 0.015 / cScale;
  const sx = Math.sin(frame * 0.7) * shk + Math.sin(frame * 1.3) * shk * 0.4;
  const sy = Math.cos(frame * 0.9) * shk * 0.3;

  // Apply to camera
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = 50;
  cam.near = 0.1;
  cam.far = 200;
  cam.updateProjectionMatrix();

  cam.position.set(camX + sx, camY + sy, camZ);
  cam.lookAt(focusX, 0, focusZ);

  return (
    <>
      {WORDS.map((w, i) => (
        <WordPlane key={i} word={w} frame={frame} fps={fps} />
      ))}
    </>
  );
}

// ─── Main export ───

export const Kinetic3DTypography: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#e8e8e8" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 50, position: [0, 5, 15], near: 0.1, far: 200 }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#e8e8e8"]} />
        <Scene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
