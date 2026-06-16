import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

// Counts from 0 → value once, when scrolled into view.
export default function CountUp({ value, duration = 1200, suffix = "", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {n}
      {suffix}
    </span>
  );
}
