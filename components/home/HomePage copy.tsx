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

    const recentIncomeAmount = await getTotalXLMReceived(selectedWalletAddress);
    setRecentIncomeAmount(recentIncomeAmount);
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
      <div className="relative text-neutral">
        <h2 className="text-md font-light mb-2 tracking-wide uppercase">INCOME</h2>

        {/* Display XLM in large black text */}
        <div className="text-4xl font-light mb-6">
          <span className="text-xl font-semibold mr-2">XLM</span>
          {Number(accountBalances?.nativeBalance ?? 0).toFixed(2)}
        </div>

        {!isInfinityLevel && isLoaded && (<>
          <MyCard className="mt-4">
            <div className="space-y-2">
              {/* Progress Bar */}
              <progress
                className="progress progress-primary w-full"
                value={progress}
                max="100"
              ></progress>

              {(balanceNeeded > 0 && !isInfinityLevel && userLevel) && (<>
                <p className="text-sm">
                  Current Tier: {userLevel.level} — You need <span className={"text-error font-bold"}>{balanceNeeded.toFixed(2)}</span> QINFRAX more to upgrade!
                </p>
                <div>
                  <button
                    onClick={() => setCurrentView('buymain')}
                    className="btn btn-outline btn-success btn-sm"
                  >
                    Buy more
                  </button>
                </div>
              </>)}
            </div>
          </MyCard>
        </>)}

        {/* Render stack graph for 12 months */}
        <MyCard className="mt-4">
            <h2 className="text-md font-semibold text-gray-300 mb-2 tracking-wide uppercase">INCOME</h2>

            <div className="text-3xl font-semibold text-gray-300">
              <span className="tracking-tight">
                {recentIncomeAmount >= 1 ? recentIncomeAmount.toFixed(2) : Number(recentIncomeAmount ?? 0).toFixed(4)}
              </span>
              &nbsp;
              <span className="font-bold text-gray-300">XLM</span>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stackChartData} barGap={2}>
                  <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="rent" stackId="a" fill="#EF4444" barSize={10} radius={5} />
                  <Bar dataKey="food" stackId="a" fill="#3B82F6" barSize={10} radius={5} />
                  <Bar dataKey="travel" stackId="a" fill="#10B981" barSize={10} radius={5} />
                  <Bar dataKey="misc" stackId="a" fill="#06B6D4" barSize={10} radius={5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </MyCard>

        {/* Render the list of expenses */}
        <MyCard className="mt-4">
            <h2 className="text-md font-semibold text-gray-300 mb-2 tracking-wide uppercase">EXPENSES</h2>

            {/* Display XLM in large black text */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-3xl font-semibold text-gray-300">
                <span className="tracking-tight">0.00</span>
                <span className="text-lg font-semibold ml-2">XLMUSD</span>
              </div>
              <MoveDown className="text-pink-500" />
            </div>

            {!MOCK_EXPENSES_LIST?.length && (
              <>
                <h2 className="text-md font-semibold text-orange-500 mb-2 tracking-wide uppercase">No recent transactions</h2>
              </>
            )}

            <ul className="space-y-2">
              {MOCK_EXPENSES_LIST.map((expense: any, index) => {
                const IconComponent = expense.icon;
                return (
                  <li key={index} className="flex justify-between items-center pb-2">
                    <div className="flex items-center space-x-2">
                      {/* Pie Chart */}
                      <div className="w-16 h-16 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              <linearGradient id="pinkToPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#E1255D" />
                                <stop offset="100%" stopColor="#6B48CE" />
                              </linearGradient>
                            </defs>
                            <Pie
                              data={[
                                { name: 'percent', value: expense.percent },
                                { name: 'empty', value: 100 - expense.percent },
                              ]}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={30}
                              cornerRadius={3}
                              startAngle={90}
                              endAngle={-450}
                            >
                              <Cell fill="url(#pinkToPurple)" />
                              <Cell fill="#E5E7EB" />
                              <Label value={`${expense.percent}%`} position="center" className="text-sm font-semibold text-blue-600" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Icon and Text */}
                      <div>
                        <h3 className="mb-2 text-sm text-gray-300">{expense.name?.toUpperCase()}</h3>
                        <p className="text-xs font-medium text-gray-300 flex items-center">
                          <IconComponent className="w-4 h-4 text-pink-500 inline-block mr-1" />
                          <span>{expense.category?.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>

                    {/* Balance and End Icon */}
                    <div className="ml-auto flex items-center space-x-2">
                      <span className="font-semibold text-md text-[#FD7267]">
                        - $ {expense.balance?.toLocaleString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
        </MyCard>
      </div>
    </MainLayout>
  );
}