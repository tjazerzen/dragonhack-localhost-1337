import { create } from 'zustand';
import { Incident } from '@/types/incidents';

interface IncidentStore {
  incidents: Incident[];
}

// Sample incident data
const sampleIncidents: Incident[] = [
  {
    id: '1',
    summary: 'House Fire in Blair Hills',
    status: 'critical',
    location: 'Blair Hills',
    timestamp: '10:31AM',
    coordinates: [51.505, -0.09],
  },
  {
    id: '2',
    summary: 'House Fire in Blair Hills',
    status: 'moderate',
    location: 'Blair Hills',
    timestamp: '10:31AM',
    coordinates: [51.506, -0.08],
  },
  {
    id: '3',
    summary: 'House Fire in Blair Hills',
    status: 'resolved',
    location: 'Blair Hills',
    timestamp: '10:31AM',
    coordinates: [51.507, -0.07],
  },
];

export const useIncidentStore = create<IncidentStore>()(() => ({
  incidents: sampleIncidents,
})); 