'use client';

import Chat from '@/components/Chat';
import { useChatStore } from '@/store/chatStore';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import IncidentList from '@/components/IncidentList';
import CollapsedPanel from '@/components/CollapsedPanel';
import { useLayoutStore } from '@/store/layoutStore';

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>
});

export default function MapPanel() {
  const addMessage = useChatStore((state) => state.addMessage);
  const isIncidentPanelCollapsed = useLayoutStore((state) => state.isIncidentPanelCollapsed);
  const position: LatLngExpression = [46.052091, 14.468414];

  // Add an admin message
  addMessage('Hello, how can I help you?', 'admin');

  // Add a caller message
  addMessage('I need assistance with my account', 'caller');

  return (
    <div className="flex flex-row h-[100vh] w-full">
      {isIncidentPanelCollapsed ? (
        <CollapsedPanel />
      ) : (
        <div className="w-3/12 h-full border-r">
          <IncidentList />
        </div>
      )}
      <div className={`${isIncidentPanelCollapsed ? 'w-[calc(75%-40px)]' : 'w-6/12'} h-full relative transition-all duration-300`}>
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
