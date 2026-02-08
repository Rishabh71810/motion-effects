import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

/**
 * Phase 2: The button zooms to fill the screen while
 * "Meet your" flies left and the blue word flies right.
 * A cursor hand appears and clicks the zoomed button.
 */

export const MeetYourNewZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const fontSize = 82;

  // --- Phase timing ---
  const zoomDuration = 1.2; // seconds for the zoom + disperse
  const holdZoomed = 0.6; // hold after zoom before cursor appears
  const cursorEnter = 0.6; // cursor slides in
  const cursorClick = 0.3; // click animation

  // Zoom progress (0 = normal, 1 = fully zoomed)
  const zoomProgress = interpolate(t, [0, zoomDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Button scale: from 1 to filling the screen (~5x)
  const buttonScale = interpolate(zoomProgress, [0, 1], [1, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Meet your" — flies to the left and fades
  const leftTextX = interpolate(zoomProgress, [0, 0.6], [0, -width * 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const leftTextOpacity = interpolate(zoomProgress, [0, 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blue word — flies to the right and fades
  const rightTextX = interpolate(zoomProgress, [0, 0.6], [0, width * 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const rightTextOpacity = interpolate(zoomProgress, [0, 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rotating border (continues from phase 1)
  const borderAngle = (t * 120) % 360;

  // --- Cursor animation ---
  const cursorStartTime = zoomDuration + holdZoomed;
  const cursorEndTime = cursorStartTime + cursorEnter;
  const clickTime = cursorEndTime + 0.15;
  const clickEndTime = clickTime + cursorClick;

  // Cursor position: slides in from bottom-right
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

  // Click: scale down then back up
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

  // Button press effect on click
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* "Meet your" — disperses left */}
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

        {/* "+ New" button — zooms in */}
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
          {/* Rotating conic gradient border */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              background: `conic-gradient(from ${borderAngle}deg, transparent 0%, transparent 30%, #8ab4f8 45%, #669df6 50%, #8ab4f8 55%, transparent 70%, transparent 100%)`,
            }}
          />
          {/* Inner button */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 36px",
              borderRadius: 22,
              background: "linear-gradient(180deg, #f8f9fb 0%, #eef1f5 100%)",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <span
              style={{
                fontFamily:
                  "'Google Sans', 'Product Sans', 'Inter', sans-serif",
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
                fontFamily:
                  "'Google Sans', 'Product Sans', 'Inter', sans-serif",
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

        {/* Blue word — disperses right */}
        <span
          style={{
            fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
            fontSize,
            fontWeight: 400,
            whiteSpace: "nowrap",
            background:
              "linear-gradient(135deg, #8ab4f8 0%, #669df6 40%, #4285f4 100%)",
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

      {/* Cursor hand */}
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
          {/* Hand cursor SVG */}
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
