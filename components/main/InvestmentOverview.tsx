'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { getTierLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, TierLevel } from '@/utils/consts';
import { getTokenBalance } from '@/utils/custom';
import MainLayout from '../layout/MainLayout';
import { useUser } from '@/contexts/UserContext';
import MyCard from '../custom/MyCard';

interface InvestmentOverviewProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function InvestmentOverview({ currentView, setCurrentView }: InvestmentOverviewProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, stakingLevel, accountBalances, updateBalanceData } = useUser();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);

  // BEGIN initial_load_logic
  const handleViewChange = (view: string) => {
    console.log('Attempting to change view to:', view);
    if (typeof setCurrentView === 'function') {
      try {
        triggerHapticFeedback(window);
        setCurrentView(view);
        console.log('View change successful');
      } catch (error) {
        console.error('Error occurred while changing view:', error);
      }
    } else {
      console.error('setCurrentView is not a function:', setCurrentView);
    }
  };

  useEffect(() => {
    let swa = getSelectedWalletAddress();
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
  // END initial_load_logic

  const isLoaded = mainTokenBalance !== null;
  const isInsufficientBalance = isLoaded && userLevel === null;
  const isInfinityLevel = userLevel?.end === Infinity;

  let progress = userLevel && mainTokenBalance !== null
    ? ((mainTokenBalance - userLevel.start) / (userLevel.end - userLevel.start)) * 100
    : 0;
  progress = progress <= 100 ? progress : 100;

  if (isInfinityLevel) {
    progress = 100;
  }

  const balanceNeeded = userLevel && mainTokenBalance !== null
    ? Math.max(0, userLevel.end - mainTokenBalance + 1)
    : 0;

  return (
    <MainLayout title="My Tier">
      <div className="relative space-y-4">
        {/** BEGIN page_content */}
        {isLoaded ? (
          <>
            {/** BEGIN after_web3_loaded */}
            {/* Balance Card */}
            <MyCard glow='info'>
              <div className="text-center">
                <div className="text-sm text-gray-200 mb-2">QINFRAX Balance</div>
                <div className="text-3xl font-bold text-success">
                  {Number(mainTokenBalance).toLocaleString()}
                </div>
              </div>
            </MyCard>

            {/** BEGIN normal_view_sufficient_holdings */}
            {userLevel && (<>
              {/* Tier Level Card */}
              <MyCard>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-200">Current Tier</div>
                  <div className="text-2xl font-bold text-gray-300">
                    Tier {userLevel?.level}
                  </div>
                </div>

                {/* Progress Bar - Hide for Infinity Level */}
                {!isInfinityLevel && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-200">
                      <span>{userLevel.start.toLocaleString()} QINFRAX</span>
                      <span>{userLevel.end.toLocaleString()} QINFRAX</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-200">
                      Progress: <span className="font-semibold text-success">{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/** BEGIN: Next_tier_info_and_buy_button */}                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Next Tier Info - Show for non-infinity users who need more */}       
                  {(balanceNeeded > 0 && !isInfinityLevel) && (
                    <div className="text-sm text-gray-200 mb-3">
                      Need <span className="font-bold text-info">{balanceNeeded.toLocaleString()}</span> more QINFRAX to reach Tier {userLevel.level + 1}
                    </div>
                  )}
                  <button
                    onClick={() => setCurrentView('buymain')}
                    className="btn btn-outline btn-success w-full"
                  >
                    Buy QINFRAX
                  </button>
                </div>
                {/** END: Next_tier_info_and_buy_button */}
              </MyCard>
              
              {/** BEGIN WARNING_FOR_ZERO_LEVEL */}
              {userLevel.level === 0 && (
                <div className="bg-panel-glass border border-info rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 shrink-0 text-warning"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-warning mb-1">Tier 0 - No Benefits Available</h3>
                      <div className="text-sm text-warning">
                        You need to reach at least <span className='font-bold text-success'>Tier 1</span> to get benefits
                      </div>
                      <button
                        onClick={() => setCurrentView('buymain')}
                        className="btn btn-outline btn-success btn-sm mt-3"
                      >
                        Buy QINFRAX
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/** END WARNING_FOR_ZERO_LEVEL */}
            </>)}
            {/** END normal_view_sufficient_holdings */}
            {/** END after_web3_loaded */}
          </>
        ) : (
          <>
            <h1 className="text-xl text-center mt-4">Loading ...</h1>
          </>
        )}
        {/** END page_content */}
      </div>
    </MainLayout>
  );
}
