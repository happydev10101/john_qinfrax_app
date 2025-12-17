'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { MAIN_ASSET_CODE, SECOND_ASSETS, MOCK_EXPENSES_LIST } from '@/utils/consts';
import MainLayout from '../layout/MainLayout';
import { useAppStore } from '@/utils/app-store';
import { triggerHapticFeedback } from '@/utils/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { ChevronRight } from "lucide-react";
import MyPageTitle from '../custom/MyPageTitle';
import BgLayout from '../layout/BgLayout';
import MyPageTitle2 from '../custom/MyPageTitle2';
import { bgGr1 } from '@/images';

const ASSETS = [
  { code: 'XLM', issuer: 'native' },
  ...SECOND_ASSETS,
];

interface LoanSystemPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function LoanSystemPage({ currentView, setCurrentView }: LoanSystemPageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);

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

  return (
    <BgLayout backgroundImage={bgGr1.src} topSpaceSize='tiny' topSpaceContent={(<>
      <MyPageTitle2>
        Expenses
      </MyPageTitle2>
    </>)}>
      <div className="relative">
        {/* Display XLM in large black text */}
        <div className="text-3xl font-bold text-black mb-6">
          0.00 XLMUSD
        </div>

        {/* Render the list of expenses */}
        {!MOCK_EXPENSES_LIST?.length && (<>
          <h2 className="text-md font-semibold text-orange-500 mb-2 tracking-wide uppercase">No recent transactions</h2>
        </>)}

        <ul className="space-y-4">
          {MOCK_EXPENSES_LIST.map((expense: any, index) => {
            const IconComponent = expense.icon; // Extracting the icon component

            return (
              <li key={index} className="flex justify-between items-center pb-2">
                <div className="flex items-center space-x-4">
                  {/* Pie Chart */}
                  <div className="w-16 h-16 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {/* Define the gradient */}
                          <linearGradient id="pinkToPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E1255D" /> {/* Pink */}
                            <stop offset="100%" stopColor="#6B48CE" /> {/* Purple */}
                          </linearGradient>
                        </defs>

                        <Pie
                          data={[
                            { name: 'percent', value: expense.percent },
                            { name: 'empty', value: 100 - expense.percent },
                          ]}
                          dataKey="value"
                          cx="50%" cy="50%" innerRadius={20} outerRadius={30} cornerRadius={3}
                          startAngle={90} // Start at 12 o'clock
                          endAngle={-450} // Complete the circle clockwise
                        >
                          {/* Apply the gradient to the first slice */}
                          <Cell fill="url(#pinkToPurple)" />
                          <Cell fill="#E5E7EB" /> {/* The second cell (empty slice) */}
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
                      <span className="inline-block">{expense.category?.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                
                {/* Balance and End Icon float to the right */}
                <div className="ml-auto flex items-center space-x-2">
                  <span className="font-semibold text-lg">$ {expense.balance?.toLocaleString()} </span>                  
                  {/* End Icon */}
                  <div>
                    <ChevronRight className="w-4 h-4 inline-block mr-1" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </BgLayout>
  );
}
