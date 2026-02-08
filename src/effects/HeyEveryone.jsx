/**
 * ============================================================
 * EFFECT: "Hey everyone, we're finally back" — Word Pop Text
 * FILE: HeyEveryone.tsx
 * COMPOSITION ID: HeyEveryone
 * DURATION: 120 frames (4s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a bold word-pop text animation in Remotion with two
 * phases. Words pop in one at a time with scale + fade, hold
 * briefly, then blur and fade out before the next phase begins.
 * The final word triggers a cinematic zoom with a chat bubble
 * containing an animated fire emoji.
 *
 * ─── PHASE CONFIGURATION ───
 *
 *   Phase 1 words: ["Hey", "everyone"]
 *   Phase 2 words: ["we're", "finally", "back"]
 *
 *   Font: Google Sans / Product Sans / Inter, sans-serif
 *   Font size: 110px
 *   Font weight: 400
 *   Text color: gradient from #e8eaed → #bdc1c6 → #9aa0a6
 *     Applied via background-clip: text with a 180deg
 *     linear gradient (light silver at top, darker at bottom)
 *
 * ─── WORD POP-IN ANIMATION ───
 *
 *   Each word in a phase appears sequentially:
 *     - WORD_POP_DURATION: 0.2s per word
 *     - WORD_STAGGER: 0.25s between words in a group
 *     - Scale: 0.3 → 1.0 with Easing.out(Easing.back(1.4))
 *       (slight overshoot for punchy feel)
 *     - Opacity: 0 → 1 over first 0.08s (fast snap-in)
 *     - Each word is inline-block with marginRight: 24px
 *
 * ─── PHASE 1 → PHASE 2 TRANSITION ───
 *
 *   After Phase 1 words are fully visible:
 *     - HOLD_DURATION: 0.4s (words stay visible)
 *     - FADE_DURATION: 0.3s (blur + fade out)
 *     - Blur: 0 → 20px (Gaussian blur ramps up)
 *     - Opacity: 1 → 0 (fades to invisible)
 *     - Phase 1 div is unmounted 0.3s after fade completes
 *
 *   Phase 2 starts at t=1.6s (PHASES[1].startTime)
 *     - "we're" pops at 1.6s
 *     - "finally" pops at 1.85s
 *     - "back" does NOT pop normally — it appears WITH the zoom
 *
 * ─── ZOOM + PAN (FINAL CLIMAX) ───
 *
 *   After "we're" and "finally" are visible + 0.3s hold:
 *     - Zoom duration: 0.7s
 *     - Scale: 1.0 → 2.5 with Easing.inOut(Easing.cubic)
 *     - Pan X: 0 → -width*0.22 (shifts left to center on "back")
 *     - Pan Y: 0 → height*0.05 (slight downward drift)
 *     - Transform applied to entire content container
 *     - transformOrigin: center center
 *
 *   During zoom, earlier words drift and fade:
 *     - "we're" (index 0): drifts -200px left, fades to 0
 *     - "finally" (index 1): drifts -80px left, fades to 0.5
 *       (stays partially visible so "lly" remains on screen)
 *     - Drift uses Easing.in(Easing.cubic)
 *
 *   "back" appears at zoom start:
 *     - Scale: 0.3 → 1.0 over 0.3s with Easing.out(Easing.cubic)
 *     - Opacity: 0 → 1 over 0.1s
 *
 * ─── CHAT BUBBLE + FIRE EMOJI ───
 *
 *   Appears 0.25s after zoom starts:
 *     - Blue chat bubble: backgroundColor #4A90D9
 *     - Border radius: 22px, padding: 12px 18px
 *     - Chat tail: 16x16px rotated 45deg square at bottom-left
 *     - Scale: 0 → 1 with Easing.out(Easing.back(2)) over 0.25s
 *     - Opacity: 0 → 1 over 0.1s
 *     - transformOrigin: center left
 *
 *   Fire emoji (🔥) inside bubble:
 *     - Font size: 48px
 *     - Animated wobble rotation: sin(t*12)*5 + sin(t*8.5)*3 degrees
 *     - Scale X flicker: 1 + sin(t*10)*0.08 + sin(t*15)*0.05
 *     - Scale Y stretch: 1 + sin(t*9)*0.1
 *     - transformOrigin: bottom center (flame flickers from base)
 *
 * ─── EDGE GLOW EFFECT ───
 *
 *   Left and right edge glows appear during zoom:
 *     - Width: 180px, full height
 *     - Gradient: rgba(180,210,210,0.5) → transparent
 *     - Opacity: 0 → 0.6 over first 0.4s of zoom
 *     - Creates a cinematic lens-flare feel at screen edges
 *     - pointerEvents: none, zIndex: 10
 *
 * ─── BACKGROUND ───
 *
 *   Teal radial gradient:
 *     - Center: #2a5c5c (medium teal)
 *     - Mid: #1a3d3d at 40%
 *     - Edge: #0f2b2b at 100%
 *     - Ellipse centered at 50% 40% (slightly above center)
 *
 *   Vignette overlay:
 *     - radial-gradient: transparent center → rgba(0,0,0,0.3) edges
 *     - Adds subtle darkening at corners
 *
 * ─── ANIMATION TIMELINE ───
 *
 *   0.00s       : Phase 1 — "Hey" pops in (scale 0.3→1)
 *   0.25s       : "everyone" pops in
 *   0.45s       : Both words fully visible
 *   0.85s       : Hold complete, blur + fade begins
 *   1.15s       : Phase 1 fully faded out
 *   1.60s       : Phase 2 — "we're" pops in
 *   1.85s       : "finally" pops in
 *   2.35s       : Zoom begins (scale 1→2.5), "back" appears
 *   2.60s       : Chat bubble with 🔥 appears
 *   3.05s       : Zoom complete, fully zoomed into "back"
 *   3.05s–4.00s : Hold at zoom (fire emoji flickering)
 *
 * ─── TECHNICAL REQUIREMENTS ───
 *
 *   - Pure Remotion: useCurrentFrame(), useVideoConfig(), interpolate()
 *   - NO CSS animations, NO requestAnimationFrame
 *   - All motion driven by frame count → time → interpolate()
 *   - Easing: back() for pop-in, cubic for zoom, in/out for drift
 *   - CSS filter: blur() for phase transitions
 *   - Inline styles only (no external CSS)
 *   - Background-clip: text for gradient text effect
 *
 * ─── CUSTOMIZATION ───
 *
 *   - Change PHASES array for different word groups
 *   - Adjust WORD_STAGGER for faster/slower sequential pops
 *   - Change zoom scale (2.5) for more/less dramatic zoom
 *   - Swap fire emoji for any emoji in chat bubble
 *   - Change bubble color (#4A90D9) for different accent
 *   - Modify background gradient for different mood
 *   - Adjust edge glow color/opacity for different lens effect
 *   - Change font size (110) for different text scale
 *
 * ─── OVERALL FEEL ───
 *
 *   Energetic, punchy text reveal with cinematic zoom climax.
 *   Words pop with overshoot easing — snappy and dynamic.
 *   Blur transition between phases feels like a camera focus shift.
 *   Final zoom creates dramatic emphasis on "back".
 *   Fire emoji in chat bubble adds playful energy.
 *   Teal background with silver text — modern, premium feel.
 *   Edge glows during zoom mimic anamorphic lens artifacts.
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

/**
 * "Hey everyone, we're finally back" text pop animation.
 *
 * Words pop in one by one with scale-up, then blur and fade out.
 * New words pop in, and the final word zooms in with a
 * chat bubble + fire emoji.
 */

