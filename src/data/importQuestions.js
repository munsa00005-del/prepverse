// ───────────────────────────────────────────────────────────────
// IMPORT PIPELINE for real previous-year questions.
//
// Drop your data into `imported.json` (an array of objects) and it is
// normalized, validated, and merged into the question bank at build time.
// The importer is deliberately TOLERANT: it accepts a range of common
// field names and value shapes, maps loose chapter names onto the official
// syllabus, and SKIPS rows it cannot trust (logging why in dev) rather than
// letting one bad row break the app.
//
// See IMPORT.md for the full field contract and examples.
// ───────────────────────────────────────────────────────────────

import { CHAPTERS } from "./taxonomy.js";

const isDev = import.meta.env?.DEV;

// ── Value vocabularies ─────────────────────────────────────────
const EXAM_ALIASES = {
  "jee main": "jee-main", "jeemain": "jee-main", "jee-main": "jee-main",
  "jee": "jee-main", "main": "jee-main", "jee mains": "jee-main",
  "jee advanced": "jee-advanced", "jee-advanced": "jee-advanced",
  "jeeadvanced": "jee-advanced", "advanced": "jee-advanced", "adv": "jee-advanced",
  "iit jee": "jee-advanced", "neet": "neet", "neet ug": "neet", "aipmt": "neet",
};

const SUBJECT_ALIASES = {
  physics: "physics", phy: "physics", p: "physics",
  chemistry: "chemistry", chem: "chemistry", c: "chemistry",
  maths: "maths", math: "maths", mathematics: "maths", m: "maths",
  biology: "biology", bio: "biology", b: "biology",
};

const DIFFICULTY_ALIASES = {
  easy: "easy", e: "easy", low: "easy", "1": "easy",
  medium: "medium", med: "medium", moderate: "medium", m: "medium", "2": "medium",
  hard: "hard", h: "hard", difficult: "hard", tough: "hard", high: "hard", "3": "hard",
};

// First non-null value among several candidate keys (case-insensitive).
function pick(row, keys) {
  for (const k of keys) {
    for (const actual of Object.keys(row)) {
      if (actual.toLowerCase().trim() === k && row[actual] != null && row[actual] !== "") {
        return row[actual];
      }
    }
  }
  return undefined;
}

const norm = (v) => String(v ?? "").toLowerCase().trim();
const slug = (v) => norm(v).replace(/[^a-z0-9]+/g, "");

