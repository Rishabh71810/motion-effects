/**
 * ============================================================
 * EFFECT: Per-Letter Typography Swap — TypoSwap
 * FILE: TypoSwap.tsx
 * COMPOSITION ID: TypoSwap
 * DURATION: 300 frames (10s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a premium typography motion effect in Remotion where
 * words cycle through a list by swapping individual letters
 * one at a time, left to right. Each letter transitions
 * independently: the old letter (filled white) slides UP and
 * out of view, while a new letter (outline/stroke style)
 * slides UP from below into position. After landing, the new
 * letter morphs from outline to solid filled white. A subtitle
 * line below uses the same per-letter swap mechanic but at a
 * smaller size and faster stagger.
 *
 * ─── WORD CONFIGURATION ───
 *
 *   Main words (cycling): ["IDEA", "TYPE", "BOLD", "MAKE"]
 *   All words are padded to MAX_LETTERS = 4 characters.
 *   Font size: min(width * 0.16, 180px).
 *   Font: SF Pro Display, weight 800, white on dark background.
 *
 *   Subtitles (cycling in sync): ["CREATE NOW", "DESIGN IT!",
 *     "BUILD MORE", "THINK BIG"]
 *   Padded to SUB_MAX_LETTERS = 10 characters.
 *   Font size: min(width * 0.035, 38px).
 *
 *   Each word index maps to the same subtitle index.
 *
 * ─── LETTER SLOT COMPONENT ───
 *
 *   The core building block is a "LetterSlot" — a fixed-size
 *   container with overflow:hidden that clips the sliding
 *   letters to create a clean swap illusion.
 *
 *   Each slot receives:
 *     - oldChar: the current visible letter (filled white)
 *     - newChar: the incoming letter (outline → filled)
 *     - progress: 0 = old visible, 1 = new landed
 *     - fillProgress: 0 = outline stroke, 1 = solid fill
 *     - fontSize: determines slot dimensions
 *
 *   Slot dimensions:
 *     - Width: fontSize * 0.75 (wide enough for M, W, K)
 *     - Height: fontSize * 1.1
 *     - Display: inline-block, position: relative
 *     - Overflow: hidden (clips letters outside the slot)
 *
 *   Old letter behavior:
 *     - Starts at translateY(0) — fully visible in the slot
 *     - Slides UP to translateY(-slotHeight) — exits top
 *     - Color: solid white #ffffff
 *     - Easing: Easing.inOut(Easing.cubic)
 *     - Removed from DOM when progress >= 1
 *
 *   New letter behavior:
 *     - Starts at translateY(+slotHeight) — hidden below slot
 *     - Slides UP to translateY(0) — lands in position
 *     - Initially rendered as outline: WebkitTextStroke 2px white
 *       with transparent fill (rgba with 0 opacity)
 *     - After landing, outline morphs to filled:
 *       - strokeWidth interpolates from 2 → 0
 *       - text opacity interpolates from 0 → 1
 *       - At fillProgress >= 1: solid white, no stroke
 *     - Added to DOM only when progress > 0
 *
 *   Letter styling:
 *     - position: absolute, top: 0, width: 100%
 *     - textAlign: center (centers letter within slot)
 *     - fontWeight: 800
 *     - lineHeight: 1.1
 *
 * ─── TIMING SYSTEM ───
 *
 *   The animation is organized into repeating cycles.
 *   Each cycle has two phases:
 *
 *   1. HOLD phase: the current word sits fully visible.
 *      Duration: HOLD_DURATION = 4.5 seconds
 *
 *   2. TRANSITION phase: letters swap one by one.
 *      Each letter's swap takes LETTER_TRANSITION = 1.2 seconds.
 *      Letters are staggered by LETTER_STAGGER = 0.6 seconds.
 *      After the last letter lands, outline fills in over
 *      FILL_IN_DELAY = 0.8 seconds.
 *
 *   Total transition time (4-letter word):
 *     LETTER_STAGGER * (MAX_LETTERS - 1) + LETTER_TRANSITION + FILL_IN_DELAY
 *     = 0.6 * 3 + 1.2 + 0.8 = 3.8 seconds
 *
 *   Full cycle duration:
 *     HOLD_DURATION + TRANSITION_DURATION = 4.5 + 3.8 = 8.3 seconds
 *
 *   Per-letter timeline (within a cycle):
 *     Letter i starts swapping at: HOLD_DURATION + i * LETTER_STAGGER
 *     Letter i finishes at: letterStart + LETTER_TRANSITION
 *     Letter i fill starts at: letterEnd
 *     Letter i fill finishes at: letterEnd + FILL_IN_DELAY
 *
 *   Example for "IDEA" → "TYPE" (4 letters):
 *     Letter 0 (I→T): swap 4.5s–5.7s, fill 5.7s–6.5s
 *     Letter 1 (D→Y): swap 5.1s–6.3s, fill 6.3s–7.1s
 *     Letter 2 (E→P): swap 5.7s–6.9s, fill 6.9s–7.7s
 *     Letter 3 (A→E): swap 6.3s–7.5s, fill 7.5s–8.3s
 *
 * ─── SUBTITLE TIMING ───
 *
 *   Subtitles use the same LetterSlot component at smaller size.
 *   Timing differences:
 *     - SUB_LETTER_STAGGER = 0.08s (much faster cascade — more letters)
 *     - SUB_LETTER_TRANSITION = 0.5s (quicker per-letter swap)
 *     - Starts 0.3s AFTER the main word transition begins
 *
 *   This creates a cascading "ripple" where the main word starts
 *   swapping letter-by-letter, then the subtitle follows shortly
 *   after with a rapid left-to-right wave.
 *
 * ─── LAYOUT ───
 *
 *   Background: #0a0a0a (dark near-black)
 *
 *   Main word: centered horizontally and vertically,
 *   offset slightly upward (paddingBottom: 10%).
 *   Letters arranged in a flex row with gap: fontSize * 0.02.
 *
 *   Subtitle: positioned at bottom 18%, centered horizontally.
 *   Letters in a flex row with gap: subtitleFontSize * 0.02.
 *
 *   Below the subtitle: a small credit line "www.sonduckfilm.com"
 *   at 12px, weight 300, 35% opacity, 0.06em letter-spacing.
 *
 * ─── ANIMATION FLOW ───
 *
 *   Cycle 1 (0s–8.3s):
 *     0.0s–4.5s   : "IDEA" + "CREATE NOW" hold (fully visible, filled white)
 *     4.5s–7.5s   : Letters swap left-to-right → "TYPE"
 *     4.8s–6.0s   : Subtitle letters swap → "DESIGN IT!"
 *     7.5s–8.3s   : Last letters fill in from outline to solid
 *
 *   Cycle 2 (8.3s–16.6s):
 *     8.3s–12.8s  : "TYPE" + "DESIGN IT!" hold
 *     12.8s–15.8s : Swap to "BOLD" + "BUILD MORE"
 *     ... and so on
 *
 *   Words cycle: IDEA → TYPE → BOLD → MAKE → IDEA → ...
 *
 * ─── TECHNICAL REQUIREMENTS ───
 *
 *   - Pure Remotion: useCurrentFrame(), useVideoConfig(), interpolate()
 *   - NO CSS animations, NO requestAnimationFrame, NO useFrame()
 *   - All motion driven by frame count → time → interpolate()
 *   - Easing: Easing.inOut(Easing.cubic) for letter slides
 *   - WebkitTextStroke for outline rendering (cross-browser)
 *   - overflow:hidden on each letter slot for clean clipping
 *   - Each LetterSlot is inline-block with fixed width for monospace-like alignment
 *
 * ─── CUSTOMIZATION ───
 *
 *   - Change WORDS array for different cycling text
 *   - Adjust MAX_LETTERS to match your longest word
 *   - Increase HOLD_DURATION for longer pauses between transitions
 *   - Decrease LETTER_STAGGER for faster cascading (letters overlap more)
 *   - Increase LETTER_STAGGER for more sequential letter-by-letter effect
 *   - Change LETTER_TRANSITION for faster/slower individual swaps
 *   - Swap Easing.inOut(Easing.cubic) for other easings (bounce, elastic)
 *   - Change background color and text colors for different themes
 *   - Set FILL_IN_DELAY to 0 to skip the outline→filled transition
 *   - Adjust fontSize multiplier (0.16) for larger/smaller text
 *   - Add more SUBTITLES entries (must match WORDS array length)
 *   - Replace slide-up with slide-down by inverting the Y translations
 *   - Add horizontal slide by using translateX instead of translateY
 *
 * ─── OVERALL FEEL ───
 *
 *   Clean, slow, deliberate typography motion.
 *   One letter at a time creates a satisfying sequential reveal.
 *   Outline → filled morphing adds depth to the transition.
 *   Large bold letters with small subtitle creates visual hierarchy.
 *   Premium, minimal, After Effects kinetic typography style.
 *   Dark background with white text for high contrast impact.
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

const WORDS = ["IDEA", "TYPE", "BOLD", "MAKE"];
const MAX_LETTERS = 4;

const HOLD_DURATION = 4.5;
const LETTER_TRANSITION = 1.2;
const LETTER_STAGGER = 0.6;
const FILL_IN_DELAY = 0.8;

const TRANSITION_DURATION =
  LETTER_STAGGER * (MAX_LETTERS - 1) + LETTER_TRANSITION + FILL_IN_DELAY;
const CYCLE_DURATION = HOLD_DURATION + TRANSITION_DURATION;

const SUBTITLES = ["CREATE NOW", "DESIGN IT!", "BUILD MORE", "THINK BIG"];
const SUB_MAX_LETTERS = 10;
const SUB_LETTER_STAGGER = 0.08;
const SUB_LETTER_TRANSITION = 0.5;

const LetterSlot = ({ oldChar, newChar, progress, fillProgress, fontSize }) => {
  const slotHeight = fontSize * 1.1;

  const oldY = interpolate(progress, [0, 1], [0, -slotHeight], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const newY = interpolate(progress, [0, 1], [slotHeight, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const strokeWidth = interpolate(fillProgress, [0, 1], [2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(fillProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const baseStyle = {
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

export const TypoSwap = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;

  const fontSize = Math.min(width * 0.16, 180);
  const subtitleFontSize = Math.min(width * 0.035, 38);

  const cycleIndex = Math.floor(t / CYCLE_DURATION);
  const cycleTime = t - cycleIndex * CYCLE_DURATION;

  const currentWordIdx = cycleIndex % WORDS.length;
  const nextWordIdx = (cycleIndex + 1) % WORDS.length;

  const currentWord = WORDS[currentWordIdx];
  const nextWord = WORDS[nextWordIdx];

  const currentChars = currentWord.padEnd(MAX_LETTERS, " ").split("");
  const nextChars = nextWord.padEnd(MAX_LETTERS, " ").split("");

  const transitionStartTime = HOLD_DURATION;

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

            const letterStart = transitionStartTime + i * LETTER_STAGGER;
            const letterEnd = letterStart + LETTER_TRANSITION;

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
