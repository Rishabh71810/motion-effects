import { ThreeCanvas } from "@remotion/three";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Constants ───

const SECTION_HEIGHT = 1920;

// SVG brush stroke paths (organic abstract shapes)
const BRUSH_PATH_1 =
  "M 20,80 C 60,10 140,-10 220,40 C 300,90 360,30 420,70 C 480,110 440,180 360,160 C 280,140 200,190 120,150 C 40,110 -10,100 20,80 Z";
const BRUSH_PATH_2 =
  "M 30,10 C 80,60 160,100 250,70 C 340,40 400,120 350,190 C 300,260 200,240 130,280 C 60,320 -10,260 20,190 C 50,120 -20,50 30,10 Z";

// Diagonal stroke path for section 3 — single curve, drawn on with thick strokeWidth
const BAND_STROKE_PATH =
  "M -200,1600 C 100,1300 400,1000 700,850 C 900,720 1100,550 1400,400";

// Cursor arrow path
const CURSOR_SVG =
  "M 0,0 L 0,22 L 5.5,17.5 L 9.5,26 L 13,24.5 L 9,16 L 15.5,15.5 Z";

// Typing config
const TYPED_TEXT =
  "In today's fast-paced world, everyone is searching for shortcuts\u2014quick fixes that promise instant results with minimal effort. This desire for speed has become deeply embedded in our culture.";

// Subtitle for section 3
const SUBTITLE_TEXT =
  "Truth is one of the most powerful and essential values in human life. It serves as the foundation for trust, justice, growth, and meaningful relationships.";

// ─── Scroll keyframes ───

interface ScrollKF {
  t: number;
  y: number;
}

const SCROLL_KFS: ScrollKF[] = [
  { t: 0, y: 0 },
  { t: 5.0, y: 0 },
  { t: 6.5, y: -SECTION_HEIGHT },
  { t: 12.0, y: -SECTION_HEIGHT },
  { t: 13.5, y: -SECTION_HEIGHT * 2 },
  { t: 16.0, y: -SECTION_HEIGHT * 2 },
  { t: 17.5, y: -SECTION_HEIGHT * 3 },
  { t: 22.0, y: -SECTION_HEIGHT * 3 },
];

// ─── Helpers ───

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getScrollY(t: number): number {
  if (t <= SCROLL_KFS[0].t) return SCROLL_KFS[0].y;
  const last = SCROLL_KFS[SCROLL_KFS.length - 1];
  if (t >= last.t) return last.y;

  let i = 0;
  while (i < SCROLL_KFS.length - 2 && SCROLL_KFS[i + 1].t <= t) i++;

  const a = SCROLL_KFS[i];
  const b = SCROLL_KFS[i + 1];
  const progress = easeInOutCubic((t - a.t) / (b.t - a.t));
  return a.y + (b.y - a.y) * progress;
}

// ─── Dot Grid with Net Lines (memoized for performance) ───

const GRID_SPACING = 65;
const GRID_DOT_R = 3;
const GRID_W = 600;
const GRID_H = 500;

const DotNetGrid = React.memo(() => {
  const cols = Math.floor(GRID_W / GRID_SPACING) + 1;
  const rows = Math.floor(GRID_H / GRID_SPACING) + 1;
  const elements: React.ReactNode[] = [];

  // Horizontal lines
  for (let r = 0; r < rows; r++) {
    elements.push(
      <line
        key={`h-${r}`}
        x1={0}
        y1={r * GRID_SPACING}
        x2={GRID_W}
        y2={r * GRID_SPACING}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />,
    );
  }

  // Vertical lines
  for (let c = 0; c < cols; c++) {
    elements.push(
      <line
        key={`v-${c}`}
        x1={c * GRID_SPACING}
        y1={0}
        x2={c * GRID_SPACING}
        y2={GRID_H}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />,
    );
  }

  // Dots at intersections
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      elements.push(
        <circle
          key={`d-${r}-${c}`}
          cx={c * GRID_SPACING}
          cy={r * GRID_SPACING}
          r={GRID_DOT_R}
          fill="rgba(0,0,0,0.15)"
        />,
      );
    }
  }

  return (
    <svg
      width={GRID_W}
      height={GRID_H}
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      style={{
        position: "absolute",
        left: (1080 - GRID_W) / 2,
        top: (SECTION_HEIGHT - GRID_H) / 2 - 120,
      }}
    >
      {elements}
    </svg>
  );
});

// ─── Section 1: Brush Strokes + "SHORTCUTS" Selection ───

