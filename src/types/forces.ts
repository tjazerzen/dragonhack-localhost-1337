export type ForceType = 'police' | 'firefighter';

export type ForceStatus = 'idle' | 'on_road';

export interface Force {
  id: string;
  type: ForceType;
  status: ForceStatus;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  callsign: string; // Identifier like "Unit-1" or "Engine-3"
  dispatchedToIncidentId?: string | null; // ID of the incident the unit is dispatched to
  route?: Array<[number, number]> | null; // Array of [lat, lng] points for the calculated route
  routeTargetIndex?: number; // The index of the next point in the route array the unit is moving towards
} 