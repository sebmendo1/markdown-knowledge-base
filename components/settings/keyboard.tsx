"use client";

import { emit } from "../ui-events";
import { Pane, Row } from "./parts";

export function KeyboardSettings({ canShowShortcuts, onClose }: { canShowShortcuts: boolean; onClose: () => void }) {
  return (
    <Pane title="Keyboard" lead="Every core action has a shortcut. Press ? anywhere to see them.">
      <Row label="Shortcuts" detail="The full list is in the shortcut help. On Windows and Linux, Ctrl takes the place of ⌘.">
        {canShowShortcuts ? (
          <button
            type="button"
            className="settings-button"
            onClick={() => {
              onClose();
              emit("markdown-kb-help", null);
            }}
          >
            Show shortcuts
          </button>
        ) : null}
      </Row>
    </Pane>
  );
}
