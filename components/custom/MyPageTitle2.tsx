'use client';

import React from 'react';

export default function MyPageTitle2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-bold text-center">
      {children}
    </h2>
  );
}
