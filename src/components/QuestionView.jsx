import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  XCircle,
  BookmarkSimple,
  Lightbulb,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import MathText from "./MathText.jsx";
import { DIFFICULTY } from "../data/taxonomy.js";

export default function QuestionView({ q, index, total, attempt, onAnswer, bookmarked, onBookmark }) {
  const [chosen, setChosen] = useState(null); // option index OR typed numeric string
  const [numInput, setNumInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef(null);

  // Reset local state whenever the question changes; rehydrate a prior attempt.
  useEffect(() => {
    if (attempt) {
      setChosen(attempt.chosen);
      setNumInput(q.type === "numerical" ? String(attempt.chosen) : "");
      setRevealed(true);
    } else {
      setChosen(null);
      setNumInput("");
      setRevealed(false);
    }
  }, [q.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const diff = DIFFICULTY[q.difficulty];

  function commitMcq(i) {
    if (revealed) return;
    const correct = i === q.answer;
    setChosen(i);
    setRevealed(true);
    onAnswer(q.id, correct, i);
  }

  function commitNumeric() {
    if (revealed) return;
    const val = parseFloat(numInput);
    if (Number.isNaN(val)) {
      inputRef.current?.focus();
      return;
    }
    const tol = q.tol ?? 0;
    const correct = Math.abs(val - q.answer) <= tol + 1e-9;
    setChosen(val);
    setRevealed(true);
    onAnswer(q.id, correct, val);
  }

  function retry() {
    setChosen(null);
    setNumInput("");
    setRevealed(false);
  }

  const isCorrect =
    revealed &&
    (q.type === "numerical"
      ? Math.abs(parseFloat(numInput) - q.answer) <= (q.tol ?? 0) + 1e-9
      : chosen === q.answer);

  return (
    <motion.article
      key={q.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-[var(--radius-card)] p-5 sm:p-7"
    >
      {/* meta row */}
      <header className="flex items-start justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-mono text-violet-300/60">
            {String(index + 1).padStart(2, "0")} / {total}
          </span>
          <Chip>{q.chapter}</Chip>
          <Chip subtle>{q.topic}</Chip>
          <span
            className="px-2 py-0.5 rounded-full font-medium border"
            style={{ color: diff.color, borderColor: `${diff.color}40` }}
          >
            {diff.label}
          </span>
        </div>
        <button
          onClick={() => onBookmark(q.id)}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          className={`shrink-0 grid place-items-center w-9 h-9 rounded-[10px] border transition-colors ${
            bookmarked
              ? "bg-fuchsia-400/15 border-fuchsia-400/40 text-fuchsia-400"
              : "glass border-violet-400/15 text-violet-300/60 hover:text-violet-200"
          }`}
        >
          <BookmarkSimple size={18} weight={bookmarked ? "fill" : "regular"} />
        </button>
      </header>

      {/* source */}
      <div className="text-[12px] font-mono text-violet-300/45 mb-3">{q.source}</div>

      {/* question */}
      <div className="text-[16.5px] sm:text-[17.5px] leading-relaxed text-violet-50">
        <MathText text={q.question} />
      </div>

      {/* answer area */}
      <div className="mt-6">
        {q.type === "single" ? (
          <div className="grid sm:grid-cols-2 gap-2.5">
            {q.options.map((opt, i) => {
              const state = optionState(i, q.answer, chosen, revealed);
              return (
                <button
                  key={i}
                  onClick={() => commitMcq(i)}
                  disabled={revealed}
                  className={`group relative text-left px-4 py-3.5 rounded-[var(--radius-control)] border transition-all ${OPTION_CLASS[state]} ${
                    revealed ? "cursor-default" : "active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`shrink-0 grid place-items-center w-7 h-7 rounded-full text-[12.5px] font-semibold border ${BADGE_CLASS[state]}`}
                    >
                      {state === "correct" ? (
                        <CheckCircle size={16} weight="fill" />
                      ) : state === "wrong" ? (
                        <XCircle size={16} weight="fill" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="text-[15px] text-violet-50">
                      <MathText text={opt} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={numInput}
              disabled={revealed}
              onChange={(e) => setNumInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitNumeric()}
              placeholder="Type your answer"
              className="w-48 h-12 px-4 rounded-[var(--radius-control)] bg-ink-900/70 border border-violet-400/20 text-violet-50 font-mono text-[16px] placeholder:text-violet-300/35 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-70"
            />
            {!revealed && (
              <button
                onClick={commitNumeric}
                className="h-12 px-6 rounded-[var(--radius-control)] bg-violet-600 hover:bg-violet-500 text-white font-semibold active:scale-[0.98] transition-all"
              >
                Check
              </button>
            )}
          </div>
        )}
      </div>

      {/* verdict + solution */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-5 border-t border-violet-400/12">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div
                  className={`inline-flex items-center gap-2 font-semibold text-[14.5px] ${
                    isCorrect ? "text-mint-400" : "text-rose-400"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle size={20} weight="fill" />
                  ) : (
                    <XCircle size={20} weight="fill" />
                  )}
                  {isCorrect ? "Correct" : "Not quite"}
                  {q.type === "numerical" && (
                    <span className="text-violet-300/60 font-mono font-normal">
                      · answer {q.answer}
                      {q.tol ? ` ± ${q.tol}` : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={retry}
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-violet-300/70 hover:text-violet-100 transition-colors"
                >
                  <ArrowsClockwise size={14} weight="bold" /> Retry
                </button>
              </div>

              <div className="rounded-[var(--radius-control)] bg-violet-600/8 border border-violet-400/15 p-4">
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-violet-300/70 mb-2.5">
                  <Lightbulb size={15} weight="duotone" className="text-amber-400" />
                  Worked solution
                </div>
                <div className="text-[14.5px] leading-relaxed text-violet-100/90">
                  <MathText text={q.solution} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function optionState(i, answer, chosen, revealed) {
  if (!revealed) return "idle";
  if (i === answer) return "correct";
  if (i === chosen) return "wrong";
  return "dim";
}

const OPTION_CLASS = {
  idle: "glass border-violet-400/15 hover:border-violet-400/45 hover:bg-violet-400/6",
  correct: "bg-mint-400/12 border-mint-400/50",
  wrong: "bg-rose-400/12 border-rose-400/50",
  dim: "glass border-violet-400/10 opacity-55",
};

const BADGE_CLASS = {
  idle: "border-violet-400/25 text-violet-200/80 group-hover:border-violet-400/60",
  correct: "border-mint-400/50 text-mint-400",
  wrong: "border-rose-400/50 text-rose-400",
  dim: "border-violet-400/15 text-violet-300/40",
};

function Chip({ children, subtle }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full border ${
        subtle
          ? "border-violet-400/12 text-violet-300/55"
          : "border-violet-400/25 text-violet-200/85 bg-violet-600/10"
      }`}
    >
      {children}
    </span>
  );
}
