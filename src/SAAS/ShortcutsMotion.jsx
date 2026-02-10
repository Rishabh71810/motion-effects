/**
 * ============================================================
 * EFFECT: Shortcuts Motion — Multi-Section Scrolling Editorial
 * FILE: ShortcutsMotion.tsx
 * COMPOSITION ID: ShortcutsMotion
 * DURATION: 480 frames (16s @ 30fps)
 * RESOLUTION: 1080x1920 (vertical / mobile)
 * ============================================================
 *
 * PROMPT:
 *
 * Create a vertical (1080x1920) multi-section scrolling motion
 * piece with 3 editorial sections. The viewport scrolls between
 * sections using keyframed timing. Rotating brush stroke SVGs
 * float as overlays across sections 1 and 2. The piece combines
 * 2D typography, a 3D WebGL pill capsule, and a drawn-on
 * diagonal brush stroke.
 *
 * ─── GLOBAL STRUCTURE ───
 *
 *   Resolution: 1080x1920 (vertical)
 *   Background: #f5f5f0 (warm off-white)
 *   Each section is 1920px tall (SECTION_HEIGHT = 1920)
 *   Total scrollable height: 1920 × 3 = 5760px
 *
 *   Scroll container:
 *     - A single div with height 5760px
 *     - transform: translateY(scrollY) drives the scroll
 *     - willChange: transform for GPU compositing
 *     - Scroll Y is keyframed (see below)
 *
 * ─── SCROLL KEYFRAMES ───
 *
 *   Scroll position interpolated with cubic ease-in-out:
 *
 *     t=0.0s  → y=0           (section 1 visible)
 *     t=5.0s  → y=0           (hold on section 1)
 *     t=6.5s  → y=-1920       (scroll to section 2)
 *     t=12.0s → y=-1920       (hold on section 2)
 *     t=13.5s → y=-3840       (scroll to section 3)
 *     t=16.0s → y=-3840       (hold on section 3)
 *
 *   Uses easeInOutCubic for smooth scroll transitions.
 *
 * ─── BRUSH STROKE OVERLAYS ───
 *
 *   Two abstract SVG brush shapes float as fixed overlays,
 *   visible during sections 1 and 2, fading out before section 3.
 *
 *   Brush 1 (top-right corner):
 *     - SVG path: organic closed bezier blob
 *       "M 20,80 C 60,10 140,-10 220,40 C 300,90 360,30 420,70
 *        C 480,110 440,180 360,160 C 280,140 200,190 120,150
 *        C 40,110 -10,100 20,80 Z"
 *     - Size: 460×300, viewBox "0 0 460 300"
 *     - Position: top -30px, right -60px
 *     - Fill: #111 (near-black)
 *     - Rotation: frame * 0.18 degrees (slow continuous spin)
 *     - transformOrigin: center center
 *
 *   Brush 2 (bottom-left corner):
 *     - SVG path: different organic closed bezier blob
 *       "M 30,10 C 80,60 160,100 250,70 C 340,40 400,120 350,190
 *        C 300,260 200,240 130,280 C 60,320 -10,260 20,190
 *        C 50,120 -20,50 30,10 Z"
 *     - Size: 420×320, viewBox "0 0 420 320"
 *     - Position: bottom 80px, left -70px
 *     - Fill: #111
 *     - Rotation: -frame * 0.14 degrees (opposite direction)
 *
 *   Both brushes:
 *     - Fade in: opacity 0 → 1 over t=0–1.0s
 *     - Fade out: opacity 1 → 0 over t=12.0–13.0s
 *     - Combined opacity = fadeIn * fadeOut
 *     - pointerEvents: none
 *
 * ─── SECTION 1: "Everyone is chasing SHORTCUTS" ───
 *
 *   Layout: Centered vertically and horizontally in 1080×1920.
 *
 *   Line 1: "Everyone is chasing"
 *     - Font: SF Pro Display, -apple-system, 48px, weight 400
 *     - Color: #333
 *     - Entrance: t=1.0–1.6s
 *       opacity 0 → 1
 *       translateY 40px → 0 with Easing.out(Easing.cubic)
 *     - marginBottom: 16px
 *     - letterSpacing: -0.01em
 *
 *   Line 2: "SHORTCUTS"
 *     - Font: SF Pro Display, 72px, weight 900
 *     - Color: #000
 *     - Entrance: t=1.6–2.2s
 *       opacity 0 → 1
 *       scale 0.7 → 1 with Easing.out(Easing.cubic)
 *     - letterSpacing: -0.02em, lineHeight 1
 *
 *   Cursor + Selection Animation:
 *     Full selection covers both text lines:
 *       boxW: 640px, boxH: 200px
 *       boxX: (1080 - 640) / 2 = 220px
 *       boxY: 960 - 100 - 5 = 855px (centered on both lines)
 *
 *     Cursor (arrow SVG):
 *       - Path: "M 0,0 L 0,22 L 5.5,17.5 L 9.5,26 L 13,24.5
 *               L 9,16 L 15.5,15.5 Z"
 *       - Size: 20×30px, viewBox "0 0 16 27"
 *       - Fill: #000, drop-shadow(0 1px 2px rgba(0,0,0,0.3))
 *       - Appears: opacity 0 → 1 over t=2.3–2.5s
 *       - Drag: t=2.5–3.8s with Easing.inOut(Easing.cubic)
 *         cursorX = boxX + progress * boxW
 *         cursorY = boxY + progress * boxH
 *         (drags from top-left to bottom-right)
 *
 *     Dashed selection border:
 *       - Appears at t=2.5s (when drag begins)
 *       - SVG rect at (boxX, boxY)
 *       - Width/height grow with drag progress
 *       - stroke: #333, strokeWidth 1.5
 *       - strokeDasharray: "8 5"
 *       - strokeDashoffset: -(frame * 0.6) — marching ants
 *       - 4 corner handles: 8×8px filled #333 squares
 *         at each corner of the growing rect
 *
 * ─── SECTION 2: Dot Grid + 3D Pill + Fading Text ───
 *
 *   Dot Grid Background:
 *     - SVG grid: 600×500px, centered horizontally,
 *       vertically offset 120px above center
 *     - Grid spacing: 65px
 *     - Horizontal + vertical dashed lines:
 *       stroke rgba(0,0,0,0.1), strokeWidth 1, dasharray "4 4"
 *     - Dots at intersections: circles r=3, fill rgba(0,0,0,0.15)
 *     - Memoized component (React.memo) for performance
 *     - Fades in with section: opacity tied to sectionFade
 *
 *   3D Pill Capsule (WebGL via @remotion/three):
 *     Position: centered, 350px above section vertical center
 *     Container: 400×400px
 *
 *     Geometry (built from 3 parts):
 *       1. Top hemisphere: SphereGeometry(0.5, 32, 16, 0, 2PI, 0, PI/2)
 *          translated Y+0.6
 *       2. Body cylinder: CylinderGeometry(0.5, 0.5, 1.2, 32)
 *       3. Bottom hemisphere: SphereGeometry(0.5, 32, 16, 0, 2PI, PI/2, PI/2)
 *          translated Y-0.6
 *
 *     Divider ring: TorusGeometry(0.5, 0.02, 8, 32) at Y=0
 *       color #333, roughness 0.6
 *
 *     Materials (MeshStandardMaterial):
 *       - Top cap: color #555, roughness 0.4, metalness 0.1
 *       - Body: color #4a4a4a, roughness 0.45, metalness 0.1
 *       - Bottom cap: color #888, roughness 0.5, metalness 0.05
 *
 *     Granules (60 small spheres inside bottom half):
 *       - SphereGeometry(0.08, 8, 8)
 *       - Randomly distributed: angle random*2PI, r=random*0.35
 *         y = -0.1 - random*0.9
 *       - Material: color #aaa, roughness 0.3, metalness 0.1
 *       - Memoized positions via useMemo
 *
 *     Lighting:
 *       - ambientLight intensity 0.6
 *       - directionalLight position [3, 5, 4] intensity 1.0
 *       - directionalLight position [-2, -3, 2] intensity 0.3
 *
 *     Camera: fov 35, position [0, 0, 6], near 0.1, far 100
 *     Scene background: #f5f5f0
 *
 *     Animation:
 *       - Rotation X: 0deg → 720deg over t=6.5–16.0s (2 full spins)
 *       - Scale entrance: 0.3 → 1 over t=6.5–7.3s
 *         Easing.out(Easing.cubic)
 *       - Opacity: 0 → 1 over t=6.5–7.0s
 *
 *   Word-by-Word Fading Text:
 *     Text: "In today's fast-paced world, everyone is searching
 *           for shortcuts—quick fixes that promise instant results
 *           with minimal effort. This desire for speed has become
 *           deeply embedded in our culture."
 *
 *     Layout:
 *       - Positioned below pill (paddingTop 400, marginTop 80)
 *       - maxWidth 800, padding 80 left/right
 *       - Font: SF Pro Display, 32px, weight 500
 *       - lineHeight 1.55, letterSpacing -0.01em
 *
 *     Animation:
 *       - Text split by spaces into individual words
 *       - Each word fades in sequentially starting at t=7.7s
 *       - WORD_STAGGER: 0.12s between each word start
 *       - WORD_FADE_DURATION: 0.18s per word to reach full opacity
 *       - Color: rgba(30, 30, 30, wordOpacity)
 *         (fades from transparent to dark gray)
 *
 * ─── SECTION 3: "here is the truth" + Frame + Diagonal Stroke ───
 *
 *   Diagonal Brush Stroke:
 *     - SVG path drawn across full section (1080×1920 viewBox)
 *     - Path: "M -200,1600 C 100,1300 400,1000 700,850
 *             C 900,720 1100,550 1400,400"
 *     - stroke: #1a1a1a, strokeWidth 200, strokeLinecap round
 *     - Draw-on animation using strokeDasharray/offset:
 *       pathLength=1, strokeDasharray=1
 *       strokeDashoffset = 1 - strokeProgress
 *     - Progress: 0 → 1 over t=13.5–15.0s
 *       Easing.inOut(Easing.cubic)
 *     - Creates thick diagonal band from bottom-left to top-right
 *
 *   Title: "here is the truth"
 *     Position: top 220px, centered
 *
 *     "here is the":
 *       - Font: SF Pro Display, 52px, weight 400
 *       - Color: #333, letterSpacing -0.01em
 *       - lineHeight 1, marginBottom 8
 *
 *     "truth":
 *       - Font: SF Pro Display, 130px, weight 900
 *       - Color: #111, letterSpacing -0.04em
 *       - lineHeight 1
 *
 *     Entrance (both together): t=13.5–14.2s
 *       opacity 0 → 1
 *       scale 0.85 → 1 with Easing.out(Easing.cubic)
 *       translateY 30 → 0 with Easing.out(Easing.cubic)
 *
 *   Ornate Picture Frame:
 *     Position: vertically centered minus 100px, horizontally centered
 *     Size: 360×360px
 *
 *     Structure (layered divs):
 *       1. Outer border: 12px solid #d4d0c8, borderRadius 6
 *          boxShadow: inset 0 0 0 3px #b8b4aa,
 *                     inset 0 0 0 6px #e8e4dc,
 *                     0 0 0 3px #b8b4aa
 *       2. Inner border: inset 20px, 4px solid #c8c4bc, radius 3
 *       3. Corner flourishes: 4 circles (24×24px, radius 12)
 *          at each corner offset -8px
 *          radial-gradient: #d8d4cc 40%, #b8b4aa 70%, transparent
 *       4. Edge ornaments: 4 circles (20×20px, radius 10)
 *          at center of each edge, offset -10px
 *          radial-gradient: #ddd8d0 30%, #c0bcb4 60%, transparent
 *       5. Inner content: inset 28px, background #f8f6f2
 *          Contains gradient rectangle (80% size):
 *          linear-gradient(135deg, #eee, #ddd 50%, #e8e8e8)
 *
 *     Animation:
 *       - Opacity: 0 → 1 over t=13.8–14.4s
 *       - Rotation: -6deg → 6deg over t=13.5–16.0s (slow rock)
 *       - Scale: 0.5 → 1 over t=13.8–14.5s
 *         Easing.out(Easing.cubic)
 *       - Drop shadow: 8px 12px 20px rgba(0,0,0,0.4)
 *
 *   Subtitle:
 *     Text: "Truth is one of the most powerful and essential values
 *           in human life. It serves as the foundation for trust,
 *           justice, growth, and meaningful relationships."
 *     Position: bottom 200px, centered, maxWidth 680
 *     padding: 60 left/right, textAlign center
 *     Font: SF Pro Display, 32px, weight 600, italic
 *     Color: #555, lineHeight 1.6, letterSpacing -0.01em
 *     Entrance: t=14.5–15.2s
 *       opacity 0 → 1
 *       translateY 25 → 0 with Easing.out(Easing.cubic)
 *
 * ─── ANIMATION TIMELINE ───
 *
 *   t=0.0s–1.0s:   Brush strokes fade in, section 1 idle
 *   t=1.0s–1.6s:   "Everyone is chasing" slides up and fades in
 *   t=1.6s–2.2s:   "SHORTCUTS" scales in
 *   t=2.3s–2.5s:   Cursor arrow appears
 *   t=2.5s–3.8s:   Cursor drags, dashed selection border grows
 *   t=3.8s–5.0s:   Hold on section 1 with selection complete
 *   t=5.0s–6.5s:   Scroll transition to section 2
 *   t=6.5s–7.0s:   Section 2 fades in, pill appears
 *   t=6.5s–16.0s:  Pill continuously rotates (720deg total)
 *   t=7.7s+:       Words fade in one by one (~0.12s stagger)
 *   t=12.0s–13.0s: Brush strokes fade out
 *   t=12.0s–13.5s: Scroll transition to section 3
 *   t=13.5s–14.2s: "here is the truth" title enters
 *   t=13.5s–15.0s: Diagonal stroke draws on
 *   t=13.8s–14.5s: Ornate frame scales in with rotation
 *   t=14.5s–15.2s: Subtitle fades in
 *   t=15.2s–16.0s: Hold on section 3
 *
 * ─── TECHNICAL REQUIREMENTS ───
 *
 *   Dependencies:
 *     - @remotion/three (ThreeCanvas) — for 3D pill
 *     - @react-three/fiber (useThree) — camera access
 *     - three (THREE namespace) — geometries, materials
 *     - remotion (useCurrentFrame, useVideoConfig, interpolate, Easing)
 *
 *   - Spring config MUST be nested: config: { damping, stiffness, mass }
 *   - All motion driven by frame → time → interpolate
 *   - NO CSS animations, NO requestAnimationFrame
 *   - Inline styles only
 *   - DotNetGrid wrapped in React.memo for performance
 *   - All Three.js geometries and materials memoized with useMemo
 *   - Granule positions memoized (random but stable per render)
 *   - SVG strokeDasharray/offset for draw-on animation
 *   - CSS filter: drop-shadow for frame shadow
 *
 * ─── CUSTOMIZATION ───
 *
 *   - SCROLL_KFS: change timing and hold durations per section
 *   - SECTION_HEIGHT: change from 1920 for different section sizes
 *   - Brush stroke paths: swap SVG paths for different shapes
 *   - Brush rotation speed: frame * 0.18 / frame * 0.14
 *   - Section 1 text: change "Everyone is chasing" / "SHORTCUTS"
 *   - Selection box size: boxW/boxH
 *   - Cursor drag timing: t=2.5–3.8s
 *   - Pill colors: adjust MeshStandardMaterial colors
 *   - Pill rotation: change 720deg total or timing
 *   - Granule count: change from 60
 *   - Typed text: change TYPED_TEXT constant
 *   - Word stagger: WORD_STAGGER (0.12s) / WORD_FADE_DURATION (0.18s)
 *   - Diagonal stroke: change BAND_STROKE_PATH and strokeWidth
 *   - Frame ornament colors: adjust gradient colors
 *   - Subtitle text: change SUBTITLE_TEXT constant
 *   - Background: #f5f5f0 (warm off-white)
 *
 * ─── OVERALL FEEL ───
 *
 *   Editorial, magazine-style vertical motion piece. Warm off-white
 *   background with dark typography creates a refined, print-inspired
 *   aesthetic. Section 1 introduces the theme with a design-tool
 *   cursor selection metaphor. Section 2 adds dimensionality with
 *   a rotating 3D pill capsule (medical/shortcut metaphor) and
 *   progressive word-by-word text reveal. Section 3 delivers the
 *   punchline with "truth" in bold 130px type, a thick diagonal
 *   brush stroke drawn on in real time, and an ornate picture
 *   frame that gently rocks. Floating brush stroke blobs add
 *   organic texture. The scrolling between sections mimics a
 *   native mobile scroll experience. Overall: contemplative,
 *   editorial, and visually rich.
 *
 * ============================================================
 */

