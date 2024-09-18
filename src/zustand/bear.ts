import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BearState {
  bears: number;
  addABear: () => void;
}

export const useBearStore = create(
  persist<BearState>(
    (set, get) => ({
      bears: 1,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: "food-storage", // name of the item in the storage (must be unique)
    }
  )
);
