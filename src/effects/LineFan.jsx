/**
 * ============================================================
 * EFFECT: Line Fan Text Reveal
 * FILE: LineFan.tsx
 * COMPOSITION ID: LineFan
 * DURATION: 390 frames (13s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create an After Effects-style line fan animation on a dark
 * background (#0a0a0a). 18 white lines radiate from a single
 * origin point in the upper-left area (100, 130).
 *
 * Phase 1 - Line draw (3s):
 *   All 18 lines start as a single horizontal line growing
 *   outward from the origin point simultaneously.
 *   Lines extend together with ease-out quad easing.
 *   Maximum line length: 900px.
 *
 * Phase 2 - Hold (1s):
 *   All lines hold as a single bundled horizontal line.
 *   Creates a moment of tension before the reveal.
 *
 * Phase 3 - Fan out (5s):
 *   All lines simultaneously spread apart from horizontal.
 *   Top line: -8 degrees (nearly horizontal).
 *   Bottom line: 55 degrees (angled down-right).
 *   Fan uses ease-out exponential easing for smooth deceleration.
 *   Creates a cone/fan shape radiating from the origin point.
 *
 * Line styling:
 *   Edge lines (top and bottom): solid, 1.2px wide, 80% opacity.
 *   Filler lines: dashed (4 6 pattern), 0.7px wide, 35% opacity.
 *   Word-carrying lines: dashed, 0.7px wide, 70% opacity.
 *   All lines white (#ffffff).
 *
 * Words:
 *   11 words: "Motion design is where design movement and story
 *   work in harmony"
 *   Distributed evenly across the fan at line tips.
 *   Words fade in over 2s starting at 5s mark.
 *   Font: SF Pro Display, weight 300, 30px, white, 0.02em tracking.
 *   Last word "harmony" is italic, weight 400.
 *   Words positioned 14px to the right of each line endpoint.
 *
 * Overall feel:
 *   Typographic, editorial, cinematic motion design.
 *   Slow, deliberate, premium.
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

const WORDS = [
  "Motion", "design", "is", "where", "design",
  "movement", "and", "story", "work", "in", "harmony",
];

const ORIGIN_X = 100;
const ORIGIN_Y = 130;
const LINE_LENGTH = 900;
const FAN_START_ANGLE = -8;
const FAN_END_ANGLE = 55;
const TOTAL_LINES = 18;

const LINE_GROW_DURATION = 3.0;
const SINGLE_HOLD = 1.0;
const FAN_DURATION = 5.0;
const WORD_FADE_START = 5.0;
const WORD_FADE_DURATION = 2.0;

export const LineFan = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const growProgress = interpolate(t, [0, LINE_GROW_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const currentLength = LINE_LENGTH * growProgress;

  const fanStart = LINE_GROW_DURATION + SINGLE_HOLD;
  const fanProgress = interpolate(t, [fanStart, fanStart + FAN_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  const wordCount = WORDS.length;
  const lines = [];

  for (let i = 0; i < TOTAL_LINES; i++) {
    const angle =
      FAN_START_ANGLE + (i / (TOTAL_LINES - 1)) * (FAN_END_ANGLE - FAN_START_ANGLE);
    const wordSlot = Math.round((i / (TOTAL_LINES - 1)) * (wordCount - 1));
    const idealLine = (wordSlot / (wordCount - 1)) * (TOTAL_LINES - 1);
    const isWordLine = Math.abs(i - idealLine) < 0.5;

    lines.push({
      angle,
      wordIndex: isWordLine ? wordSlot : null,
      lineIndex: i,
    });
  }

  const lineOpacityBase = interpolate(t, [0, 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        {lines.map((line) => {
          const currentAngle =
            FAN_START_ANGLE + fanProgress * (line.angle - FAN_START_ANGLE);
          const angleRad = (currentAngle * Math.PI) / 180;
          const endX = ORIGIN_X + Math.cos(angleRad) * currentLength;
          const endY = ORIGIN_Y + Math.sin(angleRad) * currentLength;

          const isEdge = line.lineIndex === 0 || line.lineIndex === TOTAL_LINES - 1;
          const isDashed = !isEdge;
          const baseOpacity = line.wordIndex !== null ? 0.7 : isEdge ? 0.8 : 0.35;

          return (
            <line
              key={line.lineIndex}
              x1={ORIGIN_X}
              y1={ORIGIN_Y}
              x2={endX}
              y2={endY}
              stroke="#ffffff"
              strokeWidth={isEdge ? 1.2 : 0.7}
              strokeOpacity={lineOpacityBase * baseOpacity}
              strokeDasharray={isDashed ? "4 6" : "none"}
            />
          );
        })}
      </svg>

      {lines
        .filter((l) => l.wordIndex !== null)
        .map((line) => {
          const wordIdx = line.wordIndex;
          const word = WORDS[wordIdx];
          const currentAngle =
            FAN_START_ANGLE + fanProgress * (line.angle - FAN_START_ANGLE);
          const angleRad = (currentAngle * Math.PI) / 180;
          const endX = ORIGIN_X + Math.cos(angleRad) * currentLength;
          const endY = ORIGIN_Y + Math.sin(angleRad) * currentLength;

          const wordOpacity = interpolate(
            t,
            [WORD_FADE_START, WORD_FADE_START + WORD_FADE_DURATION],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            },
          );

          const isLast = wordIdx === WORDS.length - 1;

          return (
            <div
              key={`word-${wordIdx}`}
              style={{
                position: "absolute",
                left: endX + 14,
                top: endY,
                transform: "translateY(-50%)",
                opacity: wordOpacity,
              }}
            >
              <span
                style={{
                  fontFamily: "SF Pro Display, -apple-system, Helvetica, sans-serif",
                  fontSize: 30,
                  fontWeight: isLast ? 400 : 300,
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  fontStyle: isLast ? "italic" : "normal",
                }}
              >
                {word}
              </span>
            </div>
          );
        })}
    </AbsoluteFill>
  );
};
