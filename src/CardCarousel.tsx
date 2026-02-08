import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React from "react";

/**
 * Card carousel with typing animation on first card,
 * then vertical scroll through designer cards.
 */

const TYPED_TEXT_PARTS = [
  { text: "Corporate ", color: "#1a1a2e" },
  { text: "gifting ", color: "#6c5ce7" },
  { text: "🎁", color: "", isEmoji: true },
  { text: " is broken", color: "#6c5ce7" },
];
const FULL_TEXT = TYPED_TEXT_PARTS.map((p) => p.text).join("");
const TYPE_SPEED = 0.04;

// Orbiting items for card 2
const ORBIT_ITEMS = [
  { emoji: "🧴", bg: "#f0e6e6", size: 70 },
  { emoji: "💼", bg: "#e6dcc8", size: 65 },
  { emoji: "🌾", bg: "#d4eef8", size: 75 },
  { emoji: "🎁", bg: "#e8d8c8", size: 60 },
  { emoji: "🌸", bg: "#f0d8e8", size: 68 },
  { emoji: "👕", bg: "#e0e0e0", size: 72 },
  { emoji: "🎒", bg: "#e0e8f0", size: 65 },
  { emoji: "📱", bg: "#d8e8d8", size: 70 },
  { emoji: "🧃", bg: "#f0e0e0", size: 60 },
  { emoji: "💎", bg: "#e8e0f0", size: 68 },
];

const CARD_WIDTH = 900;
const CARD_HEIGHT = 460;
const CARD_GAP = 24;
const CARD_RADIUS = 28;

// Card definitions — many cards for fast carousel
const CARDS = [
  { id: "typing" },
  { id: "curated" },
  { id: "writing" },
  { id: "globe" },
  { id: "ugc" },
  { id: "brands" },
  { id: "delivery" },
  { id: "analytics" },
  { id: "social" },
  { id: "rewards" },
];

const TypingCard: React.FC<{ t: number }> = ({ t }) => {
  const charsVisible = Math.floor(Math.max(0, t / TYPE_SPEED));
  const visibleText = FULL_TEXT.slice(0, Math.min(charsVisible, FULL_TEXT.length));
  const typingDone = charsVisible >= FULL_TEXT.length;
  const cursorVisible = !typingDone || Math.floor(t * 3) % 2 === 0;

  // Stamp pops in after "gifting" is typed
  const stampStart = 0.8;
  const stampScale = interpolate(t, [stampStart, stampStart + 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });
  const stampRotate = interpolate(t, [stampStart, stampStart + 0.3], [20, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const stampGrow = interpolate(t, [stampStart, stampStart + 0.8], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Render text with colors
  let rendered: React.ReactNode[] = [];
  let charCount = 0;
  for (const part of TYPED_TEXT_PARTS) {
    const partStart = charCount;
    const partEnd = charCount + part.text.length;
    charCount = partEnd;
    if (partStart >= visibleText.length) break;
    const visiblePart = part.text.slice(
      0,
      Math.max(0, visibleText.length - partStart),
    );
    if (visiblePart.length === 0) continue;
    rendered.push(
      <span
        key={partStart}
        style={{ color: part.color || "#1a1a2e", fontSize: part.isEmoji ? 28 : 28 }}
      >
        {visiblePart}
      </span>,
    );
  }

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Soft center glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,180,240,0.25) 0%, rgba(240,200,220,0.15) 40%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
        <span
          style={{
            fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {rendered}
          {cursorVisible && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 24,
                backgroundColor: "#6c5ce7",
                marginLeft: 2,
                verticalAlign: "middle",
              }}
            />
          )}
        </span>
        {/* Stamp element */}
        {t >= stampStart && (
          <div
            style={{
              display: "inline-block",
              transform: `scale(${stampScale * stampGrow}) rotate(${stampRotate}deg)`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                background: "linear-gradient(135deg, #a78bfa, #ec4899)",
                border: "4px dashed rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                boxShadow: "0 4px 12px rgba(167,139,250,0.3)",
              }}
            >
              🎁
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CuratedCard: React.FC<{ t: number }> = ({ t }) => {
  const orbitAngle = t * 25; // degrees per second rotation
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        backgroundColor: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Soft glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,180,240,0.2) 0%, transparent 60%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Orbiting items */}
      {ORBIT_ITEMS.map((item, i) => {
        const angle = (360 / ORBIT_ITEMS.length) * i + orbitAngle;
        const rad = (angle * Math.PI) / 180;
        const radiusX = 320;
        const radiusY = 200;
        const x = Math.cos(rad) * radiusX;
        const y = Math.sin(rad) * radiusY;
        const zOrder = Math.sin(rad);
        const itemScale = 0.7 + zOrder * 0.3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${itemScale})`,
              zIndex: Math.round(zOrder * 10) + 10,
              width: item.size,
              height: item.size,
              borderRadius: "50%",
              backgroundColor: item.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: item.size * 0.45,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              opacity: 0.6 + zOrder * 0.4,
            }}
          >
            {item.emoji}
          </div>
        );
      })}
      {/* Center text */}
      <div style={{ position: "relative", zIndex: 20, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
            fontSize: 72,
            fontWeight: 800,
            background: "linear-gradient(135deg, #2d1b69, #6c5ce7, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
          }}
        >
          +2000
        </div>
        <div
          style={{
            fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#2d1b69",
            letterSpacing: "0.15em",
            marginTop: 8,
          }}
        >
          CURATED GIFTS
        </div>
      </div>
    </div>
  );
};

const GlobeCard: React.FC<{ t: number }> = ({ t }) => {
  const glow = Math.sin(t * 2) * 0.15 + 0.85;
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        backgroundColor: "#0a0a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
        border: "1px solid rgba(100,80,200,0.2)",
      }}
    >
      {/* Purple globe glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,92,231,0.5) 0%, rgba(108,92,231,0.2) 40%, transparent 70%)",
          bottom: -100,
          left: "50%",
          transform: `translate(-50%, 0) scale(${glow})`,
        }}
      />
      {/* Globe circle */}
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: "2px solid rgba(108,92,231,0.4)",
          position: "absolute",
          bottom: -80,
          left: "50%",
          transform: "translate(-50%, 0)",
          background:
            "radial-gradient(circle at 40% 40%, rgba(140,120,255,0.3), rgba(60,40,120,0.6))",
        }}
      />
      {/* Location pins */}
      {[
        { x: -80, y: -60, flag: "🇺🇸" },
        { x: 40, y: -90, flag: "🇬🇧" },
        { x: 120, y: -40, flag: "🇫🇷" },
      ].map((pin, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(50% + ${pin.x}px)`,
            bottom: `calc(50% + ${pin.y}px)`,
            fontSize: 24,
            transform: `translateY(${Math.sin(t * 3 + i) * 4}px)`,
          }}
        >
          📍{pin.flag}
        </div>
      ))}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
          fontSize: 28,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 80,
        }}
      >
        Ship Worldwide
      </div>
    </div>
  );
};

