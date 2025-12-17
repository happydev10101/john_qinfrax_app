import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Request Asset Swap Store
export interface RasState {
  issuerId: string;
  telegramChannel: string;
  assetName: string;
  domain: string;
  assetPrice: number | string;
  lastSubmit: number;

  // Setters
  setIssuerId: (value: string) => void;
  setTelegramChannel: (value: string) => void;
  setAssetName: (value: string) => void;
  setDomain: (value: string) => void;
  setAssetPrice: (value: number | string) => void;
  setLastSubmit: (value: number) => void;
}

export const useRasStore = create<RasState>()(
  persist(
    (set) => ({
      issuerId: '',
      telegramChannel: '',
      assetName: '',
      domain: '',
      assetPrice: '',
      lastSubmit: 0,

      setIssuerId: (value) => set({ issuerId: value }),
      setTelegramChannel: (value) => set({ telegramChannel: value }),
      setAssetName: (value) => set({ assetName: value }),
      setDomain: (value) => set({ domain: value }),
      setAssetPrice: (value) => set({ assetPrice: value }),
      setLastSubmit: (value) => set({ lastSubmit: value }),
    }),
    { name: 'ras-store' }
  )
);