// Animation phases with word groups
const PHASES = [
  { words: ["Hey", "everyone"], startTime: 0 },
  { words: ["we're", "finally", "back"], startTime: 1.6 },
];

const WORD_POP_DURATION = 0.2; // seconds for each word to pop in
const WORD_STAGGER = 0.25; // delay between words in a group
const HOLD_DURATION = 0.4; // hold after all words visible
const FADE_DURATION = 0.3; // time for blur + fade out

const textStyle = {
  fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
  fontWeight: 400,
  lineHeight: 1,
  whiteSpace: "nowrap",
  background:
    "linear-gradient(180deg, #e8eaed 0%, #bdc1c6 50%, #9aa0a6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export const HeyEveryone = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const fontSize = 110;

  // --- Phase 1: "Hey" then "everyone" ---
  const phase1Start = PHASES[0].startTime;
  const phase1Words = PHASES[0].words;

  // When all words of phase 1 are done popping
  const phase1AllVisible =
    phase1Start +
    (phase1Words.length - 1) * WORD_STAGGER +
    WORD_POP_DURATION;
  const phase1FadeStart = phase1AllVisible + HOLD_DURATION;
  const phase1FadeEnd = phase1FadeStart + FADE_DURATION;

  // Blur + fade progress for phase 1
  const fadeProgress1 = interpolate(
    t,
    [phase1FadeStart, phase1FadeEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const phase1Blur = fadeProgress1 * 20; // blur up to 20px
  const phase1Opacity = 1 - fadeProgress1;

  // --- Phase 2: "we're" then "finally" then "back" ---
  const phase2Start = PHASES[1].startTime;
  const phase2Words = PHASES[1].words;
  // "back" appears WITH the zoom, not before it
  // Zoom starts after "we're finally" are visible (only 2 words pop)
  const phase2TwoWordsVisible =
    phase2Start + 1 * WORD_STAGGER + WORD_POP_DURATION;
  const zoomStart = phase2TwoWordsVisible + 0.3;
  const zoomEnd = zoomStart + 0.7;
  const zoomScale = interpolate(t, [zoomStart, zoomEnd], [1, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Pan to center on "back" during zoom
  // "back" is the last word, so it's to the right — shift left
  const zoomPanX = interpolate(t, [zoomStart, zoomEnd], [0, -width * 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const zoomPanY = interpolate(t, [zoomStart, zoomEnd], [0, height * 0.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Edge blur glow intensity during zoom
  const edgeGlowOpacity = interpolate(t, [zoomStart, zoomStart + 0.4], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fire flickering
  const fireWobble = Math.sin(t * 12) * 5 + Math.sin(t * 8.5) * 3;
  const fireScale = 1 + Math.sin(t * 10) * 0.08 + Math.sin(t * 15) * 0.05;
  const fireStretch = 1 + Math.sin(t * 9) * 0.1;

  // Chat bubble appears during zoom
  const bubbleStart = zoomStart + 0.25;
  const bubbleScale = interpolate(t, [bubbleStart, bubbleStart + 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });
  const bubbleOpacity = interpolate(
    t,
    [bubbleStart, bubbleStart + 0.1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Render a word with pop-in animation
  const renderPopWord = (
    word,
    wordIndex,
    phaseStart,
  ) => {
    const popStart = phaseStart + wordIndex * WORD_STAGGER;
    const popEnd = popStart + WORD_POP_DURATION;

    const scale = interpolate(t, [popStart, popEnd], [0.3, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.4)),
    });

    const opacity = interpolate(t, [popStart, popStart + 0.08], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <span
        key={word}
        style={{
          ...textStyle,
          fontSize,
          display: "inline-block",
          transform: `scale(${scale})`,
          opacity,
          marginRight: 24,
        }}
      >
        {word}
      </span>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #2a5c5c 0%, #1a3d3d 40%, #0f2b2b 100%)",
      }}
    >
      {/* Subtle vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Left edge blur glow */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 180,
          height: "100%",
          background:
            "linear-gradient(90deg, rgba(180,210,210,0.5) 0%, rgba(180,210,210,0.15) 40%, transparent 100%)",
          opacity: edgeGlowOpacity,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {/* Right edge blur glow */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 180,
          height: "100%",
          background:
            "linear-gradient(270deg, rgba(180,210,210,0.5) 0%, rgba(180,210,210,0.15) 40%, transparent 100%)",
          opacity: edgeGlowOpacity,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Main content container — zooms during final phase */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoomScale}) translate(${zoomPanX}px, ${zoomPanY}px)`,
          transformOrigin: "center center",
        }}
      >
        {/* Phase 1: "Hey everyone" — blurs and fades out */}
        {t < phase1FadeEnd + 0.3 && (
          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              filter: phase1Blur > 0.5 ? `blur(${phase1Blur}px)` : "none",
              opacity: phase1Opacity,
            }}
          >
            {phase1Words.map((word, i) =>
              renderPopWord(word, i, phase1Start),
            )}
          </div>
        )}

        {/* Phase 2: "we're finally back" */}
        {t >= phase2Start - 0.1 && (
          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {phase2Words.map((word, i) => {
              const isBack = i === phase2Words.length - 1;

              // "back" appears with zoom, other words pop normally
              const popStart = isBack ? zoomStart : phase2Start + i * WORD_STAGGER;
              const popEnd = popStart + (isBack ? 0.3 : WORD_POP_DURATION);

              const scale = interpolate(t, [popStart, popEnd], [0.3, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(isBack ? Easing.cubic : Easing.back(1.4)),
              });

              const opacity = interpolate(
                t,
                [popStart, popStart + 0.1],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );

              // During zoom, earlier words drift left and partially fade
              // "finally" (i=1) stays partially visible so "lly" is on screen
              let zoomFlyX = 0;
              let zoomFadeOpacity = 1;
              if (!isBack) {
                // "we're" (i=0) drifts more and fades fully
                // "finally" (i=1) drifts less and stays partially visible
                const driftAmount = i === 0 ? -200 : -80;
                const fadeTarget = i === 0 ? 0 : 0.5;
                zoomFlyX = interpolate(
                  t,
                  [zoomStart, zoomEnd],
                  [0, driftAmount],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.in(Easing.cubic),
                  },
                );
                zoomFadeOpacity = interpolate(
                  t,
                  [zoomStart, zoomEnd],
                  [1, fadeTarget],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                );
              }

              return (
                <span
                  key={word}
                  style={{
                    ...textStyle,
                    fontSize,
                    display: "inline-block",
                    transform: `scale(${scale}) translateX(${zoomFlyX}px)`,
                    opacity: opacity * zoomFadeOpacity,
                    marginRight: isBack ? 8 : 24,
                  }}
                >
                  {word}
                </span>
              );
            })}

            {/* Blue chat bubble with fire emoji — appears during zoom */}
            {t >= bubbleStart && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: -12,
                  transform: `scale(${bubbleScale})`,
                  opacity: bubbleOpacity,
                  transformOrigin: "center left",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "#4A90D9",
                    borderRadius: 22,
                    padding: "12px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Chat bubble tail */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -6,
                      left: 12,
                      width: 16,
                      height: 16,
                      backgroundColor: "#4A90D9",
                      borderRadius: 4,
                      transform: "rotate(45deg)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 48,
                      lineHeight: 1,
                      position: "relative",
                      zIndex: 1,
                      display: "inline-block",
                      transform: `rotate(${fireWobble}deg) scaleX(${fireScale}) scaleY(${fireStretch})`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    🔥
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
