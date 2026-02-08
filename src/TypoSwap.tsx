import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

/**
 * Per-letter typography swap: each letter transitions individually
 * (left to right). The old letter slides UP and out, a new letter
 * in outline style slides UP from below — one letter at a time.
 */

const WORDS = ["IDEA", "TYPE", "BOLD", "MAKE"];
const MAX_LETTERS = 4;

const HOLD_DURATION = 4.5; // seconds word is fully visible before transition starts
const LETTER_TRANSITION = 1.2; // seconds per letter swap
const LETTER_STAGGER = 0.6; // delay between each letter starting its swap
const FILL_IN_DELAY = 0.8; // after last letter lands, outline morphs to filled

// Total transition time for a 4-letter word
const TRANSITION_DURATION =
  LETTER_STAGGER * (MAX_LETTERS - 1) + LETTER_TRANSITION + FILL_IN_DELAY;
const CYCLE_DURATION = HOLD_DURATION + TRANSITION_DURATION;

const SUBTITLES = ["CREATE NOW", "DESIGN IT!", "BUILD MORE", "THINK BIG"];
const SUB_MAX_LETTERS = 10; // max subtitle length
const SUB_LETTER_STAGGER = 0.08; // faster stagger for smaller text
const SUB_LETTER_TRANSITION = 0.5;

/**
 * Single letter slot: shows either the old letter sliding up/out
 * or the new letter sliding up from below, each clipped by overflow:hidden.
 */
const LetterSlot: React.FC<{
  oldChar: string;
  newChar: string;
  progress: number; // 0 = old fully visible, 1 = new fully visible
  fillProgress: number; // 0 = outline, 1 = filled (for the new letter after landing)
  fontSize: number;
}> = ({ oldChar, newChar, progress, fillProgress, fontSize }) => {
  const slotHeight = fontSize * 1.1;

  // Old letter: slides from y=0 to y=-slotHeight
  const oldY = interpolate(progress, [0, 1], [0, -slotHeight], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // New letter: slides from y=+slotHeight to y=0
  const newY = interpolate(progress, [0, 1], [slotHeight, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Outline → filled transition on new letter
  const strokeWidth = interpolate(fillProgress, [0, 1], [2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(fillProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "100%",
    fontFamily: "SF Pro Display, -apple-system, Helvetica Neue, sans-serif",
    fontSize,
    fontWeight: 800,
    lineHeight: 1.1,
    textAlign: "center",
  };

  return (
    <div
      style={{
        display: "inline-block",
        width: fontSize * 0.75,
        height: slotHeight,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Old letter (filled white) sliding UP and out */}
      {progress < 1 && (
        <div
          style={{
            ...baseStyle,
            top: 0,
            transform: `translateY(${oldY}px)`,
            color: "#ffffff",
          }}
        >
          {oldChar}
        </div>
      )}

      {/* New letter (outline → filled) sliding UP from below */}
      {progress > 0 && (
        <div
          style={{
            ...baseStyle,
            top: 0,
            transform: `translateY(${newY}px)`,
            color:
              fillProgress >= 1
                ? "#ffffff"
                : `rgba(255, 255, 255, ${textOpacity})`,
            WebkitTextStroke:
              fillProgress >= 1 ? "none" : `${strokeWidth}px #ffffff`,
          }}
        >
          {newChar}
        </div>
      )}
    </div>
  );
};

export const TypoSwap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;

  const fontSize = Math.min(width * 0.16, 180);
  const subtitleFontSize = Math.min(width * 0.035, 38);

  // Which word cycle are we in?
  const cycleIndex = Math.floor(t / CYCLE_DURATION);
  const cycleTime = t - cycleIndex * CYCLE_DURATION;

  const currentWordIdx = cycleIndex % WORDS.length;
  const nextWordIdx = (cycleIndex + 1) % WORDS.length;

  const currentWord = WORDS[currentWordIdx];
  const nextWord = WORDS[nextWordIdx];

  // Pad words to MAX_LETTERS for consistent slot count
  const currentChars = currentWord.padEnd(MAX_LETTERS, " ").split("");
  const nextChars = nextWord.padEnd(MAX_LETTERS, " ").split("");

  // Is transition phase active?
  const transitionStartTime = HOLD_DURATION;

  // Subtitle uses same cycle timing as main word
  const currentSubIdx = currentWordIdx % SUBTITLES.length;
  const nextSubIdx = nextWordIdx % SUBTITLES.length;
  const currentSub = SUBTITLES[currentSubIdx];
  const nextSub = SUBTITLES[nextSubIdx];
  const currentSubChars = currentSub.padEnd(SUB_MAX_LETTERS, " ").split("");
  const nextSubChars = nextSub.padEnd(SUB_MAX_LETTERS, " ").split("");

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Main word — centered */}
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
          paddingBottom: "10%",
        }}
      >
        <div style={{ display: "flex", gap: fontSize * 0.02 }}>
          {currentChars.map((oldChar, i) => {
            const newChar = nextChars[i] || " ";

            // Per-letter transition timing
            const letterStart = transitionStartTime + i * LETTER_STAGGER;
            const letterEnd = letterStart + LETTER_TRANSITION;

            // Swap progress: 0 = old visible, 1 = new landed
            const swapProgress = interpolate(
              cycleTime,
              [letterStart, letterEnd],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            // Fill-in progress: after the new letter lands, outline → filled
            const fillStart = letterEnd;
            const fillEnd = fillStart + FILL_IN_DELAY;
            const fillProgress = interpolate(
              cycleTime,
              [fillStart, fillEnd],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <LetterSlot
                key={`slot-${i}`}
                oldChar={oldChar}
                newChar={newChar}
                progress={swapProgress}
                fillProgress={fillProgress}
                fontSize={fontSize}
              />
            );
          })}
        </div>
      </div>

      {/* Subtitle — same per-letter swap motion */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: subtitleFontSize * 0.02 }}>
          {currentSubChars.map((oldChar, i) => {
            const newChar = nextSubChars[i] || " ";

            // Subtitle letters start swapping slightly after main word
            const subDelay = 0.3;
            const letterStart =
              transitionStartTime + subDelay + i * SUB_LETTER_STAGGER;
            const letterEnd = letterStart + SUB_LETTER_TRANSITION;

            const swapProgress = interpolate(
              cycleTime,
              [letterStart, letterEnd],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            const fillStart = letterEnd;
            const fillEnd = fillStart + FILL_IN_DELAY;
            const fillProgress = interpolate(
              cycleTime,
              [fillStart, fillEnd],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <LetterSlot
                key={`sub-${i}`}
                oldChar={oldChar}
                newChar={newChar}
                progress={swapProgress}
                fillProgress={fillProgress}
                fontSize={subtitleFontSize}
              />
            );
          })}
        </div>
        <div
          style={{
            marginTop: 12,
            opacity: 0.35,
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, sans-serif",
            fontSize: 12,
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "0.06em",
          }}
        >
          www.sonduckfilm.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
