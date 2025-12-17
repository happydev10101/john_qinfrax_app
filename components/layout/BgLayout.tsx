'use client'
import React from 'react';

interface BgLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string; // Optional background image URL
  gradientColors?: string[]; // Optional gradient color array
  topSpaceSize?: 'tiny' | 'small' | 'medium' | 'big'; // Configurable top space size
  borderRaidus?: boolean; // Optional border radius for card
  topSpaceContent?: React.ReactNode; // Optional content to be placed in the top space
  darkCurtain?: boolean; // Optional dark overlay for image & gradient
  darkCurtainOpacity?: number; // Optional opacity of dark curtain: 0 ~ 1
}

const BgLayout: React.FC<BgLayoutProps> = ({
  children,
  backgroundImage,
  gradientColors,
  topSpaceSize = 'medium', // Default is 'medium'
  borderRaidus = false,
  topSpaceContent, // Optional top space content
  darkCurtain = false, // Default is no dark curtain
  darkCurtainOpacity = 0.5,
}) => {
  // Map topSpaceSize to corresponding pixel height
  const topHeightMap = {
    tiny: 150,
    small: 200,
    medium: 250,
    big: 300,
  };

  const topHeight: number = topHeightMap[topSpaceSize];
  const borderRadiusSize = 20;

  return (
    <div className="bg-white flex justify-center min-h-screen">
      <div className="w-full flex flex-col max-w-xl relative">
        {/* Top Space Content */}
        {topSpaceContent && (
          <div
            className="absolute inset-0 z-10 flex justify-center items-center"
            style={{
              height: topHeight + 'px', // Dynamic height based on topSpaceSize
              top: 0,
            }}
          >
            {topSpaceContent}
          </div>
        )}

        {/* Dark Curtain Overlay (if darkCurtain is true) */}
        {darkCurtain && (
          <div
            className={`absolute inset-0 z-[5]`} // Semi-transparent dark overlay
            style={{
              backgroundColor: `rgba(0, 0, 0, ${darkCurtainOpacity})`,
              height: topHeight + 'px',
            }}
          ></div>
        )}

        {/* Background Image */}
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-center bg-cover z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover', // Ensures the image covers the container while maintaining aspect ratio
              backgroundPosition: 'top center', // Keeps the image aligned at the top and centered horizontally
              height: topHeight + 'px', // Dynamic height based on topSpaceSize
            }}
          ></div>
        )}

        {/* Gradient at the bottom (only if gradientColors are provided) */}
        {gradientColors && gradientColors.length > 0 && (
          <div
            className="absolute top-0 w-full z-10"
            style={{
              background: `linear-gradient(to top, ${gradientColors[0]}, ${gradientColors[1]})`,
              height: topHeight + 'px', // Dynamic gradient height based on topSpaceSize
            }}
          ></div>
        )}

        {/* Main content with margin-top to ensure it starts after the top space */}
        <div
          className={`z-20 w-full`}
          style={{
            marginTop: (topHeight - (borderRaidus ? borderRadiusSize : 0)) + 'px', // Ensure content starts after the top space
          }}
        >
          {/* Card Container */}
          <div
            className="bg-white p-6 pb-32 space-y-6 text-black"
            style={{
              borderRadius: borderRaidus ? borderRadiusSize : 0,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BgLayout;
