'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { MAIN_ASSET_CODE, SECOND_ASSETS } from '@/utils/consts';
import MainLayout from '../layout/MainLayout';
import MyPageTitle from '../custom/MyPageTitle';
import BgLayout from '../layout/BgLayout';
import MyPageTitle2 from '../custom/MyPageTitle2';
import { bgGr1, bgGr2 } from '@/images';

const ASSETS = [
  { code: 'XLM', issuer: 'native' },
  ...SECOND_ASSETS,
];

interface SwapPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function SwapPage({ currentView, setCurrentView }: SwapPageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [fromAsset, setFromAsset] = useState(ASSETS[0]);
  const [toAsset, setToAsset] = useState(ASSETS[1]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapUrl, setSwapUrl] = useState('');

  useEffect(() => {
    const swa = getSelectedWalletAddress();
    if (!swa) {
      handleViewChange('wallets');
      return;
    }
    setSelectedWalletAddress(swa);
  }, [getSelectedWalletAddress]);

  const handleViewChange = (view: string) => {
    try {
      triggerHapticFeedback(window);
      setCurrentView(view);
    } catch (error) {
      console.error('Error occurred while changing view:', error);
    }
  };  

  const onClickSwap = () => {
    setIsModalOpen(true);
  };

  const handleSwap = () => {
    if (!fromAsset || !toAsset) return;
    const isSameAsset = fromAsset.issuer === toAsset.issuer && fromAsset.code === toAsset.code;
    if (isSameAsset) {
      showToast('You selected same assets', 'error');
      return;
    }

    // Construct trade URL
    let tradeUrl = `https://lobstr.co/trade/${fromAsset.issuer === 'native' ? 'native' : (fromAsset.code + ':' + fromAsset.issuer)}`;
    if (toAsset.issuer !== 'native') {
      tradeUrl += `/${toAsset.code}:${toAsset.issuer}`;
    }

    window.open(tradeUrl);
    setIsModalOpen(false);
  };

  return (
    <BgLayout backgroundImage={bgGr1.src} topSpaceSize='tiny' topSpaceContent={(<>
      <MyPageTitle2>
        Swap Assets
      </MyPageTitle2>
    </>)}>
      <div className="relative p-4">
        {/* Asset Selection */}
        <div className="space-y-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">From</legend>
            <select
              value={fromAsset.code}
              onChange={(e) => setFromAsset(ASSETS.find(a => a.code === e.target.value)!)}
              className="select select-bordered w-full"
            >
              {ASSETS.map((asset) => (
                <option key={asset.code} value={asset.code}>
                  {asset.code}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">To</legend>
            <select
              value={toAsset.code}
              onChange={(e) => setToAsset(ASSETS.find(a => a.code === e.target.value)!)}
              className="select select-bordered w-full"
            >
              {ASSETS.map((asset) => (
                <option key={asset.code} value={asset.code}>
                  {asset.code}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        {/* Swap Button */}
        <div className='mt-4'>
          <button
            onClick={onClickSwap}
            className="btn btn-outline btn-success btn-lg w-full"
          >
            Swap
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal modal-open" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </form>
            <h2 className="text-xl font-bold mb-4 text-center">Confirm Swap</h2>
            <p className="text-center mb-4">Stablecoins can be used directly with the card.</p>
            <div className="modal-action flex justify-center space-x-4">
              <button
                className="btn btn-outline btn-success btn-wide"
                onClick={handleSwap}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </BgLayout>
  );
}
