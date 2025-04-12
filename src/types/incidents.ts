export type IncidentStatus = 'resolved' | 'critical' | 'moderate';

export type IncidentType = 'fire' | 'flood' | 'earthquake' | 'traffic_accident' | 'medical' | 'hazmat' | 'structural' | 'rescue' | 'power_outage';

export interface Incident {
  id: string;
  type: IncidentType;
  summary: string;
  status: IncidentStatus;
  location: string;
  timestamp: string;
  coordinates: [number, number]; // [latitude, longitude]
} 