import type { Heading } from "./outline";

export type OutlineSection = { heading: Heading; children: Heading[] };
export type OutlineTree = { title: Heading | null; sections: OutlineSection[] };

// Shapes the outline card: the first H1 is the page title, each H2 opens a section, and deeper
// headings sit under the section above them. A heading before the first H2, other than the title,
// is a section of its own.
export function groupOutline(headings: Heading[]): OutlineTree {
  const first = headings[0];
  const title = first && first.depth === 1 ? first : null;
  const sections: OutlineSection[] = [];
  for (const heading of title ? headings.slice(1) : headings) {
    const open = sections.at(-1);
    if (heading.depth <= 2 || !open || open.heading.depth > 2) sections.push({ heading, children: [] });
    else open.children.push(heading);
  }
  return { title, sections };
}

// The section that holds a heading id, so the card can open it when that heading is in view.
export function sectionOf(tree: OutlineTree, id: string | null): string | null {
  if (!id) return null;
  for (const section of tree.sections) {
    if (section.heading.id === id || section.children.some((child) => child.id === id)) return section.heading.id;
  }
  return null;
}
