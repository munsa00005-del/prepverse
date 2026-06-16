import { lazy, Suspense, useEffect, useRef } from "react";
import { useInView } from "motion/react";

// Mounts a Remotion <Player> only while the section is on screen, so the
// secondary composition doesn't burn CPU when scrolled away.
const Player = lazy(() =>
  import("@remotion/player").then((m) => ({ default: m.Player }))
);
const IntroComposition = lazy(() => import("../remotion/IntroComposition.jsx"));

export default function InViewRemotion() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });

  return (
    <div
      ref={ref}
      className="glass gradient-border overflow-hidden"
      style={{ borderRadius: "var(--radius-card)", aspectRatio: "16 / 10" }}
    >
      {inView ? (
        <Suspense fallback={<div className="w-full h-full skeleton" />}>
          <PlayerInner />
        </Suspense>
      ) : (
        <div className="w-full h-full skeleton" />
      )}
    </div>
  );
}

function PlayerInner() {
  const ref = useRef(null);

  // Same autoplay-policy guard as the hero backdrop: nudge the Player to
  // actually start once it has mounted into view.
  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    try {
      if (!player.isPlaying()) player.play();
    } catch {
      /* ignore — autoPlay will still attempt to start it */
    }
  }, []);

  return (
    <Player
      ref={ref}
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
  );
}
