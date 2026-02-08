import { Series } from "remotion";
import React from "react";
import { HeyEveryone } from "./HeyEveryone";
import { CardCarousel } from "./CardCarousel";

/**
 * Combined composition:
 * Phase 1 — "Hey everyone, we're finally back" text pop animation
 * Phase 2 — Card carousel with typing + fast vertical scroll
 */
export const HeyEveryoneCombined: React.FC = () => {
  return (
    <Series>
      {/* Phase 1: Hey everyone (4s = 120 frames) */}
      <Series.Sequence durationInFrames={120}>
        <HeyEveryone />
      </Series.Sequence>

      {/* Phase 2: Card carousel (7s = 210 frames) */}
      <Series.Sequence durationInFrames={210}>
        <CardCarousel />
      </Series.Sequence>
    </Series>
  );
};
