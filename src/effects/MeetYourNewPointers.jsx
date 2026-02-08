/**
 * ============================================================
 * EFFECT: Meet Your New — Cascading Play-Button Pointers
 * FILE: MeetYourNewPointers.tsx
 * COMPOSITION ID: Phase 3 of MeetYourNewCombined
 * DURATION: 150 frames (5s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create Phase 3 of the Google "Meet your new" animation. After the
 * button click, cascading play-button triangles grow one by one from
 * the center of the screen, each spawning from the tip of the
 * previous one, while the camera pans to the right.
 *
 * Initial state:
 *   - The "+ New" button from Phase 2 is at center, zoomed to 5x
 *   - Button fades out over the first 0.4s
 *   - Background: white (#ffffff)
 *
 * Pointer chain (7 triangles):
 *   Sizes: [140, 200, 280, 380, 500, 650, 840]
 *   Colors: [#d4c5fe, #c4b5fd, #b49afa, #a78bfa, #9a9cf6, #93a8f8, #8ab8f8]
 *   (purple-to-blue gradient progression)
 *   Delays: [0.15, 0.4, 0.65, 0.9, 1.15, 1.4, 1.65] seconds
 *
 *   Each triangle is an SVG polygon: points="0,0 w,h/2 0,h"
 *   where w = size * 0.9, h = size. Filled with a linear gradient
 *   (0.85 opacity to 1.0 opacity of the color).
 *
 *   Chain math: each pointer's left edge starts at the previous
 *   pointer's tip (tipX = leftX + w). First pointer starts at
 *   centerX (640).
 *
 *   Scale animation: each pointer scales from 0 to 1 over 0.5s
 *   with Easing.out(Easing.back(1.2)), transformOrigin: "left center"
 *   Opacity: 0 to 1 over 0.12s (instant pop-in)
 *
 * Camera pan:
 *   The entire scene shifts left via translateX:
 *   interpolate(t, [0, 3.5], [0, -width * 0.7]) = -896px
 *   with Easing.inOut(Easing.cubic)
 *   This gives the illusion of the camera moving right.
 *
 * Google "G" logo:
 *   Fixed at bottom-right (right: 40, bottom: 30)
 *   Fades in from t=3.0 to t=3.5s
 *
 * ============================================================
 */

import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

const POINTERS = [
  { delay: 0.15, size: 140, color: "#d4c5fe" },
  { delay: 0.4, size: 200, color: "#c4b5fd" },
  { delay: 0.65, size: 280, color: "#b49afa" },
  { delay: 0.9, size: 380, color: "#a78bfa" },
  { delay: 1.15, size: 500, color: "#9a9cf6" },
  { delay: 1.4, size: 650, color: "#93a8f8" },
  { delay: 1.65, size: 840, color: "#8ab8f8" },
];

const Triangle = ({ size, color, scale, opacity }) => {
  const h = size;
  const w = size * 0.9;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        display: "block",
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "left center",
      }}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,0 ${w},${h / 2} 0,${h}`}
        fill={`url(#grad-${color})`}
      />
    </svg>
  );
};

export const MeetYourNewPointers = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const centerX = width / 2;
  const centerY = height / 2;

  const panX = interpolate(t, [0, 3.5], [0, -width * 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const positions = [];
  let currentTipX = centerX;
  for (const ptr of POINTERS) {
    const w = ptr.size * 0.9;
    positions.push({
      leftX: currentTipX,
      topY: centerY - ptr.size / 2,
    });
    currentTipX = currentTipX + w;
  }

  const gOpacity = interpolate(t, [3.0, 3.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${panX}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: `translate(-50%, -50%) scale(5)`,
            opacity: interpolate(t, [0, 0.4], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 36px",
              borderRadius: 22,
              background: "linear-gradient(180deg, #f8f9fb 0%, #eef1f5 100%)",
              border: "1.5px solid #d2e3fc",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <span
              style={{
                fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: 43,
                fontWeight: 300,
                color: "#3c4043",
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span
              style={{
                fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: 39,
                fontWeight: 400,
                color: "#3c4043",
                lineHeight: 1,
              }}
            >
              New
            </span>
          </div>
        </div>

        {POINTERS.map((ptr, i) => {
          const scaleProgress = interpolate(
            t,
            [ptr.delay, ptr.delay + 0.5],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.back(1.2)),
            },
          );

          const pointerOpacity = interpolate(
            t,
            [ptr.delay, ptr.delay + 0.12],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: positions[i].leftX,
                top: positions[i].topY,
              }}
            >
              <Triangle
                size={ptr.size}
                color={ptr.color}
                scale={scaleProgress}
                opacity={pointerOpacity}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 30,
          opacity: gOpacity,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
