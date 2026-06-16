import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from "remotion";

const FORMULAS = [
  "E = mc^2",
  "\\int_0^1 x\\,dx",
  "F = ma",
  "PV = nRT",
  "\\lambda = h/p",
  "\\sin^2\\theta + \\cos^2\\theta = 1",
  "\\Delta G = \\Delta H - T\\Delta S",
  "a^2 + b^2 = c^2",
  "v = u + at",
  "pH = -\\log[H^+]",
  "\\nabla\\cdot E = \\rho/\\varepsilon_0",
  "\\frac{dy}{dx}",
];

const NODES = [
  { label: "Physics", color: "#a78bfa", r: 0.30, speed: 1.0, phase: 0 },
  { label: "Chemistry", color: "#e879f9", r: 0.30, speed: 1.0, phase: 120 },
  { label: "Maths", color: "#60a5fa", r: 0.30, speed: 1.0, phase: 240 },
  { label: "Biology", color: "#34d399", r: 0.44, speed: -0.6, phase: 60 },
];

function Particles({ count = 46 }) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`x${i}`) * width;
        const baseY = random(`y${i}`) * height;
        const drift = interpolate(
          (frame + random(`o${i}`) * durationInFrames) % durationInFrames,
          [0, durationInFrames],
          [0, -120]
        );
        const y = (baseY + drift + height) % height;
        const size = 1 + random(`s${i}`) * 2.5;
        const tw = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin((frame + i * 9) / 18));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 5 === 0 ? "#e879f9" : "#c4b5fd",
              opacity: tw,
              boxShadow: `0 0 ${size * 3}px rgba(196,181,253,0.8)`,
            }}
          />
        );
      })}
    </>
  );
}

function FloatingFormulas() {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  return (
    <>
      {FORMULAS.map((f, i) => {
        const x = random(`fx${i}`) * (width - 120);
        const cycle = durationInFrames;
        const t = (frame + random(`fo${i}`) * cycle) % cycle;
        const y = interpolate(t, [0, cycle], [height + 40, -60]);
        const op = interpolate(t, [0, cycle * 0.15, cycle * 0.85, cycle], [0, 0.5, 0.5, 0]);
        const scale = 0.8 + random(`fs${i}`) * 0.8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `scale(${scale})`,
              opacity: op,
              color: "rgba(196,181,253,0.55)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 22,
              whiteSpace: "nowrap",
            }}
          >
            {`{ ${f.replace(/\\\\/g, "")} }`}
          </div>
        );
      })}
    </>
  );
}

function Mesh() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  const a = 25 + 12 * Math.sin(p * Math.PI * 2);
  const b = 75 + 10 * Math.cos(p * Math.PI * 2);
  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(45% 55% at ${a}% 25%, rgba(124,58,237,0.45) 0%, transparent 60%),
          radial-gradient(40% 45% at ${b}% 80%, rgba(232,121,249,0.28) 0%, transparent 60%),
          radial-gradient(60% 60% at 50% 50%, rgba(17,11,28,0) 0%, #0a0710 85%)
        `,
      }}
    />
  );
}

function Orbits() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const base = Math.min(width, height);
  return (
    <>
      {[0.30, 0.44].map((rr, idx) => (
        <svg key={idx} width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <circle
            cx={cx}
            cy={cy}
            r={base * rr}
            fill="none"
            stroke="rgba(167,139,250,0.16)"
            strokeWidth={1}
            strokeDasharray="2 10"
          />
        </svg>
      ))}

      {/* glowing core */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%,-50%)",
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: "radial-gradient(circle, #c084fc 0%, #6d28d9 70%)",
          boxShadow: "0 0 70px 12px rgba(139,92,246,0.7)",
          opacity: 0.5 + 0.2 * Math.sin(frame / 14),
        }}
      />

      {NODES.map((n, i) => {
        const ang = ((n.phase + frame * n.speed * 0.7) * Math.PI) / 180;
        const x = cx + base * n.r * Math.cos(ang);
        const y = cy + base * n.r * Math.sin(ang);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: "translate(-50%,-50%)",
              padding: "7px 16px",
              borderRadius: 999,
              background: "rgba(10,7,16,0.7)",
              border: `1px solid ${n.color}`,
              color: n.color,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              fontSize: 18,
              whiteSpace: "nowrap",
              boxShadow: `0 0 26px -6px ${n.color}`,
              backdropFilter: "blur(4px)",
            }}
          >
            {n.label}
          </div>
        );
      })}
    </>
  );
}

export default function HeroBackdrop() {
  return (
    <AbsoluteFill style={{ background: "#0a0710", overflow: "hidden" }}>
      <Mesh />
      <Particles />
      <Orbits />
      <FloatingFormulas />
    </AbsoluteFill>
  );
}
