'use client';

import { MapContainer, TileLayer, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Marker as LeafletMarker } from 'react-leaflet';
import { Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef, createContext, useContext, useMemo } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useIncidentStore } from '@/store/incidentStore';
import { useForceStore } from '@/store/forceStore';
import { IncidentStatus, Incident, IncidentType } from '@/types/incidents';
import { Force, ForceType, ForceStatus } from '@/types/forces';
import { getNearestPhotoUrl, getStreetViewUrl } from '../utils/placesApi';
import styled from 'styled-components';
import { statusIcons } from '@/utils/mapUtils';

// Create a styled version of the Leaflet Marker with CSS transition for smooth movement
const AnimatedMarker = styled(LeafletMarker)`
  transition: transform 1.2s ease;
  
  /* Apply animation to Leaflet's internal marker elements */
  & .leaflet-marker-icon,
  & .leaflet-marker-shadow {
    transition: all 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  }
`;

interface MapProps {
  position: LatLngExpression;
}

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
      <div className="mb-3 space-y-2">
        {photoUrl && (
          <div>
            <div className="text-gray-500 text-xs mb-1">Map View</div>
            <img 
              src={photoUrl} 
              alt="Location map" 
              className="w-full h-40 object-cover rounded-lg"
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
              className="w-full h-40 object-cover rounded-lg"
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

    <div className="grid grid-cols-2 gap-2 mb-3">
      <div>
        <label className="block text-gray-700 text-xs mb-1 whitespace-nowrap">Police Support</label>
        <input 
          type="number"
          min="0"
          value={incident.noPoliceSupport}
          onChange={(e) => {
            const newValue = Math.max(0, parseInt(e.target.value) || 0);
            incident.noPoliceSupport = newValue;
          }}
          className="w-full px-2 py-1 border rounded text-sm"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-xs mb-1 whitespace-nowrap">Firefighter Support</label>
        <input 
          type="number"
          min="0"
          value={incident.noFirefighterSupport}
          onChange={(e) => {
            const newValue = Math.max(0, parseInt(e.target.value) || 0);
            incident.noFirefighterSupport = newValue;
          }}
          className="w-full px-2 py-1 border rounded text-sm"
        />
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
  const selectedForceId = useForceStore((state) => state.selectedForceId);
  const forces = useForceStore((state) => state.forces);
  const markerRefs = useContext(MarkerContext);

  useEffect(() => {
    if (selectedIncidentId) {
      const incident = incidents.find(inc => inc.id === selectedIncidentId);
      if (incident) {
        // Center map on the incident
        map.setView(incident.coordinates, 15);
        
        // Open the popup for this incident marker
        const marker = markerRefs.current[selectedIncidentId]; // Assuming incident IDs are stored directly
        if (marker) {
          marker.openPopup();
        }
      }
    } 
    // Clear map focus if no incident is selected (optional, prevents staying focused after deselection)
    // else {
    //   // Potentially zoom out or reset view if needed when nothing is selected
    // }
  }, [selectedIncidentId, incidents, map, markerRefs]);

  // Effect to handle centering on selected force
  useEffect(() => {
    if (selectedForceId) {
      const force = forces.find(f => f.id === selectedForceId);
      if (force) {
        // Center map on the force
        map.setView(force.coordinates, 15);

        // Open the popup for this force marker
        const markerKey = `force-${selectedForceId}`;
        const marker = markerRefs.current[markerKey];
        if (marker) {
          marker.openPopup();
        }
      }
    } 
    // Clear map focus if no force is selected (optional)
    // else {
    //   // Potentially adjust view when no force is selected
    // }
  }, [selectedForceId, forces, map, markerRefs]);

  return null;
}

// Add this component above the MapContent component
function AddIncidentMapEvents() {
  const map = useMap();
  const isAddingIncident = useIncidentStore((state) => state.isAddingIncident);
  const cancelAddingIncident = useIncidentStore((state) => state.cancelAddingIncident);
  const extractedCoordinates = useIncidentStore((state) => state.extractedCoordinates);
  const [newIncidentPosition, setNewIncidentPosition] = useState<[number, number] | null>(null);
  
  // Add console log to debug
  useEffect(() => {
    console.log('🔍 isAddingIncident state changed:', isAddingIncident);
    
    // Change cursor style when in adding incident mode
    if (isAddingIncident) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
      setNewIncidentPosition(null); // Reset position when cancelling
    }
  }, [isAddingIncident, map]);

  // Use extracted coordinates if available
  useEffect(() => {
    if (extractedCoordinates && isAddingIncident) {
      const { lat, lng } = extractedCoordinates;
      // Set marker position for the new incident
      setNewIncidentPosition([lat, lng]);
      // Center the map on the extracted location
      map.setView([lat, lng], 15);
    }
  }, [extractedCoordinates, isAddingIncident, map]);
  
  // Event handler for map clicks
  useMapEvents({
    click: (e) => {
      if (isAddingIncident) {
        console.log('📍 Map clicked at:', e.latlng);
        const { lat, lng } = e.latlng;
        setNewIncidentPosition([lat, lng]);
      }
    },
  });
  
  // Render the new incident marker if position is set
  if (newIncidentPosition && isAddingIncident) {
    return (
      <AnimatedMarker
        position={newIncidentPosition}
        icon={L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzJCOEJGRiIvPjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        })}
        eventHandlers={{
          add: (e) => {
            // Force popup to open immediately when marker is added to the map
            setTimeout(() => {
              e.target.openPopup();
            }, 100);
          },
        }}
      >
        <Popup closeButton={false} className="rounded-lg shadow-lg border border-gray-200" autoPan={true} minWidth={320} maxWidth={400} closeOnClick={false}>
          <AddIncidentForm coordinates={newIncidentPosition} onCancel={() => {
            cancelAddingIncident();
          }} />
        </Popup>
      </AnimatedMarker>
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
  const extractedLocation = useIncidentStore((state) => state.extractedLocation);
  const [type, setType] = useState<IncidentType>('fire');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<IncidentStatus>('critical');
  const [location, setLocation] = useState(extractedLocation || '');
  const [noPoliceSupport, setNoPoliceSupport] = useState(0);
  const [noFirefighterSupport, setNoFirefighterSupport] = useState(0);
  
  // Update location if extractedLocation changes
  useEffect(() => {
    if (extractedLocation) {
      setLocation(extractedLocation);
    }
  }, [extractedLocation]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addIncident({
      type,
      summary,
      status,
      location,
      coordinates,
      noPoliceSupport,
      noFirefighterSupport
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-48">
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

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-gray-700 text-xs mb-1 whitespace-nowrap">Police Support</label>
          <input 
            type="number"
            min="0"
            value={noPoliceSupport}
            onChange={(e) => setNoPoliceSupport(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-xs mb-1 whitespace-nowrap">Firefighter Support</label>
          <input 
            type="number"
            min="0"
            value={noFirefighterSupport}
            onChange={(e) => setNoFirefighterSupport(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
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

// Add force icons for police and firefighter units
const forceIcons: Record<ForceType, Record<ForceStatus, string>> = {
  police: {
    idle: '/police-car-transparent-idle.png',
    on_road: '/police-car-transparent-not-idle.png',
  },
  firefighter: {
    idle: '/firefighter-transparent-idle.png',
    on_road: '/firefighter-transparent-not-idle.png',
  }
};

// Add simple popup content for forces
interface ForcePopupContentProps {
  force: Force;
}

const ForcePopupContent: React.FC<ForcePopupContentProps> = ({ force }) => (
  <div className="w-full">
    <div className="flex items-center justify-between border-b pb-2 mb-2">
      <h3 className="font-medium text-lg">{force.type === 'police' ? 'Police Unit' : 'Fire Unit'}</h3>
      <span className={`${force.status === 'idle' ? 'bg-gray-500' : 'bg-blue-500'} text-white px-2 py-1 rounded text-xs font-bold`}>
        {force.status === 'idle' ? 'IDLE' : 'ON ROAD'}
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <div className="text-gray-500 text-xs">Callsign</div>
        <div>{force.callsign}</div>
      </div>
      <div>
        <div className="text-gray-500 text-xs">Location</div>
        <div>{force.location}</div>
      </div>
    </div>
  </div>
);

// Component to inject global styles for Leaflet marker animations
function LeafletAnimationStyles() {
  useEffect(() => {
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.id = 'leaflet-marker-animations';
    styleEl.innerHTML = `
      .leaflet-marker-icon {
        transition: transform 1.2s cubic-bezier(0.25, 0.8, 0.25, 1), 
                   left 1.2s cubic-bezier(0.25, 0.8, 0.25, 1), 
                   top 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
      }
      .leaflet-marker-shadow {
        transition: transform 1.2s cubic-bezier(0.25, 0.8, 0.25, 1), 
                   left 1.2s cubic-bezier(0.25, 0.8, 0.25, 1), 
                   top 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
      }
    `;
    
    // Add to document head
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      const existingStyle = document.getElementById('leaflet-marker-animations');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  
  return null;
}

// MapContent component renders map elements only when the map is initialized
function MapContent({ 
  incidents, 
  forces,
  handleMarkerClick,
  handleForceClick,
  photoUrls, 
  streetViewUrls, 
  selectedIncident, 
  isLoading, 
  markerRefs,
  forceHistory,
  showMotionTrails 
}: {
  incidents: Incident[];
  forces: Force[];
  handleMarkerClick: (incident: Incident) => void;
  handleForceClick: (force: Force) => void;
  photoUrls: Record<string, string | null>;
  streetViewUrls: Record<string, string | null>;
  selectedIncident: Incident | null;
  isLoading: boolean;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
  forceHistory: Record<string, Array<[number, number]>>;
  showMotionTrails: boolean;
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
  
  // Effect to invalidate map size on sidebar resize
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        console.log('🗺️ Sidebar resized, invalidating map size...');
        // Use a small delay to ensure the layout is stable before invalidating
        setTimeout(() => {
          map.invalidateSize();
        }, 50); // 50ms delay
      }
    };

    window.addEventListener('sidebarResized', handleResize);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('sidebarResized', handleResize);
    };
  }, [map]); // Dependency on map ensures it's added only when map is available
  
  if (!isMapReady) return null;
  
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapController />
      <AddIncidentMapEvents />
      
      {/* Display incidents */}
      {incidents.map((incident) => (
        <AnimatedMarker
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
          <Popup className="rounded-lg shadow-lg border border-gray-200" minWidth={320} maxWidth={400}>
            <PopupContent 
              incident={incident} 
              photoUrl={photoUrls[incident.id]} 
              streetViewUrl={streetViewUrls[incident.id]}
              isLoading={isLoading && selectedIncident?.id === incident.id}
            />
          </Popup>
        </AnimatedMarker>
      ))}
      
      {/* Display motion trails when enabled */}
      {showMotionTrails && Object.entries(forceHistory).map(([forceId, positions]) => (
        positions.length > 1 && (
          <Polyline
            key={`trail-${forceId}`}
            positions={positions}
            color={forces.find(f => f.id === forceId)?.type === 'police' ? '#3399FF' : '#FF4444'}
            weight={2}
            opacity={0.6}
            dashArray="5,10"
          />
        )
      ))}
      
      {/* Display forces */}
      {forces.map((force) => (
        <AnimatedMarker
          key={`force-${force.id}`}
          position={force.coordinates}
          icon={L.icon({
            iconUrl: forceIcons[force.type][force.status],
            iconSize: [33, 33],
            iconAnchor: [11, 11],
            popupAnchor: [0, -11],
          })}
          eventHandlers={{
            click: () => handleForceClick(force),
            // Store reference to the force marker
            add: (e) => markerRefs.current[`force-${force.id}`] = e.target,
          }}
        >
          <Popup className="rounded-lg shadow-lg border border-gray-200" minWidth={220}>
            <ForcePopupContent force={force} />
          </Popup>
        </AnimatedMarker>
      ))}
    </>
  );
}

export default function Map({ position }: MapProps) {
  const incidents = useIncidentStore((state) => state.incidents);
  const selectIncident = useIncidentStore((state) => state.selectIncident);
  const isAddingIncident = useIncidentStore((state) => state.isAddingIncident);
  const cancelAddingIncident = useIncidentStore((state) => state.cancelAddingIncident);
  
  const forces = useForceStore((state) => state.forces);
  const selectForce = useForceStore((state) => state.selectForce);
  const updateForceCoordinates = useForceStore((state) => state.updateForceCoordinates);
  
  const [photoUrls, setPhotoUrls] = useState<Record<string, string | null>>({});
  const [streetViewUrls, setStreetViewUrls] = useState<Record<string, string | null>>({});
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [searchText, setSearchText] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<IncidentType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<IncidentStatus[]>([]);
  
  const [forceSearchText, setForceSearchText] = useState('');
  const [selectedForceTypes, setSelectedForceTypes] = useState<ForceType[]>([]);
  const [selectedForceStatuses, setSelectedForceStatuses] = useState<ForceStatus[]>([]);
  
  // Always enable movement and motion trails (removed toggles)
  const isMovementEnabled = true;
  const showMotionTrails = true;
  
  // Store force movement directions and history
  const [forceDirections, setForceDirections] = useState<Record<string, { lat: number, lng: number }>>({});
  const [forceHistory, setForceHistory] = useState<Record<string, Array<[number, number]>>>({});

  // Add more realistic movement to force units that are on_road
  useEffect(() => {
    // Skip movement if disabled
    if (!isMovementEnabled) return;
    
    // Initialize force directions if not set
    if (Object.keys(forceDirections).length === 0) {
      const initialDirections: Record<string, { lat: number, lng: number }> = {};
      const initialHistory: Record<string, Array<[number, number]>> = {};
      
      forces.forEach(force => {
        if (force.status === 'on_road') {
          // Random direction vector with normalized magnitude - 50% faster
          const angle = Math.random() * Math.PI * 2;
          initialDirections[force.id] = { 
            lat: Math.sin(angle) * 0.00045, // 50% faster (0.0003 * 1.5)
            lng: Math.cos(angle) * 0.00045 
          };
          
          // Initialize history with current position
          initialHistory[force.id] = [force.coordinates];
        }
      });
      
      setForceDirections(initialDirections);
      setForceHistory(initialHistory);
    }
    
    const moveForces = () => {
      const updatedDirections = { ...forceDirections };
      const updatedHistory = { ...forceHistory };
      
      forces.forEach(force => {
        // Only move forces that are on_road
        if (force.status === 'on_road') {
          // Get current direction or generate a new one
          let direction = updatedDirections[force.id];
          
          if (!direction) {
            const angle = Math.random() * Math.PI * 2;
            direction = { 
              lat: Math.sin(angle) * 0.00045,
              lng: Math.cos(angle) * 0.00045
            };
          }
          
          // Randomly adjust direction slightly (5% chance to change direction)
          if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            const newDirection = {
              lat: Math.sin(angle) * 0.00045,
              lng: Math.cos(angle) * 0.00045
            };
            
            // Smooth transition to new direction (blend old and new)
            direction = {
              lat: direction.lat * 0.7 + newDirection.lat * 0.3,
              lng: direction.lng * 0.7 + newDirection.lng * 0.3
            };
          }
          
          // Calculate new coordinates
          const newLat = force.coordinates[0] + direction.lat;
          const newLng = force.coordinates[1] + direction.lng;
          
          // Update force coordinates
          updateForceCoordinates(force.id, [newLat, newLng]);
          
          // Save updated direction
          updatedDirections[force.id] = direction;
          
          // Update position history (keep last 5 positions)
          if (!updatedHistory[force.id]) {
            updatedHistory[force.id] = [];
          }
          
          updatedHistory[force.id] = [
            [newLat, newLng],
            ...updatedHistory[force.id].slice(0, 4)
          ];
        }
      });
      
      setForceDirections(updatedDirections);
      setForceHistory(updatedHistory);
    };
    
    // Update less frequently since we have CSS transitions to handle the animation
    const intervalId = setInterval(moveForces, 1500);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [forces, updateForceCoordinates, isMovementEnabled, forceDirections, forceHistory]);

  useEffect(() => {
    const handleFiltersChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        searchText: string;
        selectedTypes: IncidentType[];
        selectedStatuses: IncidentStatus[];
      }>;
      
      if (customEvent.detail) {
        const { searchText, selectedTypes, selectedStatuses } = customEvent.detail;
        setSearchText(searchText || '');
        setSelectedTypes(selectedTypes || []);
        setSelectedStatuses(selectedStatuses || []);
      }
    };

    window.addEventListener('filtersChanged', handleFiltersChange);

    return () => {
      window.removeEventListener('filtersChanged', handleFiltersChange);
    };
  }, []);
  
  useEffect(() => {
    const handleForceFiltersChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        searchText: string;
        selectedTypes: ForceType[];
        selectedStatuses: ForceStatus[];
      }>;
      
      if (customEvent.detail) {
        const { searchText, selectedTypes, selectedStatuses } = customEvent.detail;
        setForceSearchText(searchText || '');
        setSelectedForceTypes(selectedTypes || []);
        setSelectedForceStatuses(selectedStatuses || []);
      }
    };

    window.addEventListener('forceFiltersChanged', handleForceFiltersChange);

    return () => {
      window.removeEventListener('forceFiltersChanged', handleForceFiltersChange);
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    let filtered = incidents;
    
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(incident => 
        incident.summary.toLowerCase().includes(searchLower) || 
        incident.location.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(incident => selectedTypes.includes(incident.type));
    }
    
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(incident => selectedStatuses.includes(incident.status));
    }
    
    return filtered;
  }, [incidents, searchText, selectedTypes, selectedStatuses]);
  
  const filteredForces = useMemo(() => {
    let filtered = forces;
    
    if (forceSearchText.trim()) {
      const searchLower = forceSearchText.toLowerCase().trim();
      filtered = filtered.filter(force => 
        force.callsign.toLowerCase().includes(searchLower) || 
        force.location.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedForceTypes.length > 0) {
      filtered = filtered.filter(force => selectedForceTypes.includes(force.type));
    }
    
    if (selectedForceStatuses.length > 0) {
      filtered = filtered.filter(force => selectedForceStatuses.includes(force.status));
    }
    
    return filtered;
  }, [forces, forceSearchText, selectedForceTypes, selectedForceStatuses]);

  const handleMarkerClick = async (incident: Incident) => {
    console.log('🎯 Marker clicked:', {
      id: incident.id,
      lat: incident.coordinates[0],
      lng: incident.coordinates[1]
    });

    selectIncident(incident.id);

    try {
      setSelectedIncident(incident);
      setIsLoading(true);
      console.log('🔄 Fetching photos for incident:', incident.id);

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

  const handleForceClick = (force: Force) => {
    console.log('Force clicked:', force);
    selectForce(force.id);
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
      
      <div className="absolute top-3 right-3 space-y-2 z-50">
        {(selectedTypes.length > 0 || selectedStatuses.length > 0) && (
          <div className="bg-white py-1 px-3 rounded-full border shadow-sm text-sm flex items-center">
            <span className="font-medium text-gray-700">Filtered incidents: </span>
            <span className="ml-1 text-red-600 font-medium">{filteredIncidents.length}</span>
            <button 
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('resetFilters'));
              }}
              title="Clear filters"
            >
              ×
            </button>
          </div>
        )}
        
        {(selectedForceTypes.length > 0 || selectedForceStatuses.length > 0) && (
          <div className="bg-white py-1 px-3 rounded-full border shadow-sm text-sm flex items-center">
            <span className="font-medium text-gray-700">Filtered units: </span>
            <span className="ml-1 text-blue-600 font-medium">{filteredForces.length}</span>
            <button 
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('resetForceFilters'));
              }}
              title="Clear filters"
            >
              ×
            </button>
          </div>
        )}
      </div>
      
      <MarkerContext.Provider value={markerRefs}>
        <MapContainer 
          center={position} 
          zoom={14} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="h-full w-full z-0"
        >
          <LeafletAnimationStyles />
          <MapContent 
            incidents={filteredIncidents}
            forces={filteredForces}
            handleMarkerClick={handleMarkerClick}
            handleForceClick={handleForceClick}
            photoUrls={photoUrls}
            streetViewUrls={streetViewUrls}
            selectedIncident={selectedIncident}
            isLoading={isLoading}
            markerRefs={markerRefs}
            forceHistory={forceHistory}
            showMotionTrails={showMotionTrails}
          />
        </MapContainer>
      </MarkerContext.Provider>
    </div>
  );
} 