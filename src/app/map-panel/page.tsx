'use client';

import Chat from '@/components/Chat';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import IncidentList from '@/components/IncidentList';
import CollapsedPanel from '@/components/CollapsedPanel';
import { useLayoutStore } from '@/store/layoutStore';
import { useEffect } from 'react';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>
});

export default function MapPanel() {
  const isIncidentPanelCollapsed = useLayoutStore((state) => state.isIncidentPanelCollapsed);
  const position: LatLngExpression = [46.052091, 14.468414];

  return (
    <div className="flex flex-row h-[100vh] w-full">
      {isIncidentPanelCollapsed ? (
        <CollapsedPanel />
      ) : (
        <div className="w-3/12 h-full border-r">
          <IncidentList />
        </div>
      )}
      <div className="h-full relative flex-grow transition-all duration-300">
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
