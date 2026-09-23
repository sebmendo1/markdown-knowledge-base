"use client";

import { Fragment, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSuggest, type SuggestStore } from "./suggest-store";

export function SuggestList<T>({
  store,
  label,
  empty,
  groupOf,
  keyOf,
  children,
}: {
  store: SuggestStore<T>;
  label: string;
  empty: string;
  groupOf?: (item: T) => string;
  keyOf: (item: T) => string;
  children: (item: T) => ReactNode;
}) {
  const state = useSuggest(store);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    ref.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [state?.index, state?.items]);

  if (!state?.rect) return null;
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const width = Math.min(300, window.innerWidth - 16);
  const left = Math.max(8, Math.min(state.rect.left, window.innerWidth - width - 8));
  const below = viewport - state.rect.bottom > 240 || state.rect.top < 260;
  const style = below
    ? { left, width, top: state.rect.bottom + 6, maxHeight: Math.max(160, viewport - state.rect.bottom - 16) }
    : { left, width, bottom: viewport - state.rect.top + 6, maxHeight: Math.max(160, state.rect.top - 16) };

  return createPortal(
    <div ref={ref} className="suggest" role="listbox" aria-label={label} style={style}>
      {state.items.length === 0 ? <p className="suggest-empty">{empty}</p> : null}
      {state.items.map((item, index) => {
        const group = groupOf?.(item);
        const header = group && group !== (index > 0 ? groupOf?.(state.items[index - 1]) : undefined);
        return (
          <Fragment key={keyOf(item)}>
            {header ? <p className="suggest-group">{group}</p> : null}
            <button
              type="button"
              role="option"
              aria-selected={index === state.index}
              className={index === state.index ? "is-active" : undefined}
              onMouseEnter={() => store.hover(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                store.pick(index);
              }}
            >
              {children(item)}
            </button>
          </Fragment>
        );
      })}
    </div>,
    document.body,
  );
}
