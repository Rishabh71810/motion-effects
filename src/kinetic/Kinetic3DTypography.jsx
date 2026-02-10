/**
 * ============================================================
 * EFFECT: Kinetic 3D Typography — WebGL Camera Fly-Through
 * FILE: Kinetic3DTypography.tsx
 * COMPOSITION ID: Kinetic3DTypography
 * DURATION: 300 frames (10s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a 3D kinetic typography animation using @remotion/three
 * and Three.js. Words are rendered as flat textured planes lying
 * on a ground plane (Y=0). A perspective camera flies through
 * the text, orbiting left and right to create a dramatic 3D
 * parallax tilt effect. Text is NOT 3D extruded — the 3D effect
 * comes entirely from the camera's viewing angle.
 *
 * ─── CORE CONCEPT ───
 *
 *   Words are 2D text rendered to canvas textures and applied
 *   to PlaneGeometry meshes. These planes lie flat on the
 *   ground (rotation -PI/2 on X axis). A PerspectiveCamera
 *   orbits above the ground, looking down at the text, creating
 *   a natural 3D parallax as it moves and tilts.
 *
 *   This is NOT CSS 3D transforms. It uses actual WebGL via
 *   @remotion/three's ThreeCanvas with @react-three/fiber.
 *
 * ─── WORD LAYOUT ───
 *
 *   Words are positioned in "pixel space" then converted to
 *   3D world coordinates using:
 *     const S = 0.01  (1 pixel = 0.01 world units)
 *     const OX = 640  (horizontal origin = center of 1280px)
 *     worldX = (pixelX - OX) * S
 *     worldZ = pixelY * S  (Y in pixel space → Z in 3D)
 *     worldY = 0  (ground plane)
 *
 *   Word list (text, pixelX, pixelY, fontSize, color, enterFrame):
 *     1. "animating"    x:400  y:200   90px  #111111  frame 0
 *     2. "text"         x:730  y:280   90px  #111111  frame 8
 *     3. "like"         x:950  y:180   110px #22c55e  frame 25
 *     4. "this"         x:800  y:450   220px #222222  frame 45
 *     5. "can"          x:1100 y:640   180px #222222  frame 65
 *     6. "be"           x:850  y:800   220px #222222  frame 82
 *     7. "challenging"  x:450  y:1020  190px #222222  frame 100
 *     8. "but"          x:280  y:1250  240px #22c55e  frame 122
 *     9. "this"         x:680  y:1280  210px #222222  frame 130
 *    10. "tutorial"     x:550  y:1500  230px #222222  frame 150
 *    11. "will"         x:300  y:1750  300px #222222  frame 172
 *    12. "help"         x:280  y:2050  250px #222222  frame 195
 *    13. "you"          x:850  y:2080  250px #22c55e  frame 203
 *
 *   Font: 900 weight, -apple-system, BlinkMacSystemFont,
 *         "Helvetica Neue", Helvetica, Arial, sans-serif
 *   Accent color: #22c55e (green) for "like", "but", "you"
 *
 * ─── CANVAS TEXT TEXTURES ───
 *
 *   Each word is rendered to an offscreen HTML5 Canvas at 3x DPR
 *   (device pixel ratio) for crisp close-up rendering:
 *
 *   1. Create canvas element
 *   2. Set font: `900 ${fontSize * 3}px -apple-system, ...`
 *   3. Measure text width with ctx.measureText()
 *   4. Canvas size = measured width + padding, fontSize * 1.2 + padding
 *      (padding = fontSize * DPR * 0.15 on each side)
 *   5. Fill text with ctx.fillText() at textBaseline "top"
 *   6. Create THREE.CanvasTexture from the canvas
 *   7. Set minFilter/magFilter to LinearFilter
 *   8. Disable mipmap generation (generateMipmaps = false)
 *   9. Return texture + dimensions (divided back by DPR)
 *
 *   Textures are memoized with useMemo keyed on text, fontSize, color.
 *
 * ─── WORD MESH ───
 *
 *   Each word is a Three.js mesh:
 *     - PlaneGeometry: width = canvasWidth * S, height = canvasHeight * S
 *     - MeshBasicMaterial: map=texture, transparent=true,
 *       side=DoubleSide, depthWrite=false
 *     - Rotation: [-PI/2, 0, 0] (lies flat on ground)
 *     - Position: [worldX, lift, worldZ]
 *
 *   Entrance animation (spring-driven):
 *     - Spring config: damping 12, stiffness 110, mass 0.9
 *     - opacity: 0 → 1 (spring value)
 *     - scale: 0.4 → 1.0
 *     - lift (Y position): 0.5 → 0 (rises from below, settles to ground)
 *     - Words with localFrame < 0 or opacity <= 0.01 return null
 *
 * ─── CAMERA KEYFRAMES (2D → 3D PROJECTION) ───
 *
 *   Camera movement is defined in 2D pixel space (matching word
 *   positions), then projected to 3D camera coordinates:
 *
 *   2D keyframes (frame → x, y, scale):
 *     frame 0:   x:540  y:220  scale:3.2
 *     frame 15:  x:700  y:260  scale:3.0
 *     frame 30:  x:920  y:200  scale:2.6
 *     frame 50:  x:800  y:420  scale:1.8
 *     frame 70:  x:1050 y:600  scale:1.55
 *     frame 88:  x:850  y:770  scale:1.35
 *     frame 108: x:520  y:970  scale:1.1
 *     frame 128: x:400  y:1200 scale:0.95
 *     frame 140: x:600  y:1300 scale:0.88
 *     frame 158: x:550  y:1460 scale:0.8
 *     frame 180: x:380  y:1700 scale:0.68
 *     frame 205: x:480  y:2030 scale:0.6
 *     frame 225: x:480  y:2030 scale:0.6   — hold
 *     frame 265: x:600  y:1100 scale:0.35  — zoom out
 *     frame 300: x:600  y:1100 scale:0.35  — hold
 *
 *   Interpolated with cubic ease-in-out between keyframes.
 *
 * ─── 2D → 3D CAMERA PROJECTION ───
 *
 *   Focus point (where camera looks):
 *     focusX = (cx - OX) * S    (pixel center → world X)
 *     focusZ = cy * S           (pixel Y → world Z)
 *     focusY = 0                (ground plane)
 *
 *   Camera distance from focus:
 *     baseDist = 6.5
 *     dist = baseDist / scale   (higher scale = closer camera)
 *
 *   Camera elevation (fixed angle above ground):
 *     elevation = 28 degrees
 *
 *   Lateral orbit angle (the "tilt"):
 *     Interpolated from TILT keyframes (see below)
 *     orbitAngle = tiltY in radians
 *
 *   Spherical → Cartesian conversion:
 *     camX = focusX + sin(orbitAngle) * dist * cos(elevation)
 *     camY = dist * sin(elevation)
 *     camZ = focusZ + cos(orbitAngle) * dist * cos(elevation)
 *
 *   Camera always looks at (focusX, 0, focusZ).
 *
 * ─── TILT KEYFRAMES (CAMERA ORBIT OSCILLATION) ───
 *
 *   The camera oscillates left and right around the focus point,
 *   creating a dramatic parallax effect. Values are lateral orbit
 *   angles in degrees:
 *
 *     frame 0:    0deg    (straight on)
 *     frame 20:  -18deg   (swing left)
 *     frame 40:   5deg    (swing right)
 *     frame 50:   16deg
 *     frame 62:   4deg
 *     frame 72:  -15deg
 *     frame 85:   14deg
 *     frame 100:  17deg
 *     frame 115:  4deg
 *     frame 125: -16deg
 *     frame 138:  13deg
 *     frame 155: -14deg
 *     frame 175:  16deg
 *     frame 195: -15deg
 *     frame 210:  10deg
 *     frame 225:  10deg   (hold)
 *     frame 265: -3deg    (settle)
 *     frame 300: -3deg    (hold)
 *
 *   This creates a pendulum-like swing, ~15-18deg amplitude,
 *   gradually settling as the camera zooms out.
 *
 * ─── CAMERA SHAKE ───
 *
 *   Subtle organic handheld vibration layered on camera position:
 *     shk = 0.015 / cScale  (intensity decreases with zoom)
 *     sx = sin(frame * 0.7) * shk + sin(frame * 1.3) * shk * 0.4
 *     sy = cos(frame * 0.9) * shk * 0.3
 *   Applied as offset to camera position: (camX + sx, camY + sy, camZ)
 *
 * ─── THREE.JS SCENE SETUP ───
 *
 *   ThreeCanvas (from @remotion/three):
 *     - width/height: composition dimensions
 *     - camera: fov 50, position [0, 5, 15], near 0.1, far 200
 *     - style: width/height 100%
 *
 *   Scene background: #e8e8e8 via <color attach="background">
 *   No lights needed (MeshBasicMaterial is unlit)
 *
 *   Camera is updated every frame via useThree():
 *     cam.fov = 50
 *     cam.near = 0.1
 *     cam.far = 200
 *     cam.updateProjectionMatrix()
 *     cam.position.set(camX + sx, camY + sy, camZ)
 *     cam.lookAt(focusX, 0, focusZ)
 *
 * ─── RENDERING STRUCTURE ───
 *
 *   AbsoluteFill (backgroundColor #e8e8e8)
 *     └─ ThreeCanvas
 *          └─ <color attach="background" args={["#e8e8e8"]} />
 *          └─ Scene
 *               ├─ Camera updates (via useThree)
 *               └─ WordPlane × 13 (one per word)
 *                    └─ <mesh rotation={[-PI/2, 0, 0]}>
 *                         <planeGeometry args={[w, h]} />
 *                         <meshBasicMaterial map={tex} ... />
 *                       </mesh>
 *
 * ─── ANIMATION TIMELINE ───
 *
 *   frame 0-15:    "animating" appears, camera pans right
 *   frame 8-30:    "text" appears
 *   frame 25-50:   "like" (green) appears, camera tilts left -18deg
 *   frame 45-70:   "this" at 220px, camera swings right
 *   frame 65-88:   "can" at 180px
 *   frame 82-108:  "be" at 220px, camera oscillates
 *   frame 100-128: "challenging" at 190px
 *   frame 122-140: "but" (green) at 240px
 *   frame 130-158: "this" at 210px
 *   frame 150-180: "tutorial" at 230px
 *   frame 172-205: "will" at 300px (largest)
 *   frame 195-225: "help" and "you" (green) appear
 *   frame 225-265: Camera holds then zooms out to scale 0.35
 *   frame 265-300: Hold at full view, tilt settles to -3deg
 *
 * ─── TECHNICAL REQUIREMENTS ───
 *
 *   Dependencies:
 *     - @remotion/three (ThreeCanvas)
 *     - @react-three/fiber (useThree)
 *     - three (THREE namespace: CanvasTexture, LinearFilter,
 *       DoubleSide, PerspectiveCamera)
 *     - remotion (useCurrentFrame, useVideoConfig, interpolate, spring)
 *
 *   - Spring config MUST be nested: config: { damping, stiffness, mass }
 *   - All motion driven by frame-based interpolation
 *   - Canvas textures created once and memoized (useMemo)
 *   - Camera updated imperatively each frame (not via props)
 *   - No CSS animations, no requestAnimationFrame
 *   - MeshBasicMaterial (unlit) — no lights needed
 *   - depthWrite: false to prevent z-fighting between text planes
 *
 * ─── CUSTOMIZATION ───
 *
 *   - WORDS array: change text, positions, sizes, colors, timing
 *   - CAM keyframes: adjust camera path and zoom levels
 *   - TILT keyframes: change oscillation pattern and amplitude
 *   - elevation: change viewing angle (28deg default)
 *   - baseDist: change base camera distance (6.5 default)
 *   - S constant: change pixel-to-world scale (0.01 default)
 *   - Background color: #e8e8e8
 *   - Accent color: #22c55e for highlighted words
 *   - Font: change in makeTextTexture function
 *   - DPR: change from 3 for different texture quality/performance
 *   - Camera shake: adjust shk multiplier (0.015)
 *   - Spring config: tune damping 12, stiffness 110, mass 0.9
 *
 * ─── OVERALL FEEL ───
 *
 *   Cinematic 3D fly-through of bold typography on a ground plane.
 *   Camera orbits create parallax depth — text appears to have
 *   real physical presence without any 3D extrusion. The
 *   oscillating tilt gives a dynamic "cube rotation" effect as
 *   the camera sweeps left and right. Words grow progressively
 *   larger as the message builds to its conclusion. Spring
 *   physics give natural, organic entrance animations. Camera
 *   shake adds documentary-style handheld texture. The final
 *   zoom-out reveals the full typographic landscape from above.
 *   Light gray background with dark text and green accents
 *   creates a clean, modern editorial look.
 *
 * ============================================================
 */

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

const WORDS = [
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

const CAM = [
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

const TILT = [
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

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function interp(kfs, frame, get) {
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

function makeTextTexture(text, fontSize, color) {
  const DPR = 3; // high-res for close-up zoom
  const px = fontSize * DPR;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

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

function WordPlane({ word, frame, fps }) {
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
  const cam = camera;
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

export const Kinetic3DTypography = () => {
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
