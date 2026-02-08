import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

/**
 * Phase 5: "Creating..." button goes from flat 2D to thick 3D,
 * rotating to the right and tilting down. Uses stacked layers
 * to create convincing depth.
 */

const Sparkle: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M12 0C12 0 14 8 16 10C18 12 24 12 24 12C24 12 18 12 16 14C14 16 12 24 12 24C12 24 10 16 8 14C6 12 0 12 0 12C0 12 6 12 8 10C10 8 12 0 12 0Z" />
  </svg>
);

export const MeetYourNewCreating: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const btnWidth = 700;
  const btnHeight = 210;
  const btnRadius = 90;
  const depth = 35; // 3D edge thickness
  const layers = 60; // more layers = smoother solid edge

  // Scale in
  const scaleIn = interpolate(t, [0, 0.8], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeIn = interpolate(t, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 1 (0.6-1.5s): tilt into 3D
  // Phase 2 (1.5-6s): continuous 360 rotation — linear, no pause
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

  // Camera goes down — button moves down the screen
  const translateY = interpolate(t, [0.6, 6], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Shadow follows
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

  // Sparkle
  const sparkleScale = interpolate(
    t % 1.5,
    [0, 0.3, 0.6, 1.5],
    [0.7, 1.3, 0.8, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const sparkleRotate = (t * 45) % 360;

  // Dots
  const dotCount = Math.floor((t * 2) % 4);
  const dots = ".".repeat(dotCount);

  // Build depth layers: each layer shifts slightly right and down
  // as it goes back, so both bottom AND right edges are visible
  const depthLayers = [];
  for (let i = layers; i >= 1; i--) {
    const z = -(i / layers) * depth;
    const ratio = i / layers; // 0 = front, 1 = back
    // Shift right and down to expose edges on both sides
    const offsetX = ratio * 3;
    const offsetY = ratio * 2;
    // Solid colors: lighter near front, darker toward back
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
        background:
          "linear-gradient(180deg, #f0f4ff 0%, #e8eeff 40%, #dde6fa 100%)",
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
        {/* Shadow element — separate so it doesn't flatten 3D */}
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
          {/* Stacked depth layers (back to front) */}
          {depthLayers}

          {/* Front face — the visible button */}
          <div
            style={{
              position: "absolute",
              width: btnWidth,
              height: btnHeight,
              borderRadius: btnRadius,
              background:
                "linear-gradient(135deg, #b0c8ff 0%, #7a9dff 25%, #5b80ff 50%, #4a6fff 75%, #3f65f5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              transform: "translateZ(0px)",
                }}
          >
            <span
              style={{
                fontFamily:
                  "'Google Sans', 'Product Sans', 'Inter', sans-serif",
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
