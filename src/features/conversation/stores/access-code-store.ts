import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccessCodeStore {
  accessCode: string | null;
  setAccessCode: (code: string) => void;
  clearAccessCode: () => void;
}

export const useAccessCodeStore = create<AccessCodeStore>()(
  persist(
    (set) => ({
      accessCode: null,
      setAccessCode: (code: string) => set({ accessCode: code }),
      clearAccessCode: () => set({ accessCode: null }),
    }),
    {
      name: "access-code-storage",
    },
  ),
);
