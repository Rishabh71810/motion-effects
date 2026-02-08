import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
  staticFile,
  AbsoluteFill,
} from "remotion";

// Scale
const INITIAL_SCALE = 0.2;
const FINAL_SCALE = 1.0;

// Slow continuous motion
const SCALE_DURATION = 10.0;

export const ScaleReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;

  const progress = interpolate(t, [0, SCALE_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  const scale = INITIAL_SCALE + progress * (FINAL_SCALE - INITIAL_SCALE);

  // Subtle vertical lift
  const yOffset = interpolate(progress, [0, 1], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Opacity fade in
  const opacity = interpolate(t, [0, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shadow: grows wider and more visible with scale
  const shadowScale = interpolate(progress, [0, 1], [0.3, 1]);
  const shadowOpacity = interpolate(progress, [0, 1], [0.1, 0.5]);

  // Position the shadow below center — the headphone image is centered,
  // so the shadow sits at roughly 65% of the frame height
  const shadowTop = height * 0.5 + 250 * scale + yOffset;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f2f2f2",
      }}
    >
      {/* Headphone image — centered */}
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
            style={{
              width: 500,
              height: "auto",
              objectFit: "contain",
            }}
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
