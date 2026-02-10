/**
 * ============================================================
 * EFFECT: Kinetic Typography — 2D Camera Pan with Word Animations
 * FILE: KineticTypography.tsx
 * COMPOSITION ID: KineticTypography
 * DURATION: 270 frames (9s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a kinetic typography animation where bold words are
 * scattered across a large 2D canvas and a virtual camera pans
 * and zooms through them. Each word has a unique entrance
 * animation (pop, slide, zoom blast, spin). The camera starts
 * zoomed in tight, tracks each word as it appears, then pulls
 * all the way out to reveal the full composition.
 *
 * ─── WORD LAYOUT ───
 *
 *   Words are positioned in absolute "world space" coordinates
 *   on a large virtual canvas (~1400x1200px). The camera
 *   transforms the world to create panning and zooming.
 *
 *   Word list (text, x, y, fontSize, color, animation, enterFrame):
 *     1. "animating"  x:400  y:200  90px  #111111  popFromBottom   frame 0
 *     2. "text"       x:730  y:200  90px  #111111  popFromBottom   frame 8
 *     3. "like"       x:890  y:140  60px  #22c55e  arrowReveal     frame 30
 *        - rotation: -8deg, includes upward chevron arrow
 *     4. "this"       x:950  y:350  220px #111111  zoomBlast       frame 55
 *     5. "can"        x:1220 y:520  200px #111111  slideFromRight  frame 85
 *     6. "be"         x:1010 y:700  260px #111111  popFromBottom   frame 110
 *     7. "really"     x:510  y:900  280px #111111  slideFromLeft   frame 135
 *     8. "fun"        x:230  y:1120 350px #22c55e  spinIn          frame 160
 *
 *   Font: SF Pro Display, -apple-system, Helvetica Neue, sans-serif
 *   Font weight: 800-900 (extra bold)
 *   Letter spacing: -0.02em
 *   Line height: 1
 *   Accent color: #22c55e (green) for "like" and "fun"
 *
 * ─── ANIMATION TYPES ───
 *
 *   All animations use Remotion spring() with per-type configs:
 *
 *   popFromBottom:
 *     - Spring config: damping 14, stiffness 120, mass 0.8
 *     - translateY: 80px → 0
 *     - scale: 0.7 → 1.0
 *     - blur: 8px → 0
 *     - opacity: 0 → 1 (spring-driven)
 *
 *   arrowReveal:
 *     - Spring config: damping 16, stiffness 100, mass 1.0
 *     - translateX: 30px → 0, translateY: 80px → 0
 *     - scale: 0.5 → 1.0
 *     - blur: 6px → 0
 *     - Includes SVG chevron arrow below the text:
 *       40x40px, polyline points="8,28 20,12 32,28"
 *       stroke matching word color, strokeWidth 5,
 *       strokeLinecap/strokeLinejoin round
 *
 *   zoomBlast:
 *     - Spring config: damping 10, stiffness 80, mass 1.2
 *     - Starts very large and blurred, slams into position
 *     - scale: 2.5 → 1.0
 *     - translateY: 40px → 0
 *     - blur: 20px → 0
 *     - opacity: linear ramp 0 → 1 over 4 frames
 *
 *   slideFromRight:
 *     - Spring config: damping 12, stiffness 200, mass 0.6
 *     - translateX: 180px → 0
 *     - scale: 0.8 → 1.0
 *     - blur: 12px → 0
 *
 *   slideFromLeft:
 *     - Spring config: damping 12, stiffness 200, mass 0.6
 *     - translateX: -180px → 0
 *     - scale: 0.8 → 1.0
 *     - blur: 12px → 0
 *
 *   dropIn:
 *     - Spring config: damping 14, stiffness 120, mass 0.8
 *     - translateY: -100px → 0 (drops from above)
 *     - scale: 1.3 → 1.0
 *     - blur: 10px → 0
 *
 *   spinIn:
 *     - Spring config: damping 14, stiffness 120, mass 0.8
 *     - translateY: 80px → 0
 *     - scale: 0.3 → 1.0
 *     - rotation: 180deg → 0deg
 *     - blur: 15px → 0
 *
 *   scaleFromCenter:
 *     - Spring config: damping 14, stiffness 120, mass 0.8
 *     - scale: 0 → 1.0
 *     - blur: 20px → 0
 *
 * ─── CAMERA SYSTEM ───
 *
 *   Virtual 2D camera with x, y, and scale properties.
 *   Interpolated between keyframes using cubic ease-in-out.
 *
 *   Camera keyframes (frame → x, y, scale):
 *     frame 0:   x:540  y:200  scale:3.2   — tight on "animating text"
 *     frame 30:  x:850  y:175  scale:3.0   — pan to "like"
 *     frame 55:  x:950  y:340  scale:2.0   — dramatic zoom to "this"
 *     frame 85:  x:1140 y:490  scale:1.7   — pan to "can"
 *     frame 110: x:1010 y:670  scale:1.4   — pan to "be"
 *     frame 135: x:640  y:860  scale:1.0   — pan to "really"
 *     frame 160: x:420  y:1040 scale:0.8   — pan to "fun"
 *     frame 190: x:420  y:1040 scale:0.8   — hold briefly
 *     frame 230: x:650  y:630  scale:0.55  — ZOOM OUT full composition
 *     frame 270: x:650  y:630  scale:0.55  — hold at final view
 *
 *   Camera transform formula:
 *     worldTranslateX = (viewportWidth / 2) - (camera.x * camera.scale) + shakeX
 *     worldTranslateY = (viewportHeight / 2) - (camera.y * camera.scale) + shakeY
 *     Applied as: translate(Xpx, Ypx) scale(S)
 *     transformOrigin: 0 0
 *
 * ─── CAMERA SHAKE ───
 *
 *   Subtle handheld camera vibration added on top of pan:
 *     baseShake = 1.5
 *     shakeScale = baseShake / camera.scale
 *       (reduced at higher zoom to prevent large jitter)
 *     shakeX = sin(frame * 0.7) * shakeScale * 0.5
 *            + sin(frame * 1.3) * shakeScale * 0.3
 *     shakeY = cos(frame * 0.9) * shakeScale * 0.4
 *            + cos(frame * 1.7) * shakeScale * 0.2
 *
 * ─── RENDERING ───
 *
 *   Structure:
 *     AbsoluteFill (background #e8e8e8, overflow hidden)
 *       └─ div (world container, absolute, transformOrigin 0 0)
 *            └─ for each word:
 *                 div (absolute, left: word.x, top: word.y)
 *                   transform: translate(-50%,-50%)
 *                              translate(animX, animY)
 *                              scale(animScale)
 *                              rotate(animRotation)
 *                   opacity: animOpacity
 *                   filter: blur(animBlur) if > 0.5px
 *                   willChange: transform, filter, opacity
 *                   └─ span (text) or flex container with arrow
 *
 *   Words with showArrow: true render as a flex column
 *   with the text span above and an ArrowChevron SVG below.
 *
 * ─── ANIMATION TIMELINE ───
 *
 *   frame 0-8:     "animating" pops up, camera zoomed in 3.2x
 *   frame 8-30:    "text" pops up beside it
 *   frame 30-55:   Camera pans right, "like" with arrow appears
 *   frame 55-85:   "this" zoom-blasts in at 220px, camera zooms to 2x
 *   frame 85-110:  "can" slides from the right
 *   frame 110-135: "be" pops from bottom at 260px
 *   frame 135-160: "really" slides from the left at 280px
 *   frame 160-190: "fun" spins in at 350px, green accent
 *   frame 190-230: Camera zooms out to reveal entire composition
 *   frame 230-270: Hold at full view (scale 0.55)
 *
 * ─── TECHNICAL REQUIREMENTS ───
 *
 *   - Pure Remotion: useCurrentFrame(), useVideoConfig(),
 *     interpolate(), spring()
 *   - Spring config MUST be nested: config: { damping, stiffness, mass }
 *   - NO CSS animations, NO requestAnimationFrame
 *   - All motion driven by frame → spring/interpolate
 *   - CSS filter: blur() for entrance transitions
 *   - Inline styles only
 *   - Each word is individually animated based on its enterFrame
 *   - Words not yet entered (localFrame < 0) return null
 *   - Words with opacity <= 0 return null (skip rendering)
 *
 * ─── CUSTOMIZATION ───
 *
 *   - WORDS array: change text, positions, sizes, colors, animations
 *   - CAMERA_KEYFRAMES: adjust panning path and zoom levels
 *   - Animation spring configs: tune damping/stiffness/mass per type
 *   - Background color: change #e8e8e8 to any color
 *   - Accent color: #22c55e used for "like" and "fun"
 *   - Font size range: 60px (smallest) to 350px (largest)
 *   - Camera shake intensity: adjust baseShake (1.5)
 *   - Add new animation types in useWordAnimation switch
 *
 * ─── OVERALL FEEL ───
 *
 *   Dynamic, editorial kinetic typography with weight and energy.
 *   Words cascade diagonally across the canvas, growing in size.
 *   Camera follows each word like a cinematographer tracking action.
 *   Spring physics give natural overshoot and bounce.
 *   Blur on entrance creates depth-of-field feel.
 *   Camera shake adds organic handheld texture.
 *   Final zoom-out reveals the full typographic composition.
 *   Green accent words ("like", "fun") provide color punctuation.
 *   Light gray background keeps focus on the bold black typography.
 *
 * ============================================================
 */

