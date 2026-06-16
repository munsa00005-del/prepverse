import { useEffect, useRef } from "react";
import { Player } from "@remotion/player";
import HeroBackdrop from "../remotion/HeroBackdrop.jsx";

// Full-bleed animated Remotion backdrop that fills the hero section.
export default function RemotionHero() {
  const ref = useRef(null);

  // `autoPlay` alone is silently blocked by the browser's autoplay policy in
  // many cases, so the backdrop sits frozen on frame 0. Kick playback off
  // explicitly once the Player has mounted, and retry on the first user
  // interaction as a fallback for stricter policies.
  useEffect(() => {
    const player = ref.current;
    if (!player) return;

    const start = () => {
      try {
        if (!player.isPlaying()) player.play();
      } catch {
        /* play() may reject before the player is ready — the listeners retry */
      }
    };

    start();
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  return (
    <Player
      ref={ref}
      component={HeroBackdrop}
      durationInFrames={600}
      fps={30}
      compositionWidth={1280}
      compositionHeight={720}
      style={{ width: "100%", height: "100%" }}
      autoPlay
      loop
      controls={false}
    />
  );
}
