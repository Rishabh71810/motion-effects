import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FloatingFocus } from "./FloatingFocus";
import { LineFan } from "./LineFan";
import { ScaleReveal } from "./ScaleReveal";
import { SpinningBook } from "./SpinningBook";
import { StackGrowth } from "./StackGrowth";
import { TypoSwap } from "./TypoSwap";
import { TagReveal } from "./TagReveal";
import { MeetYourNew } from "./MeetYourNew";
import { MeetYourNewCombined } from "./MeetYourNewCombined";
import { HeyEveryone } from "./HeyEveryone";
import { CardCarousel } from "./CardCarousel";
import { HeyEveryoneCombined } from "./HeyEveryoneCombined";
import { KineticTypography } from "./KineticTypography";
import { Kinetic3DTypography } from "./Kinetic3DTypography";
import { ShortcutsMotion } from "./ShortcutsMotion";
import { PillExpand } from "./PillExpand";
import { SuccessQuote } from "./SuccessQuote";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SuccessQuote"
        component={SuccessQuote}
        durationInFrames={390}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="MeetYourNewCombined"
        component={MeetYourNewCombined}
        durationInFrames={1110}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="HeyEveryoneCombined"
        component={HeyEveryoneCombined}
        durationInFrames={330}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="HeyEveryone"
        component={HeyEveryone}
        durationInFrames={120}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="CardCarousel"
        component={CardCarousel}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="PillExpand"
        component={PillExpand}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ShortcutsMotion"
        component={ShortcutsMotion}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Kinetic3DTypography"
        component={Kinetic3DTypography}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="KineticTypography"
        component={KineticTypography}
        durationInFrames={270}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="MeetYourNew"
        component={MeetYourNew}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="FloatingFocus"
        component={FloatingFocus}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="LineFan"
        component={LineFan}
        durationInFrames={390}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ScaleReveal"
        component={ScaleReveal}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="SpinningBook"
        component={SpinningBook}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="StackGrowth"
        component={StackGrowth}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="TypoSwap"
        component={TypoSwap}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="TagReveal"
        component={TagReveal}
        durationInFrames={480}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
