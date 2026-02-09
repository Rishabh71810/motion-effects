/**
 * ============================================================
 * EFFECT: Meet Your New — Word Cycling with Heartbeat Button
 * FILE: MeetYourNew.tsx
 * COMPOSITION ID: MeetYourNew (also Phase 1 of MeetYourNewCombined)
 * DURATION: 240 frames (8s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a Google-style "Meet your new [word]" animation inspired
 * by Google Workspace product videos.
 *
 * Layout (absolute positioning, centered):
 *   - "Meet your" in dark gray (#3c4043), anchored RIGHT of center
 *     (right: 50%, marginRight: 108px)
 *   - A "+ New" button at exact center (left: 50%, top: 50%,
 *     translate(-50%, -50%))
 *   - A gradient blue word anchored LEFT of center
 *     (left: 50%, marginLeft: 108px)
 *   - Font: Google Sans / Product Sans / Inter, 82px, weight 400
 *   - Background: white (#ffffff)
 *
 * Word cycling:
 *   Words: ["designer", "storyteller", "writer", "developer", "creator"]
 *   Each word holds for 2.5s, then transitions over 0.6s.
 *   Transition: old word slides UP and fades out, new word slides UP
 *   from below and fades in. Uses Easing.inOut(Easing.cubic).
 *   Word slot width is fixed based on longest word to prevent layout
 *   shift: LONGEST_WORD_LENGTH * fontSize * 0.58
 *   Text gradient: linear-gradient(135deg, #8ab4f8, #669df6, #4285f4)
 *   applied via WebkitBackgroundClip: "text".
 *
 * Button design:
 *   - Rounded rectangle (borderRadius 24), padding 20px 36px
 *   - Background: linear-gradient(180deg, #f8f9fb, #eef1f5)
 *   - Contains "+" (fontSize * 0.52, weight 300) and "New"
 *     (fontSize * 0.48, weight 400)
 *   - Subtle box shadow
 *
 * Rotating border:
 *   A conic-gradient rotates continuously around the button at
 *   120°/second: conic-gradient(from ${angle}deg, transparent 0-30%,
 *   #8ab4f8 45%, #669df6 50%, #8ab4f8 55%, transparent 70-100%).
 *   Achieved with an absolutely positioned div (inset: -20px) behind
 *   the button, with overflow: hidden on the wrapper.
 *
 * Heartbeat motion:
 *   Button has a slow double-pulse heartbeat on a 3s cycle:
 *   - Beat 1 (0-1.0s): scale 1 → 1.035 → 1
 *   - Beat 2 (1.1-2.1s): scale 1 → 1.025 → 1
 *   Both beats use Easing.out(Easing.cubic).
 *   Final scale = beat1 * beat2.
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

const WORDS = ["designer", "storyteller", "writer", "developer", "creator"];
const LONGEST_WORD_LENGTH = Math.max(...WORDS.map((w) => w.length));

const HOLD = 2.5;
const TRANSITION = 0.6;
const CYCLE = HOLD + TRANSITION;

const WordSlot = ({ oldWord, newWord, progress, fontSize }) => {
  const slotHeight = fontSize * 1.3;

  const oldY = interpolate(progress, [0, 1], [0, -slotHeight], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const oldOpacity = interpolate(progress, [0, 0.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const newY = interpolate(progress, [0, 1], [slotHeight, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const newOpacity = interpolate(progress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const baseStyle = {
    position: "absolute",
    left: 0,
    whiteSpace: "nowrap",
    fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
    fontSize,
    fontWeight: 400,
    lineHeight: 1.3,
    background: "linear-gradient(135deg, #8ab4f8 0%, #669df6 40%, #4285f4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <div
      style={{
        display: "inline-block",
        height: slotHeight,
        position: "relative",
        overflow: "hidden",
        width: LONGEST_WORD_LENGTH * fontSize * 0.58,
      }}
    >
      {progress < 1 && (
        <div
          style={{
            ...baseStyle,
            top: 0,
            transform: `translateY(${oldY}px)`,
            opacity: oldOpacity,
          }}
        >
          {oldWord}
        </div>
      )}
      {progress > 0 && (
        <div
          style={{
            ...baseStyle,
            top: 0,
            transform: `translateY(${newY}px)`,
            opacity: newOpacity,
          }}
        >
          {newWord}
        </div>
      )}
    </div>
  );
};

export const MeetYourNew = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const fontSize = 82;

  const cycleIndex = Math.floor(t / CYCLE);
  const cycleTime = t - cycleIndex * CYCLE;

  const currentIdx = cycleIndex % WORDS.length;
  const nextIdx = (cycleIndex + 1) % WORDS.length;

  const borderAngle = (t * 120) % 360;

  const heartbeatCycle = 3;
  const ht = t % heartbeatCycle;
  const beat1 = interpolate(ht, [0, 0.4, 1.0], [1, 1.035, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const beat2 = interpolate(ht, [1.1, 1.5, 2.1], [1, 1.025, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const heartbeatScale = beat1 * beat2;

  const swapProgress = interpolate(
    cycleTime,
    [HOLD, HOLD + TRANSITION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "50%",
          transform: "translateY(-50%)",
          marginRight: 108,
          fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
          fontSize,
          fontWeight: 400,
          color: "#3c4043",
          whiteSpace: "nowrap",
        }}
      >
        Meet your
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${heartbeatScale})`,
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            padding: 2,
            overflow: "hidden",
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
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateY(-50%)",
          marginLeft: 108,
        }}
      >
        <WordSlot
          oldWord={WORDS[currentIdx]}
          newWord={WORDS[nextIdx]}
          progress={swapProgress}
          fontSize={fontSize}
        />
      </div>
    </AbsoluteFill>
  );
};
