import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";

const KEY = "prepverse.progress.v1";

function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  return { attempts: {}, bookmarks: {} };
}

// attempts:  { [questionId]: { correct: boolean, chosen: number|string, at: number } }
// bookmarks: { [questionId]: true }
//
// Backing store:
//   • signed out / no backend → localStorage (unchanged behaviour)
//   • signed in               → Supabase (attempts + bookmarks tables),
//                                hydrated on login and written through on
//                                every change. The public API is identical
//                                so callers (App, Studio, QuestionView) are
//                                untouched.
export function useProgress() {
  const { user } = useAuth();
  const [state, setState] = useState(loadLocal);
  const hydratedFor = useRef(null); // user id we've hydrated from the server

  // Persist to localStorage only when signed out (offline cache).
  useEffect(() => {
    if (user) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage may be full / blocked */
    }
  }, [state, user]);

  // On sign-in, pull this user's attempts + bookmarks from Supabase.
  useEffect(() => {
    if (!user || !supabase) {
      if (!user) hydratedFor.current = null;
      return;
    }
    if (hydratedFor.current === user.id) return;
    let cancelled = false;

    (async () => {
      const [{ data: attempts }, { data: bookmarks }] = await Promise.all([
        supabase
          .from("attempts")
          .select("question_id, is_correct, chosen, created_at")
          .order("created_at", { ascending: true }),
        supabase.from("bookmarks").select("question_id"),
      ]);
      if (cancelled) return;

      const a = {};
      for (const row of attempts ?? []) {
        // later rows overwrite earlier → keeps the most recent attempt
        a[row.question_id] = {
          correct: row.is_correct,
          chosen: row.chosen,
          at: new Date(row.created_at).getTime(),
        };
      }
      const b = {};
      for (const row of bookmarks ?? []) b[row.question_id] = true;

      hydratedFor.current = user.id;
      setState({ attempts: a, bookmarks: b });
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const record = useCallback(
    (id, correct, chosen) => {
      setState((s) => ({
        ...s,
        attempts: { ...s.attempts, [id]: { correct, chosen, at: Date.now() } },
      }));
      if (user && supabase) {
        supabase
          .from("attempts")
          .insert({ user_id: user.id, question_id: id, is_correct: correct, chosen })
          .then(({ error }) => {
            if (error) console.warn("[PrepVerse] attempt not saved:", error.message);
          });
      }
    },
    [user]
  );

  const toggleBookmark = useCallback(
    (id) => {
      let added = false;
      setState((s) => {
        const next = { ...s.bookmarks };
        if (next[id]) delete next[id];
        else {
          next[id] = true;
          added = true;
        }
        return { ...s, bookmarks: next };
      });
      if (user && supabase) {
        const op = added
          ? supabase.from("bookmarks").insert({ user_id: user.id, question_id: id })
          : supabase
              .from("bookmarks")
              .delete()
              .match({ user_id: user.id, question_id: id });
        op.then(({ error }) => {
          if (error) console.warn("[PrepVerse] bookmark not saved:", error.message);
        });
      }
    },
    [user]
  );

  const reset = useCallback(() => {
    setState({ attempts: {}, bookmarks: {} });
    if (user && supabase) {
      supabase.from("attempts").delete().eq("user_id", user.id).then(() => {});
      supabase.from("bookmarks").delete().eq("user_id", user.id).then(() => {});
    }
  }, [user]);

  const stats = (() => {
    const all = Object.values(state.attempts);
    const done = all.length;
    const correct = all.filter((a) => a.correct).length;
    return {
      done,
      correct,
      accuracy: done ? Math.round((correct / done) * 100) : 0,
      bookmarks: Object.keys(state.bookmarks).length,
    };
  })();

  return { state, record, toggleBookmark, reset, stats };
}
