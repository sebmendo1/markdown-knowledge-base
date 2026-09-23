"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export function TreeInput({
  initial = "",
  placeholder,
  depth,
  onDone,
}: {
  initial?: string;
  placeholder: string;
  depth: number;
  onDone: (value: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function finish(value: string | null) {
    if (done.current) return;
    done.current = true;
    onDone(value);
  }

  return (
    <div className="tree-row is-editing" style={{ "--depth": depth } as CSSProperties}>
      <input
        ref={ref}
        className="tree-input"
        defaultValue={initial}
        placeholder={placeholder}
        aria-label={placeholder}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            finish(event.currentTarget.value);
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            finish(null);
          }
        }}
        onBlur={(event) => finish(event.currentTarget.value)}
      />
    </div>
  );
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={open ? "chevron is-open" : "chevron"} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M4.5 3 7.5 6l-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
