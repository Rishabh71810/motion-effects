/**
 * ============================================================
 * EFFECT: Meet Your New — Input Box with Typing Animation
 * FILE: MeetYourNewTyping.tsx
 * COMPOSITION ID: Phase 4 of MeetYourNewCombined
 * DURATION: 210 frames (7s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create Phase 4 of the Google "Meet your new" animation. This phase
 * continues seamlessly from Phase 3's last frame — the first frame
 * of this phase must match the last frame of Phase 3 exactly.
 *
 * Coordinate system (shared with Phase 3):
 *   Uses the SAME absolute coordinate system as Phase 3.
 *   All 7 pointers are rendered at their Phase 3 final positions.
 *   Pointer chain starts at centerX=640, each pointer's leftX =
 *   previous tipX. Sizes: [140, 200, 280, 380, 500, 650, 840]
 *   tipX for each: leftX + size * 0.9.
 *   Last pointer tipX ≈ 3331.
 *
 * Phase 3 end state:
 *   panX = -width * 0.7 = -896
 *   All 7 pointers fully visible at scale 1.
 *   Screen positions (absolute + panX):
 *     ptr2 at screenLeft=50, ptr3 at 302, ptr4 at 644,
 *     ptr5 at 1094 (partially off-screen), ptr6 at 1679 (off-screen)
 *
 * Camera pan (continuation):
 *   Pan starts at phase3EndPan (-896) and continues to
 *   -(lastTipX - 60 - width * 0.15) to bring the input box into view.
 *   Duration: 0–3.5s with Easing.inOut(Easing.cubic).
 *
 * Pointer fade-out:
 *   All pointers fade from opacity 1 to 0 between t=0.8–2.0s.
 *
 * Input box:
 *   - Pill shape (borderRadius: 250), height 500px, width: width*1.6
 *   - Background: #f0f1f5
 *   - Position: left = lastTipX - 60, top = centerY - 250
 *   - Grows from left: scaleX 0→1 over t=1.0–1.8s,
 *     transformOrigin: "left center", Easing.out(Easing.cubic)
 *   - Opacity: 0→1 over t=1.0–1.4s
 *
 * Typing animation:
 *   Text: "Help me create a presentation for work"
 *   Starts at t=2.0s (after box is fully visible)
 *   Speed: 0.07s per character
 *   Font: Google Sans, 72px, weight 400, color #5f6368
 *   Cursor: 3px wide, height fontSize*0.9, blinks at 2Hz after
 *   typing completes (Math.floor(t * 2) % 2 === 0)
 *
 * Google "G" logo:
 *   Fixed at bottom-right (right: 40, bottom: 30)
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

const TYPED_TEXT = "Help me create a presentation for work";
const TYPE_SPEED = 0.07;

const POINTERS = [
  { size: 140, color: "#d4c5fe" },
  { size: 200, color: "#c4b5fd" },
  { size: 280, color: "#b49afa" },
  { size: 380, color: "#a78bfa" },
  { size: 500, color: "#9a9cf6" },
  { size: 650, color: "#93a8f8" },
  { size: 840, color: "#8ab8f8" },
];

export const MeetYourNewTyping = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const fontSize = 72;
  const centerX = width / 2;
  const centerY = height / 2;

  const positions = [];
  let currentTipX = centerX;
  for (const ptr of POINTERS) {
    const w = ptr.size * 0.9;
    positions.push({
      leftX: currentTipX,
      topY: centerY - ptr.size / 2,
      tipX: currentTipX + w,
    });
    currentTipX = currentTipX + w;
  }

  const lastTipX = positions[positions.length - 1].tipX;

  const phase3EndPan = -width * 0.7;
  const phase4EndPan = -(lastTipX - 60 - width * 0.15);
  const panX = interpolate(t, [0, 3.5], [phase3EndPan, phase4EndPan], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const ptrFadeOut = interpolate(t, [0.8, 2.0], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boxScale = interpolate(t, [1.0, 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const boxOpacity = interpolate(t, [1.0, 1.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const typeStart = 2.0;
  const charsVisible = Math.floor(Math.max(0, (t - typeStart) / TYPE_SPEED));
  const displayedText = TYPED_TEXT.slice(
    0,
    Math.min(charsVisible, TYPED_TEXT.length),
  );
  const typingDone = charsVisible >= TYPED_TEXT.length;
  const cursorVisible = !typingDone || Math.floor(t * 2) % 2 === 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${panX}px)`,
        }}
      >
        {POINTERS.map((ptr, i) => {
          const w = ptr.size * 0.9;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: positions[i].leftX,
                top: positions[i].topY,
                opacity: ptrFadeOut,
              }}
            >
              <svg
                width={w}
                height={ptr.size}
                viewBox={`0 0 ${w} ${ptr.size}`}
                style={{ display: "block" }}
              >
                <defs>
                  <linearGradient
                    id={`typ-grad-${i}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={ptr.color} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={ptr.color} />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,0 ${w},${ptr.size / 2} 0,${ptr.size}`}
                  fill={`url(#typ-grad-${i})`}
                />
              </svg>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: lastTipX - 60,
            top: centerY - 250,
            width: width * 1.6,
            height: 500,
            borderRadius: 250,
            backgroundColor: "#f0f1f5",
            transform: `scaleX(${boxScale})`,
            transformOrigin: "left center",
            opacity: boxOpacity,
            display: "flex",
            alignItems: "center",
            paddingLeft: 120,
            paddingRight: 120,
          }}
        >
          <span
            style={{
              fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
              fontSize,
              fontWeight: 400,
              color: "#5f6368",
              whiteSpace: "nowrap",
              position: "relative",
            }}
          >
            {displayedText}
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: fontSize * 0.9,
                backgroundColor: "#5f6368",
                marginLeft: 2,
                verticalAlign: "middle",
                opacity: cursorVisible ? 1 : 0,
              }}
            />
          </span>
        </div>
      </div>

      <div style={{ position: "absolute", right: 40, bottom: 30 }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
