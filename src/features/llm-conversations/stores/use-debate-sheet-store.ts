import { create } from "zustand";

interface DebateSheetStore {
  open: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  setOpen: (open: boolean) => void;
}

export const useDebateSheetStore = create<DebateSheetStore>((set) => ({
  open: false,
  openSheet: () => set({ open: true }),
  closeSheet: () => set({ open: false }),
  setOpen: (open) => set({ open }),
}));
