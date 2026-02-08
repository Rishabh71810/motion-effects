import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

/**
 * Phase 3: After the button is clicked, the scene pans to the right
 * while play-button triangles grow out from the button's position,
 * each spawning from the tip of the previous one.
 */

const POINTERS = [
  { delay: 0.15, size: 140, color: "#d4c5fe" },
  { delay: 0.4, size: 200, color: "#c4b5fd" },
  { delay: 0.65, size: 280, color: "#b49afa" },
  { delay: 0.9, size: 380, color: "#a78bfa" },
  { delay: 1.15, size: 500, color: "#9a9cf6" },
  { delay: 1.4, size: 650, color: "#93a8f8" },
  { delay: 1.65, size: 840, color: "#8ab8f8" },
];

const Triangle: React.FC<{
  size: number;
  color: string;
  scale: number;
  opacity: number;
}> = ({ size, color, scale, opacity }) => {
  const h = size;
  const w = size * 0.9;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        display: "block",
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "left center",
      }}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,0 ${w},${h / 2} 0,${h}`}
        fill={`url(#grad-${color})`}
      />
    </svg>
  );
};

export const MeetYourNewPointers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const centerX = width / 2;
  const centerY = height / 2;

  // Scene pans to the right — the whole content shifts left
  // giving the illusion of camera moving right
  const panX = interpolate(t, [0, 3.5], [0, -width * 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Build chain: each pointer starts at the tip of the previous
  const positions: { leftX: number; topY: number }[] = [];
  let currentTipX = centerX;
  for (const ptr of POINTERS) {
    const w = ptr.size * 0.9;
    positions.push({
      leftX: currentTipX,
      topY: centerY - ptr.size / 2,
    });
    currentTipX = currentTipX + w;
  }

  // Google "G" logo fade in at the end
  const gOpacity = interpolate(t, [3.0, 3.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", overflow: "hidden" }}>
      {/* Everything pans right (content shifts left) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${panX}px)`,
        }}
      >
        {/* The button at center — starts zoomed in (5x from previous phase), fades out */}
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: `translate(-50%, -50%) scale(5)`,
            opacity: interpolate(t, [0, 0.4], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 36px",
              borderRadius: 22,
              background: "linear-gradient(180deg, #f8f9fb 0%, #eef1f5 100%)",
              border: "1.5px solid #d2e3fc",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <span
              style={{
                fontFamily:
                  "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: 43,
                fontWeight: 300,
                color: "#3c4043",
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span
              style={{
                fontFamily:
                  "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: 39,
                fontWeight: 400,
                color: "#3c4043",
                lineHeight: 1,
              }}
            >
              New
            </span>
          </div>
        </div>

        {/* Cascading pointers */}
        {POINTERS.map((ptr, i) => {
          const scaleProgress = interpolate(
            t,
            [ptr.delay, ptr.delay + 0.5],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.back(1.2)),
            },
          );

          const pointerOpacity = interpolate(
            t,
            [ptr.delay, ptr.delay + 0.12],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: positions[i].leftX,
                top: positions[i].topY,
              }}
            >
              <Triangle
                size={ptr.size}
                color={ptr.color}
                scale={scaleProgress}
                opacity={pointerOpacity}
              />
            </div>
          );
        })}
      </div>

      {/* Google "G" logo — stays fixed, bottom right */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 30,
          opacity: gOpacity,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
