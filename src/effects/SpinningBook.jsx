/**
 * ============================================================
 * EFFECT: 3D Wireframe Shape Carousel
 * FILE: SpinningBook.tsx
 * COMPOSITION ID: SpinningBook
 * DURATION: 300 frames (10s @ 30fps)
 * RESOLUTION: 1280x720
 * ============================================================
 *
 * PROMPT:
 *
 * Create a modern After Effects-style 3D wireframe carousel animation
 * using Three.js in Remotion. Multiple flat geometric panels are
 * arranged radially around a central vertical axis, forming a
 * revolving book or fan-like structure. The entire structure rotates
 * continuously.
 *
 * Shape configuration:
 *   The carousel is made of N flat geometric panels (default: 5).
 *   Each panel can be any 2D shape:
 *     - Rectangle / square (PlaneGeometry)
 *     - Circle / disc (CircleGeometry)
 *     - Triangle (custom BufferGeometry with 3 vertices)
 *     - Pentagon, hexagon, or any polygon (CircleGeometry with
 *       low segment count, e.g. args={[radius, 5]} for pentagon)
 *     - Rounded rectangle (ShapeGeometry with a custom THREE.Shape
 *       using moveTo, lineTo, quadraticCurveTo for rounded corners)
 *   The shape is defined once and reused for all panels.
 *   Panel dimensions are configurable via width and height constants.
 *   Panels should be sized to fit comfortably within the frame —
 *   not too large, not too small (roughly 25-40% of frame height).
 *
 * Panel arrangement:
 *   All panels share the same center point (origin 0,0,0).
 *   Each panel is rotated around the Y-axis by an equal angular
 *   offset: angle = (index / totalPanels) * 2 * PI.
 *   Panels stand upright (no X or Z rotation on individual panels).
 *   This creates a radial fan / open-book formation.
 *
 * Wireframe rendering:
 *   Each panel is rendered as a clean wireframe outline only.
 *   Use THREE.EdgesGeometry wrapping the shape geometry to extract
 *   only the outer boundary edges (not internal triangulation lines).
 *   Render edges using <lineSegments> with <lineBasicMaterial>.
 *   Edge color: single accent color (e.g. magenta #c800c8, white,
 *   cyan, gold — any bold color that contrasts with the background).
 *
 * Depth-based opacity:
 *   Each panel has a depth value (0 = front, 1 = back) based on
 *   its index. Front panels have full opacity (1.0). Back panels
 *   fade to ~50% opacity. This creates visual depth hierarchy
 *   as the structure rotates.
 *   Formula: opacity = 1 - depth * 0.5
 *
 * Optional subtle fill:
 *   Each panel can have a near-transparent solid fill (3-7% opacity)
 *   using the same accent color. This gives overlapping panels
 *   visual separation without looking solid.
 *   Use DoubleSide rendering and depthWrite: false to prevent
 *   z-fighting artifacts.
 *
 * Rotation animation:
 *   The entire group rotates continuously around the Y-axis.
 *   Rotation is driven by useCurrentFrame(): rotationY = frame * speed.
 *   Speed should be slow and deliberate (0.01-0.02 rad/frame).
 *   useFrame() from react-three-fiber is FORBIDDEN in Remotion.
 *   A slight fixed X-axis tilt (0.2-0.3 radians) gives a premium
 *   3D perspective, like viewing from slightly above.
 *
 * Camera:
 *   Position: [0, 0.3, 5.5] — centered, slightly above, pulled back.
 *   FOV: 40-45 degrees for a clean, non-distorted perspective.
 *   The object should be centered in the frame with breathing room.
 *
 * Lighting:
 *   Single ambient light at intensity 0.8-1.0.
 *   Wireframe materials (lineBasicMaterial, meshBasicMaterial) are
 *   unlit, so complex lighting setups are unnecessary.
 *   Additional lights only needed if using meshStandardMaterial.
 *
 * Background:
 *   Warm light grey/beige (#eae8e3) for a premium editorial feel.
 *   Can also use dark backgrounds (#0a0a0a) for a different mood.
 *
 * Technical requirements:
 *   Must use @remotion/three ThreeCanvas with width and height props.
 *   All geometries should be created in useMemo() to avoid
 *   re-creation on every frame.
 *   All animation must be driven by useCurrentFrame().
 *   No CSS animations, no useFrame(), no self-animating shaders.
 *
 * Customization examples:
 *
 *   Circles:
 *     Replace PlaneGeometry with CircleGeometry:
 *     new THREE.CircleGeometry(1.2, 64)
 *
 *   Triangles:
 *     Use CircleGeometry with 3 segments:
 *     new THREE.CircleGeometry(1.5, 3)
 *
 *   Hexagons:
 *     Use CircleGeometry with 6 segments:
 *     new THREE.CircleGeometry(1.2, 6)
 *
 *   Rounded rectangles:
 *     Create a THREE.Shape with rounded corners:
 *     const shape = new THREE.Shape();
 *     shape.moveTo(-w/2 + r, -h/2);
 *     shape.lineTo(w/2 - r, -h/2);
 *     shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
 *     // ... continue for all corners
 *     Then use new THREE.ShapeGeometry(shape)
 *
 *   Stars:
 *     Generate vertices programmatically alternating between
 *     inner and outer radius, then create BufferGeometry.
 *
 * Overall feel:
 *   Minimal, geometric, premium motion design.
 *   Clean wireframe aesthetic — no textures, no heavy shading.
 *   Slow, hypnotic rotation. Calm and intentional.
 *
 * ============================================================
 */

import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import React, { useMemo } from "react";
import * as THREE from "three";

const NUM_PAGES = 5;
const PAGE_WIDTH = 1.8;
const PAGE_HEIGHT = 2.4;

const Page = ({ angle, depth }) => {
  const edgesGeo = useMemo(() => {
    const plane = new THREE.PlaneGeometry(PAGE_WIDTH, PAGE_HEIGHT);
    return new THREE.EdgesGeometry(plane);
  }, []);

  const opacity = 1 - depth * 0.5;
  const fillOpacity = 0.03 + (1 - depth) * 0.04;

  return (
    <group rotation={[0, angle, 0]}>
      <mesh>
        <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
        <meshBasicMaterial
          color="#d400d4"
          transparent
          opacity={fillOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#c800c8" transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
};

const Scene = () => {
  const frame = useCurrentFrame();
  const rotationY = frame * 0.015;

  const pages = useMemo(() => {
    return Array.from({ length: NUM_PAGES }).map((_, i) => ({
      angle: (i / NUM_PAGES) * Math.PI * 2,
      depth: i / (NUM_PAGES - 1),
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={1.0} />

      <group rotation={[0.25, rotationY, 0]}>
        {pages.map((page, i) => (
          <Page key={i} angle={page.angle} depth={page.depth} />
        ))}
      </group>
    </>
  );
};

export const SpinningBook = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#eae8e3" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0.3, 5.5], fov: 42 }}
      >
        <Scene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
