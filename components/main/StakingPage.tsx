'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { getStakingLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, StakingLevel } from '@/utils/consts';
import { getTokenBalance, getCryptoPrices } from '@/utils/custom';
import { AccountTokenBalance } from '@/utils/types';
import MainLayout from '../layout/MainLayout';
import { coinLogo, xlmLogo, xrpLogo, usdcLogo, bgGr1 } from '@/images';
import MyPageTitle from '../custom/MyPageTitle';
import { useUser } from '@/contexts/UserContext';
import BgLayout from '../layout/BgLayout';
import MyPageTitle2 from '../custom/MyPageTitle2';

interface StakingPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function StakingPage({ currentView, setCurrentView }: StakingPageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, stakingLevel, accountBalances, updateBalanceData } = useUser();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [tvl, setTvl] = useState<string>('...');

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

  useEffect(() => {
    if (stakingLevel) {
      async function calcTvl() {
        const prices = await getCryptoPrices();
        let tvl = 0;
        tvl += (stakingLevel?.xlm ?? 0) * prices['xlm'];
        tvl += (stakingLevel?.xrp ?? 0) * prices['xrp'];
        tvl += (stakingLevel?.usdc ?? 0) * prices['usdc'];
        let formattedTvl = Number(Number(tvl).toFixed(0)).toLocaleString() + ' $';
        setTvl(String(formattedTvl));
      }
      calcTvl();
    }
  }, [stakingLevel]);

  const load_data = async () => {
    if (!selectedWalletAddress) return;
    updateBalanceData();
  };

  const handleViewChange = (view: string) => {
    try {
      triggerHapticFeedback(window);
      setCurrentView(view);
    } catch (error) {
      console.error('Error changing view:', error);
    }
  };

  const handleStake = () => {
    showToast('The amount will be available for withdraw when the app releases officially', 'error');
  };

  const isLoaded = mainTokenBalance !== null && stakingLevel !== null;

  const myTokenBalances: AccountTokenBalance[] = [
    ...(stakingLevel?.level ? [
      { assetCode: 'XLM', assetIssuer: 'stellar.org', balance: String(stakingLevel.xlm) },
      { assetCode: 'XRP', assetIssuer: 'xrpl.org', balance: String(stakingLevel.xrp) },
      { assetCode: 'USDC', assetIssuer: 'usdc.org', balance: String(stakingLevel.usdc) },
    ] : []),
  ];

  
  const isInfinityLevel = stakingLevel?.end === Infinity;
  const balanceNeeded = stakingLevel && mainTokenBalance !== null
    ? Math.max(0, stakingLevel.end - mainTokenBalance + 1)
    : 0;

  return (
    <BgLayout backgroundImage={bgGr1.src} topSpaceSize='tiny' topSpaceContent={(<>
      <MyPageTitle2>
        Staking
      </MyPageTitle2>
    </>)}>
      <div className="relative">
        {isLoaded ? (
          stakingLevel.level > 1 ? (
            <div className="mt-4">
              <ul>
                {myTokenBalances.map((token, index) => {
                  let logo = coinLogo;
                  if (token.assetCode === 'XLM') logo = xlmLogo;
                  if (token.assetCode === 'XRP') logo = xrpLogo;
                  if (token.assetCode === 'USDC') logo = usdcLogo;

                  return (
                    <li
                      key={index}
                      className="flex justify-between items-center border-b border-gray-200 py-4"
                    >
                      <div className="flex items-center space-x-4">
                        <img src={logo.src} alt={`${token.assetCode} logo`} className="w-8 h-8 rounded-full" />
                        <span className="text-base font-bold text-gray-300">{token.assetCode}</span>
                      </div>
                      <span className="text-base font-bold text-primary">{Number(token.balance).toFixed(0)}</span>
                    </li>
                  );
                })}

                {/* Total TVL */}
                <li className="flex justify-between items-center border-gray-200 py-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-base font-bold text-gray-300">Total Value</span>
                  </div>
                  <span className="text-base font-bold text-primary">{tvl}</span>
                </li>
              </ul>              

              {/* Next Tier indicate */}
              <div className="mt-6">
                {balanceNeeded > 0 && !isInfinityLevel && (
                  <p className="text-sm">
                    Your Staking Tier is <span className="text-error font-bold">{stakingLevel?.level}</span>. <br/> You need <span className="text-error font-bold">{balanceNeeded.toFixed(2)}</span> QINFRAX more to reach next Staking tier!
                  </p>
                )}
              </div>

              {/* Withdraw Button */}
              <div className="mt-6">
                <button
                  onClick={handleStake}
                  className="btn btn-outline btn-success btn-lg w-full"
                >
                  Withdraw
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h1 className="text-base font-semibold text-gray-200">
                QINFRAX Balance: <span className="text-primary">{Number(mainTokenBalance).toFixed(0)}</span>
              </h1>
              <h2 className="text-base font-semibold text-gray-200">
                Staking is available from <span className="text-primary">300K+</span> QINFRAX hold.
              </h2>
            </div>
          )
        ) : (
          <h1 className="text-xl text-center mt-6">Loading...</h1>
        )}
      </div>
    </BgLayout>
  );
}