import { ThreeCanvas } from "@remotion/three";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Constants ───

const SECTION_HEIGHT = 1920;

// SVG brush stroke paths (organic abstract shapes)
const BRUSH_PATH_1 =
  "M 20,80 C 60,10 140,-10 220,40 C 300,90 360,30 420,70 C 480,110 440,180 360,160 C 280,140 200,190 120,150 C 40,110 -10,100 20,80 Z";
const BRUSH_PATH_2 =
  "M 30,10 C 80,60 160,100 250,70 C 340,40 400,120 350,190 C 300,260 200,240 130,280 C 60,320 -10,260 20,190 C 50,120 -20,50 30,10 Z";

// Diagonal stroke path for section 3 — single curve, drawn on with thick strokeWidth
const BAND_STROKE_PATH =
  "M -200,1600 C 100,1300 400,1000 700,850 C 900,720 1100,550 1400,400";

// Cursor arrow path
const CURSOR_SVG =
  "M 0,0 L 0,22 L 5.5,17.5 L 9.5,26 L 13,24.5 L 9,16 L 15.5,15.5 Z";

// Typing config
const TYPED_TEXT =
  "In today's fast-paced world, everyone is searching for shortcuts\u2014quick fixes that promise instant results with minimal effort. This desire for speed has become deeply embedded in our culture.";

