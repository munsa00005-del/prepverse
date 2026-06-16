import { GithubLogo, Heart } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-violet-400/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="grid place-items-center w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-400 to-violet-700 font-display font-bold text-white">
              P
            </span>
            <span className="font-display font-semibold text-violet-50">PrepVerse</span>
          </div>
          <p className="text-[13.5px] text-violet-300/55 max-w-[42ch] leading-relaxed">
            A pure-frontend practice studio for Indian competitive-exam aspirants.
            Questions are a verified, representative set with hand-checked solutions —
            extend the open JSON bank to grow it toward the full archive.
          </p>
        </div>

        <FooterCol
          title="Exams"
          items={["JEE Main", "JEE Advanced", "NEET"]}
        />
        <FooterCol
          title="Subjects"
          items={["Physics", "Chemistry", "Mathematics", "Biology"]}
        />
      </div>

      <div className="border-t border-violet-400/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-violet-300/50">
          <span className="flex items-center gap-1.5">
            Built with <Heart size={13} weight="fill" className="text-fuchsia-400" /> using React, Motion & Remotion
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <GithubLogo size={15} weight="fill" /> Open question schema · no backend
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h4 className="text-[12px] uppercase tracking-[0.18em] text-violet-300/50 mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="text-[14px] text-violet-200/70">{i}</li>
        ))}
      </ul>
    </div>
  );
}
