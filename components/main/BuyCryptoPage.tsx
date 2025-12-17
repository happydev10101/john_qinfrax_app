'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { buyableCryptoCurrencyList, MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, StockHolding } from '@/utils/consts';
import { getTokenBalance, getCryptoPrices, getStockPrices, getMinDiscountableHoldAmount } from '@/utils/custom';
import { AccountTokenBalance } from '@/utils/types';
import MainLayout from '../layout/MainLayout';
import { coinLogo, xlmLogo, xrpLogo, usdcLogo, moneyBag, bgGr1, bgStock, cryptoImageMap } from '@/images';
import MyPageTitle from '../custom/MyPageTitle';
import { useUser } from '@/contexts/UserContext';
import MyPageTitle2 from '../custom/MyPageTitle2';
import MyCard from '../custom/MyCard';
import Image from 'next/image';
import { useGameStore } from '@/utils/game-mechanics';

interface BuyCryptoPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function BuyCryptoPage({ currentView, setCurrentView }: BuyCryptoPageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { mainTokenBalance, userLevel, accountBalances, updateBalanceData } = useUser();
  const { userTelegramUserName, userTelegramInitData } = useGameStore();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null);
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);

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
    ////////////////////////////
    const cryptoprs = await getCryptoPrices();
    setCryptoPrices(cryptoprs);
  };

  const handleViewChange = (view: string) => {
    try {
      triggerHapticFeedback(window);
      setCurrentView(view);
    } catch (error) {
      console.error('Error changing view:', error);
    }
  };

  const handleStake = () => {
    showToast('The amount will be available for withdraw when the app releases officially', 'error');
  };

  const handleBuyClick = (crypto: any) => {
    setSelectedCrypto(crypto);
    setBuyAmount('');
    setShowBuyModal(true);
  };

  const handleCloseModal = () => {
    setShowBuyModal(false);
    setSelectedCrypto(null);
    setBuyAmount('');
  };

  const handleGetPrivateSale = async () => {
    if (!selectedCrypto || !buyAmount) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    
    if (!selectedWalletAddress) {
      showToast('Wallet address not found', 'error');
      return;
    }

    if (!userLevel) {
      showToast('User level not found', 'error');
      return;
    }

    try {
      const response = await fetch('/api/tg_buy_crypto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: userTelegramInitData,
          tier: userLevel.level,
          walletAddress: selectedWalletAddress,
          cryptoCode: selectedCrypto.code,
          amount: parseFloat(buyAmount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Private sale request for ${buyAmount} ${selectedCrypto.code} submitted!`, 'success');
        handleCloseModal();
      } else {
        showToast(data.error || 'Failed to submit private sale request', 'error');
      }
    } catch (error) {
      console.error('Error submitting private sale request:', error);
      showToast('Failed to submit private sale request', 'error');
    }
  };

  const isLoaded = mainTokenBalance !== null && userLevel!== null;
  
  const isInfinityLevel = userLevel?.end === Infinity;
  const balanceNeeded = userLevel && mainTokenBalance !== null
    ? Math.max(0, userLevel.end - mainTokenBalance + 1)
    : 0;
  const isDiscountable = (userLevel?.discountPercent ?? 0) > 0;

  return (
    <MainLayout title="Buy Crypto">
      <div className="relative">
        {isLoaded ? (<>
          {/** BEGIN Upgrade_message_if_not_discountable */}
          {!isDiscountable && (
            <MyCard className="text-center mb-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-200 mb-2">Your QINFRAX Balance</div>
                  <div className="text-3xl font-bold text-gray-300">
                    {Number(mainTokenBalance).toLocaleString()}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-300 leading-relaxed">
                    Crypto purchase at <span className="font-bold text-success">discounted price</span> is available from{' '}
                    <span className="font-bold text-gray-300">{getMinDiscountableHoldAmount().toLocaleString()}+</span> QINFRAX .
                  </div>
                  <button
                    onClick={() => setCurrentView('buymain')}
                    className="btn btn-outline btn-success mt-4"
                  >
                    Buy QINFRAX
                  </button>
                </div>
              </div>
            </MyCard>
          )}
          {/** END Upgrade_message_if_not_discountable */}

          <div className="mb-4 text-center">
            <div className="alert alert-success text-xs">
              The higher your tier level, the greater your discount.
            </div>
          </div>

          {/** BEGIN: Crypto_Currency_List */}
          {/** Note: Always show crypto currency list */}
          <div className="mb-4">
            {/* Mobile Light Theme Cards */}
            <div className="space-y-2">
              {buyableCryptoCurrencyList.map((item, index) => {
                let logo = moneyBag;
                let price = 0;

                if (item.code in cryptoImageMap) {
                  logo = cryptoImageMap[item.code];
                }
                if (item.cgkcode in cryptoPrices) {
                  price = cryptoPrices[item.cgkcode];
                }
                
                // Calculate discounted price
                let discountedPrice = price;
                if (userLevel.discountPercent > 0) { 
                  discountedPrice = price * (1 - userLevel.discountPercent / 100);
                }

                const hasDiscount = userLevel.discountPercent > 0;
                const discountAmount = price - discountedPrice;

                return (
                  <MyCard
                    key={index}
                    p={4}
                  >
                    {/* Mobile Card Layout */}
                    <div className="flex items-center justify-between">
                      {/* Left: Asset Info */}
                      <div className="flex items-center space-x-3 flex-1">
                        <Image src={logo} alt={`${item.name} logo`} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-300 text-base">{item.code}</span>
                            {isDiscountable && hasDiscount && (
                              <span className="bg-green-100 text-green-800 badge badge-success badge-sm">
                                -{userLevel.discountPercent}%
                              </span>
                            )}
                          </div>
                          <div className="text-gray-300 text-sm">{item.name}</div>
                        </div>
                      </div>

                      {/* Right: Price and Action */}
                      {isDiscountable ? (
                        <div className="text-right">
                          <div className="flex flex-col items-end space-y-1">
                            {/* Current Price */}
                            <div className="text-lg font-bold text-gray-300">
                              ${discountedPrice.toLocaleString('en-US', { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2 
                              })}
                            </div>
                            
                            {/* Original Price (if discounted) */}
                            {hasDiscount && (
                              <div className="text-sm text-gray-400 line-through">
                                ${price.toLocaleString('en-US', { 
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            )}

                            {/* Savings (if discounted) */}
                            {hasDiscount && (
                              <div className="text-xs text-success font-medium">
                                Save ${discountAmount.toLocaleString('en-US', { 
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            )}

                            {/* Buy Button */}
                            <button
                              onClick={() => handleBuyClick(item)}
                              className="btn btn-outline btn-success text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-2"
                            >
                              Buy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-xs text-gray-400 italic">
                            Available at Tier 1+
                          </div>
                        </div>
                      )}
                    </div>
                  </MyCard>
                );
              })}
            </div>        
          </div>
          {/** END: Crypto_Currency_List */}
          </>) : (
          <h1 className="text-xl text-center mt-6">Loading...</h1>
        )}

        {/** BEGIN: Buy Modal */}
        {isLoaded && showBuyModal && selectedCrypto && (
          <div className="modal modal-open">
            <div className="modal-box text-neutral">
              <h3 className="font-bold text-lg mb-4">Buy {selectedCrypto.name}</h3>
              
              {/* Current Price Display */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-200">Current Market Price</div>
                <div className="text-2xl font-bold text-gray-300">
                  ${cryptoPrices[selectedCrypto.cgkcode]?.toLocaleString('en-US', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8 
                  }) || '0.00'}
                </div>
              </div>

              {/* Amount Input */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-sm">Amount of {selectedCrypto.code} to buy</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="ku-input ku-input-bordered w-full"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  min="0"
                  step="0.00000001"
                />
              </div>

              {/* Price Calculation */}
              {buyAmount && parseFloat(buyAmount) > 0 && (
                <div className="text-success bg-opacity-10 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-200 mb-2">Your Price (with {userLevel?.discountPercent || 0}% discount)</div>
                  <div className="text-xl font-bold text-success">
                    ${(parseFloat(buyAmount) * (cryptoPrices[selectedCrypto.cgkcode] || 0) * (1 - (userLevel?.discountPercent || 0) / 100)).toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
                  </div>
                  {userLevel?.discountPercent > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      You save ${(parseFloat(buyAmount) * (cryptoPrices[selectedCrypto.cgkcode] || 0) * (userLevel.discountPercent / 100)).toLocaleString('en-US', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-action">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-text btn-success"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGetPrivateSale}
                  className="btn btn-outline btn-success"
                  disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                >
                  Get Private Sale
                </button>
              </div>
            </div>
          </div>
        )}
        {/** END: Buy Modal */}
      </div>
    </MainLayout>
  );
}
