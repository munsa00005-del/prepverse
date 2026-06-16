import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

const NODES = [
  { label: "JEE Main", color: "#a78bfa", angle: -90 },
  { label: "JEE Advanced", color: "#e879f9", angle: 30 },
  { label: "NEET", color: "#34d399", angle: 150 },
];

function Orbit({ progress }) {
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.28;
  return (
    <>
      {/* orbit ring */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(167,139,250,0.18)"
          strokeWidth={1.5}
          strokeDasharray="4 8"
        />
      </svg>
      {NODES.map((n, i) => {
        const a = ((n.angle + progress * 90) * Math.PI) / 180;
        const x = cx + radius * Math.cos(a);
        const y = cy + radius * Math.sin(a);
        const appear = interpolate(progress, [0, 0.4], [0, 1], {
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${appear})`,
              opacity: appear,
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(17,11,28,0.85)",
              border: `1px solid ${n.color}`,
              color: n.color,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              fontSize: 26,
              whiteSpace: "nowrap",
              boxShadow: `0 0 28px -6px ${n.color}`,
            }}
          >
            {n.label}
          </div>
        );
      })}
    </>
  );
}

export default function IntroComposition() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  const titleSpring = spring({ frame: frame - 24, fps, config: { damping: 14, stiffness: 90 } });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  const tagOpacity = interpolate(frame, [54, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // count-up of "questions ready"
  const count = Math.round(
    interpolate(frame, [60, 110], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  const bgShift = interpolate(frame, [0, durationInFrames], [0, 30]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 60% at ${30 + bgShift}% 20%, #2a1f44 0%, #0a0710 60%)`,
        fontFamily: "Space Grotesk, Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* central glow */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(40% 40% at 50% 50%, rgba(139,92,246,0.30) 0%, transparent 70%)",
        }}
      />

      <Orbit progress={progress} />

      {/* central mark */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #a855f7, #6d28d9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 700,
            color: "#fff",
            transform: `scale(${interpolate(
              spring({ frame, fps, config: { damping: 12 } }),
              [0, 1],
              [0.5, 1]
            )})`,
            boxShadow: "0 0 60px -8px rgba(139,92,246,0.8)",
          }}
        >
          P
        </div>
      </AbsoluteFill>

      <Sequence from={24}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 90,
          }}
        >
          <div style={{ textAlign: "center", transform: `translateY(${titleY}px)`, opacity: titleSpring }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                background: "linear-gradient(120deg,#f5f3ff,#c4b5fd 50%,#e879f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PrepVerse
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 26,
                color: "#c4b5fd",
                opacity: tagOpacity,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Previous-year questions, solved · {count}+ verified
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
