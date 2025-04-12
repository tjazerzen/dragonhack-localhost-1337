'use client';

import Chat from '@/components/Chat';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import IncidentList from '@/components/IncidentList';
import ForceList from '@/components/ForceList';
import CollapsedPanel from '@/components/CollapsedPanel';
import { useLayoutStore } from '@/store/layoutStore';
import { useState } from 'react';
import { Resizable } from 're-resizable';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>
});

export default function MapPanel() {
  const isIncidentPanelCollapsed = useLayoutStore((state) => state.isIncidentPanelCollapsed);
  const activeSidePanel = useLayoutStore((state) => state.activeSidePanel);
  const position: LatLngExpression = [46.061583, 14.507542];
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [chatSidebarWidth, setChatSidebarWidth] = useState(400);

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
      <div className="flex flex-row flex-1 overflow-hidden">
        {isIncidentPanelCollapsed ? (
          <CollapsedPanel />
        ) : (
          <Resizable
            size={{ width: sidebarWidth, height: '100%' }}
            minWidth={250}
            maxWidth={800}
            enable={{ 
              top: false, 
              right: true,
              bottom: false, 
              left: false, 
              topRight: false, 
              bottomRight: false, 
              bottomLeft: false, 
              topLeft: false 
            }}
            handleClasses={{
              right: 'handle-right'
            }}
            handleStyles={{
              right: {
                width: '10px',
                right: '-5px',
                cursor: 'col-resize',
                backgroundColor: 'transparent'
              }
            }}
            onResizeStop={(e, direction, ref, d) => {
              setSidebarWidth(parseInt(ref.style.width, 10));
            }}
            className="border-r"
          >
            <div 
              className="h-full overflow-y-auto"
              style={{ width: `${sidebarWidth}px` }}
            >
              {renderSidePanel()}
            </div>
          </Resizable>
        )}
        <div className="h-full relative flex-grow transition-all duration-300">
          <div className="h-full w-full z-10">
            <Map position={position} />
          </div>
        </div>
        <Resizable
          size={{ width: chatSidebarWidth, height: '100%' }}
          minWidth={250}
          maxWidth={800}
          enable={{ 
            top: false, 
            right: false, 
            bottom: false, 
            left: true,
            topRight: false, 
            bottomRight: false, 
            bottomLeft: false, 
            topLeft: false 
          }}
          handleClasses={{
            left: 'handle-left'
          }}
          handleStyles={{
            left: {
              width: '10px',
              left: '-5px',
              cursor: 'col-resize',
              backgroundColor: 'transparent'
            }
          }}
          onResizeStop={(e, direction, ref, d) => {
            setChatSidebarWidth(parseInt(ref.style.width, 10));
          }}
          className="border-l"
        >
          <div 
            className="h-full overflow-y-auto"
            style={{ width: `${chatSidebarWidth}px` }}
          >
            <Chat />
          </div>
        </Resizable>
      </div>
    </div>
  );
}
