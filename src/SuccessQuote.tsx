import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  spring,
} from "remotion";

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
  x: number;
  y: number;
  fontSize: number;
  color: string;
  animation: AnimationType;
  enterFrame: number;
  rotation?: number;
  fontWeight?: number;
  showArrow?: boolean;
}

interface CameraKeyframe {
  frame: number;
  x: number;
  y: number;
  scale: number;
}

// Compact layout — world spans ~540x140 to ~560x1940
// Font sizes sized so word width never exceeds visible area at its camera scale
const WORDS: WordConfig[] = [
  // Phase 1: Hook
  {
    text: "SUCCESS",
    x: 540,
    y: 140,
    fontSize: 90,
    color: "#FFFF00",
    animation: "zoomBlast",
    enterFrame: 0,
    fontWeight: 900,
  },
  {
    text: "doesn't look like",
    x: 540,
    y: 270,
    fontSize: 38,
    color: "#FFFF00",
    animation: "popFromBottom",
    enterFrame: 18,
    fontWeight: 600,
  },
  // Phase 2: Counter
  {
    text: "BALANCE.",
    x: 540,
    y: 400,
    fontSize: 105,
    color: "#FFFF00",
    animation: "slideFromRight",
    enterFrame: 38,
    fontWeight: 900,
  },
  // Phase 3: Setup
  {
    text: "the road to success",
    x: 540,
    y: 540,
    fontSize: 38,
    color: "#FFFF00",
    animation: "slideFromLeft",
    enterFrame: 62,
    fontWeight: 600,
  },
  {
    text: "involves",
    x: 540,
    y: 615,
    fontSize: 48,
    color: "#FFFF00",
    animation: "popFromBottom",
    enterFrame: 72,
    fontWeight: 700,
  },
  // Phase 4: Impact trio — rapid fire
  {
    text: "SLEEPLESS NIGHTS,",
    x: 540,
    y: 760,
    fontSize: 62,
    color: "#FFFF00",
    animation: "zoomBlast",
    enterFrame: 90,
    fontWeight: 900,
  },
  {
    text: "MISSED MEALS,",
    x: 490,
    y: 890,
    fontSize: 72,
    color: "#FFFF00",
    animation: "slideFromLeft",
    enterFrame: 112,
    fontWeight: 900,
  },
  {
    text: "MISSED CALLS.",
    x: 590,
    y: 1020,
    fontSize: 72,
    color: "#FFFF00",
    animation: "slideFromRight",
    enterFrame: 134,
    fontWeight: 900,
  },
  // Phase 5: Climax build
  {
    text: "either your",
    x: 390,
    y: 1150,
    fontSize: 36,
    color: "#FFFF00",
    animation: "popFromBottom",
    enterFrame: 160,
    fontWeight: 600,
  },
  {
    text: "DESIRE",
    x: 540,
    y: 1280,
    fontSize: 115,
    color: "#FFFF00",
    animation: "zoomBlast",
    enterFrame: 172,
    fontWeight: 900,
  },
  {
    text: "for success",
    x: 720,
    y: 1390,
    fontSize: 36,
    color: "#FFFF00",
    animation: "popFromBottom",
    enterFrame: 188,
    fontWeight: 600,
  },
  {
    text: "or your",
    x: 390,
    y: 1480,
    fontSize: 36,
    color: "#FFFF00",
    animation: "popFromBottom",
    enterFrame: 198,
    fontWeight: 600,
  },
  {
    text: "APPETITE",
    x: 540,
    y: 1600,
    fontSize: 100,
    color: "#FFFF00",
    animation: "slideFromLeft",
    enterFrame: 210,
    fontWeight: 900,
  },
  {
    text: "for sacrifice",
    x: 730,
    y: 1710,
    fontSize: 38,
    color: "#FFFF00",
    animation: "arrowReveal",
    enterFrame: 225,
    rotation: -5,
    fontWeight: 700,
    showArrow: true,
  },
  // Phase 6: Final punch
  {
    text: "must",
    x: 400,
    y: 1810,
    fontSize: 62,
    color: "#FFFF00",
    animation: "dropIn",
    enterFrame: 242,
    fontWeight: 900,
  },
  {
    text: "DECREASE",
    x: 560,
    y: 1940,
    fontSize: 120,
    color: "#FFFF00",
    animation: "spinIn",
    enterFrame: 255,
    fontWeight: 900,
  },
];

