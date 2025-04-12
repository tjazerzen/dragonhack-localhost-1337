'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useIncidentStore } from '@/store/incidentStore';
import { IncidentStatus } from '@/types/incidents';

interface MapProps {
  position: LatLngExpression;
}

const statusIcons: Record<IncidentStatus, string> = {
  critical: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI0RDMjYyNiIvPjxwYXRoIGQ9Ik04IDhMMTYgMTZNOCAxNkwxNiA4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  moderate: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI0ZCOTIzQyIvPjxwYXRoIGQ9Ik0xMiA3VjEzTTEyIDE2VjE3IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  resolved: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzIyQzU1RSIvPjxwYXRoIGQ9Ik04IDEyTDExIDE1TDE2IDkiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+',
};

const statusColors: Record<IncidentStatus, string> = {
  critical: 'text-red-600',
  moderate: 'text-orange-500',
  resolved: 'text-green-600',
};

export default function Map({ position }: MapProps) {
  const incidents = useIncidentStore((state) => state.incidents);

  useEffect(() => {
    // @ts-expect-error - Leaflet types are not properly set up for Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden relative">
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
          >
            <Popup className="rounded-lg shadow-lg border border-gray-200">
              <div className="p-2 text-sm">
                <h3 className="font-medium">{incident.summary}</h3>
                <p className="text-gray-500 text-xs mt-1">
                  {incident.type.replace('_', ' ').toUpperCase()} • {incident.location}
                </p>
                <p className="text-gray-500 text-xs">
                  {incident.timestamp} • {(incident.distance / 1000).toFixed(1)}km away
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-2 font-medium ${statusColors[incident.status]}`}>
                  {incident.status.toUpperCase()}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 