import { lazy, Suspense } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Stack,
  Sparkle,
  CheckCircle,
  BookmarkSimple,
  CaretDown,
  Atom,
  Flask,
  MathOperations,
  Plant,
} from "@phosphor-icons/react";
import TiltCard from "./TiltCard.jsx";
import CountUp from "./CountUp.jsx";
import { examSubjectSummary } from "../data/store.js";
import { questionStats } from "../data/questions.js";
import { YEAR_MIN, YEAR_MAX } from "../data/taxonomy.js";

// Remotion is heavy — split both compositions out of the main bundle.
const RemotionHero = lazy(() => import("./RemotionHero.jsx"));
const InViewRemotion = lazy(() => import("./InViewRemotion.jsx"));

const MARQUEE = [
  "E = mc²", "F = ma", "∫₀¹ x dx", "PV = nRT", "λ = h/p", "sin²θ + cos²θ = 1",
  "ΔG = ΔH − TΔS", "a² + b² = c²", "v = u + at", "pH = −log[H⁺]", "∇·E = ρ/ε₀",
];

const SUBJECT_ICONS = { physics: Atom, chemistry: Flask, maths: MathOperations, biology: Plant };

export default function Hero({ onStart, progress }) {
  const exams = examSubjectSummary();
  const stats = questionStats();
  const headline = "Where previous-year questions become mastery.";

  return (
    <div>
      {/* ───────────────── HERO (full-bleed Remotion backdrop) ───────────────── */}
      <section className="relative min-h-[92dvh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={<div className="w-full h-full skeleton" />}>
            <RemotionHero />
          </Suspense>
        </div>
        {/* contrast scrim */}
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-950 via-ink-950/80 to-ink-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass gradient-border text-[12.5px] text-violet-200 mb-7"
          >
            <Sparkle size={14} weight="fill" className="text-fuchsia-400" />
            Section · Chapter · Topic-wise PYQ practice
          </motion.div>

          <h1 className="font-display font-bold text-[2.6rem] sm:text-6xl lg:text-[5.2rem] tracking-tighter leading-[0.98] max-w-[16ch]">
            {headline.split(" ").map((word, i) => {
              const emphasis = word.startsWith("previous-year");
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block mr-[0.25em] ${emphasis ? "text-gradient-anim" : ""}`}
                >
                  {word}
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 text-violet-100/75 text-base sm:text-lg leading-relaxed max-w-[48ch]"
          >
            JEE Main, Advanced & NEET — every question by chapter and topic, each
            paired with a full worked solution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.5 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => onStart()}
              className="group inline-flex items-center gap-2 px-7 h-[52px] rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[15px] glow-ring active:scale-[0.98] transition-all"
            >
              Start practising
              <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#exams"
              className="inline-flex items-center gap-2 px-6 h-[52px] rounded-full glass gradient-border text-violet-100 font-medium text-[15px] hover:text-white transition-colors"
            >
              <Stack size={18} weight="duotone" />
              Browse the bank
            </a>
          </motion.div>

          {/* stat band */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-14 flex flex-wrap gap-x-10 gap-y-5"
          >
            <Stat>
              <CountUp value={stats.total} suffix="+" className="tabular-nums" />
              <Cap>Verified questions</Cap>
            </Stat>
            <Stat>
              <CountUp value={3} />
              <Cap>Exams covered</Cap>
            </Stat>
            <Stat>
              <span className="tabular-nums">{YEAR_MIN}–{String(YEAR_MAX).slice(2)}</span>
              <Cap>Year range</Cap>
            </Stat>
          </motion.div>
        </div>

        <motion.a
          href="#marquee"
          aria-label="Scroll down"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 1.2 }, y: { repeat: Infinity, duration: 1.8 } }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-violet-300/50 hover:text-violet-200"
        >
          <CaretDown size={26} weight="bold" />
        </motion.a>
      </section>

      {/* ───────────────── FORMULA MARQUEE ───────────────── */}
      <section id="marquee" className="py-6 border-y border-violet-400/10 marquee-mask overflow-hidden">
        <div className="marquee-track gap-4">
          {[...MARQUEE, ...MARQUEE].map((f, i) => (
            <span
              key={i}
              className="shrink-0 px-4 py-2 rounded-full glass border border-violet-400/12 font-mono text-[14px] text-violet-200/80"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* ───────────────── EXAMS (tilt bento) ───────────────── */}
        <section id="exams" className="py-16 lg:py-24">
          <SectionHead
            eyebrow="Three exams, one studio"
            title="Pick your battleground"
            note={`${stats.total} questions ready`}
          />
          <div className="grid md:grid-cols-3 gap-5 mt-10" style={{ perspective: 1200 }}>
            {exams.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} index={i} onStart={onStart} />
            ))}
          </div>
        </section>

        {/* ───────────────── FEATURES + secondary Remotion ───────────────── */}
        <section className="py-16 lg:py-24 grid lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">
              Built for <span className="text-gradient-anim">focused</span> revision
            </h2>
            <p className="text-violet-200/60 max-w-[54ch] mt-4 mb-9 leading-relaxed">
              Drill to a single topic, filter by year and difficulty, then learn
              from the worked solution the instant you commit an answer.
            </p>
            <div className="divide-y divide-violet-400/10">
              <Step n="01" icon={<Stack size={22} weight="duotone" />} title="Navigate by topic"
                body="Exam → subject → chapter → topic, with live counts so you always know what's answerable." />
              <Step n="02" icon={<CheckCircle size={22} weight="duotone" />} title="Answer, then learn"
                body="Commit an answer and the full worked solution unfolds — never just a final key." />
              <Step n="03" icon={<BookmarkSimple size={22} weight="duotone" />} title="Track & bookmark"
                body="Accuracy and bookmarks persist in your browser. No account, no backend." />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative float-slow"
          >
            <div className="absolute -inset-4 bg-fuchsia-500/10 blur-3xl rounded-full" aria-hidden />
            <div className="relative">
              <Suspense fallback={<div className="glass skeleton" style={{ borderRadius: 18, aspectRatio: "16/10" }} />}>
                <InViewRemotion />
              </Suspense>
              <p className="mt-3 text-center text-[12px] text-violet-300/45 font-mono">
                ◍ Remotion composition · live in-browser
              </p>
            </div>
          </motion.div>
        </section>

        {progress.stats.done > 0 && (
          <section className="pb-20">
            <div className="glass gradient-border rounded-[var(--radius-card)] p-6 flex flex-wrap items-center gap-x-10 gap-y-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-violet-300/60">Your run so far</span>
              <span className="font-mono text-violet-100">{progress.stats.done} solved</span>
              <span className="font-mono text-mint-400">{progress.stats.accuracy}% accuracy</span>
              <span className="font-mono text-fuchsia-400">{progress.stats.bookmarks} bookmarked</span>
              <button onClick={() => onStart()} className="ml-auto inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-violet-200 hover:text-white">
                Resume <ArrowRight size={15} weight="bold" />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ children }) {
  return <div className="font-display font-bold text-3xl md:text-4xl text-violet-50">{children}</div>;
}
function Cap({ children }) {
  return <div className="text-[12px] font-sans font-normal text-violet-300/60 mt-1">{children}</div>;
}

function SectionHead({ eyebrow, title, note }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-violet-300/55 mb-3">{eyebrow}</div>
        <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">{title}</h2>
      </div>
      {note && <span className="text-[13px] text-violet-300/55 font-mono hidden sm:block">{note}</span>}
    </div>
  );
}

const ACCENT = {
  violet: "from-violet-500/18 to-transparent",
  fuchsia: "from-fuchsia-400/18 to-transparent",
  mint: "from-mint-400/14 to-transparent",
};

function ExamCard({ exam, index, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard
        onClick={() => onStart({ exam: exam.id, subject: exam.subjects[0], chapter: null, topic: null })}
        className="h-full cursor-pointer"
      >
        <div className={`h-full glass gradient-border rounded-[var(--radius-card)] p-6 bg-gradient-to-b ${ACCENT[exam.accent]} transition-shadow hover:shadow-[0_30px_70px_-32px_rgba(124,58,237,0.8)]`}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-xl text-violet-50">{exam.name}</h3>
            <span className="text-[12px] font-mono px-2 py-1 rounded-full bg-ink-950/60 border border-violet-400/15">
              {exam.total} Q
            </span>
          </div>
          <p className="text-[13.5px] text-violet-200/60 mt-1.5">{exam.blurb}</p>

          <div className="mt-6 space-y-2">
            {exam.subjectCounts.map((s) => {
              const Icon = SUBJECT_ICONS[s.id] || Atom;
              const pct = exam.total ? Math.round((s.count / exam.total) * 100) : 0;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <Icon size={16} weight="duotone" className="text-violet-300/80 shrink-0" />
                  <span className="text-[13px] text-violet-200/85 w-24 shrink-0">{s.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-ink-900/70 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[11.5px] font-mono text-violet-300/55 w-6 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center gap-1.5 text-[13.5px] font-medium text-violet-200">
            Enter studio <ArrowRight size={15} weight="bold" />
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

function Step({ n, icon, title, body }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-[auto_auto_1fr] items-start gap-4 sm:gap-6 py-6"
    >
      <span className="font-mono text-violet-400/50 text-sm pt-1">{n}</span>
      <span className="grid place-items-center w-11 h-11 rounded-[12px] glass gradient-border text-violet-300">{icon}</span>
      <div>
        <h3 className="font-display font-semibold text-lg text-violet-50">{title}</h3>
        <p className="text-violet-200/60 text-[14.5px] mt-1 max-w-[58ch] leading-relaxed">{body}</p>
      </div>
    </motion.div>
  );
}
