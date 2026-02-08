/**
 * ============================================================
 * EFFECT: Product Scale Reveal
 * FILE: ScaleReveal.tsx
 * COMPOSITION ID: ScaleReveal
 * DURATION: 360 frames (12s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a premium product reveal animation where a headphone image
 * (PNG with transparent background) smoothly scales up from small
 * to full size on a light background (#f2f2f2).
 *
 * Scale motion:
 *   Object continuously scales from 20% to 100% over 10 seconds.
 *   Single uninterrupted ease-out exponential curve.
 *   No pauses, no breaks, completely smooth.
 *
 * Vertical lift:
 *   Object subtly rises 50px as it scales up, settling at center.
 *   Lift is tied to scale progress, not time.
 *
 * Opacity:
 *   Fades in from 0 to 1 over the first 0.8 seconds.
 *
 * Ground shadow:
 *   An elliptical shadow sits directly beneath the headphones.
 *   Shadow grows proportionally with the object:
 *   - Width: 105px (small) to 350px (full).
 *   - Height: 15px (small) to 50px (full).
 *   Shadow uses a radial gradient:
 *   - Center: rgba(0,0,0,0.6)
 *   - 40%: rgba(0,0,0,0.2)
 *   - 70%: rgba(0,0,0,0) — fully transparent edge.
 *   Shadow opacity increases from 10% to 50% as object grows.
 *   Shadow position tracks the bottom of the headphones using:
 *     top = 50% of frame height + 250 * scale + yOffset
 *
 * Image:
 *   Uses Remotion <Img> component with staticFile("headphones.png").
 *   Image placed in public/headphones.png (transparent background PNG).
 *   Display width: 500px, height: auto.
 *
 * Overall feel:
 *   Clean, premium product showcase.
 *   Slow, intentional, Apple-style reveal.
 *   Shadow gives grounding and depth to the floating product.
 *
 * ============================================================
 */

import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
  staticFile,
  AbsoluteFill,
} from "remotion";

const INITIAL_SCALE = 0.2;
const FINAL_SCALE = 1.0;
const SCALE_DURATION = 10.0;

export const ScaleReveal = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;

  const progress = interpolate(t, [0, SCALE_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  const scale = INITIAL_SCALE + progress * (FINAL_SCALE - INITIAL_SCALE);

  const yOffset = interpolate(progress, [0, 1], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(t, [0, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shadowScale = interpolate(progress, [0, 1], [0.3, 1]);
  const shadowOpacity = interpolate(progress, [0, 1], [0.1, 0.5]);
  const shadowTop = height * 0.5 + 250 * scale + yOffset;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f2f2f2" }}>
      {/* Headphone image */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            transform: `translateY(${yOffset}px) scale(${scale})`,
            opacity,
            willChange: "transform, opacity",
          }}
        >
          <Img
            src={staticFile("headphones.png")}
            style={{ width: 500, height: "auto", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Ground shadow */}
      <div
        style={{
          position: "absolute",
          top: shadowTop,
          left: "50%",
          width: 350 * shadowScale,
          height: 50 * shadowScale,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 70%)",
          opacity: opacity * shadowOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
