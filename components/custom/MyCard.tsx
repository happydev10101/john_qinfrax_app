import React from 'react';

interface MyCardProps {
  children: React.ReactNode;
  className?: string;
  p?: number;
  glow?: 'info' | 'primary' | 'success';
}

const MyCard: React.FC<MyCardProps> = ({ children, className, p, glow}) => {
  const defaultPaddingSize = 6;
  const paddingSize = p ?? defaultPaddingSize;
  const glowClass = glow ? `bg-${glow}-glow` : '';

  return (
    <div className={`bg-panel-glass rounded-lg border border-info ${className} animate-in slide-in-from-bottom-2 fade-in duration-500`}>
      <div className={`${glowClass} p-${paddingSize}`}>
        {children}
      </div>
    </div>
  );
};

export default MyCard;
 