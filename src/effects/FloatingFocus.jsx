/**
 * ============================================================
 * EFFECT: 3D Parallax Depth of Field
 * FILE: FloatingFocus.tsx
 * COMPOSITION ID: FloatingFocus
 * DURATION: 300 frames (10s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a modern After Effects-style 3D parallax scene with multiple
 * text boxes scattered at different depths, rotations, and positions
 * on a light background (#f0f0f0).
 *
 * Layout:
 *   12 black rectangular text boxes with white bold uppercase text.
 *   Each box placed at a unique x/y position, z-depth (0-1), and
 *   rotation angle. Three depth layers:
 *   - Foreground (z 0-0.1): Large, sharp, full opacity.
 *   - Mid-ground (z 0.35-0.5): Medium, moderate blur.
 *   - Background (z 0.7-0.95): Small, heavy blur, faded.
 *
 * Camera motion:
 *   Viewport slowly pans using layered sine waves on independent cycles.
 *   Horizontal: 8s cycle, 150px amplitude.
 *   Vertical: 5.5s cycle, 40px amplitude.
 *   Items at different z-depths move at different speeds via parallax
 *   multiplier (1 - z * 0.7), creating the 3D depth feeling.
 *
 * Depth of field:
 *   Blur scales from 0px (z=0 foreground) to 16px (z=1 background).
 *   Scale shrinks from 100% (z=0) to 55% (z=1).
 *   Opacity fades from 100% (z=0) to 50% (z=1).
 *
 * Alternating focus pulse:
 *   Each box independently cycles between sharp and blurred on a 2.5s
 *   sine cycle. Boxes staggered by 0.4s to create a cascading wave.
 *   Pulse adds up to 10px additional blur when out of focus.
 *   Opacity dims to 60% when out of focus.
 *   Total blur = depth blur + pulse blur.
 *
 * Rendering:
 *   Items sorted back-to-front for correct z-layering.
 *   Box style: black fill, white text, inline-flex, no border radius.
 *   Font: SF Pro Display, weight 800, uppercase, 0.05em tracking.
 *
 * Overall feel:
 *   Premium, editorial, calm, alive.
 *   Camera drifts endlessly. Focus pulses cycle continuously.
 *
 * ============================================================
 */

import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
} from "remotion";

const ITEMS = [
  { text: "POWER OF FOCUS", x: 640, y: 360, z: 0, rotation: -4, fontSize: 64 },
  { text: "CREATIVE STYLE", x: 200, y: 300, z: 0.1, rotation: -78, fontSize: 52 },
  { text: "MOTION", x: 1050, y: 200, z: 0.4, rotation: 25, fontSize: 40 },
  { text: "DESIGN SYSTEM", x: 350, y: 580, z: 0.35, rotation: 12, fontSize: 36 },
  { text: "EDITORIAL", x: 900, y: 520, z: 0.5, rotation: -30, fontSize: 38 },
  { text: "PREMIUM", x: 150, y: 120, z: 0.45, rotation: 45, fontSize: 34 },
  { text: "TYPOGRAPHY", x: 750, y: 150, z: 0.75, rotation: -50, fontSize: 30 },
  { text: "BRANDING", x: 500, y: 500, z: 0.8, rotation: 60, fontSize: 28 },
  { text: "VISUAL CRAFT", x: 1100, y: 400, z: 0.7, rotation: -15, fontSize: 32 },
  { text: "KINETIC", x: 100, y: 500, z: 0.85, rotation: 35, fontSize: 26 },
  { text: "BOLD MOVES", x: 1000, y: 620, z: 0.9, rotation: -65, fontSize: 24 },
  { text: "LAYERS", x: 400, y: 100, z: 0.95, rotation: 70, fontSize: 22 },
];

const CAM_SPEED_X = 60;
const CAM_SPEED_Y = 20;
const CAM_CYCLE_X_SEC = 8;
const CAM_CYCLE_Y_SEC = 5.5;
const MAX_BLUR = 16;
const FOCUS_Z = 0;
const FOCUS_PULSE_BLUR = 10;
const FOCUS_CYCLE_SEC = 2.5;
const FOCUS_STAGGER_SEC = 0.4;

export const FloatingFocus = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const camX = Math.sin((t / CAM_CYCLE_X_SEC) * Math.PI * 2) * CAM_SPEED_X * 2.5;
  const camY = Math.sin((t / CAM_CYCLE_Y_SEC) * Math.PI * 2) * CAM_SPEED_Y * 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f0f0f0", overflow: "hidden" }}>
      {[...ITEMS]
        .sort((a, b) => b.z - a.z)
        .map((item, sortedIndex) => {
          const originalIndex = ITEMS.indexOf(item);
          const parallax = 1 - item.z * 0.7;
          const screenX = item.x - camX * parallax;
          const screenY = item.y - camY * parallax;

          const depthDistance = Math.abs(item.z - FOCUS_Z);
          const depthBlur = interpolate(depthDistance, [0, 1], [0, MAX_BLUR], {
            extrapolateRight: "clamp",
          });

          const staggerOffset = originalIndex * FOCUS_STAGGER_SEC;
          const focusCycle =
            (Math.cos(((t + staggerOffset) / FOCUS_CYCLE_SEC) * Math.PI * 2) + 1) / 2;
          const pulseBlur = interpolate(focusCycle, [0, 1], [FOCUS_PULSE_BLUR, 0], {
            extrapolateRight: "clamp",
          });
          const totalBlur = depthBlur + pulseBlur;

          const depthScale = interpolate(item.z, [0, 1], [1, 0.55], {
            extrapolateRight: "clamp",
          });
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
                    fontFamily: "SF Pro Display, -apple-system, Helvetica, sans-serif",
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
