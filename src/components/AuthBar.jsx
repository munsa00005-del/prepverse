// ───────────────────────────────────────────────────────────────
// Account control for the top bar: a "Sign in" button that opens a
// modal (login / sign-up), or the user's name + "Sign out" when
// authenticated. Renders nothing when the backend is not configured,
// so the offline build is unaffected.
// ───────────────────────────────────────────────────────────────
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UserCircle, SignOut, X } from "@phosphor-icons/react";
import { useAuth } from "../lib/auth.jsx";

export default function AuthBar() {
  const { user, signOut, isBackendConfigured } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isBackendConfigured) return null;

  if (user) {
    const name = user.user_metadata?.display_name || user.email?.split("@")[0];
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-[13px] text-violet-200">
          <UserCircle size={18} weight="duotone" className="text-violet-400" />
          {name}
        </span>
        <button
          onClick={signOut}
          className="grid place-items-center w-9 h-9 rounded-full glass text-violet-300/80 hover:text-white transition-colors"
          aria-label="Sign out"
          title="Sign out"
        >
          <SignOut size={17} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 h-9 rounded-full glass text-[13px] font-semibold text-violet-100 hover:text-white transition-colors flex items-center gap-1.5"
      >
        <UserCircle size={17} weight="bold" />
        Sign in
      </button>
      <AnimatePresence>{open && <AuthModal onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fn =
      mode === "signin"
        ? signIn(email, password)
        : signUp(email, password, name);
    const { error } = await fn;
    setBusy(false);
    if (error) {
      setMsg({ type: "error", text: error.message });
    } else if (mode === "signup") {
      setMsg({
        type: "ok",
        text: "Account created. If email confirmation is on, check your inbox, then sign in.",
      });
    } else {
      onClose();
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-2xl glass p-6 border border-violet-400/20"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-violet-300/60 hover:text-white"
          aria-label="Close"
        >
          <X size={20} weight="bold" />
        </button>

        <h2 className="font-display font-semibold text-xl text-white mb-1">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-[13px] text-violet-300/70 mb-5">
          {mode === "signin"
            ? "Sign in to sync your progress across devices."
            : "Track your attempts, accuracy and bookmarks."}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <Field
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Your name"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />

          {msg && (
            <p
              className={`text-[12.5px] ${
                msg.type === "error" ? "text-rose-400" : "text-mint-400"
              }`}
            >
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold transition-colors"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMsg(null);
          }}
          className="mt-4 w-full text-center text-[13px] text-violet-300/80 hover:text-violet-100"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-violet-200/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full h-11 rounded-xl bg-violet-950/40 border border-violet-400/20 px-3 text-[15px] text-white placeholder:text-violet-300/40 focus:outline-none focus:border-violet-400/60"
      />
    </label>
  );
}
