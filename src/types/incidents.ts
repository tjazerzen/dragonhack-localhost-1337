export type IncidentStatus = 'resolved' | 'critical' | 'moderate';

export interface Incident {
  id: string;
  summary: string;
  status: IncidentStatus;
  location: string;
  timestamp: string;
  coordinates: [number, number]; // [latitude, longitude]
} 