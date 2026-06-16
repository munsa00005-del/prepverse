import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

// 3D pointer-tilt + glare. Pointer values live in motion values (no React
// re-render on move), per the taste-skill physics rule.
export default function TiltCard({ children, className = "", max = 8, onClick }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const sx = useSpring(px, { stiffness: 220, damping: 18 });
  const sy = useSpring(py, { stiffness: 220, damping: 18 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);

  function onMove(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) => `radial-gradient(220px circle at ${x} ${y}, rgba(232,121,249,0.18), transparent 60%)`
          ),
        }}
      />
    </motion.div>
  );
}