// Map any loose chapter string onto the official taxonomy chapter for a
// subject: exact → case-insensitive → best token-overlap match.
function resolveChapter(rawChapter, subject) {
  const syllabus = CHAPTERS[subject] || [];
  if (!rawChapter) return null;
  const raw = String(rawChapter).trim();

  const exact = syllabus.find((c) => c === raw);
  if (exact) return exact;

  const ci = syllabus.find((c) => slug(c) === slug(raw));
  if (ci) return ci;

  // token-overlap: pick the syllabus chapter sharing the most words.
  const rawTokens = new Set(norm(raw).split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  let best = null;
  let bestScore = 0;
  for (const c of syllabus) {
    const cTokens = norm(c).split(/[^a-z0-9]+/).filter((w) => w.length > 2);
    const score = cTokens.reduce((n, w) => n + (rawTokens.has(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return bestScore > 0 ? best : null;
}

// Resolve the correct answer for a single-choice question into a 0-based
// index, supporting: 0-based index, 1-based index, a letter (A–D), or the
// full option text.
function resolveSingleAnswer(row, options) {
  // explicit 0-based index wins
  const idx0 = pick(row, ["answer", "answerindex", "correctindex", "ans"]);
  const letter = pick(row, ["correct", "correctoption", "answeroption", "key", "correctanswer"]);
  const text = pick(row, ["answertext", "correcttext"]);

  // letter A/B/C/D
  if (typeof letter === "string" && /^[a-z]$/i.test(letter.trim())) {
    const i = letter.trim().toUpperCase().charCodeAt(0) - 65;
    if (i >= 0 && i < options.length) return i;
  }
  // full option text
  if (text != null) {
    const i = options.findIndex((o) => norm(o) === norm(text));
    if (i >= 0) return i;
  }
  // numeric index — treat in [0, len) as 0-based, otherwise try 1-based
  for (const cand of [idx0, letter]) {
    if (cand != null && cand !== "" && !isNaN(Number(cand))) {
      const n = Number(cand);
      if (Number.isInteger(n)) {
        if (n >= 0 && n < options.length) return n;
        if (n >= 1 && n <= options.length) return n - 1;
      }
    }
  }
  // last resort: option text given in the `answer` field
  if (idx0 != null) {
    const i = options.findIndex((o) => norm(o) === norm(idx0));
    if (i >= 0) return i;
  }
  return null;
}

function resolveOptions(row) {
  const arr = pick(row, ["options", "choices", "opts"]);
  if (Array.isArray(arr)) return arr.map((o) => String(o));
  if (typeof arr === "string" && arr.includes("|")) {
    return arr.split("|").map((o) => o.trim()).filter(Boolean);
  }
  // optionA / optionB ... or a/b/c/d columns
  const lettered = ["a", "b", "c", "d", "e"]
    .map((L) => pick(row, [`option${L}`, `opt${L}`, L]))
    .filter((v) => v != null && v !== "");
  return lettered.length >= 2 ? lettered.map((o) => String(o)) : [];
}

// ── Public API ─────────────────────────────────────────────────
// Normalize a raw array (parsed from JSON/CSV) into validated question
// objects matching the app schema. Invalid rows are dropped, not patched.
export function normalizeQuestions(rawRows, { idPrefix = "imp" } = {}) {
  if (!Array.isArray(rawRows)) {
    if (isDev) console.warn("[import] expected an array of questions, got", typeof rawRows);
    return [];
  }

  const out = [];
  const seenIds = new Set();
  const problems = [];

  rawRows.forEach((row, i) => {
    const reject = (why) => problems.push({ i, why, row });
    if (!row || typeof row !== "object") return reject("row is not an object");

    const exam = EXAM_ALIASES[norm(pick(row, ["exam", "test", "paper"]))];
    const subject = SUBJECT_ALIASES[norm(pick(row, ["subject", "subj"]))];
    const question = pick(row, ["question", "questiontext", "q", "statement", "ques"]);

    if (!exam) return reject(`unknown exam "${pick(row, ["exam", "test", "paper"])}"`);
    if (!subject) return reject(`unknown subject "${pick(row, ["subject", "subj"])}"`);
    if (!question) return reject("missing question text");

    const chapter = resolveChapter(pick(row, ["chapter", "unit", "topic_chapter"]), subject);
    if (!chapter) {
      return reject(`chapter "${pick(row, ["chapter", "unit"])}" not in ${subject} syllabus`);
    }

    const topic = pick(row, ["topic", "subtopic", "concept"]) || chapter;

    const yearRaw = pick(row, ["year", "yr", "session"]);
    const year = parseInt(String(yearRaw).replace(/[^0-9]/g, ""), 10);
    if (!year || year < 1990 || year > 2100) return reject(`invalid year "${yearRaw}"`);

    const difficulty = DIFFICULTY_ALIASES[norm(pick(row, ["difficulty", "level", "diff"]))] || "medium";
    const solution = pick(row, ["solution", "explanation", "answerexplanation", "sol"]) || "";
    const source = pick(row, ["source", "ref"]) || `${exam.toUpperCase()} ${year}`;

    // type: explicit, else inferred from presence of options
    const typeRaw = norm(pick(row, ["type", "qtype", "kind"]));
    const options = resolveOptions(row);
    const isNumerical =
      typeRaw === "numerical" || typeRaw === "integer" || typeRaw === "numeric" ||
      (typeRaw === "" && options.length === 0);

    let q;
    if (isNumerical) {
      const ansRaw = pick(row, ["answer", "ans", "correctanswer", "value"]);
      const answer = Number(ansRaw);
      if (ansRaw == null || isNaN(answer)) return reject(`numerical answer "${ansRaw}" not a number`);
      const tolRaw = pick(row, ["tol", "tolerance", "margin"]);
      const tol = tolRaw != null && tolRaw !== "" && !isNaN(Number(tolRaw)) ? Number(tolRaw) : 0;
      q = { type: "numerical", answer, tol };
    } else {
      if (options.length < 2) return reject("single-choice question needs ≥2 options");
      const answer = resolveSingleAnswer(row, options);
      if (answer == null) return reject("could not resolve the correct option");
      q = { type: "single", options, answer };
    }

    // stable, unique id
    let id = String(pick(row, ["id", "qid", "uid"]) || `${idPrefix}-${exam}-${year}-${i + 1}`);
    while (seenIds.has(id)) id = `${id}-x`;
    seenIds.add(id);

    out.push({
      id, exam, subject, chapter, topic, year, difficulty,
      source, question: String(question), solution: String(solution),
      ...q,
    });
  });

  if (isDev && problems.length) {
    console.warn(
      `[import] accepted ${out.length}/${rawRows.length} rows; skipped ${problems.length}.`,
      problems.slice(0, 20)
    );
  }
  return out;
}
