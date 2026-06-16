# PrepVerse — Backend setup (Supabase)

The app runs fine with **no backend** (bundled questions, progress saved in
the browser). To enable the **database, login, cross-device progress, and
analytics**, connect a free Supabase project once. ~10 minutes.

---

## 1. Create the Supabase project
1. Go to <https://supabase.com> → sign in → **New project**.
2. Pick a name + a strong database password, choose the free plan, create.
3. Wait ~2 min for it to provision.

## 2. Create the database schema
1. In the project, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Click **Run**. You should see "Success". This creates the `questions`,
   `profiles`, `attempts`, `bookmarks` tables, the analytics views, and all
   Row-Level Security policies.

## 3. Get your API keys
**Project Settings → API**, copy:
- **Project URL** → `https://<ref>.supabase.co`
- **anon public** key (safe for the browser)
- **service_role** key (SECRET — only for seeding, step 5)

## 4. Point the frontend at it
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

## 5. Seed the question bank into the database
Pushes the local bank (`questions.js` + `imported.json`) into the `questions`
table. Re-runnable (upsert on id).
```bash
SUPABASE_URL="https://<ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service_role key>" \
node scripts/seed-supabase.mjs
```

## 6. Configure Auth (email/password)
**Authentication → Providers → Email**: it's on by default.
- For instant testing, **Authentication → Providers → Email → "Confirm email"
  → OFF** so new accounts can log in without an inbox round-trip.
- Leave it ON for production (users confirm via email link).

## 7. Run / build
```bash
npm run dev        # local dev against Supabase
npm run build      # production build (env is baked in)
```

When configured you'll see a **Sign in** button in the top bar; attempts and
bookmarks then sync to your account across devices.

---

## Analytics
Two SQL views aggregate attempts (no personal data):
- `question_analytics` — attempts / correct / accuracy per question
- `chapter_analytics`  — same, rolled up per chapter

Query them in **SQL Editor**, e.g.:
```sql
select * from chapter_analytics order by attempts desc;
```

## Deploying to GitHub Pages
`.env` is git-ignored and baked into the build at `npm run build`, so just
build and push `dist/` as before — the keys travel inside the bundle (the
anon key is meant to be public; RLS protects the data).

## Security model (why the anon key is safe to ship)
- `questions`: world-readable (it's a public question bank); writes blocked.
- `attempts`, `bookmarks`, `profiles`: a user can only read/write **their own**
  rows (`auth.uid() = user_id`), enforced by RLS in the database.
- The `service_role` key (which bypasses RLS) is never in the frontend or git.
