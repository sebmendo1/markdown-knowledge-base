"use client";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useMemo } from "react";
import { useResolvedTheme } from "./theme-store";

function editorTheme(dark: boolean) {
  return EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "transparent",
      color: "var(--text)",
      fontSize: "13.5px",
    },
    ".cm-content": {
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      padding: "20px 0 80px",
      caretColor: "var(--text)",
      lineHeight: "1.6",
    },
    ".cm-line": { padding: "0 20px" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "var(--text-faint)",
      border: "none",
    },
    ".cm-activeLine": { backgroundColor: "var(--bg-hover)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--text-dim)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--selection) !important",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-cursor": { borderLeftColor: "var(--text)" },
  },
    { dark },
  );
}

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  onView?: (view: EditorView | null) => void;
};

export function Editor({ value, onChange, onView }: EditorProps) {
  const dark = useResolvedTheme() === "dark";
  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      editorTheme(dark),
      EditorView.lineWrapping,
      Prec.highest(
        keymap.of([
          { key: "Mod-s", run: () => true },
          { key: "Mod-/", run: () => true },
        ]),
      ),
    ],
    [dark],
  );

  return (
    <CodeMirror
      className="editor"
      value={value}
      height="100%"
      theme="none"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: false,
        highlightSelectionMatches: false,
        autocompletion: false,
      }}
      extensions={extensions}
      indentWithTab
      onChange={onChange}
      onCreateEditor={(view) => onView?.(view)}
      placeholder="Start writing…"
    />
  );
}

export type { ReactCodeMirrorRef };
