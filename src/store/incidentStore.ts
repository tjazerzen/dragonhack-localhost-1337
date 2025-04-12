import { create } from 'zustand';
import { Incident } from '@/types/incidents';

interface IncidentStore {
  incidents: Incident[];
}

// Sample incident data
const sampleIncidents: Incident[] = [
  {
    id: '1',
    type: 'fire',
    summary: 'House Fire in Blair Hills',
    status: 'critical',
    location: 'Blair Hills',
    timestamp: '10:31AM',
    coordinates: [51.505, -0.09],
    distance: 1200, // 1.2km from command center
  },
  {
    id: '2',
    type: 'flood',
    summary: 'Flash Flood on Main Street',
    status: 'moderate',
    location: 'Main Street',
    timestamp: '10:45AM',
    coordinates: [51.506, -0.08],
    distance: 800, // 800m from command center
  },
  {
    id: '3',
    type: 'earthquake',
    summary: 'Minor Earthquake Damage',
    status: 'moderate',
    location: 'Downtown Area',
    timestamp: '11:00AM',
    coordinates: [51.507, -0.07],
    distance: 2500, // 2.5km from command center
  },
  {
    id: '4',
    type: 'traffic_accident',
    summary: 'Multi-vehicle Collision',
    status: 'critical',
    location: 'Highway Junction',
    timestamp: '11:15AM',
    coordinates: [51.504, -0.10],
    distance: 350, // 350m from command center
  },
  {
    id: '5',
    type: 'fire',
    summary: 'Factory Fire',
    status: 'resolved',
    location: 'Industrial Park',
    timestamp: '09:30AM',
    coordinates: [51.508, -0.11],
    distance: 1800, // 1.8km from command center
  }
];

export const useIncidentStore = create<IncidentStore>()(() => ({
  incidents: sampleIncidents,
})); 