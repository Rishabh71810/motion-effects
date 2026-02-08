/**
 * ============================================================
 * EFFECT: 3D Bar Chart — Stack Growth
 * FILE: StackGrowth.tsx
 * COMPOSITION ID: StackGrowth
 * DURATION: 360 frames (12s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a premium After Effects-style 3D bar chart animation
 * using Three.js (@remotion/three) in Remotion. Four solid
 * wireframe rectangular prisms grow sequentially from a flat
 * ground surface, each representing a monetary value. After
 * each bar finishes growing, a connector line and value label
 * appear above it from the visual center of its top face.
 *
 * ─── BAR CONFIGURATION ───
 *
 *   4 bars arranged left-to-right with adjacent placement
 *   (touching, minimal 0.05-unit gap between edges).
 *   Each bar is a rectangular prism (BoxGeometry) with:
 *     - Fixed square cross-section: width = 0.9, depth = 0.9.
 *     - Variable height proportional to the value it represents.
 *   Example values: $250M (shortest), $350M, $500M, $650M (tallest).
 *   Heights: [0.7, 1.1, 1.5, 2.0] units.
 *   X positions at 0.95 intervals (0.9 width + 0.05 gap),
 *   centered around origin: [-1.425, -0.475, 0.475, 1.425].
 *
 *   Each bar has two properties:
 *     - accent: wireframe edge color (first bar orange #e8a040, rest white #ffffff)
 *     - fill: solid face color (first bar dark amber #2a1a08, rest dark grey #151515)
 *
 * ─── SOLID WIREFRAME RENDERING ───
 *
 *   Each bar renders as a SOLID dark block with wireframe edges on top.
 *   Two overlapping meshes per bar:
 *
 *   1. Solid fill mesh:
 *      - BoxGeometry with meshBasicMaterial
 *      - Color: bar.fill (#2a1a08 for orange bar, #151515 for others)
 *      - Opacity: 0.95 (nearly opaque — blocks what's behind)
 *      - side: THREE.DoubleSide
 *      - polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
 *        (pushes fill slightly back in depth to prevent z-fighting with edges)
 *
 *   2. Wireframe edges:
 *      - THREE.EdgesGeometry wrapping BoxGeometry (clean outline, no triangulation)
 *      - Rendered as <lineSegments> with <lineBasicMaterial>
 *      - Color: bar.accent (#e8a040 orange or #ffffff white)
 *      - Opacity: 0.8
 *      - Geometries created in useMemo() to avoid per-frame recreation
 *
 *   The result: cubes look like solid dark blocks with glowing edge outlines,
 *   NOT transparent glass boxes. This matches premium data-viz aesthetics.
 *
 * ─── 3D PERSPECTIVE (GROUP ROTATION) ───
 *
 *   All bars are children of a <group rotation={[0.3, 0.5, 0]}>.
 *   This creates the isometric-like 3D perspective:
 *     - X rotation 0.3 rad: tilts top faces toward camera (visible from above)
 *     - Y rotation 0.5 rad: rotates to show RIGHT face of each cube
 *     - Combined: classic 3/4 view — top, front, and right faces visible
 *
 *   The cubes appear to go from lower-left (shortest) to upper-right (tallest),
 *   creating a natural ascending bar chart diagonal.
 *
 * ─── CAMERA ───
 *
 *   Position: [0, 1.2, 10] — centered, slightly above, pulled well back.
 *   FOV: 38 degrees — narrow FOV minimizes perspective distortion.
 *   The camera auto-looks at [0, 0, 0] (R3F/ThreeCanvas default).
 *   This framing ensures all bars + connector lines + labels fit within
 *   the 1280x720 frame with comfortable margins.
 *
 * ─── SEQUENTIAL GROWTH ANIMATION ───
 *
 *   Bars grow one after another in a staggered cascade.
 *   Each bar scales from height 0 to full height on the Y-axis.
 *   Growth uses Easing.out(Easing.exp) for smooth deceleration.
 *   Growth duration per bar: 2.0 seconds.
 *   Stagger between bars: 1.2 seconds (overlapping cascade).
 *
 *   Timeline:
 *     Cube 1 ($250M): 0.0s – 2.0s
 *     Cube 2 ($350M): 1.2s – 3.2s
 *     Cube 3 ($500M): 2.4s – 4.4s
 *     Cube 4 ($650M): 3.6s – 5.6s
 *
 *   Growth mechanics:
 *     - position Y = currentHeight / 2 (keeps base anchored at ground y=0)
 *     - scale Y = growProgress (stretches box from 0 to full height)
 *     - Bar returns null when growProgress <= 0 (not yet started)
 *
 * ─── CONNECTOR LINES + VALUE LABELS (2D HTML OVERLAY) ───
 *
 *   After each bar reaches full height, a connector system appears:
 *
 *   1. Small dot (5px circle) at the visual center of the cube's top face.
 *   2. Thin vertical line (1px) growing upward from the dot (80px tall).
 *   3. Value label fading in above the line.
 *
 *   CRITICAL: Connector lines and labels are rendered as 2D HTML divs
 *   overlaid on top of the ThreeCanvas. This ensures:
 *     - Lines are perfectly vertical on screen (not tilted by 3D rotation)
 *     - Text renders crisply (no 3D text rendering needed)
 *
 *   3D → 2D PROJECTION:
 *     To position the 2D overlays correctly over the 3D cubes, we create
 *     an offscreen PerspectiveCamera matching the ThreeCanvas camera:
 *       - Same position [0, 1.2, 10], FOV 38, aspect ratio
 *       - MUST call cam.lookAt(0, 0, 0) to match R3F's default behavior
 *       - Apply the same group rotation matrix to local positions
 *       - Use Vector3.project(camera) to get NDC, then convert to pixels
 *
 *   VISUAL CENTER OF TOP FACE:
 *     The dot must land at the visual center of the top face on screen.
 *     Due to perspective distortion, the 3D center [x, height, 0] does NOT
 *     project to the visual center of the trapezoid. Instead:
 *       - Project all 4 corners of the top face to screen space
 *       - Average their X and Y coordinates
 *       - This gives the true visual centroid of the projected quadrilateral
 *
 *     Top face corners (group-local space):
 *       [x - w/2, height, -d/2]  (front-left)
 *       [x + w/2, height, -d/2]  (front-right)
 *       [x + w/2, height, +d/2]  (back-right)
 *       [x - w/2, height, +d/2]  (back-left)
 *
 *   Connector timeline per bar:
 *     - Dot + line appear: growEnd → growEnd + 0.5s (Easing.out quad)
 *     - Label fades in: connectorEnd → connectorEnd + 0.5s
 *
 * ─── TITLE TEXT ───
 *
 *   After all bars and labels are revealed, title text fades in (~1s).
 *
 *   Upper left (top: 45px, left: 45px):
 *     "OPTIONS BUILT FOR\nPERFORMANCE"
 *     14px, weight 500, uppercase, 0.08em tracking, white
 *
 *   Bottom left (bottom: 45px, left: 45px):
 *     "STACK GROWTH" — 28px, weight 600, white
 *     + small description text below: 10px, weight 300, 40% opacity
 *
 * ─── BACKGROUND ───
 *
 *   Dark near-black #0a0a0a for premium data-viz feel.
 *
 * ─── ANIMATION TIMELINE (30fps) ───
 *
 *   0.0s–2.0s  : Bar 1 grows ($250M, orange wireframe)
 *   1.2s–3.2s  : Bar 2 grows ($350M, white wireframe)
 *   2.0s–2.5s  : Bar 1 connector dot + line appears
 *   2.4s–4.4s  : Bar 3 grows ($500M)
 *   2.5s–3.0s  : Bar 1 value label "$250M" fades in (orange)
 *   3.2s–3.7s  : Bar 2 connector appears
 *   3.6s–5.6s  : Bar 4 grows ($650M)
 *   3.7s–4.2s  : Bar 2 label "$350M" fades in (white)
 *   4.4s–4.9s  : Bar 3 connector appears
 *   4.9s–5.4s  : Bar 3 label "$500M" fades in
 *   5.6s–6.1s  : Bar 4 connector appears
 *   6.1s–6.6s  : Bar 4 label "$650M" fades in
 *   6.6s–7.6s  : Title text fades in
 *   7.6s–12.0s : Hold (all elements visible)
 *
 * ─── TECHNICAL REQUIREMENTS ───
 *
 *   - @remotion/three ThreeCanvas with width/height props
 *   - All geometries in useMemo() (EdgesGeometry, BoxGeometry)
 *   - All animation driven by useCurrentFrame() + interpolate()
 *   - NO CSS animations, NO useFrame(), NO self-animating shaders
 *   - 2D overlay labels use THREE.PerspectiveCamera.project() for positioning
 *   - cam.lookAt(0,0,0) MUST be called to match R3F camera default
 *
 * ─── CUSTOMIZATION ───
 *
 *   - Change bar count by modifying the BARS array
 *   - Adjust heights to match different data values
 *   - Change BAR_WIDTH / BAR_DEPTH for thicker/thinner bars
 *   - Swap accent colors for different themes (cyan, gold, magenta)
 *   - Replace BoxGeometry with CylinderGeometry for round columns
 *   - Adjust GROUP_ROTATION for different viewing angles
 *   - Add slow Y-axis rotation for a spinning 3D effect
 *   - Change fill opacity (0.95) lower for glass/translucent look
 *
 * ─── OVERALL FEEL ───
 *
 *   Clean, premium data visualization motion design.
 *   Sequential reveal builds narrative tension bar by bar.
 *   Solid dark cubes with glowing wireframe edges.
 *   Slow, deliberate, Apple keynote-style pacing.
 *   First bar has warm amber accent for visual hierarchy.
 *
 * ============================================================
 */