// Camera scales kept low enough that each word (even at peak animation scale)
// fits within the 1080px viewport. Zoom-out to 0.52 shows the full composition.
const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { frame: 0, x: 540, y: 140, scale: 1.8 },
  { frame: 18, x: 540, y: 270, scale: 2.0 },
  { frame: 38, x: 540, y: 400, scale: 1.5 },
  { frame: 62, x: 540, y: 560, scale: 2.0 },
  { frame: 90, x: 540, y: 750, scale: 1.2 },
  { frame: 112, x: 510, y: 880, scale: 1.3 },
  { frame: 134, x: 570, y: 1010, scale: 1.3 },
  { frame: 160, x: 460, y: 1150, scale: 2.2 },
  { frame: 172, x: 540, y: 1270, scale: 1.4 },
  { frame: 198, x: 460, y: 1480, scale: 2.0 },
  { frame: 210, x: 540, y: 1590, scale: 1.3 },
  { frame: 225, x: 640, y: 1710, scale: 2.0 },
  { frame: 242, x: 440, y: 1810, scale: 1.5 },
  { frame: 255, x: 550, y: 1930, scale: 1.2 },
  { frame: 290, x: 550, y: 1930, scale: 1.2 },
  { frame: 340, x: 540, y: 1020, scale: 0.52 },
  { frame: 380, x: 540, y: 1020, scale: 0.52 },
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getCamera(frame: number) {
  if (frame <= CAMERA_KEYFRAMES[0].frame) {
    const f = CAMERA_KEYFRAMES[0];
    return { x: f.x, y: f.y, scale: f.scale };
  }
  if (frame >= CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].frame) {
    const f = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
    return { x: f.x, y: f.y, scale: f.scale };
  }

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

// All animation offsets reduced so text never leaves the viewport:
// - zoomBlast: 1.5x start (was 2.5x)
// - slides: 100px (was 180px)
// - popFromBottom: 50px (was 80px)
// - dropIn: -60px (was -100px)
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
        translateY: interpolate(springVal, [0, 1], [50, 0]),
        scale: interpolate(springVal, [0, 1], [0.8, 1]),
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
        translateX: interpolate(slideUp, [0, 1], [20, 0]),
        translateY: interpolate(slideUp, [0, 1], [50, 0]),
        scale: interpolate(slideUp, [0, 1], [0.6, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(slideUp, [0, 1], [6, 0]),
      };
    }

    case "zoomBlast": {
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
        translateY: interpolate(zoomSpring, [0, 1], [25, 0]),
        scale: interpolate(zoomSpring, [0, 1], [1.5, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(zoomSpring, [0, 1], [12, 0]),
      };
    }

    case "slideFromRight": {
      return {
        opacity: fastSpring,
        translateX: interpolate(fastSpring, [0, 1], [100, 0]),
        translateY: 0,
        scale: interpolate(fastSpring, [0, 1], [0.85, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(fastSpring, [0, 1], [10, 0]),
      };
    }

    case "slideFromLeft": {
      return {
        opacity: fastSpring,
        translateX: interpolate(fastSpring, [0, 1], [-100, 0]),
        translateY: 0,
        scale: interpolate(fastSpring, [0, 1], [0.85, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(fastSpring, [0, 1], [10, 0]),
      };
    }

    case "dropIn": {
      return {
        opacity: springVal,
        translateX: 0,
        translateY: interpolate(springVal, [0, 1], [-60, 0]),
        scale: interpolate(springVal, [0, 1], [1.15, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(springVal, [0, 1], [8, 0]),
      };
    }

    case "spinIn": {
      return {
        opacity: springVal,
        translateX: 0,
        translateY: interpolate(springVal, [0, 1], [50, 0]),
        scale: interpolate(springVal, [0, 1], [0.3, 1]),
        rotation: interpolate(springVal, [0, 1], [180, word.rotation ?? 0]),
        blur: interpolate(springVal, [0, 1], [12, 0]),
      };
    }

    case "scaleFromCenter": {
      return {
        opacity: springVal,
        translateX: 0,
        translateY: 0,
        scale: interpolate(springVal, [0, 1], [0, 1]),
        rotation: word.rotation ?? 0,
        blur: interpolate(springVal, [0, 1], [15, 0]),
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

export const SuccessQuote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const camera = getCamera(frame);

  const baseShake = 1.2;
  const shakeScale = baseShake / camera.scale;
  const shakeX =
    Math.sin(frame * 0.7) * shakeScale * 0.5 +
    Math.sin(frame * 1.3) * shakeScale * 0.3;
  const shakeY =
    Math.cos(frame * 0.9) * shakeScale * 0.4 +
    Math.cos(frame * 1.7) * shakeScale * 0.2;

  const worldTranslateX = width / 2 - camera.x * camera.scale + shakeX;
  const worldTranslateY = height / 2 - camera.y * camera.scale + shakeY;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0A",
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
