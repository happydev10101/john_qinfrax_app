'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { triggerHapticFeedback } from '@/utils/ui';
import MainLayout from '../layout/MainLayout';
import { useUser } from '@/contexts/UserContext';
import MyCard from '../custom/MyCard';
import { getTierLevel } from '@/utils/consts';

interface RewardsPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function RewardsPage({ currentView, setCurrentView }: RewardsPageProps) {
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance } = useUser();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);

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

  const tierLevel = getTierLevel(mainTokenBalance || 0);
  const ownershipPercent = tierLevel ? tierLevel.ownershipPercent : 0;
  const isLoaded = mainTokenBalance !== null;

  return (
    <MainLayout title="Rewards">
      <div className="relative space-y-4">
        {isLoaded ? (
          <>
            {/* Ownership Percent Card - Big and Visible */}
            <MyCard glow='info'>
              <div className="text-center">
                <div className="text-sm text-gray-200 mb-2">Your Ownership</div>
                <div className="text-5xl font-bold text-success">
                  {ownershipPercent.toFixed(2)}%
                </div>
                {tierLevel && (
                  <div className="text-sm text-gray-300 mt-2">
                    Tier {tierLevel.level}
                  </div>
                )}
              </div>
            </MyCard>

            {/* Tier Benefits Section */}
            {tierLevel && tierLevel.level > 0 && tierLevel.additionalBenifits && tierLevel.additionalBenifits.length > 0 && (
              <MyCard p={0} className="overflow-hidden">
                <div className="px-4 py-3 border-b border-info">
                  <h3 className="text-sm font-semibold text-gray-200">Tier Benefits</h3>
                </div>
                <div className="divide-y divide-info">
                  {tierLevel.additionalBenifits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4">
                      <span className="text-xl">{benefit.emoticon}</span>
                      <p
                        className="text-sm text-gray-300 flex-1"
                        dangerouslySetInnerHTML={{ __html: benefit.text }}
                      />
                    </div>
                  ))}
                </div>
              </MyCard>
            )}

            {/* Message for Tier 0 */}
            {tierLevel && tierLevel.level === 0 && (
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
          </>
        ) : (
          <>
            <h1 className="text-xl text-center mt-4">Loading ...</h1>
          </>
        )}
      </div>
    </MainLayout>
  );
}



