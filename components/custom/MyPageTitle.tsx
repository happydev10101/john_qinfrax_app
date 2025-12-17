'use client';

import React from 'react';

export default function MyPageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold mb-6 text-center">
      {children}
    </h2>
  );
}
