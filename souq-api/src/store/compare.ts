import { create } from "zustand";
import { persist } from "zustand/middleware";

export const COMPARE_LIMIT = 4;

/** Just enough to draw the compare tray without a fetch; the compare page loads the full products. */
export type CompareItem = { id: string; name: string; image: string; photo?: boolean };

type CompareState = {
  items: CompareItem[];
  /** Returns false when the list is already full. */
  toggle: (item: CompareItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const { items } = get();
        if (items.some((x) => x.id === item.id)) {
          set({ items: items.filter((x) => x.id !== item.id) });
          return true;
        }
        if (items.length >= COMPARE_LIMIT) return false;
        set({ items: [...items, item] });
        return true;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "souq-compare" }
  )
);
