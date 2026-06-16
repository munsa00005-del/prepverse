import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  SlidersHorizontal,
  X,
  BookmarkSimple,
  Confetti,
} from "@phosphor-icons/react";
import Sidebar from "./Sidebar.jsx";
import QuestionView from "./QuestionView.jsx";
import { selectQuestions, availableYears } from "../data/store.js";
import { DIFFICULTY, SUBJECTS, examById } from "../data/taxonomy.js";

export default function Studio({ selection, setSelection, progress }) {
  const [search, setSearch] = useState("");
  const [years, setYears] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const baseList = useMemo(
    () => selectQuestions({ ...selection, years, difficulties, search }),
    [selection, years, difficulties, search]
  );

  const list = useMemo(
    () => (onlyBookmarks ? baseList.filter((q) => progress.state.bookmarks[q.id]) : baseList),
    [baseList, onlyBookmarks, progress.state.bookmarks]
  );

  // Keep cursor in range when the list changes.
  useEffect(() => {
    setCursor(0);
  }, [selection, years, difficulties, search, onlyBookmarks]);

  const yearOptions = useMemo(
    () => availableYears(selection.exam, selection.subject),
    [selection.exam, selection.subject]
  );

  const current = list[cursor];
  const exam = examById(selection.exam);

  const go = (delta) => setCursor((c) => Math.min(Math.max(c + delta, 0), list.length - 1));

  // Keyboard navigation: ←/→ to page through questions (ignored while typing).
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list.length]);

  function toggleYear(y) {
    setYears((arr) => (arr.includes(y) ? arr.filter((x) => x !== y) : [...arr, y]));
  }
  function toggleDiff(d) {
    setDifficulties((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));
  }
  function clearFilters() {
    setYears([]);
    setDifficulties([]);
    setSearch("");
    setOnlyBookmarks(false);
  }

  const activeFilterCount = years.length + difficulties.length + (search ? 1 : 0) + (onlyBookmarks ? 1 : 0);

  const crumb = [
    exam.short,
    SUBJECTS[selection.subject].name,
    selection.chapter || "All chapters",
    selection.topic,
  ].filter(Boolean);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
      <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Sidebar selection={selection} setSelection={setSelection} />
          </div>
        </aside>

        {/* ── Main column ── */}
        <section className="min-w-0">
          {/* breadcrumb + controls */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 h-10 rounded-full glass text-[13px] text-violet-100"
            >
              <SlidersHorizontal size={16} weight="bold" /> Topics
            </button>

            <nav className="flex items-center gap-1.5 text-[13px] text-violet-300/70 min-w-0 overflow-x-auto">
              {crumb.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                  {i > 0 && <CaretRight size={11} weight="bold" className="text-violet-400/40" />}
                  <span className={i === crumb.length - 1 ? "text-violet-100 font-medium" : ""}>{c}</span>
                </span>
              ))}
            </nav>
          </div>

          {/* search + filter bar */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlass
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-300/50"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions, topics…"
                className="w-full h-11 pl-10 pr-4 rounded-full glass border border-violet-400/15 text-[14px] text-violet-50 placeholder:text-violet-300/40 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={`inline-flex items-center gap-2 px-4 h-11 rounded-full border text-[13.5px] font-medium transition-colors ${
                filtersOpen || activeFilterCount
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "glass border-violet-400/15 text-violet-100 hover:border-violet-400/40"
              }`}
            >
              <SlidersHorizontal size={16} weight="bold" />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid place-items-center min-w-5 h-5 px-1 rounded-full bg-white/20 text-[11px] font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setOnlyBookmarks((o) => !o)}
              aria-pressed={onlyBookmarks}
              className={`inline-flex items-center gap-2 px-4 h-11 rounded-full border text-[13.5px] font-medium transition-colors ${
                onlyBookmarks
                  ? "bg-fuchsia-400/15 border-fuchsia-400/40 text-fuchsia-300"
                  : "glass border-violet-400/15 text-violet-100 hover:border-violet-400/40"
              }`}
            >
              <BookmarkSimple size={16} weight={onlyBookmarks ? "fill" : "regular"} />
              Saved
            </button>
          </div>

          {/* filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-[var(--radius-card)] p-4 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] uppercase tracking-[0.16em] text-violet-300/60">
                      Difficulty
                    </span>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-[12px] text-violet-300/70 hover:text-violet-100 inline-flex items-center gap-1"
                      >
                        <X size={12} weight="bold" /> Clear all
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(DIFFICULTY).map(([key, d]) => (
                      <FilterPill
                        key={key}
                        active={difficulties.includes(key)}
                        onClick={() => toggleDiff(key)}
                        color={d.color}
                      >
                        {d.label}
                      </FilterPill>
                    ))}
                  </div>

                  <div className="text-[12px] uppercase tracking-[0.16em] text-violet-300/60 mb-3">
                    Year
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {yearOptions.length === 0 && (
                      <span className="text-[13px] text-violet-300/45">No questions for this selection yet.</span>
                    )}
                    {yearOptions.map((y) => (
                      <FilterPill key={y} active={years.includes(y)} onClick={() => toggleYear(y)}>
                        {y}
                      </FilterPill>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* question / empty / nav */}
          {current ? (
            <>
              <div className="relative">
                {/* stacked deck behind the active card for depth */}
                {list.length > 1 && (
                  <>
                    <div className="absolute -z-10 inset-x-4 -bottom-2 h-full rounded-[var(--radius-card)] glass opacity-40" aria-hidden />
                    <div className="absolute -z-20 inset-x-8 -bottom-4 h-full rounded-[var(--radius-card)] glass opacity-20" aria-hidden />
                  </>
                )}
                <QuestionView
                  q={current}
                  index={cursor}
                  total={list.length}
                  attempt={progress.state.attempts[current.id]}
                  bookmarked={!!progress.state.bookmarks[current.id]}
                  onAnswer={progress.record}
                  onBookmark={progress.toggleBookmark}
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-5">
                <NavBtn disabled={cursor === 0} onClick={() => go(-1)} dir="prev">
                  <span className="hidden sm:inline">Previous</span>
                </NavBtn>

                <div className="flex-1 flex items-center gap-3 mx-1">
                  <ProgressRing value={cursor + 1} total={list.length} />
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                        animate={{ width: `${((cursor + 1) / list.length) * 100}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 30 }}
                      />
                    </div>
                    <div className="hidden sm:block text-[11px] text-violet-300/40 font-mono mt-1.5">
                      use ← → keys to navigate
                    </div>
                  </div>
                </div>

                <NavBtn disabled={cursor >= list.length - 1} onClick={() => go(1)} dir="next">
                  <span className="hidden sm:inline">Next</span>
                </NavBtn>
              </div>
            </>
          ) : (
            <EmptyState onlyBookmarks={onlyBookmarks} onClear={clearFilters} />
          )}
        </section>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[88%] max-w-[340px] p-5 overflow-y-auto bg-ink-950 border-r border-violet-400/15 lg:hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="font-display font-semibold text-violet-50">Navigate</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="grid place-items-center w-9 h-9 rounded-full glass text-violet-200"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              <Sidebar
                selection={selection}
                setSelection={setSelection}
                onPick={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressRing({ value, total }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className="relative shrink-0 w-11 h-11 grid place-items-center">
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-ink-800)" strokeWidth="3" />
        <motion.circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 150, damping: 24 }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#e879f9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[10px] font-mono text-violet-200/80 tabular-nums">{value}</span>
    </div>
  );
}

