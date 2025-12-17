'use client'

import React from 'react';
import NeonBackground from './NeonBackground';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string; // Optional background image URL
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <div className="relative z-10 flex justify-center min-h-screen">
      <div className="w-full font-bold flex flex-col max-w-xl px-6 pt-4 pb-24">
        {/* Title */}
        <div className="py-3 text-xl text-info tracking-wide page-title">
          {title}
        </div>
        <div className="">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;