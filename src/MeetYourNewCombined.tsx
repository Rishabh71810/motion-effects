import { Series } from "remotion";
import React from "react";
import { MeetYourNew } from "./MeetYourNew";
import { MeetYourNewZoom } from "./MeetYourNewZoom";
import { MeetYourNewPointers } from "./MeetYourNewPointers";
import { MeetYourNewTyping } from "./MeetYourNewTyping";
import { MeetYourNewCreating } from "./MeetYourNewCreating";
import { MeetYourNewStyles } from "./MeetYourNewStyles";

/**
 * Combined composition:
 * Phase 1 — word cycling with heartbeat button
 * Phase 2 — zoom into button, text disperses, cursor clicks
 * Phase 3 — cascading play-button pointers scale in one by one
 * Phase 4 — input box with typing animation
 * Phase 5 — 3D "Creating..." button rotating with depth
 * Phase 6 — "Select a style" card with template grid
 */
export const MeetYourNewCombined: React.FC = () => {
  return (
    <Series>
      {/* Phase 1: word cycling (8s = 240 frames) */}
      <Series.Sequence durationInFrames={240}>
        <MeetYourNew />
      </Series.Sequence>

      {/* Phase 2: zoom + cursor click (4s = 120 frames) */}
      <Series.Sequence durationInFrames={120}>
        <MeetYourNewZoom />
      </Series.Sequence>

      {/* Phase 3: cascading pointers (5s = 150 frames) */}
      <Series.Sequence durationInFrames={150}>
        <MeetYourNewPointers />
      </Series.Sequence>

      {/* Phase 4: input box with typing (7s = 210 frames) */}
      <Series.Sequence durationInFrames={210}>
        <MeetYourNewTyping />
      </Series.Sequence>

      {/* Phase 5: 3D "Creating..." button with 360 spin (7s = 210 frames) */}
      <Series.Sequence durationInFrames={210}>
        <MeetYourNewCreating />
      </Series.Sequence>

      {/* Phase 6: Style selection card with template grid (6s = 180 frames) */}
      <Series.Sequence durationInFrames={180}>
        <MeetYourNewStyles />
      </Series.Sequence>
    </Series>
  );
};
