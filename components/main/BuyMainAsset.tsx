'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { getTierLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, TierLevel } from '@/utils/consts';
import { getAccountBalances } from '@/utils/custom';
import { AccountAllBalnaces } from '@/utils/types';
import MainLayout from '../layout/MainLayout';
import { qrCode } from '@/images';
import Image from 'next/image';

interface BuyMainAssetProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function BuyMainAsset({ currentView, setCurrentView }: BuyMainAssetProps) {
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
    <MainLayout title="Buy QINFRAX">
      <div className="relative">
        <div>
          <Image src={qrCode} alt="QrCode" className="w-full h-auto mb-4 drop-shadow-xl" />
        </div>
        <div>
          <button
            onClick={() => window.open(`https://lobstr.co/trade/native/${String(MAIN_ASSET_CODE).toUpperCase()}:${MAIN_ISSUER_ADDRESS}`, '_blank')}
            className="btn btn-outline btn-success btn-lg w-full"
          >
            Buy on Lobstr
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
