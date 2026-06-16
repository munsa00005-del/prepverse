#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────
// Convert a CSV export of questions into the JSON shape expected by
// src/data/imported.json. Field names are normalized by the importer,
// so headers like "Exam", "Option A", "Correct" all work.
//
//   node scripts/csv-to-questions.mjs questions.csv > src/data/imported.json
//
// Notes:
//  - First row must be the header.
//  - Quoted fields ("...") may contain commas, newlines, and "" escapes.
//  - An `options` column may be a pipe list:  $10$ | $20$ | $30$ | $40$
// ───────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/csv-to-questions.mjs <file.csv> > src/data/imported.json");
  process.exit(1);
}

// RFC-4180-ish CSV parser (handles quotes, escaped quotes, embedded newlines).
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n") {
      row.push(field); field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

const rows = parseCSV(readFileSync(file, "utf8"));
if (rows.length < 2) {
  console.error("CSV needs a header row plus at least one data row.");
  process.exit(1);
}

const headers = rows[0].map((h) => h.trim());
const objects = rows.slice(1).map((cells) => {
  const obj = {};
  headers.forEach((h, i) => {
    let v = (cells[i] ?? "").trim();
    if (v === "") return;
    // a pipe-delimited options column becomes an array
    if (/^(options|choices|opts)$/i.test(h) && v.includes("|")) {
      obj[h] = v.split("|").map((s) => s.trim()).filter(Boolean);
    } else {
      obj[h] = v;
    }
  });
  return obj;
});

process.stdout.write(JSON.stringify(objects, null, 2) + "\n");
console.error(`Converted ${objects.length} rows from ${file}.`);
