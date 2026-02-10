/**
 * ============================================================
 * EFFECT: GlassPlusExpand — Glassmorphic SaaS Product Reveal
 * FILE: GlassPlusExpand.tsx
 * COMPOSITION ID: GlassPlusExpand
 * DURATION: 420 frames (14s @ 30fps)
 * RESOLUTION: 1280x720 (landscape / 16:9)
 * ============================================================
 *
 * PROMPT:
 *
 * Create a 1280x720 landscape motion piece (14s, 30fps) with 5
 * sequential phases that showcase a SaaS AI product called "lovio".
 * The animation flows from a minimal glassmorphic UI element into
 * a full product layout, then zooms into a prompt bar, reveals a
 * dramatic "idea" text on an aurora background, and finally shows
 * a prompt box typing + generating response sequence.
 *
 * Font: system font stack (-apple-system, BlinkMacSystemFont,
 * 'Helvetica Neue', Helvetica, Arial, sans-serif).
 *
 * ─── PHASE 1: Circle + Pill Intro (0s → 2s) ───
 *
 *   Background: Muted green gradient (olive/sage tones) with
 *   organic radial overlays, light streaks from upper-right,
 *   and subtle vignette. Think soft, natural, editorial.
 *
 *   Center of screen:
 *   - A glassmorphic circle "+" button (130px) spring-animates in
 *     from frame 0. Glass style: linear-gradient white 18%→8%,
 *     backdrop-filter blur(24px), 1.5px white border at 30% opacity,
 *     box-shadow with inset highlights.
 *   - At 0.8s a glassmorphic pill expands to the right of the circle
 *     (max width 245px, height 130px, same glass style). Contains:
 *       - An app icon (34px SVG: circle with two arc strokes and
 *         two small dots) that spring-scales in at 0.9s
 *       - "Public" text types in character-by-character starting at
 *         1.0s (0.08s per char), 36px, weight 500, white 95% opacity
 *   - Gap between circle and pill animates from 0 to 20px
 *
 * ─── PHASE 1→2 TRANSITION (2s → 2.8s) ───
 *
 *   The circle+pill group smoothly moves from center (640, 360) to
 *   bottom-left position (200, 485) while scaling down to 0.354.
 *   Uses cubic ease-in-out interpolation. At this scale the circle
 *   renders at ~46px and the pill at ~46px, matching the audio
 *   button size on the prompt bar.
 *
 * ─── PHASE 2: Full Product Layout (2.3s → 5.5s) ───
 *
 *   Elements fade/scale in with staggered timing:
 *
 *   Title (top: 105px, centered):
 *     - "Build something" + BrandIcon SVG (56px, 4 overlapping
 *       circles in purple/blue shades) + "lovio"
 *     - 82px, weight 700, white, letter-spacing -0.02em
 *     - Fades in 2.3s→3.0s with 25px upward slide
 *
 *   Subtitle (top: 215px, centered):
 *     - "Create apps and websites by chatting with"
 *     - Types character-by-character starting at 2.8s (0.05s/char)
 *     - 28px, weight 400, white 70% opacity
 *     - "with" portion renders in purple (#8B7BEE)
 *     - Fades in 2.6s→3.0s
 *
 *   Prompt Bar (left: 80, top: 300, 1120x230px, radius 28px):
 *     - Glassmorphic surface: gradient white 10%→4%, blur(30px),
 *       1.5px border at 15% white, inset highlight shadow
 *     - Scales in from 0.95→1.0 during 2.4s→3.0s
 *     - Contains placeholder text "Ask lovio to create something..."
 *       that types in starting at 3.2s (0.06s/char), 26px,
 *       white 45% opacity; "something..." in purple
 *     - Bottom-right: 46px audio button (glassmorphic circle with
 *       5-line audio waveform SVG icon), springs in at 3.5s
 *
 *   Circle+pill group sits at bottom-left of prompt bar area,
 *   vertically aligned with the audio button (both 46px rendered).
 *   Both the group and audio button fade out during Phase 3.
 *
 * ─── PHASE 3: Zoom Into Prompt Bar (5.5s → ~8s) ───
 *
 *   Simultaneous animations at 5.5s:
 *
 *   - Title disperses upward (translateY → -120px, opacity → 0)
 *     over 0.5s with cubic ease-in
 *   - Subtitle disperses upward (translateY → -80px, opacity → 0)
 *     over 0.4s
 *   - Circle+pill group and audio button fade out over 0.4s
 *   - Old prompt placeholder text fades out over 0.4s
 *
 *   Scene zoom (5.5s → 6.5s, cubic ease-in-out):
 *     - Scale: 1 → 2.2
 *     - Translate: (0, 0) → (-160px, -450px)
 *     - Origin: top-left (0 0)
 *     - Effect: prompt bar text area fills the entire viewport
 *
 *   New text "I have an idea" types in starting at 6.2s
 *   (0.07s/char), 26px white 90% opacity, with blinking cursor
 *   (12-frame toggle cycle). Cursor stops at Phase 4 start.
 *
 * ─── PHASE 4: Blue Aurora "idea" Reveal (8.0s → 9.5s) ───
 *
 *   Blue aurora background crossfades in over 0.6s (z-index 10):
 *     - Deep dark base (#050218)
 *     - Pink/magenta aurora blob upper-left (blur 60px)
 *     - Deep blue sweep bottom-right (blur 50px, rotated -20deg)
 *     - Blue accent right (blur 50px)
 *     - Purple accent center-left (blur 45px)
 *     - Blue curve lower-left (blur 40px, rotated 15deg)
 *     - Subtle central glow for text (blur 30px)
 *
 *   "idea" text animation (z-index 11):
 *     - Starts at the zoomed Phase 3 position (390, 309) at
 *       scale 0.286 (matching 26px * 2.2 zoom = 57.2px → 200px)
 *     - Flies to center (640, 360) at scale 1.0 over 0.9s
 *       with cubic ease-out
 *     - Three stacked text layers (all 200px, weight 600):
 *       1. Glow layer: purple-ish color with blur(35px), pulsing
 *          opacity driven by sin wave (1.5 Hz, range 0.4→0.7)
 *       2. White layer: fades out as gradient layer fades in
 *       3. Gradient layer: linear-gradient 90deg from #c080ee
 *          through #a090ff, #70a0ff to #60b0ff, applied via
 *          WebkitBackgroundClip: "text". Fades in during 30%→80%
 *          of the motion progress.
 *
 * ─── PHASE 5: Prompt Box + Generating (9.5s → 14s) ───
 *
 *   Continues on the blue aurora background.
 *
 *   5A — Idea shrinks, prompt box appears (9.5s → 10.2s):
 *     - "idea" gradient text fades out over 0.4s
 *     - Glassmorphic prompt box (1000px wide, radius 24px) springs
 *       in at 9.65s. Glass: white 8%, blur(40px), 1px border at
 *       15% white, shadow with inset highlight. Padding 20px 24px.
 *
 *   5B — Text typing (10.2s → 12.0s):
 *     - "Build a web app marketplace with user accounts and payments"
 *       types at 0.03s per character, 28px white, line-height 1.4
 *     - Blinking cursor (10-frame toggle), 2px wide white bar
 *
 *   Bottom controls row:
 *     Left: 36px "+" circle button (white 10% bg, 1px border) +
 *           "Public" pill (6px/16px padding, 14px text, white 60%)
 *     Right: 36px audio circle (waveform SVG icon) +
 *            40px send circle (up-arrow SVG, highlights when
 *            typing is done, pressed state with scale 0.9)
 *
 *   5C — Hand cursor clicks send (12.0s → 12.5s):
 *     - Hand pointer SVG (32px, white fill) fades in at 11.9s
 *     - Moves toward send button over 0.3s (cubic ease-out)
 *     - Send button shows pressed state (blue highlight, scale 0.9)
 *       at 12.3s→12.45s
 *     - Hand fades out at 12.6s→12.8s
 *
 *   5D — Text disperses (12.5s → 13.0s):
 *     - Typed text fades out + lifts up 40px over 0.3s (cubic ease-in)
 *     - Bottom controls (+ button, Public pill, audio, send) fade
 *       out over 0.2s
 *     - Prompt box remains as empty glassmorphic container
 *
 *   5E — Generating response (13.0s → 14.0s):
 *     - Overlay inside the prompt box fades in over 0.4s
 *     - BrandIcon SVG at 1.5x scale, centered
 *     - "Generating response..." text: 18px, white 70%,
 *       letter-spacing 0.02em
 *     - Progress bar (320px wide):
 *       - Track: 6px tall, white 10% bg, rounded
 *       - Fill: linear-gradient 90deg #6080ff → #80b0ff
 *       - Animates from 0% → 62% over 0.6s (13.3s → 13.9s)
 *         with cubic ease-out
 *     - "62%" label: 14px, white 50%, right of progress bar
 *
 * ─── TECHNICAL NOTES ───
 *
 *   - All animations use Remotion's interpolate() with clamp
 *     extrapolation and spring() with nested config objects
 *   - Easing functions: Easing.out(cubic), Easing.in(cubic),
 *     Easing.inOut(cubic) for different transition feels
 *   - SVG icons are memoized with React.memo() to prevent re-renders
 *   - z-index layering: base scene < Phase 4 aurora (10) <
 *     Phase 4 text (11) < Phase 5 prompt box (15-16) < hand (17)
 *   - Phase transitions use opacity crossfades, no hard cuts
 *   - Zoom transform uses translate + scale with origin 0 0
 *   - Glass effects: consistent use of backdrop-filter blur,
 *     semi-transparent white backgrounds, subtle white borders,
 *     and inset highlight shadows
 *
 * ============================================================
 */

