import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { makeProject, removeProject } from "./helpers";

// The Paper design direction (ADR-0037): F21-REQ-020 to F21-REQ-027 and F08-REQ-036 to F08-REQ-041.
const project = `e2e-design-${process.pid}`;
const PAGE = `# Design check

The lead paragraph sets up the page.

The second paragraph is ordinary body text.

| Source | File |
| --- | --- |
| One | a.md |
| Two | b.md |

## Sources

### Ledger PRD

### Decisions

## Phases
`;

test.beforeEach(() => makeProject(project, { "check.md": PAGE, "other.md": "# Other\n" }));
test.afterEach(() => removeProject(project));

async function open(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/${project}/check`);
  await expect(page.locator(".md h1", { hasText: "Design check" })).toBeVisible();
}

const css = (locator: Locator, property: string) => locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

test("F21-AC-020a share is the cobalt gradient with a white label", async ({ page }) => {
  await open(page);
  const share = page.getByRole("button", { name: "Share" });
  expect(await css(share, "background-image")).toBe("linear-gradient(rgb(14, 62, 210), rgb(1, 31, 173))");
  expect(await css(share, "color")).toBe("rgb(255, 255, 255)");
  expect(await css(page.getByRole("button", { name: "Turn editing on" }), "background-color")).toBe("rgba(0, 0, 0, 0)");
});

test("F21-AC-021a focus ring keeps the accent", async ({ page }) => {
  await open(page);
  await page.keyboard.press("Tab");
  const share = page.getByRole("button", { name: "Share" });
  await share.focus();
  expect(await css(share, "outline-color")).toBe("rgb(122, 162, 247)");
});

test("F21-AC-022a title lead and project name use the display face", async ({ page }) => {
  await open(page);
  // Stand in for the Seb Sans files: once the variable exists, the three places use it and body text does not.
  await page.addStyleTag({ content: ":root { --font-seb-display: 'Probe Display'; }" });
  const family = (locator: Locator) => css(locator, "font-family");
  expect(await family(page.locator(".md h1").first())).toMatch(/^"?Probe Display/);
  expect(await family(page.locator(".md p", { hasText: "lead paragraph" }))).toMatch(/^"?Probe Display/);
  expect(await family(page.locator(".project-switch-name"))).toMatch(/^"?Probe Display/);
  expect(await family(page.locator(".md p", { hasText: "second paragraph" }))).not.toMatch(/Probe Display/);
});

test("F21-AC-022b missing display face falls back to geist", async ({ page }) => {
  await open(page);
  const title = page.locator(".md h1").first();
  expect(await css(title, "font-family")).toMatch(/Geist/);
  expect(await css(title, "font-size")).toBe("30px");
  expect(await css(title, "font-weight")).toBe("700");
});

test("F21-AC-023a search field is the gradient with a mono key hint", async ({ page }) => {
  await open(page);
  const search = page.locator(".search-button");
  expect(await css(search, "height")).toBe("30px");
  expect(await css(search, "border-radius")).toBe("10px");
  expect(await css(search, "background-image")).toMatch(/^linear-gradient/);
  const kbd = search.locator("kbd");
  expect(await css(kbd, "font-family")).toMatch(/Geist Mono/);
  expect(await css(kbd, "font-size")).toBe("11px");
  expect(await css(kbd, "background-color")).toBe("rgb(31, 31, 31)");
});

test("F21-AC-024a open page row has the white tint", async ({ page }) => {
  await open(page);
  const current = page.locator(".tree-link[aria-current='page']");
  expect(await css(current, "background-color")).toBe("rgba(255, 255, 255, 0.08)");
  expect(await css(current, "color")).toBe("rgb(236, 236, 236)");
  const other = page.locator(".tree-link", { hasText: "Other" });
  expect(await css(other, "background-color")).toBe("rgba(0, 0, 0, 0)");
  expect(await css(other, "color")).toBe("rgb(163, 163, 163)");
});

test("F21-AC-025a tables clip to 18px with striped rows", async ({ page }) => {
  await open(page);
  const wrapper = page.locator(".table-scroll").first();
  expect(await css(wrapper, "border-top-left-radius")).toBe("18px");
  expect(await css(wrapper, "overflow-x")).not.toBe("visible");
  expect(await css(wrapper.locator("th").first(), "background-color")).toBe("rgb(31, 31, 31)");
  expect(await css(wrapper.locator("tbody tr").nth(1), "background-color")).toBe("rgb(31, 31, 31)");
  expect(await css(wrapper.locator("td").first(), "border-top-width")).toBe("0px");
});

test("F21-AC-026a faint text meets 4.5 to 1 in dark", async ({ page }) => {
  await open(page);
  const results = await new AxeBuilder({ page }).include(".sidebar").include(".outline").withRules(["color-contrast"]).analyze();
  expect(results.violations.flatMap((violation) => violation.nodes.map((node) => node.target.join(" ")))).toEqual([]);
});

test("F21-AC-027a section labels are small caps", async ({ page }) => {
  await open(page);
  for (const label of [page.locator(".tree-head span"), page.locator(".outline h2")]) {
    expect(await css(label, "font-size")).toBe("11px");
    expect(await css(label, "text-transform")).toBe("uppercase");
    expect(await css(label, "letter-spacing")).toBe("0.66px");
  }
});

test("F08-AC-036a outline is a card in a page-colored column", async ({ page }) => {
  await open(page);
  expect(await css(page.locator(".outline"), "background-color")).toBe("rgb(17, 17, 17)");
  expect(await css(page.locator(".outline-card"), "border-top-left-radius")).toBe("16px");
});

test("F08-AC-037a file column foot is one settings row", async ({ page }) => {
  await open(page);
  await expect(page.locator(".sidebar-foot button")).toHaveText(["Settings"]);
  await page.locator(".sidebar-foot button").click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Project actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Trash" })).toBeVisible();
});

test("F08-AC-038a page actions sit beside the file name", async ({ page }) => {
  await open(page);
  const order = await page.locator(".topbar").evaluate((bar) =>
    [...bar.children]
      .filter((child) => getComputedStyle(child).display !== "none")
      .map((child) => child.getAttribute("aria-label") ?? (child.tagName === "BUTTON" ? child.textContent?.trim() : child.className) ?? ""),
  );
  const crumbs = order.indexOf("crumbs");
  expect(order[crumbs + 1]).toBe("Page actions");
  const spacer = order.indexOf("topbar-spacer");
  expect(order.slice(spacer)).toEqual(expect.arrayContaining(["Turn editing on", "Share"]));
  expect(order.indexOf("Turn editing on")).toBeLessThan(order.indexOf("Share"));
  expect(crumbs).toBeLessThan(spacer);
});

test("F08-AC-039a F08-AC-040a outline lists the title and each h2, and a chevron shows and hides its h3 rows", async ({ page }) => {
  await open(page);
  const card = page.locator(".outline-card");
  await expect(card.locator(".outline-title")).toHaveText("Design check");
  await expect(card.locator(".outline-row .outline-jump")).toHaveText(["Sources", "Phases"]);
  await expect(card.locator(".outline-toggle-slot")).toHaveCount(2);
  const children = card.locator(".outline-children");
  const height = () => children.evaluate((element) => element.getBoundingClientRect().height);
  await expect(children).toHaveAttribute("aria-hidden", "true");
  await expect.poll(height).toBe(0);
  const toggle = card.getByRole("button", { name: "Show Sources subsections" });
  await toggle.click();
  await expect(children).toHaveAttribute("aria-hidden", "false");
  await expect(card.locator(".outline-child")).toHaveText(["Ledger PRD", "Decisions"]);
  await expect.poll(height).toBeGreaterThan(20);
  expect(await css(card.locator(".outline-child").first(), "padding-left")).toBe("24px");
  // The rows unfold over a transition rather than appearing at once.
  expect(await css(children, "transition-property")).toContain("grid-template-rows");
  await card.getByRole("button", { name: "Hide Sources subsections" }).click();
  await expect(children).toHaveAttribute("aria-hidden", "true");
  await expect.poll(height).toBe(0);
});

test("F08-AC-041a project name has a chevron and no tile", async ({ page }) => {
  await open(page);
  const trigger = page.locator(".project-switch");
  await expect(trigger.locator(".project-tile")).toHaveCount(0);
  await expect(trigger.locator(".project-switch-icon")).toBeVisible();
  await trigger.click();
  await expect(page.getByRole("menu", { name: "Projects" })).toBeVisible();
});

const LONG = ["# Long page", ...["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"].flatMap((name) => [`## ${name}`, ...Array(6).fill(`Paragraph under ${name}. `.repeat(12))])].join("\n\n");
const MANY = ["# Many", ...Array.from({ length: 40 }, (_, index) => [`## Heading ${index + 1}`, "Short text."]).flat()].join("\n\n");

async function openPage(page: Page, file: string, size = { width: 1280, height: 900 }) {
  await page.setViewportSize(size);
  await page.goto(`/${project}/${file}`);
  await expect(page.locator(".md h1").first()).toBeVisible();
}

test.describe("outline placement and tracking", () => {
  test.beforeEach(() => makeProject(project, { "check.md": PAGE, "other.md": "# Other\n", "long.md": LONG, "many.md": MANY }));

  test("F08-AC-042a outline sits under the title row beside the page", async ({ page }) => {
    await openPage(page, "long");
    const bar = await page.locator(".topbar").boundingBox();
    const outline = await page.locator(".outline").boundingBox();
    const stage = await page.locator(".stage").boundingBox();
    expect(bar && outline && stage).toBeTruthy();
    expect(bar!.x + bar!.width).toBeGreaterThanOrEqual(outline!.x + outline!.width - 1);
    expect(outline!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height - 1);
    expect(Math.abs(stage!.x + stage!.width - outline!.x)).toBeLessThanOrEqual(1);
    await page.locator(".preview-pane").evaluate((element) => (element.scrollTop = 1500));
    expect((await page.locator(".outline").boundingBox())!.y).toBe(outline!.y);
  });

  test("F08-AC-043a outline button beside edit shows and hides the outline", async ({ page }) => {
    await openPage(page, "check");
    const order = await page.locator(".topbar").evaluate((bar) => [...bar.querySelectorAll("button")].map((button) => button.getAttribute("aria-label") ?? button.textContent?.trim()));
    expect(order[order.indexOf("Turn editing on") - 1]).toBe("Hide outline");
    const outline = page.locator(".outline");
    const width = () => outline.evaluate((element) => element.getBoundingClientRect().width);
    // Closing and opening slide the outline rather than removing it at once.
    expect(await css(outline, "transition-property")).toContain("width");
    await page.getByRole("button", { name: "Hide outline" }).click();
    await expect(outline).toHaveAttribute("aria-hidden", "true");
    await expect.poll(width).toBe(0);
    await expect(page.getByRole("button", { name: "Show outline" })).toHaveAttribute("aria-pressed", "false");
    await page.reload();
    await expect(page.locator(".md h1").first()).toBeVisible();
    await expect(outline).toHaveAttribute("aria-hidden", "true");
    await page.getByRole("button", { name: "Show outline" }).click();
    await expect(outline).toHaveAttribute("aria-hidden", "false");
    await expect.poll(width).toBe(220);
    await page.keyboard.press("Control+\\");
    await expect(outline).toHaveAttribute("aria-hidden", "true");
  });

  test("F08-AC-044a outline marks the heading at the top and the last heading at the end", async ({ page }) => {
    await openPage(page, "long");
    const pane = page.locator(".preview-pane");
    const marked = page.locator(".outline [aria-current='location']");
    await pane.evaluate((element) => {
      const five = element.querySelector<HTMLElement>("#five")!;
      element.scrollTop += five.getBoundingClientRect().top - element.getBoundingClientRect().top - 40;
    });
    await expect(marked).toHaveText("Five");
    await pane.evaluate((element) => (element.scrollTop = element.scrollHeight));
    await expect(marked).toHaveText("Eight");
    await pane.evaluate((element) => (element.scrollTop = 0));
    await expect(marked).toHaveText("Long page");
  });

  test("F08-AC-045a outline scrolls to keep the marked row visible", async ({ page }) => {
    await openPage(page, "many", { width: 1280, height: 520 });
    const outline = page.locator(".outline");
    expect(await outline.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await page.locator(".preview-pane").evaluate((element) => (element.scrollTop = element.scrollHeight));
    const row = page.locator(".outline [aria-current='location']");
    await expect(row).toHaveText("Heading 40");
    await expect
      .poll(async () => {
        const [view, box] = await Promise.all([outline.boundingBox(), row.boundingBox()]);
        return Boolean(view && box && box.y >= view.y && box.y + box.height <= view.y + view.height);
      })
      .toBe(true);
    expect(await page.locator(".preview-pane").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });
});
