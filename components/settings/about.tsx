"use client";

import Link from "next/link";
import { Pane, Row } from "./parts";

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
const SOURCE = "https://github.com/sebmendo1/markdown-knowledge-base";

export function AboutSettings({ onClose }: { onClose: () => void }) {
  return (
    <Pane title="About" lead="markdown-kb is a Markdown knowledge base. Pages stay Markdown files.">
      <Row label="Version">
        <span className="settings-value">{VERSION}</span>
      </Row>
      <Row label="Guide" detail="How to write, organize, and read pages here.">
        <Link className="settings-button" href="/guide" onClick={onClose}>
          Open the guide
        </Link>
      </Row>
      <Row label="Specs" detail="What the product does and why, requirement by requirement.">
        <Link className="settings-button" href="/specs" onClick={onClose}>
          Open the specs
        </Link>
      </Row>
      <Row label="Source">
        <a className="settings-button" href={SOURCE} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </Row>
    </Pane>
  );
}
