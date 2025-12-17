import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

interface Wallet {
  id: string;
  address: string;
  completed: boolean;
}

interface AppState {
  wallets: Wallet[];
  selectedWalletId: string | null;
  addWallet: (address: string) => void;
  removeWallet: (id: string) => void;
  toggleComplete: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  getSelectedWalletAddress: () => string | null;
  getSelectedWallet: () => Wallet | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      wallets: [],
      selectedWalletId: null,

      addWallet: (address) =>
        set((state) => {
          const newWallet = { id: nanoid(), address, completed: false };
          const isFirstWallet = state.wallets.length === 0;

          return {
            wallets: [...state.wallets, newWallet],
            selectedWalletId: isFirstWallet ? newWallet.id : state.selectedWalletId,
          };
        }),

      removeWallet: (id) =>
        set((state) => {
          const newWallets = state.wallets.filter((wallet) => wallet.id !== id);
          const isRemovingSelected = state.selectedWalletId === id;

          return {
            wallets: newWallets,
            selectedWalletId: isRemovingSelected ? null : state.selectedWalletId,
          };
        }),

      toggleComplete: (id) =>
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === id ? { ...wallet, completed: !wallet.completed } : wallet
          ),
        })),

      setSelectedId: (id) => set({ selectedWalletId: id }),

      getSelectedWalletAddress: () => {
        const { wallets, selectedWalletId } = get();
        const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId);
        return selectedWallet ? selectedWallet.address : null;
      },

      getSelectedWallet: () => {
        const { wallets, selectedWalletId } = get();
        return wallets.find((wallet) => wallet.id === selectedWalletId) || null;
      },
    }),
    { name: 'wallet-store' }
  )
);
