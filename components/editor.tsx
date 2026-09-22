"use client";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView, keymap } from "@codemirror/view";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useMemo } from "react";

const editorTheme = EditorView.theme(
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
    ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.03)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--text-dim)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "#2a3a55 !important",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-cursor": { borderLeftColor: "var(--text)" },
  },
  { dark: true },
);

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  onView?: (view: EditorView | null) => void;
};

export function Editor({ value, onChange, onView }: EditorProps) {
  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      editorTheme,
      EditorView.lineWrapping,
      keymap.of([
        {
          key: "Mod-s",
          run: () => true,
        },
      ]),
    ],
    [],
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