const Section1: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  // Text entrance — "Everyone is chasing"
  const line1Opacity = interpolate(t, [1.0, 1.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(t, [1.0, 1.6], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "SHORTCUTS" entrance
  const shortcutsOpacity = interpolate(t, [1.6, 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shortcutsScale = interpolate(t, [1.6, 2.2], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Full selection area — covers BOTH "Everyone is chasing" and "SHORTCUTS"
  const boxW = 640;
  const boxH = 200;
  const boxX = (1080 - boxW) / 2;
  const boxY = 960 - boxH / 2 - 5; // centered on both lines

  // Cursor appears at top-left of the box area, then drags to bottom-right
  const cursorOpacity = interpolate(t, [2.3, 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor drags from top-left corner to bottom-right corner
  const dragProgress = interpolate(t, [2.5, 3.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cursorX = boxX + dragProgress * boxW;
  const cursorY = boxY + dragProgress * boxH;

  // Dashed border grows from top-left as cursor drags — width/height follow cursor
  const borderW = Math.max(0, dragProgress * boxW);
  const borderH = Math.max(0, dragProgress * boxH);
  const borderVisible = t >= 2.5;
  const dashOffset = -(frame * 0.6);


  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: SECTION_HEIGHT,
        overflow: "hidden",
      }}
    >
      {/* Text block — centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: SECTION_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* "Everyone is chasing" */}
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 48,
            fontWeight: 400,
            color: "#333",
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}
        >
          Everyone is chasing
        </span>

        {/* "SHORTCUTS" — smaller text */}
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 72,
            fontWeight: 900,
            color: "#000",
            opacity: shortcutsOpacity,
            transform: `scale(${shortcutsScale})`,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          SHORTCUTS
        </span>
      </div>

      {/* Dashed selection border — grows from top-left as cursor drags */}
      {borderVisible && borderW > 2 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: SECTION_HEIGHT,
            pointerEvents: "none",
          }}
        >
          <rect
            x={boxX}
            y={boxY}
            width={borderW}
            height={borderH}
            fill="none"
            stroke="#333"
            strokeWidth={1.5}
            strokeDasharray="8 5"
            strokeDashoffset={dashOffset}
          />
          {/* Corner handles — at the 4 corners of the current border rect */}
          {[
            [boxX, boxY],
            [boxX + borderW, boxY],
            [boxX, boxY + borderH],
            [boxX + borderW, boxY + borderH],
          ].map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx - 4}
              y={cy - 4}
              width={8}
              height={8}
              fill="#333"
            />
          ))}
        </svg>
      )}

      {/* Cursor arrow — drags from top-left to bottom-right */}
      <svg
        width="20"
        height="30"
        viewBox="0 0 16 27"
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          opacity: cursorOpacity,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
        }}
      >
        <path d={CURSOR_SVG} fill="#000" />
      </svg>
    </div>
  );
};

// ─── 3D Pill Scene (Three.js) ───

function PillScene({ rotX }: { rotX: number }) {
  const { camera } = useThree();

  // Set up camera
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = 35;
  cam.near = 0.1;
  cam.far = 100;
  cam.position.set(0, 0, 6);
  cam.lookAt(0, 0, 0);
  cam.updateProjectionMatrix();

  // Build capsule geometry: top hemisphere + cylinder + bottom hemisphere
  const topCapGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    geo.translate(0, 0.6, 0);
    return geo;
  }, []);

  const bodyGeo = useMemo(() => {
    return new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32);
  }, []);

  const bottomCapGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    geo.translate(0, -0.6, 0);
    return geo;
  }, []);

  // Small spheres inside the bottom half
  const granules = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.35;
      const y = -0.1 - Math.random() * 0.9;
      positions.push([Math.cos(angle) * r, y, Math.sin(angle) * r]);
    }
    return positions;
  }, []);

  // Materials
  const topMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#555", roughness: 0.4, metalness: 0.1 }),
    [],
  );
  const bottomMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#888", roughness: 0.5, metalness: 0.05 }),
    [],
  );
  const granuleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#aaa", roughness: 0.3, metalness: 0.1 }),
    [],
  );
  const granuleGeo = useMemo(() => new THREE.SphereGeometry(0.08, 8, 8), []);

  const rx = (rotX * Math.PI) / 180;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} />
      <directionalLight position={[-2, -3, 2]} intensity={0.3} />

      <group rotation={[rx, 0, 0]}>
        {/* Top cap */}
        <mesh geometry={topCapGeo} material={topMat} />
        {/* Body — top half dark, bottom half lighter */}
        <mesh geometry={bodyGeo}>
          <meshStandardMaterial color="#4a4a4a" roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Bottom cap */}
        <mesh geometry={bottomCapGeo} material={bottomMat} />

        {/* Divider ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 32]} />
          <meshStandardMaterial color="#333" roughness={0.6} />
        </mesh>

        {/* Granules in bottom half */}
        {granules.map((pos, i) => (
          <mesh key={i} position={pos} geometry={granuleGeo} material={granuleMat} />
        ))}
      </group>
    </>
  );
}

