import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
} from "remotion";

// Text boxes scattered in 3D space
// x, y = position in world. z = depth layer (0 = closest, higher = further).
// rotation = degrees. fontSize scales per item.
const ITEMS: {
  text: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  fontSize: number;
}[] = [
  // Foreground — sharp, large
  { text: "POWER OF FOCUS", x: 640, y: 360, z: 0, rotation: -4, fontSize: 64 },
  { text: "CREATIVE STYLE", x: 200, y: 300, z: 0.1, rotation: -78, fontSize: 52 },

  // Mid-ground
  { text: "MOTION", x: 1050, y: 200, z: 0.4, rotation: 25, fontSize: 40 },
  { text: "DESIGN SYSTEM", x: 350, y: 580, z: 0.35, rotation: 12, fontSize: 36 },
  { text: "EDITORIAL", x: 900, y: 520, z: 0.5, rotation: -30, fontSize: 38 },
  { text: "PREMIUM", x: 150, y: 120, z: 0.45, rotation: 45, fontSize: 34 },

  // Background — blurred, smaller
  { text: "TYPOGRAPHY", x: 750, y: 150, z: 0.75, rotation: -50, fontSize: 30 },
  { text: "BRANDING", x: 500, y: 500, z: 0.8, rotation: 60, fontSize: 28 },
  { text: "VISUAL CRAFT", x: 1100, y: 400, z: 0.7, rotation: -15, fontSize: 32 },
  { text: "KINETIC", x: 100, y: 500, z: 0.85, rotation: 35, fontSize: 26 },
  { text: "BOLD MOVES", x: 1000, y: 620, z: 0.9, rotation: -65, fontSize: 24 },
  { text: "LAYERS", x: 400, y: 100, z: 0.95, rotation: 70, fontSize: 22 },
];

// Camera pan speed (pixels per second in world space)
const CAM_SPEED_X = 60;
const CAM_SPEED_Y = 20;
const CAM_CYCLE_X_SEC = 8;
const CAM_CYCLE_Y_SEC = 5.5;

// Depth of field
const MAX_BLUR = 16; // blur at z=1 (furthest)
const FOCUS_Z = 0; // z-depth that is in perfect focus

// Alternating focus pulse per box
const FOCUS_PULSE_BLUR = 10; // max additional blur when out of focus
const FOCUS_CYCLE_SEC = 2.5; // duration of one in/out focus cycle
const FOCUS_STAGGER_SEC = 0.4; // offset between each box so they alternate

export const FloatingFocus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const t = frame / fps;

  // Camera position — slow panning drift
  const camX =
    Math.sin((t / CAM_CYCLE_X_SEC) * Math.PI * 2) * CAM_SPEED_X * 2.5;
  const camY =
    Math.sin((t / CAM_CYCLE_Y_SEC) * Math.PI * 2) * CAM_SPEED_Y * 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f0f0f0",
        overflow: "hidden",
      }}
    >
      {/* Render back-to-front for correct layering */}
      {[...ITEMS]
        .sort((a, b) => b.z - a.z)
        .map((item, sortedIndex) => {
          // Use original index for stagger timing
          const originalIndex = ITEMS.indexOf(item);

          // Parallax: deeper items move less with camera
          const parallax = 1 - item.z * 0.7;
          const screenX = item.x - camX * parallax;
          const screenY = item.y - camY * parallax;

          // Depth of field blur (base)
          const depthDistance = Math.abs(item.z - FOCUS_Z);
          const depthBlur = interpolate(depthDistance, [0, 1], [0, MAX_BLUR], {
            extrapolateRight: "clamp",
          });

          // Alternating focus pulse — each box offset in time
          const staggerOffset = originalIndex * FOCUS_STAGGER_SEC;
          const focusCycle =
            (Math.cos(((t + staggerOffset) / FOCUS_CYCLE_SEC) * Math.PI * 2) + 1) / 2;
          // focusCycle: 1 = sharp, 0 = blurred
          const pulseBlur = interpolate(focusCycle, [0, 1], [FOCUS_PULSE_BLUR, 0], {
            extrapolateRight: "clamp",
          });

          const totalBlur = depthBlur + pulseBlur;

          // Scale by depth — further items appear smaller
          const depthScale = interpolate(item.z, [0, 1], [1, 0.55], {
            extrapolateRight: "clamp",
          });

          // Opacity: depth fade + pulse dim when out of focus
          const depthOpacity = interpolate(item.z, [0, 1], [1, 0.5], {
            extrapolateRight: "clamp",
          });
          const pulseOpacity = interpolate(focusCycle, [0, 1], [0.6, 1], {
            extrapolateRight: "clamp",
          });
          const opacity = depthOpacity * pulseOpacity;

          return (
            <div
              key={sortedIndex}
              style={{
                position: "absolute",
                left: screenX,
                top: screenY,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${depthScale})`,
                filter: totalBlur > 0.5 ? `blur(${totalBlur}px)` : "none",
                opacity,
                willChange: "transform, filter",
              }}
            >
              <div
                style={{
                  backgroundColor: "#000000",
                  paddingLeft: 28,
                  paddingRight: 28,
                  paddingTop: 12,
                  paddingBottom: 12,
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "SF Pro Display, -apple-system, Helvetica, sans-serif",
                    fontSize: item.fontSize,
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.text}
                </span>
              </div>
            </div>
          );
        })}
    </AbsoluteFill>
  );
};
