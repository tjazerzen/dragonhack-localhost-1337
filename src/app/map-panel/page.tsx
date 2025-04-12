'use client';

import Chat from '@/components/Chat';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import IncidentList from '@/components/IncidentList';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>
});

export default function MapPanel() {
  const position: LatLngExpression = [51.505, -0.09];

  return (
    <div className="flex flex-row w-full">
      <div className="w-3/12 h-full border-r">
        <IncidentList />
      </div>
      <div className="w-6/12 h-full relative">
        <div className="h-full w-full z-10">
          <Map position={position} />
        </div>
      </div>
      <div className="w-3/12 h-full border-l">
        <Chat />
      </div>
    </div>
  );
}
