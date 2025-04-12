export type ForceType = 'police' | 'firefighter';

export type ForceStatus = 'idle' | 'on_road';

export interface Force {
  id: string;
  type: ForceType;
  status: ForceStatus;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  callsign: string; // Identifier like "Unit-1" or "Engine-3"
} 