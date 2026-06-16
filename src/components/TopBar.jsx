import { motion } from "motion/react";
import { House, Lightning, Target } from "@phosphor-icons/react";
import AuthBar from "./AuthBar.jsx";

export default function TopBar({ view, onHome, onStudio, stats }) {
  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-x-0 border-t-0">
        <div className="max-w-[1400px] mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <button
            onClick={onHome}
            className="flex items-center gap-2.5 group"
            aria-label="PrepVerse home"
          >
            <span className="grid place-items-center w-9 h-9 rounded-[12px] bg-gradient-to-br from-violet-400 to-violet-700 font-display font-bold text-white text-lg glow-ring">
              P
            </span>
            <span className="font-display font-semibold text-[17px] tracking-tight text-violet-50 group-hover:text-white transition-colors">
              Prep<span className="text-violet-400">Verse</span>
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-5">
            <div className="flex items-center gap-2 text-[13px] text-violet-300/80">
              <Target size={16} weight="duotone" className="text-violet-400" />
              <span className="font-mono">
                {stats.done} solved · {stats.accuracy}%
              </span>
            </div>

            <nav className="flex items-center gap-1 p-1 rounded-full glass">
              <NavPill active={view === "home"} onClick={onHome} icon={<House size={15} weight="bold" />}>
                Home
              </NavPill>
              <NavPill active={view === "studio"} onClick={onStudio} icon={<Lightning size={15} weight="bold" />}>
                Practice
              </NavPill>
            </nav>

            <AuthBar />
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <AuthBar />
            <button
              onClick={onStudio}
              className="px-4 h-9 rounded-full bg-violet-600 text-white text-sm font-semibold active:scale-[0.97] transition-transform"
            >
              Practice
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavPill({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3.5 h-8 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-colors ${
        active ? "text-white" : "text-violet-300/70 hover:text-violet-200"
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-violet-600"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        {children}
      </span>
    </button>
  );
}
