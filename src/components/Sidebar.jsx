import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretRight, CaretDown, Circle } from "@phosphor-icons/react";
import { EXAMS, SUBJECTS, examById } from "../data/taxonomy.js";
import { chaptersFor } from "../data/store.js";

export default function Sidebar({ selection, setSelection, onPick }) {
  const exam = examById(selection.exam);

  return (
    <div className="flex flex-col gap-6">
      {/* Exam switch */}
      <div>
        <Label>Exam</Label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[14px] glass">
          {EXAMS.map((e) => (
            <button
              key={e.id}
              onClick={() =>
                setSelection({
                  exam: e.id,
                  subject: e.subjects[0],
                  chapter: null,
                  topic: null,
                })
              }
              className={`relative h-9 rounded-[10px] text-[12.5px] font-medium transition-colors ${
                selection.exam === e.id ? "text-white" : "text-violet-300/70 hover:text-violet-100"
              }`}
            >
              {selection.exam === e.id && (
                <motion.span
                  layoutId="exam-tab"
                  className="absolute inset-0 rounded-[10px] bg-violet-600"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              )}
              <span className="relative z-10">{e.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subject switch */}
      <div>
        <Label>Subject</Label>
        <div className="flex flex-wrap gap-1.5">
          {exam.subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSelection({ ...selection, subject: s, chapter: null, topic: null })}
              className={`px-3.5 h-9 rounded-full text-[13px] font-medium border transition-all active:scale-[0.97] ${
                selection.subject === s
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "glass text-violet-200/80 border-violet-400/15 hover:border-violet-400/40"
              }`}
            >
              {SUBJECTS[s].name}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter / topic tree */}
      <div>
        <Label>Chapters & topics</Label>
        <div className="rounded-[16px] glass p-1.5 max-h-[52vh] overflow-y-auto">
          <TreeRow
            label="All chapters"
            active={!selection.chapter}
            count={null}
            onClick={() => setSelection({ ...selection, chapter: null, topic: null })}
            leaf
          />
          {chaptersFor(selection.exam, selection.subject).map((ch) => (
            <ChapterNode
              key={ch.name}
              chapter={ch}
              selection={selection}
              setSelection={setSelection}
              onPick={onPick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChapterNode({ chapter, selection, setSelection, onPick }) {
  const isActiveChapter = selection.chapter === chapter.name;
  const [open, setOpen] = useState(isActiveChapter);
  const empty = chapter.count === 0;

  const toggle = () => {
    setOpen((o) => !o);
    if (!empty) {
      setSelection({ ...selection, chapter: chapter.name, topic: null });
      onPick?.();
    }
  };

  return (
    <div>
      <button
        onClick={toggle}
        disabled={empty}
        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-[10px] text-left transition-colors ${
          isActiveChapter && !selection.topic
            ? "bg-violet-600/25 text-white"
            : empty
            ? "text-violet-300/30 cursor-not-allowed"
            : "text-violet-200/85 hover:bg-violet-400/8"
        }`}
      >
        <span className="shrink-0 text-violet-400/70">
          {chapter.topics.length > 0 ? (
            open ? <CaretDown size={13} weight="bold" /> : <CaretRight size={13} weight="bold" />
          ) : (
            <Circle size={6} weight="fill" className="ml-[3px] mr-[3px]" />
          )}
        </span>
        <span className="flex-1 text-[13px] leading-snug">{chapter.name}</span>
        <span
          className={`shrink-0 text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
            empty ? "text-violet-300/25" : "bg-ink-900/70 text-violet-300/70"
          }`}
        >
          {chapter.count}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && chapter.topics.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden ml-4 border-l border-violet-400/12 pl-1.5 my-0.5"
          >
            {chapter.topics.map((t) => {
              const active = selection.chapter === chapter.name && selection.topic === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelection({ ...selection, chapter: chapter.name, topic: t.name });
                    onPick?.();
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[8px] text-left transition-colors ${
                    active ? "bg-violet-600/30 text-white" : "text-violet-200/65 hover:bg-violet-400/8"
                  }`}
                >
                  <span className="text-[12.5px] leading-snug">{t.name}</span>
                  <span className="shrink-0 text-[10.5px] font-mono text-violet-300/55">{t.count}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TreeRow({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-[10px] text-left text-[13px] font-medium transition-colors ${
        active ? "bg-violet-600/25 text-white" : "text-violet-200/85 hover:bg-violet-400/8"
      }`}
    >
      {label}
    </button>
  );
}

function Label({ children }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.16em] text-violet-300/50 mb-2.5">{children}</div>
  );
}