import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
  spring,
} from "remotion";
import React from "react";

// ─── Phase 1 Constants ───
const LABEL_TEXT = "Public";
const CIRCLE_SIZE = 130;
const PILL_H = 130;
const PILL_MAX_W = 245;
const GAP = 20;
const TYPE_SPEED = 0.08;

// ─── Phase 2 Constants ───
const TITLE_MAIN = "Build something";
const BRAND_NAME = "lovio";
const SUBTITLE_NORMAL = "Create apps and websites by chatting ";
const SUBTITLE_PURPLE = "with";
const SUBTITLE_FULL = SUBTITLE_NORMAL + SUBTITLE_PURPLE;
const PROMPT_NORMAL = "Ask lovio to create ";
const PROMPT_PURPLE = "something...";
const PROMPT_FULL = PROMPT_NORMAL + PROMPT_PURPLE;
const PURPLE = "#8B7BEE";

// Prompt bar layout
const PB_X = 80;
const PB_Y = 300;
const PB_W = 1120;
const PB_H = 230;
const PB_R = 28;

// Phase 1→2 transition timing
const T_START = 2.0;
const T_END = 2.8;

// Phase 2 target for circle+pill group center
const P2_CENTER_X = 200;
const P2_CENTER_Y = 485;
const P2_SCALE = 0.354;