// Subtitle for section 3
const SUBTITLE_TEXT =
  "Truth is one of the most powerful and essential values in human life. It serves as the foundation for trust, justice, growth, and meaningful relationships.";

// ─── Scroll keyframes ───

const SCROLL_KFS = [
  { t: 0, y: 0 },
  { t: 5.0, y: 0 },
  { t: 6.5, y: -SECTION_HEIGHT },
  { t: 12.0, y: -SECTION_HEIGHT },
  { t: 13.5, y: -SECTION_HEIGHT * 2 },
  { t: 16.0, y: -SECTION_HEIGHT * 2 },
];

// ─── Helpers ───

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getScrollY(t) {
  if (t <= SCROLL_KFS[0].t) return SCROLL_KFS[0].y;
  const last = SCROLL_KFS[SCROLL_KFS.length - 1];
  if (t >= last.t) return last.y;

  let i = 0;
  while (i < SCROLL_KFS.length - 2 && SCROLL_KFS[i + 1].t <= t) i++;

  const a = SCROLL_KFS[i];
  const b = SCROLL_KFS[i + 1];
  const progress = easeInOutCubic((t - a.t) / (b.t - a.t));
  return a.y + (b.y - a.y) * progress;
}

// ─── Dot Grid with Net Lines (memoized for performance) ───

