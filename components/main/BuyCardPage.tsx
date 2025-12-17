'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { getTierLevel, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, TierLevel } from '@/utils/consts';
import { getTokenBalance } from '@/utils/custom';
import MainLayout from '../layout/MainLayout';
import { useGameStore } from '@/utils/game-mechanics';
import MyCountrySelect from '@/components/custom/MyCountrySelect';
import MyPageTitle from '../custom/MyPageTitle';
import { useCardStore } from '@/utils/card-store';
import { useUser } from '@/contexts/UserContext';
import BgLayout from '../layout/BgLayout';
import { bgCard } from '@/images';
import MyPageTitle2 from '../custom/MyPageTitle2';

interface BuyCardPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function BuyCardPage({ currentView, setCurrentView }: BuyCardPageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, stakingLevel, accountBalances, updateBalanceData } = useUser();
  
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);

  const { userTelegramUserName, userTelegramInitData } = useGameStore();

  // Card Store
  const {
    firstName, lastName, streetAddress, city, zipCode, country, phoneNumber, lastSubmit,
    setFirstName, setLastName, setStreetAddress, setCity, setZipCode, setCountry, setPhoneNumber, setLastSubmit
  } = useCardStore();

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

  const validate_TelegramUserName = (): boolean => {
    return !(!userTelegramUserName.trim()) && userTelegramUserName.trim() !== "Unknown User";
  };

  const handleSubmit = async () => {
    // Check if last submit was within 3 days
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    if (lastSubmit && now - lastSubmit < threeDaysInMs) {
      showToast('Your credit card is already on its way.', 'error');
      return;
    }

    if (!validate_TelegramUserName()) {
      showToast('Please set @username in your telegram account', 'error');
      return;
    }

    if (!firstName || !lastName || !streetAddress || !city || !zipCode || !country || !phoneNumber) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const response = await fetch('/api/tg_card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: userTelegramInitData,
          tier: userLevel?.level ?? 0,
          walletAddress: selectedWalletAddress,
          firstName,
          lastName,
          streetAddress,
          city,
          zipCode,
          country,
          phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sending request');
      }

      await response.json();

      // Clear fields
      setFirstName('');
      setLastName('');
      setStreetAddress('');
      setCity('');
      setZipCode('');
      setCountry('');
      setPhoneNumber('');
      setLastSubmit(now);

      showToast('Your card request has been received.', 'success');
    } catch (error) { 
      showToast('' + error, 'error');
    }
  };

  return (
    <BgLayout backgroundImage={bgCard.src} topSpaceSize='small' darkCurtain={true} topSpaceContent={(<>
      <MyPageTitle2>
        Order Card
      </MyPageTitle2>
    </>)}>
      <div className="relative">
        {/* Form Fields */}
        <div className="space-y-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">First Name</legend>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Last Name</legend>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Street Address</legend>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Enter your street address"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">City</legend>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Zip / Postal Code</legend>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter your zip or postal code"
              className="input input-bordered w-full"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Country</legend>
            <MyCountrySelect
              selectedCountry={country}
              setSelectedCountry={setCountry}
              menuPlacement="top"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Phone Number</legend>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="input input-bordered w-full"
            />
          </fieldset>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="btn btn-outline btn-success btn-lg w-full"
          >
            Submit Card Request
          </button>
        </div>
      </div>
    </BgLayout>
  );
}
