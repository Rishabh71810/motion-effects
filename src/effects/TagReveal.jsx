/**
 * ============================================================
 * EFFECT: 3D Tag Reveal — Per-Letter Text with Cuboid Border
 * FILE: TagReveal.tsx
 * COMPOSITION ID: TagReveal
 * DURATION: 480 frames (16s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a premium motion typography effect in Remotion where
 * hashtag words (e.g. "#Design", "#Create") reveal letter by
 * letter while a 3D cuboid rounded-rectangle border draws
 * itself around the text simultaneously. The border has a 3D
 * depth illusion created by two same-sized rounded rectangles
 * offset diagonally, connected by two diagonal lines at
 * opposite corners.
 *
 * ─── WORD CONFIGURATION ───
 *
 *   Cycling words: ["#Design", "#Create", "#Build", "#Motion"]
 *   Font size: 74px
 *   Font: SF Pro Display / Helvetica Neue / Arial Black
 *   Weight: 900 (Black), Style: italic
 *   Color: #1a1a1a (near-black)
 *   Letter spacing: -0.02em (tight)
 *
 * ─── 3D CUBOID BORDER ───
 *
 *   The border is NOT a flat 2D rectangle. It simulates a 3D
 *   rounded rectangular prism (cuboid) using:
 *
 *   1. FRONT FACE — a rounded rectangle (the main visible face)
 *      - Size: 540×100px, corner radius 16px
 *      - Position: shifted slightly UP and to the RIGHT by DEPTH/2
 *      - Stroke: 2px, color #1a1a1a
 *      - Has a white fill (#f0f0f0) that masks the back face
 *        in the overlap area, creating a solid front face
 *
 *   2. BACK FACE — identical rounded rectangle, same size
 *      - Position: shifted DOWN and to the LEFT by DEPTH/2
 *      - Offset from front face: DEPTH = 18px diagonally
 *      - Stroke: 1.5px, color #1a1a1a (slightly thinner)
 *      - No fill (transparent)
 *
 *   3. TWO DIAGONAL CONNECTING LINES — depth edges
 *      - Simple straight diagonal lines (NOT L-shaped brackets)
 *      - Top-left line: connects back rect's TL visual corner
 *        to front rect's TL visual corner
 *      - Bottom-right line: connects back rect's BR visual corner
 *        to front rect's BR visual corner
 *      - Each line goes diagonally UP-RIGHT by (DEPTH, DEPTH)
 *      - Line endpoints are at the 45° point on each corner's
 *        arc (the visual corner), calculated as:
 *        ARC_45 = CORNER_RADIUS * (1 - cos(π/4)) ≈ 0.293 * R
 *      - This prevents lines from cutting into the rounded corners
 *      - Stroke: 1.5px, color #1a1a1a
 *
 *   The combined effect: a 3D rounded rectangular box with visible
 *   front face, back face, and two depth edges at diagonally
 *   opposite corners (top-left and bottom-right).
 *
 * ─── SVG RENDERING ORDER (CRITICAL) ───
 *
 *   The SVG elements MUST be rendered in this exact order to
 *   prevent visual artifacts:
 *
 *   1. Back face stroke (behind everything)
 *   2. Connecting lines (depth edges)
 *   3. Front face FILL (white rect that masks back face +
 *      connecting lines in the overlap area)
 *   4. Front face stroke (on top of everything)
 *
 *   If connecting lines are rendered AFTER the front fill, they
 *   will "cut" visually into the front rectangle. Rendering them
 *   BEFORE the fill allows the fill to cleanly mask any overlap.
 *
 * ─── ROUNDED RECTANGLE SVG PATH ───
 *
 *   Each rounded rectangle is an SVG <path> (not <rect>) to
 *   support stroke-dashoffset drawing animation. The path starts
 *   from the TOP-RIGHT corner going CLOCKWISE:
 *
 *     M (x+w, y+r) → right edge down → BR arc → bottom edge →
 *     BL arc → left edge up → TL arc → top edge → TR arc → Z
 *
 *   Starting from top-right means the stroke-dashoffset animation
 *   begins drawing from the RIGHT SIDE of the border, matching
 *   the left-to-right text reveal direction.
 *
 *   Path uses arc commands (A) for rounded corners with the
 *   specified CORNER_RADIUS.
 *
 * ─── BORDER DRAWING ANIMATION ───
 *
 *   Both rectangles draw themselves using SVG stroke-dashoffset:
 *     - pathLength={1} normalizes path length to 1
 *     - strokeDasharray={1} = full dash covers entire path
 *     - strokeDashoffset goes from 1 (hidden) to 0 (fully drawn)
 *
 *   Front face: draws over BORDER_DRAW_DURATION = 1.0s
 *     Easing: Easing.inOut(Easing.cubic)
 *
 *   Back face: starts 0.06s later, finishes 0.08s later
 *     Creates a subtle stagger — back face trails the front
 *
 *   Connecting lines: appear from 50% to 90% of border draw
 *     Easing: Easing.out(Easing.quad)
 *
 *   Front fill: fades in from 50% to 85% of front border progress
 *     Gradually masks the back face in the overlap area
 *
 * ─── PER-LETTER TEXT REVEAL ───
 *
 *   Letters appear one by one from left to right, simultaneously
 *   with the border drawing.
 *
 *   Each letter has:
 *     - Opacity: 0 → 1 over LETTER_FADE = 0.12s
 *     - Scale: 0.85 → 1.0 with Easing.out(Easing.quad) over 0.18s
 *     - Stagger: LETTER_STAGGER = 0.07s between each letter
 *
 *   For "#Design" (7 chars):
 *     "#": appears at 0.00s
 *     "D": appears at 0.07s
 *     "e": appears at 0.14s
 *     "s": appears at 0.21s
 *     "i": appears at 0.28s
 *     "g": appears at 0.35s
 *     "n": appears at 0.42s
 *     Full reveal: ~0.54s (well within the 1.0s border draw)
 *
 *   Text is centered within the FRONT rectangle using a transform
 *   offset of (DEPTH/2, -DEPTH/2) to match the front face position.
 *
 * ─── CYCLE TIMING ───
 *
 *   Each word cycle has 4 phases:
 *
 *   1. REVEAL: border draws + letters appear (1.0s)
 *   2. HOLD: everything fully visible (2.4s)
 *   3. FADE OUT: entire composition fades to 0 opacity (0.4s)
 *   4. GAP: brief pause before next word (0.4s)
 *
 *   Total cycle: 4.2 seconds
 *   At 480 frames (16s): ~3.8 full word cycles
 *
 *   Words cycle: #Design → #Create → #Build → #Motion → #Design → ...
 *
 * ─── LAYOUT ───
 *
 *   Background: #f0f0f0 (light gray)
 *   Border centered on canvas (1280×720)
 *   Front face offset: (+DEPTH/2, -DEPTH/2) = (+9px, -9px)
 *   Back face offset: (-DEPTH/2, +DEPTH/2) = (-9px, +9px)
 *   Text centered within front face via transform offset
 *
 * ─── ANIMATION TIMELINE (per cycle) ───
 *
 *   0.00s       : Border starts drawing from right side
 *   0.00s–0.54s : Letters "#Design" appear one by one
 *   0.06s       : Back face starts drawing (slight delay)
 *   0.50s       : Connecting lines begin appearing
 *   0.50s       : Front fill starts fading in
 *   0.85s       : Front fill fully opaque (back face masked)
 *   0.90s       : Connecting lines fully drawn
 *   1.00s       : Front border fully drawn
 *   1.08s       : Back border fully drawn
 *   1.00s–3.40s : Hold (everything visible)
 *   3.40s–3.80s : Fade out
 *   3.80s–4.20s : Gap (empty)
 *   4.20s       : Next cycle begins
 *
 * ─── TECHNICAL REQUIREMENTS ───
 *
 *   - Pure Remotion: useCurrentFrame(), useVideoConfig(), interpolate()
 *   - NO CSS animations, NO requestAnimationFrame, NO useFrame()
 *   - All motion driven by frame count → time → interpolate()
 *   - SVG with pathLength normalization for stroke drawing
 *   - Easing functions: inOut(cubic) for borders, out(quad) for lines/text
 *   - SVG render order critical: back stroke → lines → front fill → front stroke
 *   - Front fill uses matching background color (#f0f0f0) for masking
 *
 * ─── CUSTOMIZATION ───
 *
 *   - Change WORDS array for different cycling text
 *   - Adjust DEPTH (18) for more/less 3D depth
 *   - Change RECT_WIDTH / RECT_HEIGHT for different border sizes
 *   - Increase CORNER_RADIUS for more pill-shaped borders
 *   - Swap LETTER_STAGGER for faster/slower letter reveals
 *   - Change border stroke colors for different themes
 *   - Swap background to dark (#0a0a0a) with white strokes
 *   - Add more connecting lines at all 4 corners for full wireframe
 *   - Increase BORDER_DRAW_DURATION for slower drawing
 *   - Remove the scale animation on letters for a simpler pop-in
 *   - Add a subtitle below the border for additional information
 *
 * ─── OVERALL FEEL ───
 *
 *   Clean, modern hashtag/tag motion design.
 *   3D cuboid border gives depth and dimension to flat typography.
 *   Per-letter reveal synced with border drawing creates energy.
 *   Light background with dark strokes — editorial, premium feel.
 *   Smooth easing on all elements — no harsh or jarring motion.
 *   Cycling words keep the composition dynamic and looping.
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
const DEPTH = 18;

function roundedRectPath(x, y, w, h, r) {
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

export const TagReveal = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const fontSize = 74;

  const cycleIndex = Math.floor(t / CYCLE_DURATION);
  const cycleTime = t - cycleIndex * CYCLE_DURATION;
  const wordIdx = cycleIndex % WORDS.length;
  const word = WORDS[wordIdx];
  const chars = word.split("");

  const fadeOutStart = BORDER_DRAW_DURATION + HOLD_DURATION;
  const cycleOpacity = interpolate(
    cycleTime,
    [fadeOutStart, fadeOutStart + FADE_OUT_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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

  const frontFillOpacity = interpolate(
    frontProgress,
    [0.5, 0.85],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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

  const cx = width / 2;
  const cy = height / 2;

  const fX = cx - RECT_WIDTH / 2 + DEPTH / 2;
  const fY = cy - RECT_HEIGHT / 2 - DEPTH / 2;

  const bX = fX - DEPTH;
  const bY = fY + DEPTH;

  const frontPath = roundedRectPath(
    fX, fY, RECT_WIDTH, RECT_HEIGHT, CORNER_RADIUS
  );
  const backPath = roundedRectPath(
    bX, bY, RECT_WIDTH, RECT_HEIGHT, CORNER_RADIUS
  );

  const ARC_45 = CORNER_RADIUS * (1 - Math.cos(Math.PI / 4));

  const topLeftLine = `M ${bX + ARC_45} ${bY + ARC_45} L ${fX + ARC_45} ${fY + ARC_45}`;
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

          {/* Depth connecting lines (BEFORE front fill so fill masks overlap) */}
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

          {/* Front face fill (masks back face + lines in overlap area) */}
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

        {/* Text — per-letter reveal, centered in front face */}
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
