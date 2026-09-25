import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const REQUIREMENT_ID = /(?:F\d{2}|X)-REQ-\d+/g;
const DEFINITION =
  /^(?:-\s+\*\*((?:F\d{2}|X)-REQ-\d+)\*\*|-\s+((?:F\d{2}|X)-REQ-\d+)|\*\*((?:F\d{2}|X)-REQ-\d+)\*\*)(?=\s|$)/;
const CITATION_LINE = /(?:Requirements|Satisfies)\s*:/;
const ADR_ID = /ADR-\d{4}/g;
const PRD_CITATION = /prd:([a-z0-9-]+)/g;
const PRD_ANCHOR = /<!--\s*prd:([a-z0-9-]+)\s*-->/g;
const MARKDOWN_LINK = /!?\[[^\]]*\]\(([^)\s]+)\)/g;

function relative(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join("/");
}

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

function markdownUnder(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(dir, entry));
}

function idsIn(source: string): string[] {
  REQUIREMENT_ID.lastIndex = 0;
  return source.match(REQUIREMENT_ID) ?? [];
}

function definedRequirements(source: string): string[] {
  const ids: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    const match = DEFINITION.exec(line.trim());
    if (match) ids.push(match[1] || match[2] || match[3]);
  }
  return ids;
}

function citedBySteps(source: string): string[] {
  const ids: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    if (CITATION_LINE.test(line)) ids.push(...idsIn(line));
  }
  return ids;
}

function citedByTaskLines(source: string): string[] {
  const ids: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    if (CITATION_LINE.test(line) || /^\s*\|/.test(line)) ids.push(...idsIn(line));
  }
  return ids;
}

function checkRequirements(root: string): string[] {
  const features = path.join(root, "specs", "features");
  if (!fs.existsSync(features)) return [];

  const issues: string[] = [];
  const seen = new Map<string, string[]>();

  for (const entry of fs.readdirSync(features, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const folder = path.join(features, entry.name);
    const specFile = path.join(folder, "spec.md");
    if (!fs.existsSync(specFile)) continue;

    const specPath = relative(root, specFile);
    const defined = definedRequirements(read(specFile));
    const definedSet = new Set<string>();
    for (const id of defined) {
      const places = seen.get(id) ?? [];
      places.push(specPath);
      seen.set(id, places);
      if (definedSet.has(id)) {
        issues.push(`${specPath} defines ${id} more than once`);
      }
      definedSet.add(id);
    }

    const tasksFile = path.join(folder, "tasks.md");
    if (!fs.existsSync(tasksFile)) continue;
    const tasks = read(tasksFile);
    const tasksPath = relative(root, tasksFile);
    const citedByStep = new Set(citedBySteps(tasks));
    for (const id of definedSet) {
      if (!citedByStep.has(id)) issues.push(`${tasksPath} does not cite ${id}`);
    }
    for (const id of new Set(citedByTaskLines(tasks))) {
      if (!definedSet.has(id)) issues.push(`${tasksPath} cites ${id}, which spec.md does not define`);
    }
  }

  for (const [id, places] of seen) {
    const unique = [...new Set(places)];
    if (unique.length > 1) issues.push(`${id} is defined in ${unique.join(" and ")}`);
  }
  return issues;
}

function adrIndex(root: string): Map<string, string> | null {
  const dir = path.join(root, "specs", "decisions");
  if (!fs.existsSync(dir)) return null;
  const index = new Map<string, string>();
  for (const name of fs.readdirSync(dir)) {
    const match = /^(ADR-\d{4}).*\.md$/.exec(name);
    if (match) index.set(match[1], path.join(dir, name));
  }
  return index.size > 0 ? index : null;
}

function checkAdrs(root: string): string[] {
  const index = adrIndex(root);
  if (!index) return [];

  const issues: string[] = [];
  for (const file of markdownUnder(path.join(root, "specs"))) {
    const source = read(file);
    const filePath = relative(root, file);
    ADR_ID.lastIndex = 0;
    for (const id of new Set(source.match(ADR_ID) ?? [])) {
      if (!index.has(id)) issues.push(`${filePath} cites ${id}, which has no file in specs/decisions`);
    }
    MARKDOWN_LINK.lastIndex = 0;
    for (const match of source.matchAll(MARKDOWN_LINK)) {
      const target = match[1];
      if (!target || (!/ADR-\d{4}/.test(target) && !/(^|\/)decisions\//.test(target))) continue;
      const bare = target.split("#")[0]?.split("?")[0] ?? "";
      if (!bare || /^[a-z][a-z0-9+.-]*:/i.test(bare)) continue;
      let decoded = bare;
      try {
        decoded = decodeURIComponent(bare);
      } catch {
        issues.push(`${filePath} links to missing ${target}`);
        continue;
      }
      const resolved = path.resolve(path.dirname(file), decoded);
      if (!fs.existsSync(resolved)) issues.push(`${filePath} links to missing ${target}`);
    }
  }
  return issues;
}

function checkPrdAnchors(root: string): string[] {
  const prdFile = path.join(root, "specs", "source", "ledger-prd.md");
  if (!fs.existsSync(prdFile)) return [];

  PRD_ANCHOR.lastIndex = 0;
  const anchors = new Set([...read(prdFile).matchAll(PRD_ANCHOR)].map((match) => match[1]));
  const issues: string[] = [];
  for (const file of markdownUnder(path.join(root, "specs"))) {
    if (path.resolve(file) === path.resolve(prdFile)) continue;
    PRD_CITATION.lastIndex = 0;
    const cited = new Set([...read(file).matchAll(PRD_CITATION)].map((match) => match[1]));
    for (const anchor of cited) {
      if (!anchors.has(anchor)) {
        issues.push(`${relative(root, file)} cites prd:${anchor}, which ledger-prd.md does not anchor`);
      }
    }
  }
  return issues;
}

function checkContracts(root: string): string[] {
  const dir = path.join(root, "specs", "contracts");
  const issues: string[] = [];
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { recursive: true, encoding: "utf8" })) {
      if (!entry.endsWith(".json")) continue;
      const file = path.join(dir, entry);
      try {
        JSON.parse(read(file));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        issues.push(`${relative(root, file)} is not JSON: ${message}`);
      }
    }
  }

  const openapi = path.join(dir, "rest.openapi.yaml");
  if (fs.existsSync(openapi)) {
    try {
      parse(read(openapi));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push(`${relative(root, openapi)} is not YAML: ${message}`);
    }
  }
  return issues;
}

export function checkSpecs(root: string): string[] {
  return [...checkRequirements(root), ...checkAdrs(root), ...checkPrdAnchors(root), ...checkContracts(root)];
}