const GRID_SPACING = 65;
const GRID_DOT_R = 3;
const GRID_W = 600;
const GRID_H = 500;

const DotNetGrid = React.memo(() => {
  const cols = Math.floor(GRID_W / GRID_SPACING) + 1;
  const rows = Math.floor(GRID_H / GRID_SPACING) + 1;
  const elements = [];

  // Horizontal lines
  for (let r = 0; r < rows; r++) {
    elements.push(
      <line
        key={`h-${r}`}
        x1={0}
        y1={r * GRID_SPACING}
        x2={GRID_W}
        y2={r * GRID_SPACING}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />,
    );
  }

  // Vertical lines
  for (let c = 0; c < cols; c++) {
    elements.push(
      <line
        key={`v-${c}`}
        x1={c * GRID_SPACING}
        y1={0}
        x2={c * GRID_SPACING}
        y2={GRID_H}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />,
    );
  }

  // Dots at intersections
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      elements.push(
        <circle
          key={`d-${r}-${c}`}
          cx={c * GRID_SPACING}
          cy={r * GRID_SPACING}
          r={GRID_DOT_R}
          fill="rgba(0,0,0,0.15)"
        />,
      );
    }
  }

  return (
    <svg
      width={GRID_W}
      height={GRID_H}
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      style={{
        position: "absolute",
        left: (1080 - GRID_W) / 2,
        top: (SECTION_HEIGHT - GRID_H) / 2 - 120,
      }}
    >
      {elements}
    </svg>
  );
});