// ─── Section 2: Net Grid + 3D Pill + Fading Text ───

// Split typed text into words for fade-in
const TYPED_WORDS = TYPED_TEXT.split(" ");
const WORD_FADE_DURATION = 0.18; // seconds per word to fully fade in
const WORD_STAGGER = 0.12; // delay between each word starting

const Section2: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  // Section-local time (section becomes visible around t=6.5)
  const sectionFade = interpolate(t, [6.5, 7.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pill rotation — spins around X axis
  const pillRotX = interpolate(t, [6.5, 16.0], [0, 720], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pill entrance
  const pillScale = interpolate(t, [6.5, 7.3], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pillOpacity = interpolate(t, [6.5, 7.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Word-by-word fade-in start time
  const fadeStart = 7.7;

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_HEIGHT,
        left: 0,
        width: 1080,
        height: SECTION_HEIGHT,
        overflow: "hidden",
      }}
    >
      {/* Dotted net grid background — centered behind pill */}
      <div style={{ opacity: sectionFade }}>
        <DotNetGrid />
      </div>

      {/* 3D Pill — WebGL via ThreeCanvas */}
      <div
        style={{
          position: "absolute",
          left: (1080 - 400) / 2,
          top: SECTION_HEIGHT / 2 - 350,
          width: 400,
          height: 400,
          opacity: pillOpacity,
          transform: `scale(${pillScale})`,
        }}
      >
        <ThreeCanvas
          width={400}
          height={400}
          camera={{ fov: 35, position: [0, 0, 6], near: 0.1, far: 100 }}
          style={{ width: 400, height: 400, background: "transparent" }}
        >
          <color attach="background" args={["#f5f5f0"]} />
          <PillScene rotX={pillRotX} />
        </ThreeCanvas>
      </div>

      {/* Fading word-by-word text */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: SECTION_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 400,
        }}
      >
        {/* Fading word-by-word text */}
        <div
          style={{
            marginTop: 80,
            maxWidth: 800,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          <span
            style={{
              fontFamily:
                "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 1.55,
              letterSpacing: "-0.01em",
            }}
          >
            {TYPED_WORDS.map((word, i) => {
              const wordStart = fadeStart + i * WORD_STAGGER;
              const wordOpacity = interpolate(
                t,
                [wordStart, wordStart + WORD_FADE_DURATION],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              return (
                <span
                  key={i}
                  style={{
                    color: `rgba(30, 30, 30, ${wordOpacity})`,
                  }}
                >
                  {word}{" "}
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Section 3: "here is the truth" + Frame + Brush Line ───

const Section3: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  // Title entrance
  const titleOpacity = interpolate(t, [13.5, 14.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = interpolate(t, [13.5, 14.2], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(t, [13.5, 14.2], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Ornate frame
  const frameOpacity = interpolate(t, [13.8, 14.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameRotation = interpolate(t, [13.5, 16.0], [-6, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameScale = interpolate(t, [13.8, 14.5], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Diagonal stroke — draws on from one end to the other
  const strokeProgress = interpolate(t, [13.5, 15.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Subtitle
  const subOpacity = interpolate(t, [14.5, 15.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(t, [14.5, 15.2], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_HEIGHT * 2,
        left: 0,
        width: 1080,
        height: SECTION_HEIGHT,
        overflow: "hidden",
      }}
    >
      {/* Thick diagonal stroke — draws on like a brush from bottom-left to top-right */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <path
          d={BAND_STROKE_PATH}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={200}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - strokeProgress}
        />
      </svg>

      {/* "here is the" + "truth" — positioned in upper area */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          width: 1080,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale}) translateY(${titleY}px)`,
        }}
      >
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 52,
            fontWeight: 400,
            color: "#333",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          here is the
        </span>
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 130,
            fontWeight: 900,
            color: "#111",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          truth
        </span>
      </div>

      {/* Ornate picture frame — sitting on the diagonal band */}
      <div
        style={{
          position: "absolute",
          top: SECTION_HEIGHT / 2 - 100,
          left: (1080 - 360) / 2,
          width: 360,
          height: 360,
          opacity: frameOpacity,
          transform: `rotate(${frameRotation}deg) scale(${frameScale})`,
          filter: "drop-shadow(8px 12px 20px rgba(0,0,0,0.4))",
        }}
      >
        {/* Outer ornate border */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "12px solid #d4d0c8",
            borderRadius: 6,
            boxShadow:
              "inset 0 0 0 3px #b8b4aa, inset 0 0 0 6px #e8e4dc, 0 0 0 3px #b8b4aa",
          }}
        />
        {/* Inner frame border */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "4px solid #c8c4bc",
            borderRadius: 3,
          }}
        />
        {/* Corner flourishes */}
        {[
          { top: -8, left: -8 },
          { top: -8, right: -8 },
          { bottom: -8, left: -8 },
          { bottom: -8, right: -8 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 24,
              height: 24,
              borderRadius: 12,
              background:
                "radial-gradient(circle, #d8d4cc 40%, #b8b4aa 70%, transparent 71%)",
            } as React.CSSProperties}
          />
        ))}
        {/* Edge ornaments — top & bottom center */}
        {[
          { top: -10, left: "50%", transform: "translateX(-50%)" },
          { bottom: -10, left: "50%", transform: "translateX(-50%)" },
          { top: "50%", left: -10, transform: "translateY(-50%)" },
          { top: "50%", right: -10, transform: "translateY(-50%)" },
        ].map((pos, i) => (
          <div
            key={`e-${i}`}
            style={{
              position: "absolute",
              ...pos,
              width: 20,
              height: 20,
              borderRadius: 10,
              background:
                "radial-gradient(circle, #ddd8d0 30%, #c0bcb4 60%, transparent 61%)",
            } as React.CSSProperties}
          />
        ))}
        {/* Inner content area */}
        <div
          style={{
            position: "absolute",
            inset: 28,
            background: "#f8f6f2",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              background:
                "linear-gradient(135deg, #eee 0%, #ddd 50%, #e8e8e8 100%)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Subtitle text — positioned below the frame */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        <div
          style={{
            maxWidth: 680,
            textAlign: "center",
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <span
            style={{
              fontFamily:
                "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
              fontSize: 32,
              fontWeight: 600,
              color: "#555",
              lineHeight: 1.6,
              letterSpacing: "-0.01em",
              fontStyle: "italic",
            }}
          >
            {SUBTITLE_TEXT}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Particles for Section 4 dark background ───

const PARTICLES: { x: number; y: number; r: number; speed: number; phase: number }[] = [];
for (let i = 0; i < 50; i++) {
  PARTICLES.push({
    x: Math.sin(i * 137.508 * (Math.PI / 180)) * 540 + 540, // golden angle spread
    y: Math.cos(i * 137.508 * (Math.PI / 180) * 0.7 + i * 0.3) * 960 + 960,
    r: 1 + (i % 3) * 0.6,
    speed: 0.5 + (i % 5) * 0.4,
    phase: (i * 2.39996) % (Math.PI * 2),
  });
}

// ─── Section 4: "Start Now" Pill Button ───

const Section4: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  // Inner pill button entrance
  const buttonOpacity = interpolate(t, [17.8, 18.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonScale = interpolate(t, [17.8, 18.4], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "Start Now" text
  const textOpacity = interpolate(t, [18.4, 18.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Middle ring (dark fill with border)
  const midOpacity = interpolate(t, [18.2, 18.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const midScale = interpolate(t, [18.2, 18.7], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Outer ring (thin outline)
  const outerOpacity = interpolate(t, [18.5, 19.0], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outerScale = interpolate(t, [18.5, 19.0], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // 3D cursor — slides in from bottom-right
  const cursorOpacity = interpolate(t, [18.8, 19.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorSlide = interpolate(t, [18.8, 19.3], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Particle fade-in
  const particleFade = interpolate(t, [17.5, 18.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_HEIGHT * 3,
        left: 0,
        width: 1080,
        height: SECTION_HEIGHT,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 45%, #1a2a3d 0%, #111d2c 40%, #0a1420 100%)",
      }}
    >
      {/* Background particles */}
      {PARTICLES.map((p, i) => {
        const twinkle =
          0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * p.speed * 0.05 + p.phase));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              backgroundColor: `rgba(160, 190, 220, ${twinkle * particleFade * 0.4})`,
            }}
          />
        );
      })}

      {/* Centered button group */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: SECTION_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer ring — large thin semi-transparent outline */}
        <div
          style={{
            position: "absolute",
            width: 580,
            height: 350,
            borderRadius: 175,
            border: "1.5px solid rgba(130, 165, 200, 0.25)",
            opacity: outerOpacity,
            transform: `scale(${outerScale})`,
          }}
        />

        {/* Middle ring — dark filled with subtle border */}
        <div
          style={{
            position: "absolute",
            width: 490,
            height: 285,
            borderRadius: 143,
            backgroundColor: "rgba(10, 18, 30, 0.85)",
            border: "1.5px solid rgba(130, 165, 200, 0.18)",
            opacity: midOpacity,
            transform: `scale(${midScale})`,
          }}
        />

        {/* Inner white outline ring — wraps the button */}
        <div
          style={{
            position: "absolute",
            width: 410,
            height: 210,
            borderRadius: 105,
            border: "1.5px solid rgba(200, 220, 240, 0.35)",
            opacity: buttonOpacity,
            transform: `scale(${buttonScale})`,
          }}
        />

        {/* Inner pill button — glossy gradient */}
        <div
          style={{
            position: "relative",
            width: 380,
            height: 190,
            borderRadius: 95,
            background:
              "linear-gradient(180deg, rgba(80, 115, 160, 0.65) 0%, rgba(35, 55, 90, 0.8) 45%, rgba(22, 40, 65, 0.9) 100%)",
            border: "1px solid rgba(180, 210, 240, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: buttonOpacity,
            transform: `scale(${buttonScale})`,
            boxShadow:
              "0 4px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(60, 100, 160, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Glossy top highlight */}
          <div
            style={{
              position: "absolute",
              top: 3,
              left: 25,
              right: 25,
              height: "42%",
              borderRadius: "90px 90px 50% 50%",
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.01) 100%)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontFamily:
                "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
              fontSize: 48,
              fontWeight: 500,
              color: `rgba(255, 255, 255, ${textOpacity})`,
              letterSpacing: "-0.01em",
              position: "relative",
              zIndex: 1,
            }}
          >
            Start Now
          </span>
        </div>

        {/* 3D Cursor — faceted arrow */}
        <svg
          width="55"
          height="65"
          viewBox="0 0 55 65"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: 175,
            marginTop: 55,
            opacity: cursorOpacity,
            transform: `translate(${cursorSlide}px, ${cursorSlide}px)`,
            filter: "drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.6))",
          }}
        >
          {/* Left face — lightest */}
          <polygon points="4,2 4,48 22,38" fill="#ddd0e8" />
          {/* Right face — medium */}
          <polygon points="4,2 22,38 40,30" fill="#c0b0d4" />
          {/* Bottom-left notch */}
          <polygon points="4,48 15,43 19,57" fill="#b0a0c4" />
          {/* Bottom-right connector */}
          <polygon points="15,43 22,38 25,51 19,57" fill="#ccbedd" />
        </svg>
      </div>
    </div>
  );
};

// ─── Main Component ───

export const ShortcutsMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const scrollY = getScrollY(t);

  // Brush strokes — persistent across sections 1 & 2, fade out before section 3
  const brushFadeIn = interpolate(t, [0, 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brushFadeOut = interpolate(t, [12.0, 13.0], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brushOpacity = brushFadeIn * brushFadeOut;
  const brushRot1 = frame * 0.18;
  const brushRot2 = -frame * 0.14;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5f5f0", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: SECTION_HEIGHT * 4,
          transform: `translateY(${scrollY}px)`,
          willChange: "transform",
        }}
      >
        <Section1 t={t} frame={frame} />
        <Section2 t={t} frame={frame} />
        <Section3 t={t} frame={frame} />
        <Section4 t={t} frame={frame} />
      </div>

      {/* Brush strokes — fixed overlay, visible across sections 1 & 2 */}
      <svg
        width="460"
        height="300"
        viewBox="0 0 460 300"
        style={{
          position: "absolute",
          top: -30,
          right: -60,
          opacity: brushOpacity,
          transform: `rotate(${brushRot1}deg)`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        <path d={BRUSH_PATH_1} fill="#111" />
      </svg>

      <svg
        width="420"
        height="320"
        viewBox="0 0 420 320"
        style={{
          position: "absolute",
          bottom: 80,
          left: -70,
          opacity: brushOpacity,
          transform: `rotate(${brushRot2}deg)`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        <path d={BRUSH_PATH_2} fill="#111" />
      </svg>
    </AbsoluteFill>
  );
};
