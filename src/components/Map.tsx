'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';

interface MapProps {
  position: LatLngExpression;
}

export default function Map({ position }: MapProps) {
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
        <Marker 
          position={position}
          icon={L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSAxMi4xMyA1IDE2QzUgMTkuODcgOC4xMyAyMyAxMiAyM0MxNS44NyAyMyAxOSAxOS44NyAxOSAxNkMxOSAxMi4xMyAxNS44NyAyIDEyIDJaTTcgMTZDNyAxMi4xMyAxMCA5IDE0IDlDMTcuODcgOSAyMSAxMi4xMyAyMSAxNkMyMSAxOS44NyAxNy44NyAyMyAxNCAyM0MxMC4xMyAyMyA3IDE5Ljg3IDcgMTZaIiBmaWxsPSIjMDA3QUZGIi8+PC9zdmc+',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24],
          })}
        >
          <Popup className="rounded-lg shadow-lg border border-gray-200">
            <div className="p-2 text-sm">
              <p className="font-medium">Current Location</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
} 