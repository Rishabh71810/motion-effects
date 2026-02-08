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
const PHASES: { words: string[]; startTime: number }[] = [
  { words: ["Hey", "everyone"], startTime: 0 },
  { words: ["we're", "finally", "back"], startTime: 1.6 },
];

const WORD_POP_DURATION = 0.2; // seconds for each word to pop in
const WORD_STAGGER = 0.25; // delay between words in a group
const HOLD_DURATION = 0.4; // hold after all words visible
const FADE_DURATION = 0.3; // time for blur + fade out

const textStyle: React.CSSProperties = {
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

export const HeyEveryone: React.FC = () => {
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
    word: string,
    wordIndex: number,
    phaseStart: number,
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
