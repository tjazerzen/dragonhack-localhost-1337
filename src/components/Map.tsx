'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef, createContext, useContext } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useIncidentStore } from '@/store/incidentStore';
import { IncidentStatus, Incident } from '@/types/incidents';
import { getNearestPhotoUrl } from '../utils/placesApi';

interface MapProps {
  position: LatLngExpression;
}

const statusIcons: Record<IncidentStatus, string> = {
  critical: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI0RDMjYyNiIvPjxwYXRoIGQ9Ik04IDhMMTYgMTZNOCAxNkwxNiA4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  moderate: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI0ZCOTIzQyIvPjxwYXRoIGQ9Ik0xMiA3VjEzTTEyIDE2VjE3IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  resolved: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzIyQzU1RSIvPjxwYXRoIGQ9Ik04IDEyTDExIDE1TDE2IDkiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+',
};

const statusBgColors: Record<IncidentStatus, string> = {
  critical: 'bg-red-600',
  moderate: 'bg-orange-500',
  resolved: 'bg-green-600',
};

interface PopupContentProps {
  incident: Incident;
  photoUrl: string | null;
  isLoading: boolean;
}

const PopupContent: React.FC<PopupContentProps> = ({ incident, photoUrl, isLoading }) => (
  <div className="w-full max-w-sm">
    <div className="relative">
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <h3 className="font-medium text-lg">{incident.summary}</h3>
        <span className={`${statusBgColors[incident.status]} text-white px-2 py-1 rounded text-xs font-bold`}>
          {incident.status.toUpperCase()}
        </span>
      </div>
    </div>
    
    {isLoading ? (
      <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    ) : photoUrl && (
      <div className="mb-3">
        <img 
          src={photoUrl} 
          alt="Location photo" 
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    )}
    
    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
      <div>
        <div className="text-gray-500 text-xs">Distance</div>
        <div>{(incident.distance / 1000).toFixed(1)} km</div>
      </div>
      <div>
        <div className="text-gray-500 text-xs">Type</div>
        <div>{incident.type.replace('_', ' ')}</div>
      </div>
      <div>
        <div className="text-gray-500 text-xs">Time</div>
        <div>{incident.timestamp}</div>
      </div>
      <div>
        <div className="text-gray-500 text-xs">Location</div>
        <div>{incident.location}</div>
      </div>
    </div>
    
    <div>
      <div className="text-gray-500 text-xs">Summary</div>
      <p className="text-sm">
        {incident.summary}
      </p>
    </div>
    
    <div className="mt-2 text-right">
      <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
        Play
      </button>
    </div>
  </div>
);

// Create a context for marker references
const MarkerContext = createContext<React.MutableRefObject<Record<string, L.Marker>>>({
  current: {}
});

// Map controller component to handle programmatic interactions
function MapController() {
  const map = useMap();
  const selectedIncidentId = useIncidentStore((state) => state.selectedIncidentId);
  const incidents = useIncidentStore((state) => state.incidents);
  const markerRefs = useContext(MarkerContext);

  useEffect(() => {
    if (selectedIncidentId) {
      const incident = incidents.find(inc => inc.id === selectedIncidentId);
      if (incident) {
        // Center map on the incident
        map.setView(incident.coordinates, 15);
        
        // Open the popup for this marker
        const marker = markerRefs.current[selectedIncidentId];
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [selectedIncidentId, incidents, map, markerRefs]);

  return null;
}

export default function Map({ position }: MapProps) {
  const incidents = useIncidentStore((state) => state.incidents);
  const selectIncident = useIncidentStore((state) => state.selectIncident);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string | null>>({});
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    // @ts-expect-error - Leaflet types are not properly set up for Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const handleMarkerClick = async (incident: Incident) => {
    console.log('🎯 Marker clicked:', {
      id: incident.id,
      lat: incident.coordinates[0],
      lng: incident.coordinates[1]
    });

    // Update the selected incident in the store
    selectIncident(incident.id);

    try {
      setSelectedIncident(incident);
      setIsLoading(true);
      console.log('🔄 Fetching photo for incident:', incident.id);

      const photoUrl = await getNearestPhotoUrl(incident.coordinates[0], incident.coordinates[1]);
      console.log('📸 Photo URL received:', photoUrl ? '✅ Success' : '❌ No URL');

      if (photoUrl) {
        setPhotoUrls(prev => ({
          ...prev,
          [incident.id]: photoUrl
        }));
        console.log('💾 Stored photo URL for incident:', incident.id);
      }
    } catch (error) {
      console.error('💥 Error in handleMarkerClick:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        incidentId: incident.id
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden relative">
      <MarkerContext.Provider value={markerRefs}>
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <MapController />
          {incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={incident.coordinates}
              icon={L.icon({
                iconUrl: statusIcons[incident.status],
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12],
              })}
              eventHandlers={{
                click: () => handleMarkerClick(incident),
                add: (e) => markerRefs.current[incident.id] = e.target,
              }}
            >
              <Popup className="rounded-lg shadow-lg border border-gray-200">
                <PopupContent 
                  incident={incident} 
                  photoUrl={photoUrls[incident.id]} 
                  isLoading={isLoading && selectedIncident?.id === incident.id}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </MarkerContext.Provider>
    </div>
  );
} 