# Importing real previous-year questions

Drop your questions into **`src/data/imported.json`** as a JSON array. On the
next build/dev reload they are normalized, validated, and merged into the bank —
navigation, filters, year ranges, and counts all update automatically.

The importer ([`src/data/importQuestions.js`](src/data/importQuestions.js)) is
**tolerant**: it accepts several field-name spellings, maps loose chapter names
onto the official syllabus, and **skips** any row it can't trust (logging the
reason in the dev console) rather than breaking the app.

---

## Minimum fields

| Field      | Required | Notes |
|------------|----------|-------|
| `exam`     | ✅ | `JEE Main` / `JEE Advanced` / `NEET` (aliases like `jee`, `adv`, `aipmt` work) |
| `subject`  | ✅ | `physics` / `chemistry` / `maths` / `biology` (or `phy`, `chem`, `bio`) |
| `chapter`  | ✅ | Mapped to the official syllabus — close spellings are auto-matched |
| `year`     | ✅ | e.g. `2019` (also reads `2019 Shift 1`) |
| `question` | ✅ | Question text. Math in `$...$` (inline) or `$$...$$` (block), KaTeX syntax |
| `topic`    | ⬜ | Defaults to the chapter if omitted |
| `difficulty` | ⬜ | `easy` / `medium` / `hard` (defaults to `medium`) |
| `solution` | ⬜ | Worked solution (KaTeX supported) |
| `source`   | ⬜ | Defaults to e.g. `JEE MAIN 2019` |
| `id`       | ⬜ | Auto-generated & de-duplicated if omitted |

### For multiple-choice questions
- `options`: array of strings, **or** a `"A | B | C | D"` pipe string, **or**
  `optionA`/`optionB`/`optionC`/`optionD` columns.
- The correct answer — any **one** of:
  - `answer` as a **0-based index** (`0` = first option), or
  - `correct` as a **letter** (`A`/`B`/`C`/`D`), or
  - `answerText` matching one option's text exactly.

### For numerical / integer questions
- Set `type: "numerical"` (or just omit options).
- `answer`: the numeric value. Optional `tol` for accepted tolerance (default `0`).

---

## Example `imported.json`

```json
[
  {
    "exam": "JEE Main",
    "subject": "physics",
    "chapter": "Kinematics",
    "topic": "Projectile Motion",
    "year": 2019,
    "difficulty": "medium",
    "question": "A ball is thrown at $30^\\circ$ ... the range is:",
    "options": ["$10\\,$m", "$20\\,$m", "$17.3\\,$m", "$5\\,$m"],
    "correct": "C",
    "solution": "Range $R=\\dfrac{u^2\\sin 2\\theta}{g}$ ..."
  },
  {
    "exam": "NEET",
    "subject": "chemistry",
    "chapter": "Mole Concept",
    "year": 2021,
    "type": "numerical",
    "question": "Moles in $22\\,$g of CO$_2$ is ___ .",
    "answer": 0.5,
    "tol": 0.01,
    "solution": "$n = 22/44 = 0.5$ mol."
  }
]
```

> `"chapter": "Mole Concept"` auto-maps to the official **"Some Basic Concepts"**
> chapter via token matching — you don't need to match the syllabus wording exactly.

---

## Have a CSV or Excel file instead?

Export it to CSV and convert it to the JSON above with the bundled script:

```bash
node scripts/csv-to-questions.mjs path/to/your-questions.csv > src/data/imported.json
```

The first CSV row must be a header. Column names are matched the same tolerant
way (`Exam`, `Subject`, `Chapter`, `Year`, `Question`, `Option A`…`Option D`,
`Correct`, `Solution`, etc.).

---

## What gets rejected (and why)

A row is **skipped** (with a dev-console warning naming the row index and reason) if:
- the exam or subject can't be recognized,
- the chapter doesn't map to that subject's syllabus,
- the year is missing/implausible,
- a multiple-choice row has fewer than 2 options or no resolvable correct answer,
- a numerical row's answer isn't a number.

Fix the flagged rows and reload — nothing else is affected.
