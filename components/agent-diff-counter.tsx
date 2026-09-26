"use client";

import { markReviewed, type AgentReview } from "./agent-changes";

// Characters agents added and removed on this page since the person last reviewed it. Choosing it marks them reviewed.
export function AgentDiffCounter({ pageId, review }: { pageId: string; review: AgentReview }) {
  const label = `Agent changes: ${review.added} ${review.added === 1 ? "character" : "characters"} added, ${review.removed} removed. Mark reviewed.`;
  return (
    <button
      type="button"
      className="agent-diff-counter"
      aria-label={label}
      title="Changes from agents since you last reviewed. Click to mark reviewed."
      onClick={() => markReviewed(pageId)}
    >
      <span className="agent-diff-added">+{review.added}</span>
      <span className="agent-diff-removed">−{review.removed}</span>
    </button>
  );
}
