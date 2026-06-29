import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  config: { size: string; paper: string; finish: string; qty: number };
  unit: number;
  subtotal: number;
  gst: number;
  total: number;
};

type State = {
  items: CartItem[];
  open: boolean;
};

let state: State = { items: [], open: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const cart = {
  add(item: CartItem) {
    set({ items: [...state.items, item], open: true });
  },
  remove(id: string) {
    set({ items: state.items.filter((i) => i.id !== id) });
  },
  clear() {
    set({ items: [] });
  },
  open() {
    set({ open: true });
  },
  close() {
    set({ open: false });
  },
  toggle() {
    set({ open: !state.open });
  },
};

export function useCart<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}
