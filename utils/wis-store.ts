import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// WisStore - Just with the `lastSubmit` field
export interface WisState {
  lastSubmit: number;

  // Setters
  setLastSubmit: (value: number) => void;
}

export const useWisStore = create<WisState>()(
  persist(
    (set) => ({
      lastSubmit: 0,

      setLastSubmit: (value) => set({ lastSubmit: value }),
    }),
    { name: 'wis-store' }
  )
);
