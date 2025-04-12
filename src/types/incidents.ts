export type IncidentStatus = 'resolved' | 'critical' | 'moderate';

export type IncidentType = 'fire' | 'flood' | 'earthquake' | 'traffic_accident';

export interface Incident {
  id: string;
  type: IncidentType;
  summary: string;
  status: IncidentStatus;
  location: string;
  timestamp: string;
  coordinates: [number, number]; // [latitude, longitude]
  distance: number; // in meters from command center
} 