// ─── Section 1: Brush Strokes + "SHORTCUTS" Selection ───

const Section1 = ({ t, frame }) => {
  // Text entrance — "Everyone is chasing"
  const line1Opacity = interpolate(t, [1.0, 1.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(t, [1.0, 1.6], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "SHORTCUTS" entrance
  const shortcutsOpacity = interpolate(t, [1.6, 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shortcutsScale = interpolate(t, [1.6, 2.2], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Full selection area — covers BOTH "Everyone is chasing" and "SHORTCUTS"
  const boxW = 640;
  const boxH = 200;
  const boxX = (1080 - boxW) / 2;
  const boxY = 960 - boxH / 2 - 5; // centered on both lines

  // Cursor appears at top-left of the box area, then drags to bottom-right
  const cursorOpacity = interpolate(t, [2.3, 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor drags from top-left corner to bottom-right corner
  const dragProgress = interpolate(t, [2.5, 3.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cursorX = boxX + dragProgress * boxW;
  const cursorY = boxY + dragProgress * boxH;

  // Dashed border grows from top-left as cursor drags — width/height follow cursor
  const borderW = Math.max(0, dragProgress * boxW);
  const borderH = Math.max(0, dragProgress * boxH);
  const borderVisible = t >= 2.5;
  const dashOffset = -(frame * 0.6);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: SECTION_HEIGHT,
        overflow: "hidden",
      }}
    >
      {/* Text block — centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: SECTION_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* "Everyone is chasing" */}
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 48,
            fontWeight: 400,
            color: "#333",
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}
        >
          Everyone is chasing
        </span>

        {/* "SHORTCUTS" — smaller text */}
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 72,
            fontWeight: 900,
            color: "#000",
            opacity: shortcutsOpacity,
            transform: `scale(${shortcutsScale})`,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          SHORTCUTS
        </span>
      </div>

      {/* Dashed selection border — grows from top-left as cursor drags */}
      {borderVisible && borderW > 2 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: SECTION_HEIGHT,
            pointerEvents: "none",
          }}
        >
          <rect
            x={boxX}
            y={boxY}
            width={borderW}
            height={borderH}
            fill="none"
            stroke="#333"
            strokeWidth={1.5}
            strokeDasharray="8 5"
            strokeDashoffset={dashOffset}
          />
          {/* Corner handles — at the 4 corners of the current border rect */}
          {[
            [boxX, boxY],
            [boxX + borderW, boxY],
            [boxX, boxY + borderH],
            [boxX + borderW, boxY + borderH],
          ].map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx - 4}
              y={cy - 4}
              width={8}
              height={8}
              fill="#333"
            />
          ))}
        </svg>
      )}

      {/* Cursor arrow — drags from top-left to bottom-right */}
      <svg
        width="20"
        height="30"
        viewBox="0 0 16 27"
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          opacity: cursorOpacity,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
        }}
      >
        <path d={CURSOR_SVG} fill="#000" />
      </svg>
    </div>
  );
};

