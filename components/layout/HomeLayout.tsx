'use client'
import Stellar from '@/icons/Stellar';

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  const top_gradient_height = 220;
  const gradient_border_width = 30; 

  return (
    <div className="bg-white flex justify-center min-h-screen">
      <div className="w-full text-gray-300 font-bold flex flex-col max-w-xl">
        <div className='relative'>
          {/* Gradient background for top 200px */}
          <div className="z-0 w-full bg-gradient-to-r from-[rgb(130,105,210)] to-[rgb(225,85,135)] absolute" style={{ height: top_gradient_height + 'px' }}></div>

          {/* Smooth fade transition at the bottom with box-shadow */}
          <div
            className="z-1 w-full absolute bg-gradient-to-t from-[rgb(255,255,255)] to-[transparent]] "
            style={{
              height: gradient_border_width + `px`,
              top: (top_gradient_height - gradient_border_width) + 'px',
            }}
          ></div>

          {/** Stellar logo */}
          <div className='z-1 text-white absolute right-4 top-4'>
            <Stellar size={36}/>
          </div>

          <div className="z-2 px-6">
            <div className="pt-6 pb-24">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
