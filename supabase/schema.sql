-- ═══════════════════════════════════════════════════════════════════
-- PrepVerse — Supabase schema
-- Paste this whole file into the Supabase SQL editor (Dashboard → SQL →
-- New query → paste → Run). Safe to re-run: everything is IF NOT EXISTS /
-- CREATE OR REPLACE / idempotent policy drops.
-- ═══════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────
create extension if not exists pgcrypto;   -- for gen_random_uuid()

-- ═══════════════════════════════════════════════════════════════════
-- 1. QUESTIONS  — the question bank (public read, admin write)
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.questions (
  id          text primary key,
  exam        text not null,                         -- jee-main | jee-advanced | neet
  subject     text not null,                         -- physics | chemistry | maths | biology
  chapter     text not null,
  topic       text,
  year        int,
  difficulty  text default 'medium',                 -- easy | medium | hard
  type        text not null default 'single',        -- single | numerical
  question    text not null,
  options     jsonb,                                 -- array of strings (single) or null (numerical)
  answer      jsonb,                                 -- index (single) or number (numerical)
  tol         numeric default 0,                     -- numerical tolerance
  solution    text,
  source      text,
  created_at  timestamptz not null default now()
);

create index if not exists questions_exam_subject_idx on public.questions (exam, subject);
create index if not exists questions_chapter_idx       on public.questions (chapter);
create index if not exists questions_year_idx          on public.questions (year);

alter table public.questions enable row level security;

drop policy if exists "questions are public" on public.questions;
create policy "questions are public"
  on public.questions for select
  using (true);

-- Writes are blocked for normal users (no insert/update/delete policy →
-- denied under RLS). The seed script uses the service_role key, which
-- bypasses RLS. To allow specific admins later, add a policy keyed on a
-- profiles.is_admin flag.

-- ═══════════════════════════════════════════════════════════════════
-- 2. PROFILES  — one row per auth user
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: insert own"  on public.profiles;
drop policy if exists "profiles: update own"  on public.profiles;

create policy "profiles: read own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles: insert own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: update own"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════
-- 3. ATTEMPTS  — every answer a user submits (own rows only)
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  question_id  text not null references public.questions (id) on delete cascade,
  is_correct   boolean not null,
  chosen       jsonb,                       -- option index or numerical value entered
  time_taken   int,                         -- seconds, optional
  created_at   timestamptz not null default now()
);

create index if not exists attempts_user_idx     on public.attempts (user_id);
create index if not exists attempts_question_idx on public.attempts (question_id);

alter table public.attempts enable row level security;

drop policy if exists "attempts: read own"   on public.attempts;
drop policy if exists "attempts: insert own" on public.attempts;
drop policy if exists "attempts: delete own" on public.attempts;

create policy "attempts: read own"
  on public.attempts for select using (auth.uid() = user_id);
create policy "attempts: insert own"
  on public.attempts for insert with check (auth.uid() = user_id);
create policy "attempts: delete own"
  on public.attempts for delete using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 4. BOOKMARKS  — saved questions (own rows only)
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.bookmarks (
  user_id      uuid not null references auth.users (id) on delete cascade,
  question_id  text not null references public.questions (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks: read own"   on public.bookmarks;
drop policy if exists "bookmarks: insert own" on public.bookmarks;
drop policy if exists "bookmarks: delete own" on public.bookmarks;

create policy "bookmarks: read own"
  on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks: insert own"
  on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks: delete own"
  on public.bookmarks for delete using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 5. ANALYTICS  — aggregate views (no personal data exposed)
-- ═══════════════════════════════════════════════════════════════════
-- Per-question stats. security_invoker so RLS of the caller applies; we
-- intentionally aggregate so individual users are not identifiable.
create or replace view public.question_analytics
with (security_invoker = true) as
  select
    q.id              as question_id,
    q.exam, q.subject, q.chapter, q.topic, q.difficulty,
    count(a.id)                                              as attempts,
    count(a.id) filter (where a.is_correct)                  as correct,
    case when count(a.id) = 0 then 0
         else round(100.0 * count(a.id) filter (where a.is_correct) / count(a.id), 1)
    end                                                      as accuracy_pct
  from public.questions q
  left join public.attempts a on a.question_id = q.id
  group by q.id;

create or replace view public.chapter_analytics
with (security_invoker = true) as
  select
    exam, subject, chapter,
    sum(attempts)                                            as attempts,
    sum(correct)                                             as correct,
    case when sum(attempts) = 0 then 0
         else round(100.0 * sum(correct) / sum(attempts), 1)
    end                                                      as accuracy_pct
  from public.question_analytics
  group by exam, subject, chapter;

-- ═══════════════════════════════════════════════════════════════════
-- Done. Tables: questions, profiles, attempts, bookmarks.
-- Views: question_analytics, chapter_analytics.
-- ═══════════════════════════════════════════════════════════════════
