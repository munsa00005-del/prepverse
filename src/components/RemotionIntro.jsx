import { Player } from "@remotion/player";
import IntroComposition from "../remotion/IntroComposition.jsx";

// Embeds the Remotion composition live in the page (no video file rendered —
// @remotion/player runs the same composition in-browser, looping).
export default function RemotionIntro() {
  return (
    <div
      className="glass overflow-hidden"
      style={{ borderRadius: "var(--radius-card)", aspectRatio: "16 / 10" }}
    >
      <Player
        component={IntroComposition}
        durationInFrames={150}
        fps={30}
        compositionWidth={800}
        compositionHeight={500}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        loop
        controls={false}
      />
    </div>
  );
}