// ─── Phase 3 Constants ───
const PHASE3_TEXT = "I have an idea";
const P3_START = 5.5; // title/subtitle disperse + zoom begins
const P3_ZOOM_END = 6.5; // zoom finishes
const P3_TYPE_START = 6.2; // new text starts typing

// Zoom target: scale scene so prompt bar text area fills viewport
const ZOOM_S = 2.2;
const ZOOM_TX = -160;
const ZOOM_TY = -450;

// ─── Phase 4 Constants ───
const P4_START = 8.0; // blue bg crossfade + "idea" motion begins

// Where "idea" sits in viewport after Phase 3 zoom:
// "idea" in unzoomed coords ≈ (250, 345), after translate(-160,-450) scale(2.2):
// viewport position ≈ (250*2.2 - 160, 345*2.2 - 450) = (390, 309)
// font size after zoom: 26 * 2.2 = 57.2px → scale = 57.2 / 200 = 0.286
const P4_FROM_X = 390;
const P4_FROM_Y = 309;
const P4_FROM_SCALE = 0.286;
const P4_TO_X = 640;
const P4_TO_Y = 360;

// ─── Phase 5 Constants ───
const P5_START = 9.5;
const P5_TYPE_START = 10.2;
const P5_TYPE_TEXT =
  "Build a web app marketplace with user accounts and payments";
const P5_CLICK_START = 12.0;
const P5_CLEAR_START = 12.5;
const P5_GEN_START = 13.0;
const P5_BOX_W = 1000;
const P5_BOX_R = 24;

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// ─── SVG Icons ───
const PlusIcon = React.memo(() => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <line
      x1="22" y1="8" x2="22" y2="36"
      stroke="white" strokeWidth="2.5" strokeLinecap="round"
    />
    <line
      x1="8" y1="22" x2="36" y2="22"
      stroke="white" strokeWidth="2.5" strokeLinecap="round"
    />
  </svg>
));

const AppIcon = React.memo(() => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <circle cx="17" cy="17" r="14" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
    <path d="M11 17c0-3.3 2.7-6 6-6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M17 23c3.3 0 6-2.7 6-6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="11" cy="17" r="1.8" fill="rgba(255,255,255,0.85)" />
    <circle cx="23" cy="17" r="1.8" fill="rgba(255,255,255,0.85)" />
  </svg>
));

const BrandIcon = React.memo(() => (
  <svg
    width="56" height="56" viewBox="0 0 56 56" fill="none"
    style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }}
  >
    <circle cx="20" cy="20" r="11" fill="#7060EA" opacity="0.9" />
    <circle cx="36" cy="20" r="11" fill="#5580EA" opacity="0.9" />
    <circle cx="20" cy="36" r="11" fill="#9050EA" opacity="0.9" />
    <circle cx="36" cy="36" r="11" fill="#6570EA" opacity="0.9" />
  </svg>
));

