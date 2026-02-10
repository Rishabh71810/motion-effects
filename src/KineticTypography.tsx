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
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getCamera(frame: number) {
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
const ArrowChevron: React.FC<{ color: string; opacity: number }> = ({
  color,
  opacity,
}) => (
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
function useWordAnimation(
  word: WordConfig,
  frame: number,
  fps: number,
): {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
  blur: number;
} {
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

export const KineticTypography: React.FC = () => {
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
