import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

/**
 * Phase 6: A "Select a style" card slides in from the right.
 * Small style cards fly in one by one and settle into a 4×3 grid.
 */

const STYLE_CARDS = [
  { color: "#f5c518", label: "Pocket\nSolar Power", textColor: "#1a1a1a", sub: "SALES TRAINING" },
  { color: "#f5f5f0", label: "Pocket\nSolar Power", textColor: "#333", sub: "" },
  { color: "#f2b8c6", label: "POCKET SOLAR\nPOWER", textColor: "#1a1a1a", sub: "Sales Training" },
  { color: "#8a8a6e", label: "WELCOME TO\nPOCKET SOLAR\nPOWER", textColor: "#c9a84c", sub: "" },
  { color: "#c8e0cc", label: "Pocket\nSolar Power", textColor: "#1a3a2a", sub: "Sales Training" },
  { color: "#3a3a3a", label: "Pocket Solar\nPower", textColor: "#ffffff", sub: "" },
  { color: "#d8ccf0", label: "POCKET SOLAR\nPOWER", textColor: "#2a2a2a", sub: "2024" },
  { color: "#6a8eb8", label: "POCKET SOLAR\nPOWER", textColor: "#ffffff", sub: "Sales Training" },
  { color: "#4a6840", label: "POCKET SOLAR\nPOWER", textColor: "#c8d8a0", sub: "" },
  { color: "#8a2080", label: "Pocket\nSolar Power", textColor: "#ffffff", sub: "Sustainable Mobility" },
  { color: "#fafafa", label: "Pocket Solar\nPower", textColor: "#1a1a1a", sub: "", border: "#1a1a1a" },
  { color: "#c8d4e0", label: "Pocket Solar\nPower", textColor: "#4a5a6a", sub: "Sales Training" },
];

const StyleCard: React.FC<{
  card: (typeof STYLE_CARDS)[0];
  translateZ: number;
  opacity: number;
}> = ({ card, translateZ, opacity }) => (
  <div
    style={{
      width: 260,
      height: 160,
      borderRadius: 12,
      backgroundColor: card.color,
      border: card.border ? `2px solid ${card.border}` : "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "16px 20px",
      transform: `translateZ(${translateZ}px)`,
      opacity,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <span
      style={{
        fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
        fontSize: 16,
        fontWeight: 700,
        color: card.textColor,
        lineHeight: 1.2,
        whiteSpace: "pre-line",
      }}
    >
      {card.label}
    </span>
    {card.sub && (
      <span
        style={{
          fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
          fontSize: 9,
          fontWeight: 400,
          color: card.textColor,
          opacity: 0.7,
          marginTop: 6,
        }}
      >
        {card.sub}
      </span>
    )}
  </div>
);

export const MeetYourNewStyles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // Card panel slides in from right
  const panelX = interpolate(t, [0, 1.0], [width, 40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const panelOpacity = interpolate(t, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Header elements
  const headerOpacity = interpolate(t, [0.6, 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Grid: 4 columns × 3 rows
  const cols = 4;
  const cardW = 260;
  const cardH = 160;
  const gapX = 20;
  const gapY = 20;
  const gridLeft = 60;
  const gridTop = 120;

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #f0f4ff 0%, #e8eeff 40%, #dde6fa 100%)",
      }}
    >
      {/* Main card panel */}
      <div
        style={{
          position: "absolute",
          left: panelX,
          top: 30,
          width: width - 80,
          height: height - 60,
          borderRadius: 24,
          backgroundColor: "#fafbff",
          border: "1.5px solid #c0cfee",
          opacity: panelOpacity,
          overflow: "visible",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 32px",
            opacity: headerOpacity,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: 24,
                color: "#3c4043",
              }}
            >
              ←
            </span>
            <span
              style={{
                fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 400,
                color: "#3c4043",
              }}
            >
              Select a style for your video
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
              fontSize: 28,
              color: "#5f6368",
              cursor: "pointer",
            }}
          >
            ✕
          </span>
        </div>

        {/* Style cards grid — perspective container for 3D fly-from-front */}
        <div
          style={{
            position: "absolute",
            left: gridLeft,
            top: gridTop,
            width: cols * (cardW + gapX),
            height: 3 * (cardH + gapY),
            perspective: 800,
            perspectiveOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          {STYLE_CARDS.map((card, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const cardDelay = 1.2 + i * 0.12; // stagger each card

            // Cards fly in from the front (large positive Z = close to viewer)
            const cardZ = interpolate(
              t,
              [cardDelay, cardDelay + 0.5],
              [600, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );
            const cardOpacity = interpolate(
              t,
              [cardDelay, cardDelay + 0.25],
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
                  left: col * (cardW + gapX),
                  top: row * (cardH + gapY),
                  transformStyle: "preserve-3d",
                }}
              >
                <StyleCard
                  card={card}
                  translateZ={cardZ}
                  opacity={cardOpacity}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom toolbar — appears at the end */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            opacity: interpolate(t, [4.0, 4.5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {/* Play button */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#1a237e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          </div>
          {/* Subtitle button */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#e8eaed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="16" viewBox="0 0 20 16" fill="#5f6368">
              <rect x="0" y="0" width="20" height="16" rx="3" fill="none" stroke="#5f6368" strokeWidth="1.5" />
              <rect x="3" y="9" width="6" height="2" rx="1" />
              <rect x="11" y="9" width="6" height="2" rx="1" />
            </svg>
          </div>
          {/* Menu button */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#e8eaed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="#5f6368">
              <rect x="0" y="0" width="18" height="2" rx="1" />
              <rect x="0" y="6" width="18" height="2" rx="1" />
              <rect x="0" y="12" width="18" height="2" rx="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Google "G" logo — fixed bottom right */}
      <div style={{ position: "absolute", right: 20, bottom: 15 }}>
        <svg width="40" height="40" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
