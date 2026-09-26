// Which heading the outline marks while the page scrolls (F08-REQ-044).
// `tops` are heading tops relative to the top of the scrolling page, in document order.
export const ACTIVE_OFFSET = 96;

export function pickActiveHeading(tops: { id: string; top: number }[], atEnd: boolean, offset = ACTIVE_OFFSET): string | null {
  if (tops.length === 0) return null;
  if (atEnd) return tops[tops.length - 1].id;
  let active = tops[0].id;
  for (const heading of tops) {
    if (heading.top > offset) break;
    active = heading.id;
  }
  return active;
}
