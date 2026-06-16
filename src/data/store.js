import { QUESTIONS } from "./questions.js";
import { EXAMS, CHAPTERS, SUBJECTS } from "./taxonomy.js";

// The bundled bank is the offline fallback / initial value. At startup
// loadQuestions() may replace `bank` with rows fetched from Supabase via
// setBank(); all selectors below read the current `bank`, so the swap is
// transparent to callers and they stay synchronous.
export const BUNDLED_QUESTIONS = QUESTIONS;
let bank = QUESTIONS;

export function setBank(next) {
  if (Array.isArray(next) && next.length) bank = next;
}

export function getBank() {
  return bank;
}

// Count questions matching a partial selection.
export function countFor({ exam, subject, chapter, topic } = {}) {
  return bank.filter(
    (q) =>
      (!exam || q.exam === exam) &&
      (!subject || q.subject === subject) &&
      (!chapter || q.chapter === chapter) &&
      (!topic || q.topic === topic)
  ).length;
}

// Chapters for an exam+subject, each with its question count and derived topics.
export function chaptersFor(exam, subject) {
  const syllabus = CHAPTERS[subject] || [];
  return syllabus.map((chapter) => {
    const qs = bank.filter(
      (q) => q.exam === exam && q.subject === subject && q.chapter === chapter
    );
    const topics = [...new Set(qs.map((q) => q.topic))].map((topic) => ({
      name: topic,
      count: qs.filter((q) => q.topic === topic).length,
    }));
    return { name: chapter, count: qs.length, topics };
  });
}

// Years that actually have questions for a selection (for the year filter).
export function availableYears(exam, subject) {
  const set = new Set(
    bank.filter(
      (q) => (!exam || q.exam === exam) && (!subject || q.subject === subject)
    ).map((q) => q.year)
  );
  return [...set].sort((a, b) => b - a);
}

// Apply the full filter set and return the matching questions.
export function selectQuestions({
  exam,
  subject,
  chapter,
  topic,
  years, // array of numbers or null
  difficulties, // array or null
  search, // string
} = {}) {
  return bank.filter((q) => {
    if (exam && q.exam !== exam) return false;
    if (subject && q.subject !== subject) return false;
    if (chapter && q.chapter !== chapter) return false;
    if (topic && q.topic !== topic) return false;
    if (years && years.length && !years.includes(q.year)) return false;
    if (difficulties && difficulties.length && !difficulties.includes(q.difficulty))
      return false;
    if (search && search.trim()) {
      const hay = `${q.question} ${q.chapter} ${q.topic} ${q.source}`.toLowerCase();
      if (!hay.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });
}

export function examSubjectSummary() {
  return EXAMS.map((exam) => ({
    ...exam,
    total: countFor({ exam: exam.id }),
    subjectCounts: exam.subjects.map((s) => ({
      id: s,
      name: SUBJECTS[s].name,
      icon: SUBJECTS[s].icon,
      count: countFor({ exam: exam.id, subject: s }),
    })),
  }));
}
