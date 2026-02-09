/**
 * ============================================================
 * EFFECT: Meet Your New — 3D "Creating..." Button with 360° Spin
 * FILE: MeetYourNewCreating.tsx
 * COMPOSITION ID: Phase 5 of MeetYourNewCombined
 * DURATION: 210 frames (7s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create Phase 5 of the Google "Meet your new" animation. A flat
 * "Creating..." button transforms into a thick 3D object that
 * rotates a full 360° to the right while drifting downward.
 *
 * Background:
 *   linear-gradient(180deg, #f0f4ff 0%, #e8eeff 40%, #dde6fa 100%)
 *
 * Button dimensions:
 *   Width: 700px, Height: 210px, Border radius: 90px
 *   3D depth: 35px (edge thickness)
 *
 * 3D technique — stacked layers:
 *   60 opaque layers stacked behind the front face at different
 *   translateZ positions. Each layer:
 *   - translateZ: -(i/60) * 35px (back to front)
 *   - translateX: ratio * 3px (offset right to expose right edge)
 *   - translateY: ratio * 2px (offset down to expose bottom edge)
 *   - Color: solid RGB from rgb(65,95,210) at front to rgb(40,60,160)
 *     at back (formula: r=65-ratio*25, g=95-ratio*35, b=210-ratio*50)
 *   IMPORTANT: All colors are SOLID (no transparency) to prevent
 *   see-through artifacts.
 *
 * Front face:
 *   Background: linear-gradient(135deg, #b0c8ff, #7a9dff, #5b80ff,
 *   #4a6fff, #3f65f5)
 *   Contains "Creating..." text (Google Sans, 72px, white, weight 400)
 *   and a sparkle SVG icon (48px, white, 4-point star shape).
 *   Dots animate: 0-3 dots cycling at 2Hz (t*2 % 4).
 *   Sparkle pulses on a 1.5s cycle (0.7→1.3→0.8→0.7 scale) and
 *   rotates continuously at 45°/second.
 *
 * 3D transforms on the button container:
 *   - transformStyle: "preserve-3d" on the button wrapper
 *   - perspective: 900 on the parent, perspectiveOrigin: "50% 45%"
 *   - Scale in: 0.7→1 over 0-0.8s, Easing.out(Easing.cubic)
 *   - Fade in: 0→1 over 0-0.4s
 *
 * Rotation phases:
 *   Phase A (0.6-1.5s): Initial tilt into 3D
 *     rotateX: 0→20°, rotateY: 0→-25°, rotateZ: 0→-5°
 *     All with Easing.out(Easing.cubic)
 *   Phase B (1.5-6s): Continuous 360° Y-axis rotation
 *     rotateY: -25→-385° (LINEAR, no easing — no pause)
 *     rotateX stays at 20°, rotateZ stays at -5°
 *
 * Downward drift:
 *   translateY: 0→300px over 0.6-6s, Easing.inOut(Easing.cubic)
 *
 * Shadow:
 *   CRITICAL: Shadow is on a SEPARATE sibling element, NOT on the
 *   preserve-3d container. CSS filter on preserve-3d flattens 3D.
 *   Shadow element: same dimensions, rgba(40,60,150,0.25),
 *   filter: blur(8→40px), offset Y: 4→30px, offset X: 0→-15px.
 *   Applies same rotation transforms as the button.
 *
 * No backfaceVisibility: "hidden" — the back of the button must be
 * visible during the 360° rotation.
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

const Sparkle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M12 0C12 0 14 8 16 10C18 12 24 12 24 12C24 12 18 12 16 14C14 16 12 24 12 24C12 24 10 16 8 14C6 12 0 12 0 12C0 12 6 12 8 10C10 8 12 0 12 0Z" />
  </svg>
);

export const MeetYourNewCreating = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const btnWidth = 700;
  const btnHeight = 210;
  const btnRadius = 90;
  const depth = 35;
  const layers = 60;

  const scaleIn = interpolate(t, [0, 0.8], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeIn = interpolate(t, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rotateX = interpolate(t, [0.6, 1.5], [0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const rotateY = interpolate(t, [1.5, 6], [-25, -385], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotateYInitial = interpolate(t, [0.6, 1.5], [0, -25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const finalRotateY = t < 1.5 ? rotateYInitial : rotateY;
  const rotateZ = interpolate(t, [0.6, 1.5], [0, -5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const translateY = interpolate(t, [0.6, 6], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const shadowBlur = interpolate(t, [0.6, 3], [8, 40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shadowY = interpolate(t, [0.6, 3], [4, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shadowX = interpolate(t, [0.6, 3], [0, -15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sparkleScale = interpolate(
    t % 1.5,
    [0, 0.3, 0.6, 1.5],
    [0.7, 1.3, 0.8, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const sparkleRotate = (t * 45) % 360;

  const dotCount = Math.floor((t * 2) % 4);
  const dots = ".".repeat(dotCount);

  const depthLayers = [];
  for (let i = layers; i >= 1; i--) {
    const z = -(i / layers) * depth;
    const ratio = i / layers;
    const offsetX = ratio * 3;
    const offsetY = ratio * 2;
    const r = Math.round(65 - ratio * 25);
    const g = Math.round(95 - ratio * 35);
    const b = Math.round(210 - ratio * 50);
    depthLayers.push(
      <div
        key={`depth-${i}`}
        style={{
          position: "absolute",
          width: btnWidth,
          height: btnHeight,
          borderRadius: btnRadius,
          backgroundColor: `rgb(${r}, ${g}, ${b})`,
          transform: `translateZ(${z}px) translateX(${offsetX}px) translateY(${offsetY}px)`,
        }}
      />,
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f0f4ff 0%, #e8eeff 40%, #dde6fa 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          perspective: 900,
          perspectiveOrigin: "50% 45%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: btnWidth,
            height: btnHeight,
            borderRadius: btnRadius,
            background: "rgba(40, 60, 150, 0.25)",
            transform: `scale(${scaleIn}) translateY(${translateY + shadowY}px) translateX(${shadowX}px) rotateX(${rotateX}deg) rotateY(${finalRotateY}deg) rotateZ(${rotateZ}deg)`,
            filter: `blur(${shadowBlur}px)`,
            opacity: fadeIn,
          }}
        />
        <div
          style={{
            position: "relative",
            width: btnWidth,
            height: btnHeight,
            transformStyle: "preserve-3d",
            transform: `scale(${scaleIn}) translateY(${translateY}px) rotateX(${rotateX}deg) rotateY(${finalRotateY}deg) rotateZ(${rotateZ}deg)`,
            opacity: fadeIn,
          }}
        >
          {depthLayers}

          <div
            style={{
              position: "absolute",
              width: btnWidth,
              height: btnHeight,
              borderRadius: btnRadius,
              background: "linear-gradient(135deg, #b0c8ff 0%, #7a9dff 25%, #5b80ff 50%, #4a6fff 75%, #3f65f5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              transform: "translateZ(0px)",
            }}
          >
            <span
              style={{
                fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: 72,
                fontWeight: 400,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              Creating{dots}
            </span>
            <div
              style={{
                transform: `scale(${sparkleScale}) rotate(${sparkleRotate}deg)`,
                marginLeft: 8,
              }}
            >
              <Sparkle size={48} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
