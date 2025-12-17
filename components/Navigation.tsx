'use client'

import Image, { StaticImageData } from 'next/image';
import { FC, useState, ForwardRefExoticComponent, RefAttributes } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconProps } from '@/utils/types';
import { triggerHapticFeedback } from '@/utils/ui';
import {
  Home,
  Star,
  ChartNoAxesCombined,
  MessageSquareText,
  LucideProps,
  HomeIcon,
} from 'lucide-react';
import WalletIcon from '@/icons/Wallet';
import InfoIcon from '@/icons/Info';

type NavItem = {
  name: string;
  icon?: FC<IconProps> | ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>> | null;
  image?: StaticImageData | null;
  view: string;
  subMenu?: NavItem[];
};

const navItems: NavItem[] = [
  { name: 'Home', icon: HomeIcon, view: 'home' },
  { name: 'Rewards', icon: Star, view: 'rewards' },
  {
    name: 'My Tier',
    icon: InfoIcon,
    view: 'investment'
  },
  { name: 'Wallets', icon: WalletIcon, view: 'wallets' },
];

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Navigation({ currentView, setCurrentView }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState<any>({});

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
    <div className="fixed bottom-0 left-0 right-0 bg-panel-glass border border-info rounded-[12px] flex justify-around items-center z-40 text-xs mx-[2px] mb-[2px]">
      {navItems.map((item) => {
        const isActive = currentView === item.view || item.subMenu?.some(sub => sub.view === currentView);

        const buttonJSX = (
          <button
            key={item.name}
            onClick={() => {
              if (item.subMenu) return;
              handleViewChange(item.view);
            }}
            className={`w-full py-3 px-2 ${isActive ? 'glow-button glow-button-info' : ''}`}
          >
            <div
              className={`flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-info' : 'text-gray-300'
              } transition-colors duration-200`}
            >
              <div className="w-8 h-8 relative flex items-center justify-center">
                {item.image && (
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    width={24} 
                    height={24}
                    className={`${isActive ? 'opacity-100' : 'opacity-50'} transition-opacity duration-200`}
                  />
                )}
                {item.icon && (
                  <item.icon 
                    className={`w-4 h-4 ${isActive ? 'text-info animate-bounce' : 'text-gray-200'}`} 
                  />
                )}
              </div>
              <span className={`text-xs ${isActive ? 'text-info' : 'text-gray-200'} transition-colors duration-200`}>
                {item.name}
              </span>
            </div>
          </button>
        );

        return (
          <div key={item.name} className="flex-1">
            {!item.subMenu ? (
              buttonJSX
            ) : (
              <DropdownMenu
                open={menuOpen?.[item.name] === true}
                onOpenChange={(v) =>
                  setMenuOpen((prev: any) => ({
                    ...prev,
                    [item.name]: v,
                  }))
                }
              >
                <DropdownMenuTrigger asChild>
                  {buttonJSX}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="top"
                  className="bg-white shadow-lg border border-gray-200 rounded-lg w-48 min-w-[12rem]"
                >
                  {item.subMenu.map((subItem) => (
                    <DropdownMenuItem
                      key={`${item.view}_${subItem.view}`}
                      className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-300 transition-colors duration-200"
                      onClick={() => handleViewChange(subItem.view)}
                    >
                      {subItem.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
}
