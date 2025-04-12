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
  },
  {
    id: '6',
    type: 'medical',
    summary: 'Mass Casualty Incident at Concert Venue',
    status: 'critical',
    location: 'Royal Festival Hall',
    timestamp: '11:45AM',
    coordinates: [51.503, -0.085],
    distance: 600, // 600m from command center
  },
  {
    id: '7',
    type: 'hazmat',
    summary: 'Chemical Spill on Railway',
    status: 'moderate',
    location: 'Central Station',
    timestamp: '12:00PM',
    coordinates: [51.509, -0.095],
    distance: 950, // 950m from command center
  },
  {
    id: '8',
    type: 'structural',
    summary: 'Building Collapse Risk',
    status: 'critical',
    location: 'Old Market Square',
    timestamp: '12:15PM',
    coordinates: [51.502, -0.088],
    distance: 1500, // 1.5km from command center
  },
  {
    id: '9',
    type: 'rescue',
    summary: 'Trapped Workers in Construction Site',
    status: 'moderate',
    location: 'New Development Zone',
    timestamp: '12:30PM',
    coordinates: [51.506, -0.092],
    distance: 400, // 400m from command center
  },
  {
    id: '10',
    type: 'power_outage',
    summary: 'Widespread Power Failure',
    status: 'critical',
    location: 'Financial District',
    timestamp: '12:45PM',
    coordinates: [51.504, -0.087],
    distance: 750, // 750m from command center
  }
];

export const useIncidentStore = create<IncidentStore>()(() => ({
  incidents: sampleIncidents,
})); 