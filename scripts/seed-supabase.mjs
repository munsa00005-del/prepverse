#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────
// One-time (re-runnable) seed: pushes the local question bank
// (SEED_QUESTIONS + imported.json, normalized exactly as the app does)
// into the Supabase `questions` table.
//
// Uses the SERVICE ROLE key, which bypasses Row-Level Security — so it
// MUST stay secret and is read from the environment, never committed.
//
// Usage:
//   SUPABASE_URL="https://xxxx.supabase.co" \
//   SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
//   node scripts/seed-supabase.mjs
//
// (or put those two in a .env.seed file and run: node --env-file=.env.seed scripts/seed-supabase.mjs)
// ───────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";
import { QUESTIONS } from "../src/data/questions.js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Find them in Supabase → Project Settings → API (use the service_role key, kept secret)."
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Map the in-app question shape onto DB columns.
function toRow(q) {
  return {
    id: q.id,
    exam: q.exam,
    subject: q.subject,
    chapter: q.chapter,
    topic: q.topic ?? null,
    year: q.year ?? null,
    difficulty: q.difficulty ?? "medium",
    type: q.type ?? "single",
    question: q.question,
    options: q.options ?? null,
    answer: q.answer ?? null,
    tol: q.tol ?? 0,
    solution: q.solution ?? null,
    source: q.source ?? null,
  };
}

const rows = QUESTIONS.map(toRow);
console.log(`Seeding ${rows.length} questions…`);

// Upsert in batches (on id) so re-runs update rather than duplicate.
const BATCH = 500;
let done = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const slice = rows.slice(i, i + BATCH);
  const { error } = await supabase.from("questions").upsert(slice, { onConflict: "id" });
  if (error) {
    console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
    process.exit(1);
  }
  done += slice.length;
  console.log(`  …${done}/${rows.length}`);
}

console.log(`✓ Done. ${done} questions upserted into the 'questions' table.`);
