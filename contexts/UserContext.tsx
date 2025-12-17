// contexts/UserContext.tsx

'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { TierLevel, getTierLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, StakingLevel, getStakingLevel, StockLevel, getStockLevel, STOCK_ASSET_CODE, STOCK_ISSUER_ADDRESS } from '@/utils/consts';
import { getAccountBalances } from '@/utils/custom';
import { AccountAllBalnaces } from '@/utils/types';
import { useAppStore } from '@/utils/app-store';

interface UserContextType {
  mainTokenBalance: number | null;
  stockTokenBalance: number | null;
  userLevel: TierLevel | null;
  stakingLevel: StakingLevel | null;
  stockLevel: StockLevel | null;
  accountBalances: AccountAllBalnaces | null;
  updateBalanceData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedWalletId, getSelectedWalletAddress } = useAppStore();
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);

  const [mainTokenBalance, setMainTokenBalance] = useState<number | null>(null);
  const [stockTokenBalance, setStockTokenBalance] = useState<number | null>(null);
  const [userLevel, setUserLevel] = useState<TierLevel | null>(null);
  const [stakingLevel, setStakingLevel] = useState<StakingLevel | null>(null);
  const [stockLevel, setStockLevel] = useState<StockLevel | null>(null);
  const [accountBalances, setAccountBalances] = useState<AccountAllBalnaces | null>(null);
  const [lastBalanceDataUpdated, setLastBalanceDataUpdated] = useState<number | null>(null); // internal only

  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedWalletAddress) return;
      const now = Date.now();
      if (lastBalanceDataUpdated && now - lastBalanceDataUpdated < 4000) {
        // Skip update if less than 4 seconds
        return;
      }
      updateBalanceData();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval); // cleanup
  }, [selectedWalletAddress, lastBalanceDataUpdated]);

  useEffect(() => {
    if (!getSelectedWalletAddress) return;

    const swa = getSelectedWalletAddress();
    if (swa) {
      setSelectedWalletAddress(swa);
    }
  }, [selectedWalletId, getSelectedWalletAddress]);

  useEffect(() => {
    if (selectedWalletAddress) {
      updateBalanceData(); // initial load
    }
  }, [selectedWalletAddress]);

  const updateBalanceData = async () => {
    if (!selectedWalletAddress) return;

    const balances = await getAccountBalances(selectedWalletAddress);
    balances?.tokenBalances?.sort((a, b) => {
      const isAMain = a.assetCode === MAIN_ASSET_CODE && a.assetIssuer === MAIN_ISSUER_ADDRESS;
      const isBMain = b.assetCode === MAIN_ASSET_CODE && b.assetIssuer === MAIN_ISSUER_ADDRESS;
    
      const isAStock = a.assetCode === STOCK_ASSET_CODE && a.assetIssuer === STOCK_ISSUER_ADDRESS;
      const isBStock = b.assetCode === STOCK_ASSET_CODE && b.assetIssuer === STOCK_ISSUER_ADDRESS;
    
      if (isAMain && !isBMain) return -1;
      if (!isAMain && isBMain) return 1;
      
      if (isAStock && !isBStock) return -1;
      if (!isAStock && isBStock) return 1;
    
      return 0; // keep original order otherwise
    });

    setAccountBalances(balances);

    const tokenBalance = balances?.tokenBalances?.find(
      (token) => token.assetCode === MAIN_ASSET_CODE && token.assetIssuer === MAIN_ISSUER_ADDRESS
    )?.balance ?? 0;

    const stkBalance = balances?.tokenBalances?.find(
      (token) => token.assetCode === STOCK_ASSET_CODE && token.assetIssuer === STOCK_ISSUER_ADDRESS
    )?.balance ?? 0;

    setMainTokenBalance(Number(tokenBalance));
    setUserLevel(getTierLevel(Number(tokenBalance)));
    setStakingLevel(getStakingLevel(Number(tokenBalance)));
    
    setStockTokenBalance(Number(stkBalance));
    setStockLevel(getStockLevel(Number(stkBalance)));
    setLastBalanceDataUpdated(Date.now()); // internal tracking only
  };

  return (
    <UserContext.Provider value={{ mainTokenBalance, stockTokenBalance, userLevel, stakingLevel, stockLevel, accountBalances, updateBalanceData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