const AudioIcon = React.memo(() => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <line x1="3" y1="8" x2="3" y2="14" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="7" y1="5" x2="7" y2="17" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="11" y1="7" x2="11" y2="15" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="4" x2="15" y2="18" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="19" y1="9" x2="19" y2="13" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
));

// ─── Background ───
const Background = React.memo(() => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(160deg, #5a6b52 0%, #7a8870 20%, #8a9580 40%, #9da89a 55%, #7a8872 75%, #5a6950 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: -200,
        right: -100,
        width: 800,
        height: 900,
        background:
          "linear-gradient(220deg, rgba(255,255,240,0.18) 0%, rgba(255,255,240,0.06) 30%, transparent 60%)",
        transform: "rotate(-10deg)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: -100,
        right: 100,
        width: 400,
        height: 800,
        background:
          "linear-gradient(220deg, rgba(255,255,240,0.12) 0%, transparent 50%)",
        transform: "rotate(-15deg)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -60,
        top: 80,
        width: 420,
        height: 520,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(55,85,40,0.55) 0%, rgba(50,80,38,0.25) 40%, transparent 70%)",
        filter: "blur(30px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -40,
        bottom: 40,
        width: 320,
        height: 370,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(50,80,38,0.45) 0%, rgba(45,75,32,0.2) 40%, transparent 70%)",
        filter: "blur(25px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 300,
        top: 200,
        width: 200,
        height: 200,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(90,110,75,0.3) 0%, transparent 70%)",
        filter: "blur(20px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        background:
          "linear-gradient(to top, rgba(65,95,45,0.5) 0%, rgba(75,105,50,0.3) 40%, transparent 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(30,40,25,0.3) 100%)",
      }}
    />
  </>
));

// ─── Phase 4: Blue Aurora Background ───
const BlueAurora = React.memo(() => (
  <>
    {/* Deep dark base */}
    <div style={{ position: "absolute", inset: 0, background: "#050218" }} />

    {/* Pink/magenta aurora — upper left */}
    <div
      style={{
        position: "absolute",
        top: -120,
        left: 60,
        width: 450,
        height: 550,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(180,40,150,0.45) 0%, rgba(140,30,120,0.2) 40%, transparent 70%)",
        filter: "blur(60px)",
      }}
    />

    {/* Deep blue sweep — bottom right */}
    <div
      style={{
        position: "absolute",
        bottom: -250,
        right: -150,
        width: 1300,
        height: 900,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(35,25,160,0.5) 0%, rgba(25,15,120,0.3) 40%, transparent 70%)",
        filter: "blur(50px)",
        transform: "rotate(-20deg)",
      }}
    />

    {/* Blue accent — right */}
    <div
      style={{
        position: "absolute",
        top: 80,
        right: -80,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(30,50,180,0.4) 0%, transparent 70%)",
        filter: "blur(50px)",
      }}
    />

    {/* Purple accent — center left */}
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 180,
        width: 500,
        height: 450,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(80,25,160,0.35) 0%, transparent 70%)",
        filter: "blur(45px)",
      }}
    />

    {/* Sweeping blue curve — lower left */}
    <div
      style={{
        position: "absolute",
        bottom: -100,
        left: -200,
        width: 900,
        height: 500,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(20,30,140,0.4) 0%, transparent 65%)",
        filter: "blur(40px)",
        transform: "rotate(15deg)",
      }}
    />

    {/* Subtle central glow for text */}
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 600,
        height: 300,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(100,80,220,0.2) 0%, transparent 70%)",
        filter: "blur(30px)",
      }}
    />
  </>
));

// ─── SVG: Hand pointer cursor ───
const HandCursor = React.memo(({ opacity }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity }}>
    <path
      d="M12 2c.6 0 1 .4 1 1v12h2V5c0-.6.4-1 1-1s1 .4 1 1v10h2V7c0-.6.4-1 1-1s1 .4 1 1v8h2V9c0-.6.4-1 1-1s1 .4 1 1v13c0 5-3 8-8 8-4.5 0-7-2.5-9-6l-3-5c-.3-.5-.2-1.1.3-1.4.5-.3 1.1-.1 1.4.3l2.3 3.6V3c0-.6.4-1 1-1z"
      fill="white"
      stroke="rgba(0,0,0,0.2)"
      strokeWidth="0.5"
    />
  </svg>
));