import { ThreeCanvas } from "@remotion/three";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React, { useMemo } from "react";
import * as THREE from "three";

const BARS = [
  { value: "$250M", height: 0.7, x: -1.425, accent: "#e8a040", fill: "#2a1a08" },
  { value: "$350M", height: 1.1, x: -0.475, accent: "#ffffff", fill: "#151515" },
  { value: "$500M", height: 1.5, x: 0.475, accent: "#ffffff", fill: "#151515" },
  { value: "$650M", height: 2.0, x: 1.425, accent: "#ffffff", fill: "#151515" },
];

const BAR_WIDTH = 0.9;
const BAR_DEPTH = 0.9;
const GROW_DURATION = 2.0;
const STAGGER = 1.2;
const CONNECTOR_PX = 80;
const CONNECTOR_DURATION = 0.5;
const LABEL_FADE_DURATION = 0.5;

const GROUP_ROTATION = [0.3, 0.5, 0];
const CAMERA_POS = [0, 1.2, 10];
const CAMERA_FOV = 38;

const Bar = ({ barData, index, time }) => {
  const growStart = index * STAGGER;
  const growEnd = growStart + GROW_DURATION;

  const growProgress = interpolate(time, [growStart, growEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  const currentHeight = barData.height * growProgress;

  const edgesGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(BAR_WIDTH, barData.height, BAR_DEPTH);
    return new THREE.EdgesGeometry(box);
  }, []);

  if (growProgress <= 0) return null;

  return (
    <group position={[barData.x, currentHeight / 2, 0]} scale={[1, growProgress, 1]}>
      <mesh>
        <boxGeometry args={[BAR_WIDTH, barData.height, BAR_DEPTH]} />
        <meshBasicMaterial
          color={barData.fill}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={barData.accent} transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
};

const Scene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <>
      <ambientLight intensity={1.0} />
      <group rotation={GROUP_ROTATION}>
        {BARS.map((bar, i) => (
          <Bar key={i} barData={bar} index={i} time={t} />
        ))}
      </group>
    </>
  );
};

