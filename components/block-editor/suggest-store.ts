import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { useSyncExternalStore } from "react";

export type SuggestState<T> = {
  items: T[];
  index: number;
  query: string;
  rect: DOMRect | null;
  command: (item: T) => void;
};

export type SuggestStore<T> = ReturnType<typeof createSuggestStore<T>>;

export function createSuggestStore<T>() {
  let state: SuggestState<T> | null = null;
  const listeners = new Set<() => void>();

  function set(next: SuggestState<T> | null) {
    state = next;
    listeners.forEach((listener) => listener());
  }

  function from(props: SuggestionProps<T>, index: number): SuggestState<T> {
    return {
      items: props.items,
      index: Math.min(index, Math.max(0, props.items.length - 1)),
      query: props.query,
      rect: props.clientRect?.() ?? null,
      command: (item) => props.command(item as never),
    };
  }

  function pick(index?: number) {
    const item = state?.items[index ?? state.index];
    if (!state || item === undefined) return false;
    state.command(item);
    return true;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get: () => state,
    close: () => set(null),
    hover(index: number) {
      if (state) set({ ...state, index });
    },
    pick,
    render() {
      return {
        onStart: (props: SuggestionProps<T>) => set(from(props, 0)),
        onUpdate: (props: SuggestionProps<T>) => set(from(props, state?.query === props.query ? state.index : 0)),
        onExit: () => set(null),
        onKeyDown: ({ event }: SuggestionKeyDownProps) => {
          if (!state) return false;
          const count = state.items.length;
          if (event.key === "Escape") {
            set(null);
            return true;
          }
          if (count === 0) return false;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            const step = event.key === "ArrowDown" ? 1 : -1;
            set({ ...state, index: (state.index + step + count) % count });
            return true;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            return pick();
          }
          return false;
        },
      };
    },
  };
}

export function useSuggest<T>(store: SuggestStore<T>) {
  return useSyncExternalStore(store.subscribe, store.get, () => null);
}
