'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import MainLayout from '../layout/MainLayout';
import { useUser } from '@/contexts/UserContext';
import BgLayout from '../layout/BgLayout';
import { bgGr1 } from '@/images';
import MyPageTitle2 from '../custom/MyPageTitle2';
import { useGameStore } from '@/utils/game-mechanics';
import { useWisStore } from '@/utils/wis-store';

interface WalletInsurancePageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function WalletInsurancePage({ currentView, setCurrentView }: WalletInsurancePageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, stakingLevel, accountBalances, updateBalanceData } = useUser();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  
  const { userTelegramUserName, userTelegramInitData } = useGameStore();

  // Request Wallet Insurance Store
  const {
    lastSubmit, setLastSubmit,
  } = useWisStore();

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

  const handleSubmit = async () => {
    // Check if last submit was within 3 days
    const now = Date.now();
    const threeDaysInMs = 1 * 24 * 60 * 60 * 1000;

    if (lastSubmit && now - lastSubmit < threeDaysInMs) {
      showToast('Your Wallet Insurance Request is already on its way.', 'error');
      return;
    }

    // if (!issuerId) {
    //   showToast('Please fill in all fields', 'error');
    //   return;
    // }

    try {
      const response = await fetch('/api/tg_wallet_insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: userTelegramInitData,
          tier: userLevel?.level ?? 0,
          walletAddress: selectedWalletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sending request');
      }

      await response.json();

      // Clear fields
      // setIssuerId('');
      setLastSubmit(now);

      showToast('Your request has been procesed. We will contact you shortly!', 'success');
    } catch (error) { 
      showToast('' + error, 'error');
    }
  };

  return (
    <BgLayout backgroundImage={bgGr1.src} topSpaceSize='small' darkCurtain={true} topSpaceContent={(<>
      <MyPageTitle2>
        Wallet Insurance
      </MyPageTitle2>
    </>)}>

      <div className="relative p-4 px-2">
        {/* Wallet Address Display */}
        {selectedWalletAddress ? (
          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Wallet Address</legend>
              {/* <input
                type="text"
                value={selectedWalletAddress}
                readOnly
                className="input input-bordered w-full"
              /> */}
              
              <h3 className="text-base font-semibold text-gray-200" style={{wordBreak: 'break-all'}}>
                {selectedWalletAddress}
              </h3>
            </fieldset>
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="btn btn-outline btn-success btn-lg w-full"
            >
              Insure Wallet
            </button>
          </div>
        ) : (
          <h1 className="text-xl text-center mt-10">Loading ...</h1>
        )}
      </div>
    </BgLayout>
  );
}
