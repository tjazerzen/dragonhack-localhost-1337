'use client';

import Chat from '@/components/Chat';
import { useChatStore } from '@/store/chatStore';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import IncidentList from '@/components/IncidentList';
import ForceList from '@/components/ForceList';
import CollapsedPanel from '@/components/CollapsedPanel';
import NavBar from '@/components/NavBar';
import { useLayoutStore } from '@/store/layoutStore';
import { useEffect } from 'react';

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>
});

export default function MapPanel() {
  const addMessage = useChatStore((state) => state.addMessage);
  const isIncidentPanelCollapsed = useLayoutStore((state) => state.isIncidentPanelCollapsed);
  const activeSidePanel = useLayoutStore((state) => state.activeSidePanel);
  const position: LatLngExpression = [46.052091, 14.468414];

  // Move the message calls into a useEffect hook that runs once on mount
  useEffect(() => {
    // Add an admin message
    addMessage('Hello, how can I help you?', 'admin');
    // Add a caller message
    addMessage('I need assistance with my account', 'caller');
  }, [addMessage]); // Include addMessage in the dependency array

  // Render the appropriate panel based on the active side panel type
  const renderSidePanel = () => {
    switch (activeSidePanel) {
      case 'incidents':
        return <IncidentList />;
      case 'forces':
        return <ForceList />;
      default:
        return <IncidentList />;
    }
  };

  return (
    <div className="flex flex-col h-[100vh] w-full">
      <NavBar />
      <div className="flex flex-row flex-1 overflow-hidden">
        {isIncidentPanelCollapsed ? (
          <CollapsedPanel />
        ) : (
          <div className="w-3/12 h-full border-r overflow-y-auto">
            {renderSidePanel()}
          </div>
        )}
        <div className="h-full relative flex-grow transition-all duration-300">
          <div className="h-full w-full z-10">
            <Map position={position} />
          </div>
        </div>
        <div className="w-3/12 h-full border-l overflow-y-auto">
          <Chat />
        </div>
      </div>
    </div>
  );
}