const BrandsCard: React.FC = () => (
  <div
    style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: CARD_RADIUS,
      backgroundColor: "#f5f0ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <div
      style={{
        fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
        fontSize: 48,
        fontWeight: 800,
        background: "linear-gradient(135deg, #2d1b69, #6c5ce7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      500+ Brands
    </div>
    <div
      style={{
        fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
        fontSize: 20,
        color: "#5f5f7a",
        fontWeight: 400,
      }}
    >
      Trusted by top companies
    </div>
  </div>
);

const DeliveryCard: React.FC = () => (
  <div
    style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: CARD_RADIUS,
      backgroundColor: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 20,
      boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <span style={{ fontSize: 64 }}>📦</span>
    <div
      style={{
        fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
        fontSize: 36,
        fontWeight: 700,
        color: "#1a1a2e",
      }}
    >
      Same-Day Delivery
    </div>
    <div
      style={{
        fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
        fontSize: 18,
        color: "#6c5ce7",
        fontWeight: 500,
      }}
    >
      In 50+ cities worldwide
    </div>
  </div>
);

const AnalyticsCard: React.FC = () => (
  <div
    style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: CARD_RADIUS,
      backgroundColor: "#1a1a2e",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
      border: "1px solid rgba(108,92,231,0.2)",
    }}
  >
    <span style={{ fontSize: 48 }}>📊</span>
    <div
      style={{
        fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
        fontSize: 36,
        fontWeight: 700,
        color: "#ffffff",
      }}
    >
      Real-Time Analytics
    </div>
    <div
      style={{
        fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
        fontSize: 18,
        color: "#a78bfa",
        fontWeight: 400,
      }}
    >
      Track every gift, every step
    </div>
  </div>
);

const WritingCard: React.FC<{ t: number }> = ({ t }) => {
  const text = "Writing Script for product launch video";
  const chars = Math.floor(Math.max(0, t / 0.05));
  const visible = text.slice(0, Math.min(chars, text.length));
  const cursorOn = Math.floor(t * 3) % 2 === 0;
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a2a3a 50%, #0a1520 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span
        style={{
          fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
          fontSize: 28,
          fontWeight: 400,
          color: "#9aa0a6",
        }}
      >
        {visible.split(" ").map((w, i) => (
          <span key={i} style={{ color: i > 0 && i < 3 ? "#6c9ce7" : "#9aa0a6" }}>
            {w}{" "}
          </span>
        ))}
        {cursorOn && (
          <span style={{ display: "inline-block", width: 2, height: 24, backgroundColor: "#6c9ce7", verticalAlign: "middle" }} />
        )}
      </span>
    </div>
  );
};

