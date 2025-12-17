// components/Loading.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { botUrlQr, mainCharacter } from '@/images';
import IceCube from '@/icons/IceCube';
import { RefreshCw } from 'lucide-react';
import { calculateEnergyLimit, calculateLevelIndex, calculatePointsPerClick, calculateProfitPerHour, GameState, InitialGameState, useGameStore } from '@/utils/game-mechanics';
import WebApp from '@twa-dev/sdk';
import UAParser from 'ua-parser-js';
import { ALLOW_ALL_DEVICES } from '@/utils/consts';

interface LoadingProps {
  initialView: string;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: (view: string) => void;
}

export default function Loading({ initialView, setIsInitialized, setCurrentView }: LoadingProps) {
  const initializeState = useGameStore((state: GameState) => state.initializeState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const openTimestampRef = useRef(Date.now());
  const [isAppropriateDevice, setIsAppropriateDevice] = useState(true);


  const fetchOrCreateUser = useCallback(async () => {
    try {
      let initData, telegramId='Unknown', username='Unknown', telegramName, startParam;

      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        initData = WebApp.initData;
        telegramId = WebApp.initDataUnsafe.user?.id.toString() || 'Unknown';
        username = WebApp.initDataUnsafe.user?.username || 'Unknown User';
        if (process.env.NEXT_PUBLIC_IS_DEV === 'true') {
          username = 'martincontact101';
        }
        telegramName = WebApp.initDataUnsafe.user?.first_name || 'Unknown User';

        startParam = WebApp.initDataUnsafe.start_param;
      }


      const referrerTelegramId = startParam ? startParam.replace('kentId', '') : null;

      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
        initData = "temp";
      }
      // const response = await fetch('/api/user', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     telegramInitData: initData,
      //     referrerTelegramId,
      //   }),
      // });
      // if (!response.ok) {
      //   throw new Error('Failed to fetch or create user');
      // }
      // const userData = await response.json();

      // console.log("user data: ", userData);

      // Check if initData and telegramName are defined
      if (!initData) {
        throw new Error('initData is undefined');
      }
      if (!telegramName) {
        throw new Error('telegramName is undefined');
      }

      // Create the game store with fetched data
      const initialState: InitialGameState = {
        userTelegramInitData: initData,
        userTelegramName: telegramName,
        userTelegramUserName: username,
        lastClickTimestamp: 0, //userData.lastPointsUpdateTimestamp,
        gameLevelIndex: 0, //calculateLevelIndex(userData.points),
        points: 0, //userData.points,
        pointsBalance: 0, //userData.pointsBalance,
        unsynchronizedPoints: 0,
        multitapLevelIndex: 0, //userData.multitapLevelIndex,
        pointsPerClick: 0, // calculatePointsPerClick(userData.multitapLevelIndex),
        energy: 0, //userData.energy,
        maxEnergy: 0, //calculateEnergyLimit(userData.energyLimitLevelIndex),
        energyRefillsLeft: 0, //userData.energyRefillsLeft,
        energyLimitLevelIndex: 0, //userData.energyLimitLevelIndex,
        lastEnergyRefillTimestamp: 0, //userData.lastEnergyRefillsTimestamp,
        mineLevelIndex: 0, // userData.mineLevelIndex,
        profitPerHour: 0, //calculateProfitPerHour(userData.mineLevelIndex),
        tonWalletAddress: "", // userData?.tonWalletAddress,
      };

      console.log("Initial state: ", initialState);

      initializeState(initialState);
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error (e.g., show error message to user)
    }
  }, [initializeState]);

  useEffect(() => {
    const parser = new UAParser();
    const device = parser.getDevice();
    const isAppropriate = ALLOW_ALL_DEVICES || device.type === 'mobile' || device.type === 'tablet';
    setIsAppropriateDevice(isAppropriate);

    if (isAppropriate) {
      fetchOrCreateUser();
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - openTimestampRef.current;
      const remainingTime = Math.max(3000 - elapsedTime, 0);

      const timer = setTimeout(() => {
        setCurrentView(initialView ?? 'game');
        setIsInitialized(true);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, setIsInitialized, setCurrentView]);

  // if (!isAppropriateDevice) {
  //   return (
  //     <div className="bg-[#1d2025] flex justify-center items-center h-screen">
  //       <div className="w-full max-w-xl text-white flex flex-col items-center">
  //         <h1 className="text-2xl font-bold mb-4">Run on your mobile</h1>
  //         <Image
  //           className="bg-white p-2 rounded-xl"
  //           src={botUrlQr}
  //           alt="QR Code"
  //           width={200}
  //           height={200}
  //         />
  //         <p className="mt-4">@{process.env.NEXT_PUBLIC_BOT_USERNAME}</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Rotating Refresh Icon */}
        <RefreshCw className="w-12 h-12 text-info animate-spin" />
      </div>
    </div>
  );
}