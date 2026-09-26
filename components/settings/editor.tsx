"use client";

import { setPreference, usePreferences } from "../preferences";
import { Pane, Row, Switch } from "./parts";

export function EditorSettings() {
  const { spellcheck } = usePreferences();
  return (
    <Pane title="Editor" lead="How editing works on this machine.">
      <Row inline label="Spellcheck" detail="Underline misspelled words while you edit blocks or Markdown source.">
        <Switch label="Spellcheck" checked={spellcheck} onChange={(next) => setPreference("spellcheck", next)} />
      </Row>
    </Pane>
  );
}