function FilterPill({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-8 rounded-full text-[12.5px] font-medium border transition-all active:scale-[0.96] ${
        active
          ? "bg-violet-600 border-violet-500 text-white"
          : "glass border-violet-400/15 text-violet-200/80 hover:border-violet-400/40"
      }`}
      style={active && color ? { backgroundColor: "transparent", borderColor: color, color } : undefined}
    >
      {children}
    </button>
  );
}

function NavBtn({ disabled, onClick, dir, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-4 h-11 rounded-full glass border border-violet-400/15 text-[13.5px] font-medium text-violet-100 disabled:opacity-35 disabled:cursor-not-allowed hover:border-violet-400/40 active:scale-[0.98] transition-all"
    >
      {dir === "prev" && <CaretLeft size={15} weight="bold" />}
      {children}
      {dir === "next" && <CaretRight size={15} weight="bold" />}
    </button>
  );
}

function EmptyState({ onlyBookmarks, onClear }) {
  return (
    <div className="glass rounded-[var(--radius-card)] p-10 text-center">
      <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-violet-600/15 mb-4">
        {onlyBookmarks ? (
          <BookmarkSimple size={26} weight="duotone" className="text-fuchsia-400" />
        ) : (
          <Confetti size={26} weight="duotone" className="text-violet-300" />
        )}
      </div>
      <h3 className="font-display font-semibold text-lg text-violet-50">
        {onlyBookmarks ? "No bookmarks here yet" : "No questions match these filters"}
      </h3>
      <p className="text-[14px] text-violet-200/60 mt-1.5 max-w-[42ch] mx-auto">
        {onlyBookmarks
          ? "Bookmark questions with the ribbon icon to build a focused revision set."
          : "Try widening the year range or difficulty, or pick a different chapter."}
      </p>
      <button
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 px-5 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-[13.5px] font-semibold active:scale-[0.98] transition-all"
      >
        Reset filters
      </button>
    </div>
  );
}
