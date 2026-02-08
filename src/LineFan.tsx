import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";

const WORDS = [
  "Motion",
  "design",
  "is",
  "where",
  "design",
  "movement",
  "and",
  "story",
  "work",
  "in",
  "harmony",
];

// Origin point — all lines radiate from here
const ORIGIN_X = 100;
const ORIGIN_Y = 130;

// Fan geometry
const LINE_LENGTH = 900;
const FAN_START_ANGLE = -8;
const FAN_END_ANGLE = 55;
const TOTAL_LINES = 18;

// Timing
const LINE_GROW_DURATION = 3.0; // line extends out as single horizontal
const SINGLE_HOLD = 1.0; // hold as single line
const FAN_DURATION = 5.0; // all lines spread apart simultaneously
const WORD_FADE_START = 5.0; // words appear during fan
const WORD_FADE_DURATION = 2.0;

export const LineFan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Phase 1: Single line grows out horizontally
  const growProgress = interpolate(t, [0, LINE_GROW_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const currentLength = LINE_LENGTH * growProgress;

  // Phase 2: All lines fan out simultaneously from horizontal to their target angles
  const fanStart = LINE_GROW_DURATION + SINGLE_HOLD;
  const fanProgress = interpolate(
    t,
    [fanStart, fanStart + FAN_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    },
  );

  // Build line data
  const wordCount = WORDS.length;
  const lines: { angle: number; wordIndex: number | null; lineIndex: number }[] = [];

  for (let i = 0; i < TOTAL_LINES; i++) {
    const angle =
      FAN_START_ANGLE +
      (i / (TOTAL_LINES - 1)) * (FAN_END_ANGLE - FAN_START_ANGLE);

    const wordSlot = Math.round(
      (i / (TOTAL_LINES - 1)) * (wordCount - 1),
    );
    const idealLine = (wordSlot / (wordCount - 1)) * (TOTAL_LINES - 1);
    const isWordLine = Math.abs(i - idealLine) < 0.5;

    lines.push({
      angle,
      wordIndex: isWordLine ? wordSlot : null,
      lineIndex: i,
    });
  }

  // Line fade-in
  const lineOpacityBase = interpolate(t, [0, 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        overflow: "hidden",
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
      >
        {lines.map((line) => {
          // Interpolate from horizontal (FAN_START_ANGLE) to target angle
          const currentAngle =
            FAN_START_ANGLE + fanProgress * (line.angle - FAN_START_ANGLE);
          const angleRad = (currentAngle * Math.PI) / 180;
          const endX = ORIGIN_X + Math.cos(angleRad) * currentLength;
          const endY = ORIGIN_Y + Math.sin(angleRad) * currentLength;

          const isEdge =
            line.lineIndex === 0 || line.lineIndex === TOTAL_LINES - 1;
          const isDashed = !isEdge;
          const baseOpacity =
            line.wordIndex !== null ? 0.7 : isEdge ? 0.8 : 0.35;

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

      {/* Words at the tips */}
      {lines
        .filter((l) => l.wordIndex !== null)
        .map((line) => {
          const wordIdx = line.wordIndex as number;
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
                  fontFamily:
                    "SF Pro Display, -apple-system, Helvetica, sans-serif",
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
