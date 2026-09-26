"use client";

import { setPreference, usePreferences } from "../preferences";
import { setTheme, useThemeChoice } from "../theme-store";
import { Choice, Pane, Row } from "./parts";

export function AppearanceSettings() {
  const theme = useThemeChoice();
  const { motion } = usePreferences();
  return (
    <Pane title="Appearance" lead="How markdown-kb looks on this machine.">
      <Row label="Theme" detail="Use the system setting, or keep one look.">
        <Choice
          label="Theme"
          value={theme}
          options={[
            ["light", "Light"],
            ["dark", "Dark"],
            ["system", "System"],
          ]}
          onChange={setTheme}
        />
      </Row>
      <Row label="Motion" detail="Reduce turns off animation and smooth scrolling, whatever the system prefers.">
        <Choice
          label="Motion"
          value={motion}
          options={[
            ["system", "System"],
            ["reduce", "Reduce"],
          ]}
          onChange={(next) => setPreference("motion", next)}
        />
      </Row>
    </Pane>
  );
}
