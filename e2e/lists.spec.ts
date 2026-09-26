import { expect, test, type Page } from "@playwright/test";
import { makeProject, removeProject } from "./helpers";

// Tailwind's reset removes list markers; these checks keep bullets and numbers visible in both views.
const project = `e2e-lists-${process.pid}`;
const PAGE = `# Lists

- First
  - Nested
    - Deeper

1. One
   1. Sub
      1. Deeper

Starting at seven:

7. Seventh

- [x] Done
- [ ] Open
`;

test.beforeEach(() => makeProject(project, { "lists.md": PAGE }));
test.afterEach(() => removeProject(project));

async function markers(page: Page, root: string) {
  return page.evaluate((selector) => {
    const style = (element: Element) => getComputedStyle(element).listStyleType;
    const doc = document.querySelector(selector)!;
    const lists = [...doc.querySelectorAll("ul, ol")];
    const tasks = lists.filter((list) => list.matches(".contains-task-list, [data-type='taskList']"));
    const plain = lists.filter((list) => !tasks.includes(list));
    return {
      lists: plain.map((list) => `${list.tagName.toLowerCase()}:${style(list)}`),
      tasks: tasks.map(style),
      seventh: doc.querySelectorAll("ol")[3]?.getAttribute("start") ?? null,
    };
  }, root);
}

const EXPECTED = ["ul:disc", "ul:circle", "ul:square", "ol:decimal", "ol:lower-alpha", "ol:lower-roman", "ol:decimal"];

test("lists show bullets and numbers that change with nesting, in view mode", async ({ page }) => {
  await page.goto(`/${project}/lists`);
  await expect(page.locator(".md h1", { hasText: "Lists" })).toBeVisible();
  const found = await markers(page, ".md");
  expect(found.lists).toEqual(EXPECTED);
  expect(found.tasks).toEqual(["none"]);
  expect(found.seventh).toBe("7");
});

test("lists show bullets and numbers that change with nesting, in the block editor", async ({ page }) => {
  await page.goto(`/${project}/lists?edit=1`);
  await expect(page.locator(".block-doc h1", { hasText: "Lists" })).toBeVisible();
  const found = await markers(page, ".block-doc");
  expect(found.lists).toEqual(EXPECTED);
  expect(found.tasks).toEqual(["none"]);
  expect(found.seventh).toBe("7");
});
