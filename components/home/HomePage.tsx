'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { getTierLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, TierLevel, SECOND_ASSETS, MOCK_EXPENSES_LIST } from '@/utils/consts';
import { getAccountBalances, getTotalXLMReceived } from '@/utils/custom';
import { AccountAllBalnaces } from '@/utils/types';
import { useAppStore } from '@/utils/app-store';
import { triggerHapticFeedback } from '@/utils/ui';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { MoveDown } from "lucide-react";
import HomeLayout from '../layout/HomeLayout';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '../layout/MainLayout';
import MyCard from '../custom/MyCard';

const stackChartData = [
  { month: 'J', rent: 30, food: 20, travel: 25, misc: 25 },
  { month: 'F', rent: 35, food: 25, travel: 20, misc: 20 },
  { month: 'M', rent: 40, food: 15, travel: 30, misc: 15 },
  { month: 'A', rent: 30, food: 20, travel: 25, misc: 25 },
  { month: 'M', rent: 45, food: 10, travel: 30, misc: 15 },
  { month: 'J', rent: 40, food: 15, travel: 30, misc: 15 },
  { month: 'J', rent: 35, food: 25, travel: 20, misc: 20 },
  { month: 'A', rent: 30, food: 20, travel: 25, misc: 25 },
  { month: 'S', rent: 45, food: 10, travel: 30, misc: 15 },
  { month: 'O', rent: 40, food: 15, travel: 30, misc: 15 },
  { month: 'N', rent: 35, food: 25, travel: 20, misc: 20 },
  { month: 'D', rent: 30, food: 20, travel: 25, misc: 25 },
];

const ASSETS = [
  { code: 'XLM', issuer: 'native' },
  ...SECOND_ASSETS,
];

interface HomePageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function HomePage({ currentView, setCurrentView }: HomePageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, stakingLevel, accountBalances, updateBalanceData } = useUser();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [recentIncomeAmount, setRecentIncomeAmount] = useState<number>(0);
  // custom variables
  const head_button_width = 70;

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

  const isLoaded = mainTokenBalance !== null || userLevel !== null;
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
    <MainLayout title="Home">
      <div className="relative text-neutral space-y-4">
        {/** BEGIN Tier_Progress_Card */}
        {isLoaded && userLevel && (
          <MyCard>
            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="text-xs text-gray-200 mb-1">Tier {userLevel.level} {isInfinityLevel ? "Completed" : "Progress"}</div>
              <progress
                className="progress w-full text-info"
                value={progress}
                max="100"
              ></progress>

              {(balanceNeeded > 0 && !isInfinityLevel) && (
                <>
                  <p className="text-sm text-gray-200">
                    Need <span className="text-success font-bold">{balanceNeeded.toLocaleString()}</span> QINFRAX more to reach Tier {userLevel.level + 1}
                  </p>
                  <div>
                    <button
                      onClick={() => setCurrentView('buymain')}
                      className="btn btn-outline btn-success btn-sm"
                    >
                      Buy QINFRAX
                    </button>
                  </div>
                </>
              )}
            </div>
          </MyCard>
        )}
        {/** END Tier_Progress_Card */}
        
        {/** BEGIN QINFRAX_Benefits_Presentation */}
        <MyCard p={0} className="overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-300">Benefits from QINFRAX</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="flex items-start space-x-3 p-4">
              <span className="text-xl">🛍️</span>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-info">Up to 50% </span>of quantum infrastructure ownership
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4">
              <span className="text-xl">🎯</span>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-info">Access</span> to early quantum features
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4">
              <span className="text-xl">🎁</span>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-info">Tier-based rewards</span> and raffles
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4">
              <span className="text-xl">⚡</span>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-info">Staking boosts</span> up to 20x multiplier
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentView('investment')}
              className="btn btn-outline btn-success w-full btn-sm"
            >
              View My Tier Benefits
            </button>
          </div>
        </MyCard>
        {/** END QINFRAX_Benefits_Presentation */}
      </div>
    </MainLayout>
  );
}