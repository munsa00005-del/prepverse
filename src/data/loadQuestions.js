// ───────────────────────────────────────────────────────────────
// Loads the question bank from Supabase at startup and feeds it into
// the (synchronous) store. Falls back to the bundled bank if the
// backend is unconfigured, errors, or returns nothing — so the app
// always has questions to show.
// ───────────────────────────────────────────────────────────────
import { supabase } from "../lib/supabase.js";
import { setBank, BUNDLED_QUESTIONS } from "./store.js";

// Map a DB row (snake/jsonb) onto the in-app question shape.
function fromRow(r) {
  return {
    id: r.id,
    exam: r.exam,
    subject: r.subject,
    chapter: r.chapter,
    topic: r.topic || r.chapter,
    year: r.year,
    difficulty: r.difficulty || "medium",
    type: r.type || "single",
    question: r.question,
    options: r.options ?? undefined,
    answer: r.answer,
    tol: r.tol ?? 0,
    solution: r.solution || "",
    source: r.source || "",
  };
}

// Fetch every question (paged, since Supabase caps rows per request).
async function fetchAll() {
  const pageSize = 1000;
  let from = 0;
  const out = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

// Returns "remote" | "bundled" so the UI can show the data source.
export async function loadQuestions() {
  if (!supabase) {
    setBank(BUNDLED_QUESTIONS);
    return "bundled";
  }
  try {
    const rows = await fetchAll();
    if (rows.length === 0) {
      setBank(BUNDLED_QUESTIONS);
      return "bundled";
    }
    setBank(rows.map(fromRow));
    return "remote";
  } catch (err) {
    console.warn("[PrepVerse] Falling back to bundled questions:", err.message);
    setBank(BUNDLED_QUESTIONS);
    return "bundled";
  }
}
