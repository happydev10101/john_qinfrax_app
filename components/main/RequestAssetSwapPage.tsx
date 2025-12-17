'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { getTierLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, TierLevel } from '@/utils/consts';
import { getTokenBalance } from '@/utils/custom';
import MainLayout from '../layout/MainLayout';
import { useGameStore } from '@/utils/game-mechanics';
import MyPageTitle from '../custom/MyPageTitle';
import { useRasStore } from '@/utils/ras-store';
import { useUser } from '@/contexts/UserContext';
import BgLayout from '../layout/BgLayout';
import { bgGr1 } from '@/images';
import MyPageTitle2 from '../custom/MyPageTitle2';

interface RequestAssetSwapPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function RequestAssetSwapPage({ currentView, setCurrentView }: RequestAssetSwapPageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, stakingLevel, accountBalances, updateBalanceData } = useUser();
  
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);

  const { userTelegramUserName, userTelegramInitData } = useGameStore();

  // Request Asset Swap Store
  const {
    lastSubmit, setLastSubmit,
    issuerId, telegramChannel, assetName, domain, assetPrice, 
    setIssuerId, setTelegramChannel, setAssetName, setDomain, setAssetPrice
  } = useRasStore();

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
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    // if (lastSubmit && now - lastSubmit < threeDaysInMs) {
    //   showToast('Your Asset Registration is already on its way.', 'error');
    //   return;
    // }

    if (!issuerId || !telegramChannel || !assetName || !domain || !assetPrice) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const response = await fetch('/api/tg_request_asset_swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: userTelegramInitData,
          tier: userLevel?.level ?? 0,
          walletAddress: selectedWalletAddress,
          issuerId,
          telegramChannel,
          assetName,
          domain,
          assetPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sending request');
      }

      await response.json();

      // Clear fields
      setIssuerId('');
      setTelegramChannel('');
      setAssetName('');
      setDomain('');
      setAssetPrice('');
      setLastSubmit(now);

      showToast('Your asset registration has been received.', 'success');
    } catch (error) { 
      showToast('' + error, 'error');
    }
  };

  return (
    <BgLayout backgroundImage={bgGr1.src} topSpaceSize='small' darkCurtain={true} topSpaceContent={(<>
      <MyPageTitle2>
        Register Asset
      </MyPageTitle2>
    </>)}>

      <div className="relative">
        {/* Form Fields */}
        <div className="space-y-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Issuer ID</legend>
            <input
              type="text"
              value={issuerId}
              onChange={(e) => setIssuerId(e.target.value)}
              placeholder="Enter the issuer ID"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Telegram Channel</legend>
            <input
              type="text"
              value={telegramChannel}
              onChange={(e) => setTelegramChannel(e.target.value)}
              placeholder="Enter your Telegram channel"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Asset Name</legend>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="Enter the asset name"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Domain</legend>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter the asset's domain"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Asset Price</legend>
            <input
              type="number"
              value={assetPrice}
              onChange={(e) => setAssetPrice(e.target.value)}
              placeholder="Enter the asset price"
              className="input input-bordered w-full"
            />
          </fieldset>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="btn btn-outline btn-success btn-lg w-full"
          >
            Submit Request
          </button>
        </div>
      </div>
    </BgLayout>
  );
}
