import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      isLoggedIn: false,
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
