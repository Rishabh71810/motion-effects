import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import React, { useMemo } from "react";
import * as THREE from "three";

const NUM_PAGES = 5;
const PAGE_WIDTH = 1.8;
const PAGE_HEIGHT = 2.4;

const Page: React.FC<{
  angle: number;
  depth: number; // 0 = front, 1 = back — for line weight
}> = ({ angle, depth }) => {
  const edgesGeo = useMemo(() => {
    const plane = new THREE.PlaneGeometry(PAGE_WIDTH, PAGE_HEIGHT);
    return new THREE.EdgesGeometry(plane);
  }, []);

  // Front pages: bold magenta. Back pages: lighter/thinner
  const opacity = 1 - depth * 0.5;
  const fillOpacity = 0.03 + (1 - depth) * 0.04;

  return (
    <group rotation={[0, angle, 0]}>
      {/* Very subtle fill — gives depth when pages overlap */}
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

      {/* Edge outline */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#c800c8" transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
};


const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow continuous Y-axis rotation
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

      {/* Slight tilt for 3D perspective — like looking slightly down */}
      <group rotation={[0.25, rotationY, 0]}>
        {pages.map((page, i) => (
          <Page key={i} angle={page.angle} depth={page.depth} />
        ))}
      </group>
    </>
  );
};

export const SpinningBook: React.FC = () => {
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