import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  spring,
} from "remotion";

// Each word has its own entrance animation, timing, position, color, and size
type AnimationType =
  | "popFromBottom"
  | "arrowReveal"
  | "zoomBlast"
  | "slideFromRight"
  | "dropIn"
  | "spinIn"
  | "scaleFromCenter"
  | "slideFromLeft";

interface WordConfig {
  text: string;
  // World-space position (before camera transform)
  x: number;
  y: number;
  fontSize: number;
  color: string;
  animation: AnimationType;
  // Frame at which this word starts appearing
  enterFrame: number;
  // Optional rotation in degrees
  rotation?: number;
  fontWeight?: number;
  // For arrowReveal — show an arrow/chevron
  showArrow?: boolean;
}

// Camera keyframes — the camera zooms and pans through the text over time
interface CameraKeyframe {
  frame: number;
  x: number;
  y: number;
  scale: number;
}

// Tight diagonal cascade — words almost touch but don't overlap.
// Font bounding boxes calculated as: width ≈ chars × fontSize × 0.55

const WORDS: WordConfig[] = [
  {
    text: "animating",
    x: 400,
    y: 200,
    fontSize: 90,
    color: "#111111",
    animation: "popFromBottom",
    enterFrame: 0,
    fontWeight: 900,
  },
  {
    text: "text",
    x: 730,
    y: 200,
    fontSize: 90,
    color: "#111111",
    animation: "popFromBottom",
    enterFrame: 8,
    fontWeight: 900,
  },
  {
    text: "like",
    x: 890,
    y: 140,
    fontSize: 60,
    color: "#22c55e",
    animation: "arrowReveal",
    enterFrame: 30,
    rotation: -8,
    fontWeight: 800,
    showArrow: true,
  },
  {
    text: "this",
    x: 950,
    y: 350,
    fontSize: 220,
    color: "#111111",
    animation: "zoomBlast",
    enterFrame: 55,
    fontWeight: 900,
  },
  {
    text: "can",
    x: 1220,
    y: 520,
    fontSize: 200,
    color: "#111111",
    animation: "slideFromRight",
    enterFrame: 85,
    fontWeight: 900,
  },
  {
    text: "be",
    x: 1010,
    y: 700,
    fontSize: 260,
    color: "#111111",
    animation: "popFromBottom",
    enterFrame: 110,
    fontWeight: 900,
  },
  {
    text: "really",
    x: 510,
    y: 900,
    fontSize: 280,
    color: "#111111",
    animation: "slideFromLeft",
    enterFrame: 135,
    fontWeight: 900,
  },
  {
    text: "fun",
    x: 230,
    y: 1120,
    fontSize: 350,
    color: "#22c55e",
    animation: "spinIn",
    enterFrame: 160,
    fontWeight: 900,
  },
];

