import type { Highlighter } from "shiki";

const LANG_ALIAS: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  yml: "yaml",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  md: "markdown",
  txt: "text",
  plaintext: "text",
};

const LANGS = ["typescript", "tsx", "javascript", "jsx", "json", "yaml", "bash", "markdown", "python", "css", "html", "sql", "diff", "swift"];

let highlighter: Promise<Highlighter> | null = null;

function load() {
  highlighter ??= import("shiki").then(({ createHighlighter, createJavaScriptRegexEngine }) =>
    createHighlighter({ themes: ["github-dark", "github-light"], langs: LANGS, engine: createJavaScriptRegexEngine() }),
  );
  return highlighter;
}

export async function highlight(code: string, lang: string): Promise<string | null> {
  try {
    const shiki = await load();
    const mapped = LANG_ALIAS[lang] ?? (lang || "text");
    const useLang = shiki.getLoadedLanguages().includes(mapped) ? mapped : "text";
    return shiki.codeToHtml(code, { lang: useLang, themes: { light: "github-light", dark: "github-dark" }, defaultColor: false });
  } catch {
    return null;
  }
}