// ─── 3D Pill Scene (Three.js) ───

function PillScene({ rotX }) {
  const { camera } = useThree();

  // Set up camera
  const cam = camera;
  cam.fov = 35;
  cam.near = 0.1;
  cam.far = 100;
  cam.position.set(0, 0, 6);
  cam.lookAt(0, 0, 0);
  cam.updateProjectionMatrix();

  // Build capsule geometry: top hemisphere + cylinder + bottom hemisphere
  const topCapGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    geo.translate(0, 0.6, 0);
    return geo;
  }, []);

  const bodyGeo = useMemo(() => {
    return new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32);
  }, []);

  const bottomCapGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    geo.translate(0, -0.6, 0);
    return geo;
  }, []);

  // Small spheres inside the bottom half
  const granules = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.35;
      const y = -0.1 - Math.random() * 0.9;
      positions.push([Math.cos(angle) * r, y, Math.sin(angle) * r]);
    }
    return positions;
  }, []);

  // Materials
  const topMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#555", roughness: 0.4, metalness: 0.1 }),
    [],
  );
  const bottomMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#888", roughness: 0.5, metalness: 0.05 }),
    [],
  );
  const granuleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#aaa", roughness: 0.3, metalness: 0.1 }),
    [],
  );
  const granuleGeo = useMemo(() => new THREE.SphereGeometry(0.08, 8, 8), []);

  const rx = (rotX * Math.PI) / 180;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} />
      <directionalLight position={[-2, -3, 2]} intensity={0.3} />

      <group rotation={[rx, 0, 0]}>
        {/* Top cap */}
        <mesh geometry={topCapGeo} material={topMat} />
        {/* Body — top half dark, bottom half lighter */}
        <mesh geometry={bodyGeo}>
          <meshStandardMaterial color="#4a4a4a" roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Bottom cap */}
        <mesh geometry={bottomCapGeo} material={bottomMat} />

        {/* Divider ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 32]} />
          <meshStandardMaterial color="#333" roughness={0.6} />
        </mesh>

        {/* Granules in bottom half */}
        {granules.map((pos, i) => (
          <mesh key={i} position={pos} geometry={granuleGeo} material={granuleMat} />
        ))}
      </group>
    </>
  );
}

