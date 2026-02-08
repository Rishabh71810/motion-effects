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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MeetYourNewCombined"
        component={MeetYourNewCombined}
        durationInFrames={1110}
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
