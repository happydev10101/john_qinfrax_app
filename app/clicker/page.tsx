// app/clicker/page.tsx

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

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import SimpleLoadingScreen from '@/components/SimpleLoading';
import Wallets from '@/components/main/WalletsPage';
import InvestmentOverview from '@/components/main/InvestmentOverview';
import BalancesOverview from '@/components/main/BalancesOverview';
import BuyMainAsset from '@/components/main/BuyMainAsset';
import SwapPage from '@/components/main/SwapPage';
import ExpensesPage from '@/components/cardsystem/ExpensesPage';
import HomePage from '@/components/home/HomePage';
import BuyCardPage from '@/components/main/BuyCardPage';
import StakingPage from '@/components/main/StakingPage';
import StockPage from '@/components/main/StockPage';
import RequestAssetSwapPage from '@/components/main/RequestAssetSwapPage';
import RewardsPage from '@/components/main/RewardsPage';
import WalletInsurancePage from '@/components/main/WalletInsurancePage';

function ClickerPage() {
    let params: any = typeof window !== "undefined" ? new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop as string),
    }) : null;

    const initialView = params?.view ?? "home"; // Default to "home"
    
    const [currentView, setCurrentViewState] = useState<string>(initialView);
    const [isInitialized, setIsInitialized] = useState(false);

    const setCurrentView = (newView: string) => {
        console.log('Changing view to:', newView);
        setCurrentViewState(newView);
    };

    const renderCurrentView = useCallback(() => {
        if (!isInitialized) {
            return <SimpleLoadingScreen
                setIsInitialized={setIsInitialized}
                setCurrentView={setCurrentView}
                initialView={initialView}
            />;
        }

        switch (currentView) {
            case 'home':
                return <HomePage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'wallets':
                return <Wallets />;
            case 'investment':
                return <InvestmentOverview currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'rewards':
                return <RewardsPage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'buymain':
                return <BuyMainAsset currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'buycard':
                return <BuyCardPage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'balances':
                return <BalancesOverview currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'staking':
                return <StakingPage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'swap':
                return <SwapPage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'expenses':
                return <ExpensesPage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'stock':
                return <StockPage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'requestswap':
                return <RequestAssetSwapPage currentView={currentView} setCurrentView={setCurrentView}/>;
            case 'walletinsurance':
                return <WalletInsurancePage currentView={currentView} setCurrentView={setCurrentView}/>;
            default:
                return <HomePage currentView={currentView} setCurrentView={setCurrentView}/>;
        }
    }, [currentView, isInitialized]);

    console.log('ClickerPage rendering. Current state:', { currentView, isInitialized });

    return (
        <div className="min-h-screen">
            {/* {
                isInitialized &&
                <>
                    <AutoIncrement />
                    <PointSynchronizer />
                </>
            } */}
            {renderCurrentView()}
            {isInitialized && currentView !== 'loading' && (
                <Navigation
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />
            )}
        </div>
    );
}

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}

export default function ClickerPageWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <ClickerPage />
        </ErrorBoundary>
    );
}