// ─── Section 2: Net Grid + 3D Pill + Fading Text ───

// Split typed text into words for fade-in
const TYPED_WORDS = TYPED_TEXT.split(" ");
const WORD_FADE_DURATION = 0.18; // seconds per word to fully fade in
const WORD_STAGGER = 0.12; // delay between each word starting

const Section2 = ({ t, frame }) => {
  // Section-local time (section becomes visible around t=6.5)
  const sectionFade = interpolate(t, [6.5, 7.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pill rotation — spins around X axis
  const pillRotX = interpolate(t, [6.5, 16.0], [0, 720], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pill entrance
  const pillScale = interpolate(t, [6.5, 7.3], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pillOpacity = interpolate(t, [6.5, 7.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Word-by-word fade-in start time
  const fadeStart = 7.7;

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_HEIGHT,
        left: 0,
        width: 1080,
        height: SECTION_HEIGHT,
        overflow: "hidden",
      }}
    >
      {/* Dotted net grid background — centered behind pill */}
      <div style={{ opacity: sectionFade }}>
        <DotNetGrid />
      </div>

      {/* 3D Pill — WebGL via ThreeCanvas */}
      <div
        style={{
          position: "absolute",
          left: (1080 - 400) / 2,
          top: SECTION_HEIGHT / 2 - 350,
          width: 400,
          height: 400,
          opacity: pillOpacity,
          transform: `scale(${pillScale})`,
        }}
      >
        <ThreeCanvas
          width={400}
          height={400}
          camera={{ fov: 35, position: [0, 0, 6], near: 0.1, far: 100 }}
          style={{ width: 400, height: 400, background: "transparent" }}
        >
          <color attach="background" args={["#f5f5f0"]} />
          <PillScene rotX={pillRotX} />
        </ThreeCanvas>
      </div>

      {/* Fading word-by-word text */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: SECTION_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 400,
        }}
      >
        {/* Fading word-by-word text */}
        <div
          style={{
            marginTop: 80,
            maxWidth: 800,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          <span
            style={{
              fontFamily:
                "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 1.55,
              letterSpacing: "-0.01em",
            }}
          >
            {TYPED_WORDS.map((word, i) => {
              const wordStart = fadeStart + i * WORD_STAGGER;
              const wordOpacity = interpolate(
                t,
                [wordStart, wordStart + WORD_FADE_DURATION],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              return (
                <span
                  key={i}
                  style={{
                    color: `rgba(30, 30, 30, ${wordOpacity})`,
                  }}
                >
                  {word}{" "}
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Section 3: "here is the truth" + Frame + Brush Line ───

const Section3 = ({ t, frame }) => {
  // Title entrance
  const titleOpacity = interpolate(t, [13.5, 14.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = interpolate(t, [13.5, 14.2], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(t, [13.5, 14.2], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Ornate frame
  const frameOpacity = interpolate(t, [13.8, 14.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameRotation = interpolate(t, [13.5, 16.0], [-6, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameScale = interpolate(t, [13.8, 14.5], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Diagonal stroke — draws on from one end to the other
  const strokeProgress = interpolate(t, [13.5, 15.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Subtitle
  const subOpacity = interpolate(t, [14.5, 15.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(t, [14.5, 15.2], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_HEIGHT * 2,
        left: 0,
        width: 1080,
        height: SECTION_HEIGHT,
        overflow: "hidden",
      }}
    >
      {/* Thick diagonal stroke — draws on like a brush from bottom-left to top-right */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <path
          d={BAND_STROKE_PATH}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={200}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - strokeProgress}
        />
      </svg>

      {/* "here is the" + "truth" — positioned in upper area */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          width: 1080,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale}) translateY(${titleY}px)`,
        }}
      >
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 52,
            fontWeight: 400,
            color: "#333",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          here is the
        </span>
        <span
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
            fontSize: 130,
            fontWeight: 900,
            color: "#111",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          truth
        </span>
      </div>

      {/* Ornate picture frame — sitting on the diagonal band */}
      <div
        style={{
          position: "absolute",
          top: SECTION_HEIGHT / 2 - 100,
          left: (1080 - 360) / 2,
          width: 360,
          height: 360,
          opacity: frameOpacity,
          transform: `rotate(${frameRotation}deg) scale(${frameScale})`,
          filter: "drop-shadow(8px 12px 20px rgba(0,0,0,0.4))",
        }}
      >
        {/* Outer ornate border */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "12px solid #d4d0c8",
            borderRadius: 6,
            boxShadow:
              "inset 0 0 0 3px #b8b4aa, inset 0 0 0 6px #e8e4dc, 0 0 0 3px #b8b4aa",
          }}
        />
        {/* Inner frame border */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "4px solid #c8c4bc",
            borderRadius: 3,
          }}
        />
        {/* Corner flourishes */}
        {[
          { top: -8, left: -8 },
          { top: -8, right: -8 },
          { bottom: -8, left: -8 },
          { bottom: -8, right: -8 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 24,
              height: 24,
              borderRadius: 12,
              background:
                "radial-gradient(circle, #d8d4cc 40%, #b8b4aa 70%, transparent 71%)",
            }}
          />
        ))}
        {/* Edge ornaments — top & bottom center */}
        {[
          { top: -10, left: "50%", transform: "translateX(-50%)" },
          { bottom: -10, left: "50%", transform: "translateX(-50%)" },
          { top: "50%", left: -10, transform: "translateY(-50%)" },
          { top: "50%", right: -10, transform: "translateY(-50%)" },
        ].map((pos, i) => (
          <div
            key={`e-${i}`}
            style={{
              position: "absolute",
              ...pos,
              width: 20,
              height: 20,
              borderRadius: 10,
              background:
                "radial-gradient(circle, #ddd8d0 30%, #c0bcb4 60%, transparent 61%)",
            }}
          />
        ))}
        {/* Inner content area */}
        <div
          style={{
            position: "absolute",
            inset: 28,
            background: "#f8f6f2",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              background:
                "linear-gradient(135deg, #eee 0%, #ddd 50%, #e8e8e8 100%)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Subtitle text — positioned below the frame */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        <div
          style={{
            maxWidth: 680,
            textAlign: "center",
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <span
            style={{
              fontFamily:
                "SF Pro Display, -apple-system, Helvetica Neue, Helvetica, sans-serif",
              fontSize: 32,
              fontWeight: 600,
              color: "#555",
              lineHeight: 1.6,
              letterSpacing: "-0.01em",
              fontStyle: "italic",
            }}
          >
            {SUBTITLE_TEXT}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───

export const ShortcutsMotion = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const scrollY = getScrollY(t);

  // Brush strokes — persistent across sections 1 & 2, fade out before section 3
  const brushFadeIn = interpolate(t, [0, 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brushFadeOut = interpolate(t, [12.0, 13.0], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brushOpacity = brushFadeIn * brushFadeOut;
  const brushRot1 = frame * 0.18;
  const brushRot2 = -frame * 0.14;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5f5f0", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: SECTION_HEIGHT * 3,
          transform: `translateY(${scrollY}px)`,
          willChange: "transform",
        }}
      >
        <Section1 t={t} frame={frame} />
        <Section2 t={t} frame={frame} />
        <Section3 t={t} frame={frame} />
      </div>

      {/* Brush strokes — fixed overlay, visible across sections 1 & 2 */}
      <svg
        width="460"
        height="300"
        viewBox="0 0 460 300"
        style={{
          position: "absolute",
          top: -30,
          right: -60,
          opacity: brushOpacity,
          transform: `rotate(${brushRot1}deg)`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        <path d={BRUSH_PATH_1} fill="#111" />
      </svg>

      <svg
        width="420"
        height="320"
        viewBox="0 0 420 320"
        style={{
          position: "absolute",
          bottom: 80,
          left: -70,
          opacity: brushOpacity,
          transform: `rotate(${brushRot2}deg)`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        <path d={BRUSH_PATH_2} fill="#111" />
      </svg>
    </AbsoluteFill>
  );
};