// ─── SVG: Send arrow button ───
const SendIcon = React.memo(() => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 3L10 17M10 3L5 8M10 3L15 8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));

// ─── Helper: typed text with last portion in purple ───
const TypedText = ({ displayed, normalPart, fontSize, fontWeight, baseColor }) => {
  if (displayed.length <= normalPart.length) {
    return (
      <span style={{ fontFamily: FONT, fontSize, fontWeight, color: baseColor, letterSpacing: "0.01em" }}>
        {displayed}
      </span>
    );
  }
  return (
    <>
      <span style={{ fontFamily: FONT, fontSize, fontWeight, color: baseColor, letterSpacing: "0.01em" }}>
        {normalPart}
      </span>
      <span style={{ fontFamily: FONT, fontSize, fontWeight, color: PURPLE, letterSpacing: "0.01em" }}>
        {displayed.slice(normalPart.length)}
      </span>
    </>
  );
};

// ─── Main Component ───
export const GlassPlusExpand = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // ════════════════════════════════════════
  // PHASE 1: Circle + Pill (0 → 2s)
  // ════════════════════════════════════════

  const circleSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });

  const pillProgress = interpolate(t, [0.8, 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pillWidth = interpolate(pillProgress, [0, 1], [0, PILL_MAX_W]);
  const pillOpacity = interpolate(pillProgress, [0, 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentGap = interpolate(pillProgress, [0, 0.12], [0, GAP], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const iconSpring = spring({
    frame: Math.max(0, frame - Math.round(0.9 * fps)),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });

  const typeStart = 1.0;
  const charsVisible = Math.floor(Math.max(0, (t - typeStart) / TYPE_SPEED));
  const displayedText = LABEL_TEXT.slice(0, Math.min(charsVisible, LABEL_TEXT.length));
  const textOpacity = interpolate(t, [1.0, 1.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ════════════════════════════════════════
  // TRANSITION 1→2 (2s → 2.8s)
  // ════════════════════════════════════════

  const tp = interpolate(t, [T_START, T_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const groupCenterX = interpolate(tp, [0, 1], [640, P2_CENTER_X]);
  const groupCenterY = interpolate(tp, [0, 1], [360, P2_CENTER_Y]);
  const groupScale = interpolate(tp, [0, 1], [1, P2_SCALE]);

  // ════════════════════════════════════════
  // PHASE 2: Full Layout (2.3s → 5.5s)
  // ════════════════════════════════════════

  const showPhase2 = tp > 0;

  // Title — fade in, then disperse up in Phase 3
  const titleFadeIn = interpolate(t, [2.3, 3.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleDisperse = interpolate(t, [P3_START, P3_START + 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const titleOpacity = titleFadeIn * (1 - titleDisperse);
  const titleYIn = interpolate(t, [2.3, 3.0], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleYOut = interpolate(titleDisperse, [0, 1], [0, -120]);
  const titleY = titleYIn + titleYOut;

  // Subtitle — fade in, then disperse up
  const subStart = 2.8;
  const subChars = Math.floor(Math.max(0, (t - subStart) / 0.05));
  const subDisplayed = SUBTITLE_FULL.slice(0, Math.min(subChars, SUBTITLE_FULL.length));
  const subFadeIn = interpolate(t, [2.6, 3.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subDisperse = interpolate(t, [P3_START, P3_START + 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const subOpacity = subFadeIn * (1 - subDisperse);
  const subYOut = interpolate(subDisperse, [0, 1], [0, -80]);

  // Prompt bar
  const pbOpacity = interpolate(t, [2.4, 3.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pbScale = interpolate(t, [2.4, 3.0], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Prompt placeholder typing (Phase 2)
  const promptStart = 3.2;
  const promptChars = Math.floor(Math.max(0, (t - promptStart) / 0.06));
  const promptDisplayed = PROMPT_FULL.slice(0, Math.min(promptChars, PROMPT_FULL.length));
  const promptTextFadeIn = interpolate(t, [3.0, 3.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Audio button
  const audioSpring = spring({
    frame: Math.max(0, frame - Math.round(3.5 * fps)),
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.7 },
  });

  // ════════════════════════════════════════
  // PHASE 3: Zoom into prompt bar (5.5s+)
  // ════════════════════════════════════════

  // Scene zoom
  const zoomProgress = interpolate(t, [P3_START, P3_ZOOM_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const zoomScale = interpolate(zoomProgress, [0, 1], [1, ZOOM_S]);
  const zoomTx = interpolate(zoomProgress, [0, 1], [0, ZOOM_TX]);
  const zoomTy = interpolate(zoomProgress, [0, 1], [0, ZOOM_TY]);

  // Fade out circle+pill group and audio button during zoom
  const p3FadeOut = interpolate(t, [P3_START, P3_START + 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Old prompt text fades out
  const oldPromptFade = interpolate(t, [P3_START, P3_START + 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const promptTextOpacity = promptTextFadeIn * oldPromptFade;

  // New prompt text typing ("I have an idea")
  const p3TypeChars = Math.floor(Math.max(0, (t - P3_TYPE_START) / 0.07));
  const p3Displayed = PHASE3_TEXT.slice(0, Math.min(p3TypeChars, PHASE3_TEXT.length));
  const p3TextFadeIn = interpolate(t, [P3_TYPE_START - 0.2, P3_TYPE_START], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Fade out "I have an " prefix during Phase 4 (but "idea" is taken over by Phase 4 overlay)
  const p3Phase4Fade = interpolate(t, [P4_START, P4_START + 0.3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p3TextOpacity = p3TextFadeIn * p3Phase4Fade;
  const p3TypingDone = p3TypeChars >= PHASE3_TEXT.length;

  // Cursor blink (stops at Phase 4)
  const cursorVisible = p3TypingDone && t < P4_START
    ? Math.floor(frame / 12) % 2 === 0
    : t < P4_START;

  // ════════════════════════════════════════
  // PHASE 4: Blue "idea" reveal (8.0s+)
  // ════════════════════════════════════════

  // Blue overlay fades in
  const p4Overlay = interpolate(t, [P4_START, P4_START + 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "idea" text flies from Phase 3 position to center
  const p4Motion = interpolate(t, [P4_START, P4_START + 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const p4X = interpolate(p4Motion, [0, 1], [P4_FROM_X, P4_TO_X]);
  const p4Y = interpolate(p4Motion, [0, 1], [P4_FROM_Y, P4_TO_Y]);
  const p4Scale = interpolate(p4Motion, [0, 1], [P4_FROM_SCALE, 1]);
  const p4TextOpacity = interpolate(t, [P4_START, P4_START + 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gradient colors emerge as text reaches center
  const p4GradientOpacity = interpolate(p4Motion, [0.3, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow intensity pulses subtly after arrival
  const p4GlowPulse = interpolate(
    Math.sin((t - P4_START) * 1.5),
    [-1, 1],
    [0.4, 0.7],
  );
  const p4GlowStrength = interpolate(p4Motion, [0.4, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ════════════════════════════════════════
  // PHASE 5: Prompt box + Generating (9.5s+)
  // ════════════════════════════════════════

  // 5A: "idea" shrinks away, prompt box appears
  const p5IdeaFade = interpolate(t, [P5_START, P5_START + 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p5BoxSpring = spring({
    frame: Math.max(0, frame - Math.round((P5_START + 0.15) * fps)),
    fps,
    config: { damping: 12, stiffness: 90, mass: 0.8 },
  });
  const p5BoxVisible = t >= P5_START + 0.15;

  // Bottom-row controls opacity (fade out on clear)
  const p5ControlsOpacity = interpolate(t, [P5_CLEAR_START, P5_CLEAR_START + 0.2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 5B: Typing
  const p5TypeChars = Math.floor(Math.max(0, (t - P5_TYPE_START) / 0.03));
  const p5Displayed = P5_TYPE_TEXT.slice(
    0,
    Math.min(p5TypeChars, P5_TYPE_TEXT.length),
  );
  const p5TypingDone = p5TypeChars >= P5_TYPE_TEXT.length;
  const p5CursorOn =
    t >= P5_TYPE_START && t < P5_CLEAR_START && Math.floor(frame / 10) % 2 === 0;

  // 5C: Hand pointer moves to send button
  const p5HandProgress = interpolate(t, [P5_CLICK_START, P5_CLICK_START + 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const p5HandVisible = t >= P5_CLICK_START - 0.1 && t < P5_CLEAR_START + 0.3;
  const p5SendPressed = t >= P5_CLICK_START + 0.3 && t < P5_CLICK_START + 0.45;

  // 5D: Text disperses
  const p5TextFade = interpolate(t, [P5_CLEAR_START, P5_CLEAR_START + 0.3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p5TextLift = interpolate(t, [P5_CLEAR_START, P5_CLEAR_START + 0.3], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // 5E: Generating response
  const p5GenFade = interpolate(t, [P5_GEN_START, P5_GEN_START + 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p5ProgressPct = interpolate(t, [P5_GEN_START + 0.3, P5_GEN_START + 0.9], [0, 62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* ── Zoom container wraps everything ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${zoomTx}px, ${zoomTy}px) scale(${zoomScale})`,
          transformOrigin: "0 0",
        }}
      >
        <Background />

        {/* ── Phase 2: Title ── */}
        {showPhase2 && titleOpacity > 0.001 && (
          <div
            style={{
              position: "absolute",
              top: 105,
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
            }}
          >
            <span style={{ fontFamily: FONT, fontSize: 82, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
              {TITLE_MAIN}{" "}
            </span>
            <BrandIcon />
            <span style={{ fontFamily: FONT, fontSize: 82, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
              {BRAND_NAME}
            </span>
          </div>
        )}

        {/* ── Phase 2: Subtitle ── */}
        {showPhase2 && subOpacity > 0.001 && (
          <div
            style={{
              position: "absolute",
              top: 215,
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: subOpacity,
              transform: `translateY(${subYOut}px)`,
            }}
          >
            <TypedText
              displayed={subDisplayed}
              normalPart={SUBTITLE_NORMAL}
              fontSize={28}
              fontWeight={400}
              baseColor="rgba(255,255,255,0.7)"
            />
          </div>
        )}

        {/* ── Phase 2/3: Prompt Bar ── */}
        {showPhase2 && (
          <div
            style={{
              position: "absolute",
              left: PB_X,
              top: PB_Y,
              width: PB_W,
              height: PB_H,
              borderRadius: PB_R,
              opacity: pbOpacity,
              transform: `scale(${pbScale})`,
              transformOrigin: "center center",
            }}
          >
            {/* Glass surface */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: PB_R,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            />

            {/* Old prompt placeholder text (fades out in Phase 3) */}
            {promptTextOpacity > 0.001 && (
              <div
                style={{
                  position: "absolute",
                  top: 32,
                  left: 38,
                  right: 38,
                  opacity: promptTextOpacity,
                }}
              >
                <TypedText
                  displayed={promptDisplayed}
                  normalPart={PROMPT_NORMAL}
                  fontSize={26}
                  fontWeight={400}
                  baseColor="rgba(255,255,255,0.45)"
                />
              </div>
            )}

            {/* New prompt text — "I have an idea" (Phase 3) */}
            {p3TextOpacity > 0.001 && (
              <div
                style={{
                  position: "absolute",
                  top: 32,
                  left: 38,
                  right: 38,
                  opacity: p3TextOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 26,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {p3Displayed}
                </span>
                {/* Cursor */}
                {p3Displayed.length > 0 && cursorVisible && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 28,
                      background: "rgba(255,255,255,0.8)",
                      marginLeft: 2,
                      verticalAlign: "text-bottom",
                    }}
                  />
                )}
              </div>
            )}

            {/* Audio button — bottom-right (fades out in Phase 3) */}
            <div
              style={{
                position: "absolute",
                right: 22,
                bottom: 22,
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: audioSpring * p3FadeOut,
                transform: `scale(${audioSpring})`,
              }}
            >
              <AudioIcon />
            </div>
          </div>
        )}

        {/* ── Circle + Pill Group (fades out in Phase 3) ── */}
        <div
          style={{
            position: "absolute",
            left: groupCenterX,
            top: groupCenterY,
            transform: `translate(-50%, -50%) scale(${groupScale})`,
            display: "flex",
            alignItems: "center",
            gap: currentGap,
            zIndex: 2,
            opacity: p3FadeOut,
          }}
        >
          {/* Glassmorphic Circle "+" Button */}
          <div
            style={{
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: "50%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${circleSpring})`,
              opacity: circleSpring,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(255,255,255,0.05)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <PlusIcon />
            </div>
          </div>

          {/* Glassmorphic Pill */}
          <div
            style={{
              width: pillWidth,
              height: pillProgress > 0 ? PILL_H : 0,
              borderRadius: PILL_H / 2,
              position: "relative",
              display: "flex",
              alignItems: "center",
              paddingLeft: pillProgress > 0.1 ? 18 : 0,
              gap: 14,
              opacity: pillOpacity,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: PILL_H / 2,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1.5px solid rgba(255,255,255,0.22)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(255,255,255,0.05)",
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: iconSpring,
                transform: `scale(${iconSpring})`,
                flexShrink: 0,
              }}
            >
              <AppIcon />
            </div>
            <span
              style={{
                position: "relative",
                zIndex: 1,
                fontFamily: FONT,
                fontSize: 36,
                fontWeight: 500,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                opacity: textOpacity,
              }}
            >
              {displayedText}
            </span>
          </div>
        </div>
      </div>

      {/* ── Phase 4: Blue aurora background ── */}
      {p4Overlay > 0.001 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: p4Overlay,
            zIndex: 10,
          }}
        >
          <BlueAurora />
        </div>
      )}

      {/* ── Phase 4: "idea" text — flies from Phase 3 position to center ── */}
      {p4TextOpacity * p5IdeaFade > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: p4X,
            top: p4Y,
            transform: `translate(-50%, -50%) scale(${p4Scale})`,
            opacity: p4TextOpacity * p5IdeaFade,
            zIndex: 11,
          }}
        >
          {/* Glow layer (blurred duplicate — fades in as text reaches center) */}
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: FONT,
              fontSize: 200,
              fontWeight: 600,
              color: `rgba(120, 100, 240, ${p4GlowPulse * p4GlowStrength})`,
              filter: "blur(35px)",
              whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
            }}
          >
            idea
          </span>

          {/* White text layer (visible at start, fades as gradient appears) */}
          <span
            style={{
              position: "relative",
              fontFamily: FONT,
              fontSize: 200,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              opacity: 1 - p4GradientOpacity,
            }}
          >
            idea
          </span>

          {/* Gradient text layer (emerges as text reaches center) */}
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontFamily: FONT,
              fontSize: 200,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #c080ee 0%, #a090ff 35%, #70a0ff 70%, #60b0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              opacity: p4GradientOpacity,
            }}
          >
            idea
          </span>
        </div>
      )}

      {/* ── Phase 5: Prompt box + Generating ── */}
      {t >= P5_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* 5A–5D: Glassmorphic prompt box */}
          {p5BoxVisible && (
            <div
              style={{
                position: "absolute",
                width: P5_BOX_W,
                transform: `scale(${p5BoxSpring})`,
                display: "flex",
                flexDirection: "column",
                borderRadius: P5_BOX_R,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                padding: "20px 24px",
                zIndex: 16,
              }}
            >
              {/* Text area */}
              <div
                style={{
                  minHeight: 80,
                  fontFamily: FONT,
                  fontSize: 28,
                  color: "white",
                  lineHeight: 1.4,
                  opacity: p5TextFade,
                  transform: `translateY(${p5TextLift}px)`,
                }}
              >
                {t >= P5_TYPE_START && t < P5_GEN_START && (
                  <>
                    {p5Displayed}
                    {p5CursorOn && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: 28,
                          background: "white",
                          marginLeft: 2,
                          verticalAlign: "text-bottom",
                        }}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Bottom controls row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 12,
                  opacity: p5ControlsOpacity,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* + button */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    +
                  </div>
                  {/* Public pill */}
                  <div
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontFamily: FONT,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    Public
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Audio icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M9 2v14M5 6v6M13 5v8M3 8v2M15 7v4M1 9v0M17 8.5v1"
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  {/* Send button */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      background: p5SendPressed
                        ? "rgba(120,160,255,0.5)"
                        : p5TypingDone
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: p5SendPressed ? "scale(0.9)" : "scale(1)",
                      transition: "transform 0.1s",
                    }}
                  >
                    <SendIcon />
                  </div>
                </div>
              </div>

              {/* 5E: Generating response overlay */}
              {t >= P5_GEN_START && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: P5_BOX_R,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    opacity: p5GenFade,
                  }}
                >
                  {/* Brand icon */}
                  <div style={{ transform: "scale(1.5)" }}>
                    <BrandIcon />
                  </div>
                  {/* Generating text */}
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 18,
                      color: "rgba(255,255,255,0.7)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Generating response...
                  </span>
                  {/* Progress bar */}
                  <div
                    style={{
                      width: 320,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${p5ProgressPct}%`,
                          height: "100%",
                          borderRadius: 3,
                          background:
                            "linear-gradient(90deg, #6080ff, #80b0ff)",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: 14,
                        color: "rgba(255,255,255,0.5)",
                        minWidth: 36,
                      }}
                    >
                      {Math.round(p5ProgressPct)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5C: Hand cursor */}
          {p5HandVisible && (
            <div
              style={{
                position: "absolute",
                left: `calc(50% + ${P5_BOX_W / 2 - 60 + p5HandProgress * 10}px)`,
                top: `calc(50% + ${60 - p5HandProgress * 20}px)`,
                transform: "rotate(-10deg)",
                zIndex: 17,
                pointerEvents: "none",
              }}
            >
              <HandCursor opacity={interpolate(
                t,
                [P5_CLICK_START - 0.1, P5_CLICK_START, P5_CLEAR_START + 0.1, P5_CLEAR_START + 0.3],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )} />
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
