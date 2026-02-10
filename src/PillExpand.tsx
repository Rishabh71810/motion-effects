import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
  spring,
} from "remotion";
import React from "react";

// ─── Constants ───

const PILL_TEXT = "Start your design journey now";
const BUTTON_TEXT = "Start Now";
const TYPE_SPEED = 0.065; // seconds per character

// Pill dimensions
const PILL_MAX_W = 820;
const PILL_H = 120;
const PILL_RADIUS = PILL_H / 2;

// ─── Dot Grid Background (memoized) ───

const DOT_SPACING = 50;

const DotGrid = React.memo(() => {
  const cols = Math.ceil(1280 / DOT_SPACING) + 1;
  const rows = Math.ceil(720 / DOT_SPACING) + 1;
  const dots: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={c * DOT_SPACING}
          cy={r * DOT_SPACING}
          r={1.5}
          fill="rgba(255,255,255,0.08)"
        />,
      );
    }
  }

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {dots}
    </svg>
  );
});

// ─── Main Component ───

export const PillExpand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Phase 1: Vertical line appears (0 - 0.8s)
  const lineOpacity = interpolate(t, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineHeight = interpolate(t, [0, 0.8], [0, PILL_H * 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Phase 2: Line expands into pill (0.8 - 2.2s)
  const expandProgress = interpolate(t, [0.8, 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const pillWidth = interpolate(expandProgress, [0, 1], [4, PILL_MAX_W]);
  const pillHeight = interpolate(
    expandProgress,
    [0, 0.3, 1],
    [lineHeight, PILL_H, PILL_H],
  );
  const pillBorderRadius = interpolate(
    expandProgress,
    [0, 0.3, 1],
    [2, PILL_RADIUS, PILL_RADIUS],
  );

  // Border opacity — appears as pill forms
  const borderOpacity = interpolate(expandProgress, [0.1, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3: Text typing (starts when pill begins expanding)
  const typeStart = 1.0;
  const charsVisible = Math.floor(Math.max(0, (t - typeStart) / TYPE_SPEED));
  const displayedText = PILL_TEXT.slice(
    0,
    Math.min(charsVisible, PILL_TEXT.length),
  );
  const typingDone = charsVisible >= PILL_TEXT.length;

  // Text opacity — fades in as pill expands enough to show text
  const textOpacity = interpolate(t, [1.0, 1.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 4: Button pops in simultaneously while typing
  const buttonStart = 2.0; // appears mid-typing as pill finishes expanding

  const buttonSpring = spring({
    frame: Math.max(0, frame - buttonStart * fps),
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
  });
  const buttonScale = interpolate(buttonSpring, [0, 1], [0.3, 1]);
  const buttonOpacity = interpolate(buttonSpring, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showButton = t >= buttonStart;

  // Subtle glow on the pill
  const glowOpacity = interpolate(expandProgress, [0.5, 1], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 60% 50%, #152a42 0%, #0d1f35 40%, #091728 70%, #060f1e 100%)",
        overflow: "hidden",
      }}
    >
      {/* Dot grid */}
      <DotGrid />

      {/* Centered pill container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: pillWidth,
            height: pillHeight,
            borderRadius: pillBorderRadius,
            position: "relative",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* Pill background — subtle dark fill */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                expandProgress > 0.1
                  ? "linear-gradient(135deg, rgba(15,30,55,0.8) 0%, rgba(20,40,65,0.6) 50%, rgba(15,30,55,0.8) 100%)"
                  : "rgba(120,160,200,0.3)",
              borderRadius: pillBorderRadius,
            }}
          />

          {/* Pill border */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: pillBorderRadius,
              border: `1.5px solid rgba(100, 150, 200, ${borderOpacity * 0.3})`,
              boxShadow: `0 0 30px rgba(80, 140, 200, ${glowOpacity}), inset 0 1px 0 rgba(255,255,255,${borderOpacity * 0.05})`,
            }}
          />

          {/* Initial vertical line (visible before expansion) */}
          {expandProgress < 0.2 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 3,
                height: lineHeight,
                transform: "translate(-50%, -50%)",
                background:
                  "linear-gradient(180deg, rgba(120,170,220,0.6) 0%, rgba(120,170,220,0.2) 100%)",
                borderRadius: 2,
                opacity: lineOpacity * (1 - expandProgress * 5),
              }}
            />
          )}

          {/* Typing text */}
          <div
            style={{
              position: "relative",
              paddingLeft: 50,
              paddingRight: 220,
              opacity: textOpacity,
              width: "100%",
            }}
          >
            <span
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: 42,
                fontWeight: 300,
                color: "rgba(220, 235, 255, 0.95)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {displayedText}
              {!typingDone && (
                <span
                  style={{
                    color: "rgba(220, 235, 255, 0.5)",
                    fontWeight: 200,
                  }}
                >
                  |
                </span>
              )}
            </span>
          </div>

          {/* "Start Now" button — glassmorphic, pops in during typing */}
          {showButton && (
            <div
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: `translateY(-50%) scale(${buttonScale})`,
                opacity: buttonOpacity,
              }}
            >
              <div
                style={{
                  width: 190,
                  height: PILL_H - 24,
                  borderRadius: (PILL_H - 24) / 2,
                  background:
                    "linear-gradient(135deg, rgba(80,120,170,0.25) 0%, rgba(60,100,150,0.35) 50%, rgba(80,120,170,0.25) 100%)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(180, 210, 240, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: 28,
                    fontWeight: 500,
                    color: "rgba(230, 240, 255, 0.95)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {BUTTON_TEXT}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
