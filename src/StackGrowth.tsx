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

const GROUP_ROTATION: [number, number, number] = [0.3, 0.5, 0];
const CAMERA_POS: [number, number, number] = [0, 1.2, 10];
const CAMERA_FOV = 38;

const Bar: React.FC<{
  barData: (typeof BARS)[number];
  index: number;
  time: number;
}> = ({ barData, index, time }) => {
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
  }, [barData.height]);

  if (growProgress <= 0) return null;

  return (
    <group position={[barData.x, currentHeight / 2, 0]} scale={[1, growProgress, 1]}>
      {/* Solid dark fill — nearly opaque so cubes look solid */}
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
      {/* Wireframe edges on top */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={barData.accent} transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
};

const Scene: React.FC = () => {
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

export const StackGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // 3D → 2D projection matching group rotation + camera
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

    return (localPos: [number, number, number]) => {
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

      {/* 2D overlays: connector dots, vertical lines, value labels */}
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

        // Visual center of top face = average of 4 projected corners
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
            {/* Small dot at cube top */}
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

            {/* Vertical connector line going UP */}
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

            {/* Value label above connector */}
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

      {/* Title — upper left */}
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
            textTransform: "uppercase" as const,
            lineHeight: 1.6,
          }}
        >
          OPTIONS BUILT FOR
          <br />
          PERFORMANCE
        </div>
      </div>

      {/* Title — bottom left */}
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
