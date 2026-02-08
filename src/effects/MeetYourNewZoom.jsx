/**
 * ============================================================
 * EFFECT: Meet Your New — Zoom + Cursor Click
 * FILE: MeetYourNewZoom.tsx
 * COMPOSITION ID: Phase 2 of MeetYourNewCombined
 * DURATION: 120 frames (4s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create Phase 2 of the Google "Meet your new" animation. This phase
 * continues from Phase 1's final frame and zooms the "+ New" button
 * to fill the screen while dispersing surrounding text.
 *
 * Layout:
 *   - Starts with the same centered layout as Phase 1
 *   - "Meet your" text on the left, "+ New" button centered, blue
 *     "designer" word on the right
 *   - Background: white (#ffffff)
 *   - Flex row with gap 28px, centered in AbsoluteFill
 *
 * Zoom animation (0–1.2s):
 *   - Button scales from 1 to 5x using Easing.inOut(Easing.cubic)
 *   - "Meet your" flies LEFT: translateX up to -width*0.6, fades in
 *     first 40% of zoom progress
 *   - Blue "designer" flies RIGHT: translateX up to +width*0.6, fades
 *     in first 40% of zoom progress
 *   - Rotating conic border continues at 120°/second
 *
 * Cursor animation:
 *   - Cursor appears at t=1.8s (after zoom + 0.6s hold)
 *   - Slides from (width*0.7, height*0.8) to (width*0.56, height*0.58)
 *     over 0.6s with Easing.out(Easing.cubic)
 *   - Hand cursor SVG: 64x64, stroke #1a1a1a, strokeWidth 1.8
 *   - Click at t=2.55s: cursor scales down to 0.85 then back to 1
 *   - Button also presses: scales to 0.97 then back to 1 on click
 *   - Cursor has drop-shadow(2px 4px 6px rgba(0,0,0,0.15))
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

export const MeetYourNewZoom = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const fontSize = 82;

  const zoomDuration = 1.2;
  const holdZoomed = 0.6;
  const cursorEnter = 0.6;
  const cursorClick = 0.3;

  const zoomProgress = interpolate(t, [0, zoomDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const buttonScale = interpolate(zoomProgress, [0, 1], [1, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leftTextX = interpolate(zoomProgress, [0, 0.6], [0, -width * 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const leftTextOpacity = interpolate(zoomProgress, [0, 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rightTextX = interpolate(zoomProgress, [0, 0.6], [0, width * 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const rightTextOpacity = interpolate(zoomProgress, [0, 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const borderAngle = (t * 120) % 360;

  const cursorStartTime = zoomDuration + holdZoomed;
  const cursorEndTime = cursorStartTime + cursorEnter;
  const clickTime = cursorEndTime + 0.15;
  const clickEndTime = clickTime + cursorClick;

  const cursorX = interpolate(
    t,
    [cursorStartTime, cursorEndTime],
    [width * 0.7, width * 0.56],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const cursorY = interpolate(
    t,
    [cursorStartTime, cursorEndTime],
    [height * 0.8, height * 0.58],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const cursorOpacity = interpolate(
    t,
    [cursorStartTime, cursorStartTime + 0.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const clickScale = interpolate(
    t,
    [clickTime, clickTime + 0.1, clickEndTime],
    [1, 0.85, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const buttonPressScale = interpolate(
    t,
    [clickTime, clickTime + 0.08, clickEndTime],
    [1, 0.97, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <span
          style={{
            fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
            fontSize,
            fontWeight: 400,
            color: "#3c4043",
            whiteSpace: "nowrap",
            transform: `translateX(${leftTextX}px)`,
            opacity: leftTextOpacity,
          }}
        >
          Meet your
        </span>

        <div
          style={{
            position: "relative",
            borderRadius: 24,
            padding: 2,
            overflow: "hidden",
            transform: `scale(${buttonScale * buttonPressScale})`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -20,
              background: `conic-gradient(from ${borderAngle}deg, transparent 0%, transparent 30%, #8ab4f8 45%, #669df6 50%, #8ab4f8 55%, transparent 70%, transparent 100%)`,
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 36px",
              borderRadius: 22,
              background: "linear-gradient(180deg, #f8f9fb 0%, #eef1f5 100%)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <span
              style={{
                fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: fontSize * 0.52,
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
                fontSize: fontSize * 0.48,
                fontWeight: 400,
                color: "#3c4043",
                lineHeight: 1,
              }}
            >
              New
            </span>
          </div>
        </div>

        <span
          style={{
            fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
            fontSize,
            fontWeight: 400,
            whiteSpace: "nowrap",
            background: "linear-gradient(135deg, #8ab4f8 0%, #669df6 40%, #4285f4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transform: `translateX(${rightTextX}px)`,
            opacity: rightTextOpacity,
          }}
        >
          designer
        </span>
      </div>

      {t >= cursorStartTime && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            opacity: cursorOpacity,
            transform: `scale(${clickScale})`,
            transformOrigin: "top left",
            zIndex: 20,
            fontSize: 64,
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 11V6a2 2 0 0 0-4 0" />
            <path d="M14 10V4a2 2 0 0 0-4 0v2" />
            <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
