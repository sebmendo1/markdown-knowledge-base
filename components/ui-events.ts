"use client";

export type Target = { kind: "page"; id: string } | { kind: "folder"; path: string };
export type CreateDetail = { kind: "page" | "folder"; folder: string };

type Events = {
  "markdown-kb-create": CreateDetail;
  "markdown-kb-rename": Target;
  "markdown-kb-move": Target;
  "markdown-kb-trash": null;
  "markdown-kb-history": string;
};

export function emit<K extends keyof Events>(name: K, detail: Events[K]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function listen<K extends keyof Events>(name: K, handler: (detail: Events[K]) => void) {
  const wrapped = (event: Event) => handler((event as CustomEvent<Events[K]>).detail);
  window.addEventListener(name, wrapped);
  return () => window.removeEventListener(name, wrapped);
}