const UgcCard: React.FC = () => (
  <div
    style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: CARD_RADIUS,
      backgroundColor: "#f8f8f8",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 80px",
      gap: 16,
      boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 28 }}>🎬</span>
      <span
        style={{
          fontFamily: "'Google Sans', 'Product Sans', 'Inter', sans-serif",
          fontSize: 36,
          fontWeight: 700,
          color: "#1a1a2e",
        }}
      >
        UGC <span style={{ color: "#6c5ce7" }}>Campaign</span>
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 18, color: "#22c55e" }}>✓</span>
      <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 16, color: "#5f5f7a" }}>
        1 of 10
      </span>
      <div style={{ flex: 1, height: 6, backgroundColor: "#e5e5e5", borderRadius: 3, marginLeft: 8 }}>
        <div style={{ width: "10%", height: "100%", backgroundColor: "#22c55e", borderRadius: 3 }} />
      </div>
      <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 14, color: "#9aa0a6" }}>03%</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <span style={{ color: "#22c55e", fontSize: 16 }}>✓</span>
      <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 16, color: "#5f5f7a" }}>Find Creators</span>
    </div>
  </div>
);

const SocialCard: React.FC = () => (
  <div
    style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: CARD_RADIUS,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
    }}
  >
    <div style={{ display: "flex", gap: 20, fontSize: 40 }}>
      <span>📸</span><span>🎥</span><span>📱</span><span>💬</span>
    </div>
    <div
      style={{
        fontFamily: "'Google Sans', sans-serif",
        fontSize: 42,
        fontWeight: 800,
        color: "#ffffff",
      }}
    >
      Social Media Suite
    </div>
    <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 18, color: "rgba(255,255,255,0.8)" }}>
      Schedule, publish, analyze
    </div>
  </div>
);

const RewardsCard: React.FC = () => (
  <div
    style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: CARD_RADIUS,
      backgroundColor: "#fffbeb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <span style={{ fontSize: 56 }}>🏆</span>
    <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 42, fontWeight: 800, color: "#92400e" }}>
      Rewards Program
    </div>
    <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 18, color: "#b45309" }}>
      Earn points with every purchase
    </div>
  </div>
);

export const CardCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Card 1 scale in
  const cardScaleIn = interpolate(t, [0, 0.25], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cardFadeIn = interpolate(t, [0, 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fast carousel scroll — starts during typing, whips through cards, decelerates to stop
  const scrollStart = 1.5;
  const scrollEnd = 4.5;
  const stopAtCard = 7; // Stop at card index 7
  const cardStep = CARD_HEIGHT + CARD_GAP;
  const totalScrollDistance = stopAtCard * cardStep;

  const scrollY = interpolate(t, [scrollStart, scrollEnd], [0, totalScrollDistance], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // First card starts centered on screen
  const startY = 360 - CARD_HEIGHT / 2;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #2a5c5c 0%, #1a3d3d 40%, #0f2b2b 100%)",
        overflow: "hidden",
      }}
    >
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Scrolling card track — no clipping, cards go off-screen */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: `translateX(-50%)`,
          opacity: cardFadeIn,
        }}
      >
        {CARDS.map((card, i) => {
          const cardY = startY + i * cardStep - scrollY;

          // Scale effect: card in center is scale 1, cards further away are slightly smaller
          const distFromCenter = Math.abs(cardY + CARD_HEIGHT / 2 - 360);
          const cardScale = interpolate(distFromCenter, [0, 400], [1, 0.92], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * (i === 0 ? cardScaleIn : 1);

          return (
            <div
              key={card.id}
              style={{
                position: "absolute",
                top: cardY,
                left: -CARD_WIDTH / 2,
                transform: `scale(${cardScale})`,
                transformOrigin: "center center",
              }}
            >
              {card.id === "typing" && <TypingCard t={t} />}
              {card.id === "curated" && <CuratedCard t={Math.max(0, t)} />}
              {card.id === "writing" && <WritingCard t={Math.max(0, t - 1)} />}
              {card.id === "globe" && <GlobeCard t={Math.max(0, t)} />}
              {card.id === "ugc" && <UgcCard />}
              {card.id === "brands" && <BrandsCard />}
              {card.id === "delivery" && <DeliveryCard />}
              {card.id === "analytics" && <AnalyticsCard />}
              {card.id === "social" && <SocialCard />}
              {card.id === "rewards" && <RewardsCard />}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
