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

  // Same autoplay handling as the hero backdrop: retry play() briefly after
  // mount (it can no-op before the Player is ready) and fall back to the
  // first user interaction. numberOfSharedAudioTags={0} removes the audio
  // element so the browser autoplay policy never freezes it on frame 0.
  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    let raf;
    let tries = 0;

    const start = () => {
      try {
        if (!player.isPlaying()) player.play();
      } catch {
        /* retried below */
      }
    };
    const kick = () => {
      start();
      tries += 1;
      if (tries < 30 && !player.isPlaying()) raf = requestAnimationFrame(kick);
    };
    kick();

    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
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
      numberOfSharedAudioTags={0}
    />
  );
}
