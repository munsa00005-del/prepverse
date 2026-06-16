// ───────────────────────────────────────────────────────────────
// Auth context. Wraps the app, tracks the current Supabase session,
// and exposes sign-up / sign-in / sign-out helpers. When the backend
// is not configured, `user` stays null and the helpers no-op — the app
// works fine as an anonymous, offline practice tool.
// ───────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isBackendConfigured } from "./supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isBackendConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signUp = useCallback(async (email, password, displayName) => {
    if (!supabase) return { error: new Error("Backend not configured") };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split("@")[0] } },
    });
    return { error };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { error: new Error("Backend not configured") };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = {
    user,
    loading,
    isBackendConfigured,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
