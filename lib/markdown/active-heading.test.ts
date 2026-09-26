import assert from "node:assert/strict";
import { test } from "node:test";
import { pickActiveHeading } from "./active-heading";

const tops = [
  { id: "one", top: -900 },
  { id: "two", top: -300 },
  { id: "three", top: 40 },
  { id: "four", top: 400 },
];

test("F08-AC-044a outline marks the heading at the top and the last heading at the end", () => {
  assert.equal(pickActiveHeading(tops, false), "three");
  assert.equal(pickActiveHeading(tops.map((heading) => ({ ...heading, top: heading.top + 350 })), false), "two");
  assert.equal(pickActiveHeading(tops, true), "four");
});

test("before the first heading reaches the top, the first heading is marked, and no headings mark nothing", () => {
  assert.equal(pickActiveHeading([{ id: "a", top: 300 }, { id: "b", top: 900 }], false), "a");
  assert.equal(pickActiveHeading([], false), null);
  assert.equal(pickActiveHeading([], true), null);
});
