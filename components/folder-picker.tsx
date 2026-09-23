"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { hrefOf } from "@/lib/workspace/paths";
import { setMode } from "./draft-store";
import { openFolder } from "./project-store";

export function useFolderPicker(taken: string[]) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement | null>(null);
  const attach = useCallback((element: HTMLInputElement | null) => {
    element?.setAttribute("webkitdirectory", "");
    element?.setAttribute("directory", "");
    ref.current = element;
  }, []);

  const input = (
    <input
      ref={attach}
      type="file"
      multiple
      hidden
      aria-hidden="true"
      tabIndex={-1}
      onChange={async (event) => {
        const field = event.currentTarget;
        const files = Array.from(field.files ?? []);
        field.value = "";
        if (files.length === 0) return;
        const made = await openFolder(files, taken);
        if (!made) return;
        setMode("preview");
        router.push(hrefOf(made.slug, made.path));
      }}
    />
  );

  return { input, pick: () => ref.current?.click() };
}
