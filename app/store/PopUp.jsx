import { create } from "zustand";

export const usePopUpStore = create((set) => ({
  isOpen: false,
  toggleIsOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));

