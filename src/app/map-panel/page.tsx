'use client';

import Chat from '@/components/Chat';
import { useChatStore } from '@/store/chatStore';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>
});

export default function MapPanel() {
  const addMessage = useChatStore((state) => state.addMessage);
  const position: LatLngExpression = [51.505, -0.09];

  // Add an admin message
  addMessage('Hello, how can I help you?', 'admin');

  // Add a caller message
  addMessage('I need assistance with my account', 'caller');

  return (
    <div className="flex flex-row h-screen w-full">
      <div className="w-3/12 h-full bg-gray-100">
        {/* Left blank section */}
      </div>
      <div className="w-6/12 h-full relative">
        <div className="absolute inset-0">
          <Map position={position} />
        </div>
      </div>
      <div className="w-3/12 h-full">
        <Chat />
      </div>
    </div>
  );
}
