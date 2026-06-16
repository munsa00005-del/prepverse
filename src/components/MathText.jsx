import katex from "katex";
import { useMemo } from "react";

// Renders a string containing $inline$ and $$block$$ LaTeX plus plain text.
// Splits on $$...$$ first, then $...$, and renders each math span with KaTeX.
function renderToHtml(text) {
  if (!text) return "";
  const out = [];
  // Tokenise: capture $$...$$ and $...$
  const regex = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      out.push(escapeHtml(text.slice(last, m.index)));
    }
    const tok = m[0];
    const display = tok.startsWith("$$");
    const tex = display ? tok.slice(2, -2) : tok.slice(1, -1);
    try {
      out.push(
        katex.renderToString(tex, {
          displayMode: display,
          throwOnError: false,
          output: "html",
        })
      );
    } catch {
      out.push(escapeHtml(tok));
    }
    last = regex.lastIndex;
  }
  if (last < text.length) out.push(escapeHtml(text.slice(last)));
  return out.join("");
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

export default function MathText({ text, className = "" }) {
  const html = useMemo(() => renderToHtml(text), [text]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
