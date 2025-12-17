'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';
import { MAIN_ASSET_CODE, MAIN_ISSUER_ADDRESS, StockHolding } from '@/utils/consts';
import { getTokenBalance, getCryptoPrices, getStockPrices } from '@/utils/custom';
import { AccountTokenBalance } from '@/utils/types';
import MainLayout from '../layout/MainLayout';
import { coinLogo, xlmLogo, xrpLogo, usdcLogo, moneyBag, bgGr1, bgStock, stockImageMap } from '@/images';
import MyPageTitle from '../custom/MyPageTitle';
import { useUser } from '@/contexts/UserContext';
import BgLayout from '../layout/BgLayout';
import MyPageTitle2 from '../custom/MyPageTitle2';
import Image from 'next/image';

interface StockPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function StockPage({ currentView, setCurrentView }: StockPageProps) {
  const showToast = useToast();
  const { getSelectedWalletAddress } = useAppStore();
  const { stockTokenBalance, userLevel, stockLevel, accountBalances, updateBalanceData } = useUser();

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [tvl, setTvl] = useState<string>('...');

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

  useEffect(() => {
    if (stockLevel) {
      async function calcTvl() {
        if ( !stockLevel ) {
          return;
        }
        const prices = await getStockPrices();
        let tvl = 0;
        for (let i = 0; i < stockLevel.stocks.length; i++) {
          const { code, amount } = stockLevel.stocks[i];
          if ( code in prices) {
            const price = prices[code] ?? 0;
            tvl += Number(price) * Number(amount);
          } else {
            console.error(`${code} stock does not exist in prices API data`);
          }
        }
        let formattedTvl = Number(Number(tvl).toFixed(0)).toLocaleString() + ' $';
        setTvl(String(formattedTvl));
      }
      calcTvl();
    }
  }, [stockLevel]);

  const load_data = async () => {
    if (!selectedWalletAddress) return;
    updateBalanceData();
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

  const isLoaded = stockTokenBalance !== null && stockLevel!== null;

  const myStocks: StockHolding[] = [
    ...(stockLevel?.level ? stockLevel.stocks : []),
  ];

  
  const isInfinityLevel = stockLevel?.end === Infinity;
  const balanceNeeded = stockLevel && stockTokenBalance !== null
    ? Math.max(0, stockLevel.end - stockTokenBalance + 1)
    : 0;

  return (
    <BgLayout backgroundImage={bgStock.src} topSpaceSize='tiny' darkCurtain={true} topSpaceContent={(<>
      <MyPageTitle2>
        Stock
      </MyPageTitle2>
    </>)}>
      <div className="relative">
        {isLoaded ? (
          stockLevel.level > 1 ? (
            <div className="mt-4">
              <ul>
                {myStocks.map((stock, index) => {
                  let logo = moneyBag;
                  // const domain = getStockDomain(stock.code); 
                  // if(domain) {
                  //   logoSrc = `https://logo.clearbit.com/${domain}`;
                  // }
                  if (stock.code in stockImageMap) {
                    logo = stockImageMap[stock.code];
                  }

                  return (
                    <li
                      key={index}
                      className="flex justify-between items-center border-b border-gray-200 py-4"
                    >
                      <div className="flex items-center space-x-4">
                        <Image src={logo} alt={`${stock.name} logo`} className="w-8 h-8" />
                        <span className="text-base font-bold text-gray-300">{stock.name}</span>
                      </div>
                      <span className="text-base font-bold text-primary">{Number(stock.amount).toFixed(0)}</span>
                    </li>
                  );
                })}

                {/* Total TVL */}
                <li className="flex justify-between items-center border-gray-200 py-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-base font-bold text-gray-300">Total Value</span>
                  </div>
                  <span className="text-base font-bold text-primary">{tvl}</span>
                </li>
              </ul>              

              {/* Next Tier indicate */}
              <div className="mt-6">
                {balanceNeeded > 0 && !isInfinityLevel && (
                  <p className="text-sm">
                    Your Stock Tier is <span className="text-error font-bold">{stockLevel?.level}</span>. <br/> You need <span className="text-error font-bold">{balanceNeeded.toFixed(2)}</span> XLMSTOCK more to reach next Staking tier!
                  </p>
                )}
              </div>

              {/* Withdraw Button */}
              <div className="mt-6">
                <button
                  onClick={handleStake}
                  className="btn btn-outline btn-success btn-lg w-full"
                >
                  Withdraw
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h1 className="text-base font-semibold text-gray-200">
                XLMSTOCK Balance: <span className="text-primary">{Number(stockTokenBalance).toFixed(0)}</span>
              </h1>
              <h2 className="text-base font-semibold text-gray-200">
                Stock withdraw is available from <span className="text-primary">100K+</span> XLMSTOCK hold.
              </h2>
            </div>
          )
        ) : (
          <h1 className="text-xl text-center mt-6">Loading...</h1>
        )}
      </div>
    </BgLayout>
  );
}