// Camera starts very zoomed in (3.2×) and progressively zooms out,
// then pulls all the way out to show the full composition.
const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { frame: 0, x: 540, y: 200, scale: 3.2 },     // tight on "animating text"
  { frame: 30, x: 850, y: 175, scale: 3.0 },     // pan to "like"
  { frame: 55, x: 950, y: 340, scale: 2.0 },     // dramatic zoom to "this"
  { frame: 85, x: 1140, y: 490, scale: 1.7 },    // pan to "can"
  { frame: 110, x: 1010, y: 670, scale: 1.4 },   // pan to "be"
  { frame: 135, x: 640, y: 860, scale: 1.0 },    // pan to "really"
  { frame: 160, x: 420, y: 1040, scale: 0.8 },   // pan to "fun"
  { frame: 190, x: 420, y: 1040, scale: 0.8 },   // hold briefly
  { frame: 230, x: 650, y: 630, scale: 0.55 },   // ZOOM OUT — full composition
  { frame: 270, x: 650, y: 630, scale: 0.55 },   // hold
];

// Cubic ease-in-out for smooth acceleration/deceleration
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getCamera(frame) {
  // Clamp to first/last keyframe
  if (frame <= CAMERA_KEYFRAMES[0].frame) {
    const f = CAMERA_KEYFRAMES[0];
    return { x: f.x, y: f.y, scale: f.scale };
  }
  if (frame >= CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].frame) {
    const f = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
    return { x: f.x, y: f.y, scale: f.scale };
  }

  // Find which two keyframes we're between
  let i = 0;
  while (
    i < CAMERA_KEYFRAMES.length - 2 &&
    CAMERA_KEYFRAMES[i + 1].frame <= frame
  ) {
    i++;
  }

  const from = CAMERA_KEYFRAMES[i];
  const to = CAMERA_KEYFRAMES[i + 1];
  const rawProgress = (frame - from.frame) / (to.frame - from.frame);
  const t = easeInOutCubic(rawProgress);

  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    scale: from.scale + (to.scale - from.scale) * t,
  };
}

