import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import TopBar from "./components/TopBar.jsx";
import Hero from "./components/Hero.jsx";
import Studio from "./components/Studio.jsx";
import Footer from "./components/Footer.jsx";
import { useProgress } from "./hooks/useProgress.js";
import { loadQuestions } from "./data/loadQuestions.js";

export default function App() {
  const [view, setView] = useState("home"); // "home" | "studio"
  const [ready, setReady] = useState(false); // questions loaded
  const [selection, setSelection] = useState({
    exam: "jee-main",
    subject: "physics",
    chapter: null,
    topic: null,
  });
  const progress = useProgress();

  // Load the question bank (Supabase → fallback to bundled) before the UI
  // reads from the store, so counts/filters reflect the live data.
  useEffect(() => {
    let mounted = true;
    loadQuestions().finally(() => mounted && setReady(true));
    return () => {
      mounted = false;
    };
  }, []);

  const enterStudio = useCallback((next) => {
    if (next) setSelection((s) => ({ ...s, ...next }));
    setView("studio");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const goHome = useCallback(() => {
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const content = useMemo(() => {
    if (view === "studio") {
      return (
        <Studio
          key="studio"
          selection={selection}
          setSelection={setSelection}
          progress={progress}
        />
      );
    }
    return <Hero key="home" onStart={enterStudio} progress={progress} />;
  }, [view, selection, progress, enterStudio]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <TopBar
        view={view}
        onHome={goHome}
        onStudio={() => enterStudio()}
        stats={progress.stats}
      />
      <main className="flex-1">
        {!ready ? (
          <div className="grid place-items-center py-32 text-violet-300/70">
            <div className="flex flex-col items-center gap-4">
              <span className="w-8 h-8 rounded-full border-2 border-violet-400/30 border-t-violet-400 animate-spin" />
              <span className="text-sm">Loading question bank…</span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      {view === "home" && <Footer />}
    </div>
  );
}
