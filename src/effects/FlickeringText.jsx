/**
 * ============================================================
 * EFFECT: Flash Reveal Grid
 * FILE: FlickeringText.tsx
 * COMPOSITION ID: MyComp
 * DURATION: 60 frames (2s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Apply a deliberate After Effects-style text reveal on a 3x3 grid
 * of rounded pill-shaped boxes. Each box contains a single word.
 * Boxes alternate between white fill/black text and black fill/white
 * text in a checkerboard pattern.
 *
 * Phase 1 - First appearance:
 *   Each box appears briefly at full opacity.
 *   No easing, instant snap.
 *   Very short and intentional.
 *
 * Phase 2 - Disappearance:
 *   Each box fully disappears.
 *   Opacity drops linearly to 0%.
 *   Hold empty frame momentarily.
 *
 * Phase 3 - Final reveal:
 *   Each box reappears smoothly.
 *   Opacity fades from 0% to 100% with strong ease-out (exponential).
 *   Subtle scale-in from 98% to 100% with ease-out quad.
 *
 * Stagger:
 *   Boxes animate sequentially with 0.08s offset.
 *   Cascade flows left-to-right, top-to-bottom.
 *
 * End state:
 *   All boxes remain fully visible, sharp, and stable.
 *   No flicker after locking in.
 *
 * Style:
 *   Dark background (#0a0a0a).
 *   Border radius 48px on all boxes.
 *   Alternating white/black fill with inverted text color.
 *   Black inverted boxes have a 2px white border.
 *   Font: SF Pro Display, 42px, weight 700, letter-spacing 0.06em.
 *   Grid gap: 16px. Padding: 36px horizontal, 18px vertical.
 *
 * Timing constants:
 *   FLASH_IN: 0.1s
 *   FLASH_HOLD: 0.07s
 *   FADE_OUT: 0.12s
 *   EMPTY_HOLD: 0.2s
 *   FINAL_REVEAL: 0.5s
 *   STAGGER: 0.08s per box
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

const GRID_ITEMS = [
  { text: "MOTION", inverted: false },
  { text: "EFFECTS", inverted: true },
  { text: "DESIGN", inverted: false },
  { text: "VISUAL", inverted: true },
  { text: "STUDIO", inverted: false },
  { text: "RENDER", inverted: true },
  { text: "FRAMES", inverted: false },
  { text: "LAYERS", inverted: true },
  { text: "EXPORT", inverted: false },
];

const FLASH_IN_SEC = 0.1;
const FLASH_HOLD_SEC = 0.07;
const FADE_OUT_SEC = 0.12;
const EMPTY_HOLD_SEC = 0.2;
const FINAL_REVEAL_SEC = 0.5;
const STAGGER_SEC = 0.08;

const getFlicker = (frame, fps, delaySec) => {
  const delayFrames = Math.round(delaySec * fps);
  const localFrame = frame - delayFrames;

  const flashInEnd = Math.round(FLASH_IN_SEC * fps);
  const flashHoldEnd = flashInEnd + Math.round(FLASH_HOLD_SEC * fps);
  const fadeOutEnd = flashHoldEnd + Math.round(FADE_OUT_SEC * fps);
  const emptyHoldEnd = fadeOutEnd + Math.round(EMPTY_HOLD_SEC * fps);
  const finalRevealEnd = emptyHoldEnd + Math.round(FINAL_REVEAL_SEC * fps);

  if (localFrame < 0) return { opacity: 0, scale: 1 };
  if (localFrame < flashInEnd) return { opacity: 1, scale: 1 };
  if (localFrame < flashHoldEnd) return { opacity: 1, scale: 1 };

  if (localFrame < fadeOutEnd) {
    const progress = (localFrame - flashHoldEnd) / (fadeOutEnd - flashHoldEnd);
    return {
      opacity: interpolate(progress, [0, 1], [1, 0], { extrapolateRight: "clamp" }),
      scale: 1,
    };
  }

  if (localFrame < emptyHoldEnd) return { opacity: 0, scale: 1 };

  if (localFrame < finalRevealEnd) {
    const progress = (localFrame - emptyHoldEnd) / (finalRevealEnd - emptyHoldEnd);
    return {
      opacity: interpolate(progress, [0, 1], [0, 1], {
        easing: Easing.out(Easing.exp),
        extrapolateRight: "clamp",
      }),
      scale: interpolate(progress, [0, 1], [0.98, 1], {
        easing: Easing.out(Easing.quad),
        extrapolateRight: "clamp",
      }),
    };
  }

  return { opacity: 1, scale: 1 };
};

export const FlickeringText = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const columns = 3;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
        }}
      >
        {GRID_ITEMS.map(({ text, inverted }, i) => {
          const { opacity, scale } = getFlicker(frame, fps, i * STAGGER_SEC);
          const bg = inverted ? "#000000" : "#ffffff";
          const fg = inverted ? "#ffffff" : "#000000";
          const border = inverted ? "2px solid #ffffff" : "none";

          return (
            <div
              key={i}
              style={{
                backgroundColor: bg,
                border,
                borderRadius: 48,
                paddingLeft: 36,
                paddingRight: 36,
                paddingTop: 18,
                paddingBottom: 18,
                opacity,
                transform: `scale(${scale})`,
                willChange: "opacity, transform",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "SF Pro Display, -apple-system, sans-serif",
                  fontSize: 42,
                  fontWeight: 700,
                  color: fg,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