export const StackGrowth = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const projectToScreen = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      width / height,
      0.1,
      100
    );
    cam.position.set(...CAMERA_POS);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();

    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeRotationFromEuler(
      new THREE.Euler(GROUP_ROTATION[0], GROUP_ROTATION[1], GROUP_ROTATION[2])
    );

    return (localPos) => {
      const vec = new THREE.Vector3(...localPos);
      vec.applyMatrix4(rotMatrix);
      vec.project(cam);
      return {
        x: ((vec.x + 1) / 2) * width,
        y: ((-vec.y + 1) / 2) * height,
      };
    };
  }, [width, height]);

  const lastBarEnd =
    (BARS.length - 1) * STAGGER +
    GROW_DURATION +
    CONNECTOR_DURATION +
    LABEL_FADE_DURATION;

  const titleOpacity = interpolate(t, [lastBarEnd, lastBarEnd + 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: CAMERA_POS, fov: CAMERA_FOV }}
      >
        <Scene />
      </ThreeCanvas>

      {BARS.map((bar, i) => {
        const growEnd = i * STAGGER + GROW_DURATION;
        const connectorEnd = growEnd + CONNECTOR_DURATION;

        const connectorProgress = interpolate(
          t,
          [growEnd, connectorEnd],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }
        );

        const labelOpacity = interpolate(
          t,
          [connectorEnd, connectorEnd + LABEL_FADE_DURATION],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (connectorProgress <= 0 && labelOpacity <= 0) return null;

        const hw = BAR_WIDTH / 2;
        const hd = BAR_DEPTH / 2;
        const c1 = projectToScreen([bar.x - hw, bar.height, -hd]);
        const c2 = projectToScreen([bar.x + hw, bar.height, -hd]);
        const c3 = projectToScreen([bar.x + hw, bar.height, hd]);
        const c4 = projectToScreen([bar.x - hw, bar.height, hd]);
        const cubeTopScreen = {
          x: (c1.x + c2.x + c3.x + c4.x) / 4,
          y: (c1.y + c2.y + c3.y + c4.y) / 4,
        };
        const connectorHeight = CONNECTOR_PX * connectorProgress;

        return (
          <React.Fragment key={`overlay-${i}`}>
            {connectorProgress > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: cubeTopScreen.x - 2.5,
                  top: cubeTopScreen.y - 2.5,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: bar.accent,
                  opacity: 0.9 * connectorProgress,
                }}
              />
            )}

            {connectorProgress > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: cubeTopScreen.x - 0.5,
                  top: cubeTopScreen.y - connectorHeight,
                  width: 1,
                  height: connectorHeight,
                  backgroundColor: "#ffffff",
                  opacity: 0.4 * connectorProgress,
                }}
              />
            )}

            {labelOpacity > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: cubeTopScreen.x,
                  top: cubeTopScreen.y - CONNECTOR_PX - 10,
                  transform: "translateX(-50%)",
                  opacity: labelOpacity,
                  fontFamily:
                    "SF Pro Display, -apple-system, Helvetica, sans-serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: bar.accent,
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {bar.value}
              </div>
            )}
          </React.Fragment>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 45,
          left: 45,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "#ffffff",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.6,
          }}
        >
          OPTIONS BUILT FOR
          <br />
          PERFORMANCE
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 45,
          left: 45,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica, sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "0.02em",
            marginBottom: 10,
          }}
        >
          STACK GROWTH
        </div>
        <div
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica, sans-serif",
            fontSize: 10,
            fontWeight: 300,
            color: "#ffffff",
            opacity: 0.4,
            lineHeight: 1.5,
            maxWidth: 140,
          }}
        >
          Three day festival
          <br />
          of electronic music
          <br />
          and contemporary art
        </div>
      </div>
    </AbsoluteFill>
  );
};
