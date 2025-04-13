'use client';

import { useLayoutStore } from '@/store/layoutStore';
import dynamic from 'next/dynamic';

export default function NavBar() {
  const { activeSidePanel, switchSidePanel } = useLayoutStore();
  
  return (
    <nav className="bg-sidebar text-white w-full h-11 px-4 flex justify-center items-center">
      <div className="flex items-center">
        
        <h1 className="text-2xl font-bold mr-6">
          <span className="text-red-600">nine</span><span className="text-blue-600">line</span>🚨
        </h1>
      </div>
    </nav>
  );
}