// Arrow/chevron SVG for the "arrowReveal" animation
const ArrowChevron = ({ color, opacity }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    style={{ opacity, marginTop: 4 }}
  >
    <polyline
      points="8,28 20,12 32,28"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Animate each word based on its animation type
function useWordAnimation(word, frame, fps) {
  const localFrame = frame - word.enterFrame;

  if (localFrame < 0) {
    return {
      opacity: 0,
      translateX: 0,
      translateY: 0,
      scale: 0,
      rotation: 0,
      blur: 0,
    };
  }

  const springVal = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const fastSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
  });

  switch (word.animation) {
    case "popFromBottom": {
      return {
        opacity: springVal,
        translateX: 0,
        translateY: interpolate(springVal, [0, 1], [80, 0]),
        scale: interpolate(springVal, [0, 1], [0.7, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(springVal, [0, 1], [8, 0]),
      };
    }

    case "arrowReveal": {
      const slideUp = spring({
        frame: localFrame,
        fps,
        config: { damping: 16, stiffness: 100, mass: 1 },
      });
      return {
        opacity: slideUp,
        translateX: interpolate(slideUp, [0, 1], [30, 0]),
        translateY: interpolate(slideUp, [0, 1], [80, 0]),
        scale: interpolate(slideUp, [0, 1], [0.5, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(slideUp, [0, 1], [6, 0]),
      };
    }

    case "zoomBlast": {
      // Starts very large and blurred, slams into position
      const zoomSpring = spring({
        frame: localFrame,
        fps,
        config: { damping: 10, stiffness: 80, mass: 1.2 },
      });
      return {
        opacity: interpolate(localFrame, [0, 4], [0, 1], {
          extrapolateRight: "clamp",
        }),
        translateX: 0,
        translateY: interpolate(zoomSpring, [0, 1], [40, 0]),
        scale: interpolate(zoomSpring, [0, 1], [2.5, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(zoomSpring, [0, 1], [20, 0]),
      };
    }

    case "slideFromRight": {
      return {
        opacity: fastSpring,
        translateX: interpolate(fastSpring, [0, 1], [180, 0]),
        translateY: 0,
        scale: interpolate(fastSpring, [0, 1], [0.8, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(fastSpring, [0, 1], [12, 0]),
      };
    }

    case "slideFromLeft": {
      return {
        opacity: fastSpring,
        translateX: interpolate(fastSpring, [0, 1], [-180, 0]),
        translateY: 0,
        scale: interpolate(fastSpring, [0, 1], [0.8, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(fastSpring, [0, 1], [12, 0]),
      };
    }

    case "dropIn": {
      return {
        opacity: springVal,
        translateX: 0,
        translateY: interpolate(springVal, [0, 1], [-100, 0]),
        scale: interpolate(springVal, [0, 1], [1.3, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(springVal, [0, 1], [10, 0]),
      };
    }

    case "spinIn": {
      return {
        opacity: springVal,
        translateX: 0,
        translateY: interpolate(springVal, [0, 1], [80, 0]),
        scale: interpolate(springVal, [0, 1], [0.3, 1]),
        rotation: interpolate(springVal, [0, 1], [180, word.rotation ?? 0]),
        blur: interpolate(springVal, [0, 1], [15, 0]),
      };
    }

    case "scaleFromCenter": {
      return {
        opacity: springVal,
        translateX: 0,
        translateY: 0,
        scale: interpolate(springVal, [0, 1], [0, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(springVal, [0, 1], [20, 0]),
      };
    }

    default:
      return {
        opacity: 1,
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: word.rotation ?? 0,
        blur: 0,
      };
  }
}

export const KineticTypography = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const camera = getCamera(frame);

  // Camera shake — subtle vibration, reduced at higher zoom so it
  // doesn't throw text off-screen
  const baseShake = 1.5;
  const shakeScale = baseShake / camera.scale;
  const shakeX =
    Math.sin(frame * 0.7) * shakeScale * 0.5 +
    Math.sin(frame * 1.3) * shakeScale * 0.3;
  const shakeY =
    Math.cos(frame * 0.9) * shakeScale * 0.4 +
    Math.cos(frame * 1.7) * shakeScale * 0.2;

  // Transform: move the world so the camera "looks at" (camera.x, camera.y)
  // and zoom by camera.scale
  const worldTranslateX = width / 2 - camera.x * camera.scale + shakeX;
  const worldTranslateY = height / 2 - camera.y * camera.scale + shakeY;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#e8e8e8",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${worldTranslateX}px, ${worldTranslateY}px) scale(${camera.scale})`,
          willChange: "transform",
        }}
      >
        {WORDS.map((word, index) => {
          const anim = useWordAnimation(word, frame, fps);

          if (anim.opacity <= 0) return null;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: word.x,
                top: word.y,
                transform: [
                  `translate(-50%, -50%)`,
                  `translate(${anim.translateX}px, ${anim.translateY}px)`,
                  `scale(${anim.scale})`,
                  `rotate(${anim.rotation}deg)`,
                ].join(" "),
                opacity: anim.opacity,
                filter: anim.blur > 0.5 ? `blur(${anim.blur}px)` : "none",
                willChange: "transform, filter, opacity",
              }}
            >
              {/* Arrow for arrowReveal words */}
              {word.showArrow && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
                      fontSize: word.fontSize,
                      fontWeight: word.fontWeight ?? 800,
                      color: word.color,
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {word.text}
                  </span>
                  <ArrowChevron color={word.color} opacity={anim.opacity} />
                </div>
              )}

              {/* Regular word */}
              {!word.showArrow && (
                <span
                  style={{
                    fontFamily:
                      "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
                    fontSize: word.fontSize,
                    fontWeight: word.fontWeight ?? 800,
                    color: word.color,
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {word.text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
