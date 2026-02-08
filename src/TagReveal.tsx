import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

/**
 * Per-letter text reveal with a 3D cuboid rounded-rectangle border.
 * Two same-sized rounded rectangles offset diagonally simulate
 * front + back faces of a 3D box. L-shaped depth edges connect
 * the corners at top-right and bottom-left.
 */

const WORDS = ["#Design", "#Create", "#Build", "#Motion"];

// Timing (seconds)
const LETTER_STAGGER = 0.07;
const LETTER_FADE = 0.12;
const BORDER_DRAW_DURATION = 1.0;
const HOLD_DURATION = 2.4;
const FADE_OUT_DURATION = 0.4;
const CYCLE_GAP = 0.4;
const CYCLE_DURATION =
  BORDER_DRAW_DURATION + HOLD_DURATION + FADE_OUT_DURATION + CYCLE_GAP;

// Layout
const RECT_WIDTH = 540;
const RECT_HEIGHT = 100;
const CORNER_RADIUS = 16;
const DEPTH = 18; // 3D depth offset (back face shifts down-left by this amount)

/**
 * SVG path for a rounded rectangle, starting from top-right corner
 * going clockwise. stroke-dashoffset animation reveals from the right side.
 */
function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  return [
    `M ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `Z`,
  ].join(" ");
}

export const TagReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const fontSize = 74;

  // Cycle logic
  const cycleIndex = Math.floor(t / CYCLE_DURATION);
  const cycleTime = t - cycleIndex * CYCLE_DURATION;
  const wordIdx = cycleIndex % WORDS.length;
  const word = WORDS[wordIdx];
  const chars = word.split("");

  // Fade out at end of hold
  const fadeOutStart = BORDER_DRAW_DURATION + HOLD_DURATION;
  const cycleOpacity = interpolate(
    cycleTime,
    [fadeOutStart, fadeOutStart + FADE_OUT_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Front border draw progress (0→1)
  const frontProgress = interpolate(
    cycleTime,
    [0, BORDER_DRAW_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }
  );

  // Back border slightly delayed
  const backProgress = interpolate(
    cycleTime,
    [0.06, BORDER_DRAW_DURATION + 0.08],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }
  );

  // Front face fill opacity (masks back face behind front face)
  const frontFillOpacity = interpolate(
    frontProgress,
    [0.5, 0.85],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Depth-edge brackets appear toward end of border draw
  const bracketProgress = interpolate(
    cycleTime,
    [BORDER_DRAW_DURATION * 0.5, BORDER_DRAW_DURATION * 0.9],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  // Center positions
  const cx = width / 2;
  const cy = height / 2;

  // Front face (shifted slightly up-right)
  const fX = cx - RECT_WIDTH / 2 + DEPTH / 2;
  const fY = cy - RECT_HEIGHT / 2 - DEPTH / 2;

  // Back face (shifted slightly down-left) — same size
  const bX = fX - DEPTH;
  const bY = fY + DEPTH;

  const frontPath = roundedRectPath(
    fX,
    fY,
    RECT_WIDTH,
    RECT_HEIGHT,
    CORNER_RADIUS
  );
  const backPath = roundedRectPath(
    bX,
    bY,
    RECT_WIDTH,
    RECT_HEIGHT,
    CORNER_RADIUS
  );

  // Connect at the 45° point on each rounded corner arc (the visual corner)
  const ARC_45 = CORNER_RADIUS * (1 - Math.cos(Math.PI / 4)); // ≈ 0.293 * R

  // Top-left connecting line: back rect TL arc → front rect TL arc
  const topLeftLine = `M ${bX + ARC_45} ${bY + ARC_45} L ${fX + ARC_45} ${fY + ARC_45}`;

  // Bottom-right connecting line: back rect BR arc → front rect BR arc
  const bottomRightLine = `M ${bX + RECT_WIDTH - ARC_45} ${bY + RECT_HEIGHT - ARC_45} L ${fX + RECT_WIDTH - ARC_45} ${fY + RECT_HEIGHT - ARC_45}`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f0f0f0" }}>
      <div
        style={{
          opacity: cycleOpacity,
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Back face stroke (behind) */}
          <path
            d={backPath}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth={1.5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - backProgress}
          />

          {/* Depth connecting lines (rendered BEFORE front fill so fill masks overlap) */}
          {bracketProgress > 0 && (
            <path
              d={topLeftLine}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth={1.5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - bracketProgress}
            />
          )}
          {bracketProgress > 0 && (
            <path
              d={bottomRightLine}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth={1.5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - bracketProgress}
            />
          )}

          {/* Front face fill (masks back face + connecting lines in overlap area) */}
          <rect
            x={fX}
            y={fY}
            width={RECT_WIDTH}
            height={RECT_HEIGHT}
            rx={CORNER_RADIUS}
            ry={CORNER_RADIUS}
            fill="#f0f0f0"
            opacity={frontFillOpacity}
          />

          {/* Front face stroke (on top of everything) */}
          <path
            d={frontPath}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - frontProgress}
          />
        </svg>

        {/* Text — per-letter reveal */}
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
            transform: `translate(${DEPTH / 2}px, ${-DEPTH / 2}px)`,
          }}
        >
          <div style={{ display: "flex" }}>
            {chars.map((char, i) => {
              const letterStart = i * LETTER_STAGGER;
              const letterOpacity = interpolate(
                cycleTime,
                [letterStart, letterStart + LETTER_FADE],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              const letterScale = interpolate(
                cycleTime,
                [letterStart, letterStart + LETTER_FADE * 1.5],
                [0.85, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.quad),
                }
              );

              return (
                <span
                  key={`${wordIdx}-${i}`}
                  style={{
                    fontFamily:
                      "'SF Pro Display', 'Helvetica Neue', 'Arial Black', sans-serif",
                    fontSize,
                    fontWeight: 900,
                    fontStyle: "italic",
                    color: "#1a1a1a",
                    opacity: letterOpacity,
                    transform: `scale(${letterScale})`,
                    display: "inline-block",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
