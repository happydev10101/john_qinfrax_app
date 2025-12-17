'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { getTierLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, SECOND_ASSETS, STOCK_ASSET_CODE, STOCK_ISSUER_ADDRESS, TierLevel } from '@/utils/consts';
import { getAccountBalances } from '@/utils/custom';
import { AccountAllBalnaces, AccountTokenBalance } from '@/utils/types';
import MainLayout from '../layout/MainLayout';
import { bgGr1, bgGr2, bgGr3, coinLogo, xlmLogo } from '@/images';
import MyPageTitle from '../custom/MyPageTitle';
import { useUser } from '@/contexts/UserContext';
import BgLayout from '../layout/BgLayout';
import MyPageTitle2 from '../custom/MyPageTitle2';

interface BalancesOverviewProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function BalancesOverview({ currentView, setCurrentView }: BalancesOverviewProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, stakingLevel, accountBalances, updateBalanceData } = useUser();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [hideZeroBalances, setHideZeroBalances] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'main' | 'xlm'>('all');

  useEffect(() => {
    const swa = getSelectedWalletAddress();
    if (!swa) {
      handleViewChange('wallets');
      return;
    }
    setSelectedWalletAddress(swa);
  }, [getSelectedWalletAddress]);

  useEffect(() => {
    load_data();
  }, [selectedWalletAddress]);

  const load_data = async () => {
    if (!selectedWalletAddress) return;

    updateBalanceData();
  };

  const handleViewChange = (view: string) => {
    if (typeof setCurrentView === 'function') {
      try {
        triggerHapticFeedback(window);
        setCurrentView(view);
      } catch (error) {
        console.error('Error occurred while changing view:', error);
      }
    }
  };

  const isLoaded = mainTokenBalance !== null && accountBalances !== null;

  const myTokenBalances: AccountTokenBalance[] = [
    {
      assetCode: 'XLM (Native)',
      assetIssuer: 'native',
      balance: accountBalances?.nativeBalance ?? '0',
    },
    ...(accountBalances?.tokenBalances ?? []),
  ];

  const filteredBalances = myTokenBalances.filter((token) => {
    if (hideZeroBalances && Number(token.balance) <= 0) return false;

    if (selectedFilter === 'main') {
      const isNative = token.assetIssuer === 'native';
      const isMainAsset = token.assetCode === MAIN_ASSET_CODE && token.assetIssuer === MAIN_ISSUER_ADDRESS;
      const isStockAsset = token.assetCode === STOCK_ASSET_CODE && token.assetIssuer === STOCK_ISSUER_ADDRESS;
      const isSecondAsset = SECOND_ASSETS.some(
        (second) => token.assetCode === second.code && token.assetIssuer === second.issuer
      );
      return isNative || isMainAsset || isStockAsset || isSecondAsset;
    }

    if (selectedFilter === 'xlm') {
      return token.assetIssuer === 'native';
    }

    return true;
  });

  return (
    <BgLayout backgroundImage={bgGr1.src} topSpaceSize='tiny' topSpaceContent={(<>
      <MyPageTitle2>
        Balances
      </MyPageTitle2>
    </>)}>
      <div className="relative p-4 px-0">
        {isLoaded ? (
          <>
            {accountBalances ? (
              <>
                {/* Filters */}
                <div className="flex flex-col space-y-4 mb-4">
                  {/* Tabs */}
                  <div role="tablist" className="tabs tabs-box">
                    <button
                      role="tab"
                      className={`tab tab-bordered flex-1 ${selectedFilter === 'all' ? 'tab-active' : ''}`}
                      onClick={() => setSelectedFilter('all')}
                    >
                      All
                    </button>
                    <button
                      role="tab"
                      className={`tab tab-bordered flex-1 ${selectedFilter === 'main' ? 'tab-active' : ''}`}
                      onClick={() => setSelectedFilter('main')}
                    >
                      Only Main
                    </button>
                    <button
                      role="tab"
                      className={`tab tab-bordered flex-1 ${selectedFilter === 'xlm' ? 'tab-active' : ''}`}
                      onClick={() => setSelectedFilter('xlm')}
                    >
                      Only XLM
                    </button>
                  </div>

                  {/* Hide Zero Balances Checkbox */}
                  <div className="form-control">
                    <label className="label cursor-pointer space-x-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={hideZeroBalances}
                        onChange={() => setHideZeroBalances(!hideZeroBalances)}
                      />
                      <span className="label-text text-sm">Hide zero-balance assets</span>
                    </label>
                  </div>
                </div>

                {/* Token Balances List */}
                <div>
                  <ul className="divide-y divide-gray-200">
                    {filteredBalances.map((token, index) => {
                      const isNative = token.assetIssuer === 'native';
                      const logo = isNative ? xlmLogo : coinLogo;

                      return (
                        <li key={index} className="flex justify-between items-center py-3 flex-wrap">
                          <div className="flex items-center space-x-3">
                            <img
                              src={logo.src}
                              alt={`${token.assetCode} logo`}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-gray-300 font-medium text-sm">{token.assetCode}</span>
                          </div>
                          <span className="text-primary font-semibold text-sm">
                            {Number(token.balance).toFixed(2)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            ) : (
              <p className="mt-4 text-center text-gray-300">No tokens found.</p>
            )}
          </>
        ) : (
          <h1 className="text-xl text-center mt-10">Loading ...</h1>
        )}
      </div>
    </BgLayout>
  );
}
