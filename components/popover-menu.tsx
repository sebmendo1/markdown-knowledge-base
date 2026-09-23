"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";

export type MenuItem = { label: string; run: () => void; danger?: boolean; hint?: string } | "divider";

export function PopoverMenu({
  x,
  y,
  label,
  items,
  onClose,
}: {
  x: number;
  y: number;
  label: string;
  items: MenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const away = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close.current();
    };
    const dismiss = () => close.current();
    window.addEventListener("mousedown", away);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("mousedown", away);
      window.removeEventListener("resize", dismiss);
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      buttons[(index + step + buttons.length) % buttons.length]?.focus();
    }
  }

  const rows = items.filter((item) => item !== "divider").length;
  const left = Math.max(8, Math.min(x, window.innerWidth - 232));
  const top = Math.max(8, Math.min(y, window.innerHeight - rows * 36 - 24));

  return (
    <div ref={ref} className="menu" role="menu" aria-label={label} style={{ left, top }} onKeyDown={onKeyDown}>
      {items.map((item, index) =>
        item === "divider" ? (
          <div key={`divider-${index}`} className="menu-divider" role="separator" />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={item.danger ? "is-danger" : undefined}
            onClick={() => {
              onClose();
              item.run();
            }}
          >
            {item.label}
            {item.hint ? <kbd>{item.hint}</kbd> : null}
          </button>
        ),
      )}
    </div>
  );
}
