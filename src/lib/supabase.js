// ───────────────────────────────────────────────────────────────
// Supabase client. Reads the project URL + public anon key from Vite
// env vars (set in `.env` — see SETUP.md). The anon key is safe to ship
// to the browser: every table is guarded by Row-Level Security.
//
// If the env vars are missing, `supabase` is null and the app runs in
// "offline mode" against the bundled question bank (no auth/progress
// sync). This keeps the static GitHub Pages build working even before
// the backend is configured.
// ───────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendConfigured = Boolean(url && anonKey);

export const supabase = isBackendConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isBackendConfigured && import.meta.env.DEV) {
  console.info(
    "[PrepVerse] Supabase env not set — running in offline mode " +
      "(bundled questions, no login/progress sync). See SETUP.md."
  );
}
