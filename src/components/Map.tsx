'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef, createContext, useContext } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useIncidentStore } from '@/store/incidentStore';
import { IncidentStatus, Incident, IncidentType } from '@/types/incidents';
import { getNearestPhotoUrl, getStreetViewUrl } from '../utils/placesApi';

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
  streetViewUrl: string | null;
  isLoading: boolean;
}

const PopupContent: React.FC<PopupContentProps> = ({ incident, photoUrl, streetViewUrl, isLoading }) => (
  <div className="w-full max-w-md">
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
    ) : (
      <div className="mb-3 grid grid-cols-2 gap-2">
        {photoUrl && (
          <div>
            <div className="text-gray-500 text-xs mb-1">Map View</div>
            <img 
              src={photoUrl} 
              alt="Location map" 
              className="w-full h-36 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {streetViewUrl && (
          <div>
            <div className="text-gray-500 text-xs mb-1">Street View</div>
            <img 
              src={streetViewUrl} 
              alt="Street view" 
              className="w-full h-36 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    )}
    
    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
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

// Add this component above the MapContent component
function AddIncidentMapEvents() {
  const map = useMap();
  const isAddingIncident = useIncidentStore((state) => state.isAddingIncident);
  const cancelAddingIncident = useIncidentStore((state) => state.cancelAddingIncident);
  const [tempMarker, setTempMarker] = useState<[number, number] | null>(null);
  
  // Add console log to debug
  useEffect(() => {
    console.log('🔍 isAddingIncident state changed:', isAddingIncident);
    
    // Change cursor style when in adding incident mode
    if (isAddingIncident) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [isAddingIncident, map]);
  
  // Event handler for map clicks
  useMapEvents({
    click: (e) => {
      if (isAddingIncident) {
        console.log('📍 Map clicked at:', e.latlng);
        const { lat, lng } = e.latlng;
        setTempMarker([lat, lng]);
      }
    },
  });
  
  // Display a message when in add incident mode
  useEffect(() => {
    if (isAddingIncident) {
      console.log('🔍 Trying to add notification, map container:', map?.getContainer());
      
      // Create a notification element
      const notification = document.createElement('div');
      notification.id = 'add-incident-notification';
      // Make sure notification has higher z-index and is positioned correctly
      notification.className = 'absolute top-0 left-0 right-0 bg-blue-600 text-white py-2 px-4 text-center z-[9999]';
      notification.style.position = 'absolute';
      notification.style.zIndex = '9999'; // Extremely high z-index
      notification.innerHTML = 'Click on the map to place the new incident';
      
      // Add a cancel button
      const cancelButton = document.createElement('button');
      cancelButton.className = 'ml-2 bg-blue-700 px-2 py-1 rounded';
      cancelButton.innerHTML = 'Cancel';
      cancelButton.onclick = () => {
        cancelAddingIncident();
        setTempMarker(null);
      };
      notification.appendChild(cancelButton);
      
      try {
        // Instead of adding to map container, add to its parent which has fewer z-index conflicts
        const mapContainer = map.getContainer();
        const parentContainer = mapContainer.parentElement;
        
        if (parentContainer) {
          parentContainer.appendChild(notification);
        } else {
          // Fallback to map container if parent not available
          mapContainer.appendChild(notification);
        }
        console.log('✅ Successfully added notification');
      } catch (error) {
        console.error('❌ Error adding notification to map container:', error);
      }
      
      return () => {
        try {
          const element = document.getElementById('add-incident-notification');
          if (element) {
            element.remove();
            console.log('🧹 Removed notification from map container');
          }
        } catch (error) {
          console.error('❌ Error removing notification:', error);
        }
      };
    }
  }, [isAddingIncident, cancelAddingIncident, map]);
  
  // If a temporary marker is placed, show a form to complete the incident details
  if (tempMarker && isAddingIncident) {
    return (
      <Marker
        position={tempMarker}
        icon={L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzJCOEJGRiIvPjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        })}
      >
        <Popup closeButton={false} className="rounded-lg shadow-lg border border-gray-200" autoPan={true}>
          <AddIncidentForm coordinates={tempMarker} onCancel={() => {
            cancelAddingIncident();
            setTempMarker(null);
          }} />
        </Popup>
      </Marker>
    );
  }
  
  return null;
}

// Add the AddIncidentForm component
interface AddIncidentFormProps {
  coordinates: [number, number];
  onCancel: () => void;
}

function AddIncidentForm({ coordinates, onCancel }: AddIncidentFormProps) {
  const addIncident = useIncidentStore((state) => state.addIncident);
  const [type, setType] = useState<IncidentType>('fire');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<IncidentStatus>('critical');
  const [location, setLocation] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addIncident({
      type,
      summary,
      status,
      location,
      coordinates
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-64">
      <h3 className="font-medium text-lg mb-2">Add New Incident</h3>
      
      <div className="mb-2">
        <label className="block text-gray-700 text-xs mb-1">Type</label>
        <select 
          value={type}
          onChange={(e) => setType(e.target.value as IncidentType)}
          className="w-full px-2 py-1 border rounded text-sm"
          required
        >
          <option value="fire">Fire</option>
          <option value="flood">Flood</option>
          <option value="earthquake">Earthquake</option>
          <option value="traffic_accident">Traffic Accident</option>
          <option value="medical">Medical</option>
          <option value="hazmat">Hazmat</option>
          <option value="structural">Structural</option>
          <option value="rescue">Rescue</option>
          <option value="power_outage">Power Outage</option>
        </select>
      </div>
      
      <div className="mb-2">
        <label className="block text-gray-700 text-xs mb-1">Summary</label>
        <input 
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-2 py-1 border rounded text-sm"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-gray-700 text-xs mb-1">Status</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value as IncidentStatus)}
          className="w-full px-2 py-1 border rounded text-sm"
          required
        >
          <option value="critical">Critical</option>
          <option value="moderate">Moderate</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      
      <div className="mb-3">
        <label className="block text-gray-700 text-xs mb-1">Location</label>
        <input 
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-2 py-1 border rounded text-sm"
          required
        />
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
        >
          Add Incident
        </button>
      </div>
    </form>
  );
}

// MapContent component renders map elements only when the map is initialized
function MapContent({ incidents, handleMarkerClick, photoUrls, streetViewUrls, selectedIncident, isLoading, markerRefs }: {
  incidents: Incident[];
  handleMarkerClick: (incident: Incident) => void;
  photoUrls: Record<string, string | null>;
  streetViewUrls: Record<string, string | null>;
  selectedIncident: Incident | null;
  isLoading: boolean;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map = useMap();
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Set map as ready after it's properly initialized
  useEffect(() => {
    if (map) {
      setIsMapReady(true);
      // Force map to update its size after initialization
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
      // Trigger additional resize
      window.dispatchEvent(new Event('resize'));
    }
  }, [map]);
  
  if (!isMapReady) return null;
  
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapController />
      <AddIncidentMapEvents />
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
              streetViewUrl={streetViewUrls[incident.id]}
              isLoading={isLoading && selectedIncident?.id === incident.id}
            />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function Map({ position }: MapProps) {
  const incidents = useIncidentStore((state) => state.incidents);
  const selectIncident = useIncidentStore((state) => state.selectIncident);
  const isAddingIncident = useIncidentStore((state) => state.isAddingIncident);
  const cancelAddingIncident = useIncidentStore((state) => state.cancelAddingIncident);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string | null>>({});
  const [streetViewUrls, setStreetViewUrls] = useState<Record<string, string | null>>({});
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Add console log to debug
  useEffect(() => {
    console.log('🗺️ Map component, isAddingIncident:', isAddingIncident);
  }, [isAddingIncident]);

  // Set up Leaflet icon defaults
  useEffect(() => {
    // @ts-expect-error - Leaflet types are not properly set up for Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    
    // Ensure map resizes when container size changes
    const resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }
    
    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current);
      }
    };
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
      console.log('🔄 Fetching photos for incident:', incident.id);

      // Fetch both photos in parallel
      const [photoUrl, streetViewUrl] = await Promise.all([
        getNearestPhotoUrl(incident.coordinates[0], incident.coordinates[1]),
        getStreetViewUrl(incident.coordinates[0], incident.coordinates[1])
      ]);
      
      console.log('📸 Photo URLs received:', {
        mapbox: photoUrl ? '✅ Success' : '❌ No URL',
        streetView: streetViewUrl ? '✅ Success' : '❌ No URL'
      });

      if (photoUrl) {
        setPhotoUrls(prev => ({
          ...prev,
          [incident.id]: photoUrl
        }));
      }
      
      if (streetViewUrl) {
        setStreetViewUrls(prev => ({
          ...prev,
          [incident.id]: streetViewUrl
        }));
      }
      
      console.log('💾 Stored photo URLs for incident:', incident.id);
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
    <div ref={mapContainerRef} className="h-full w-full overflow-hidden relative">
      {isAddingIncident && (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white py-2 px-4 text-center z-[9999]">
          Click on the map to place the new incident
          <button 
            className="ml-2 bg-blue-700 px-2 py-1 rounded"
            onClick={cancelAddingIncident}
          >
            Cancel
          </button>
        </div>
      )}
      
      <MarkerContext.Provider value={markerRefs}>
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="h-full w-full z-0"
        >
          <MapContent 
            incidents={incidents}
            handleMarkerClick={handleMarkerClick}
            photoUrls={photoUrls}
            streetViewUrls={streetViewUrls}
            selectedIncident={selectedIncident}
            isLoading={isLoading}
            markerRefs={markerRefs}
          />
        </MapContainer>
      </MarkerContext.Provider>
    </div>
  );
} 