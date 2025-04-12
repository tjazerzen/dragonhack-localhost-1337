import { create } from 'zustand';
import { Incident } from '@/types/incidents';

interface IncidentStore {
  incidents: Incident[];
  selectedIncidentId: string | null;
  selectIncident: (id: string | null) => void;
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
    coordinates: [46.055091, 14.468414],
    distance: 1200, // 1.2km from command center
  },
  {
    id: '2',
    type: 'flood',
    summary: 'Flash Flood on Main Street',
    status: 'moderate',
    location: 'Main Street',
    timestamp: '10:45AM',
    coordinates: [46.056091, 14.478414],
    distance: 800, // 800m from command center
  },
  {
    id: '3',
    type: 'earthquake',
    summary: 'Minor Earthquake Damage',
    status: 'moderate',
    location: 'Downtown Area',
    timestamp: '11:00AM',
    coordinates: [46.057091, 14.488414],
    distance: 2500, // 2.5km from command center
  },
  {
    id: '4',
    type: 'traffic_accident',
    summary: 'Multi-vehicle Collision',
    status: 'critical',
    location: 'Highway Junction',
    timestamp: '11:15AM',
    coordinates: [46.050091, 14.458414],
    distance: 350, // 350m from command center
  },
  {
    id: '5',
    type: 'fire',
    summary: 'Factory Fire',
    status: 'resolved',
    location: 'Industrial Park',
    timestamp: '09:30AM',
    coordinates: [46.058091, 14.448414],
    distance: 1800, // 1.8km from command center
  },
  {
    id: '6',
    type: 'medical',
    summary: 'Mass Casualty Incident at Concert Venue',
    status: 'critical',
    location: 'Royal Festival Hall',
    timestamp: '11:45AM',
    coordinates: [46.049091, 14.473414],
    distance: 600, // 600m from command center
  },
  {
    id: '7',
    type: 'hazmat',
    summary: 'Chemical Spill on Railway',
    status: 'moderate',
    location: 'Central Station',
    timestamp: '12:00PM',
    coordinates: [46.059091, 14.463414],
    distance: 950, // 950m from command center
  },
  {
    id: '8',
    type: 'structural',
    summary: 'Building Collapse Risk',
    status: 'critical',
    location: 'Old Market Square',
    timestamp: '12:15PM',
    coordinates: [46.048091, 14.470414],
    distance: 1500, // 1.5km from command center
  },
  {
    id: '9',
    type: 'rescue',
    summary: 'Trapped Workers in Construction Site',
    status: 'moderate',
    location: 'New Development Zone',
    timestamp: '12:30PM',
    coordinates: [46.056091, 14.466414],
    distance: 400, // 400m from command center
  },
  {
    id: '10',
    type: 'power_outage',
    summary: 'Widespread Power Failure',
    status: 'critical',
    location: 'Financial District',
    timestamp: '12:45PM',
    coordinates: [46.054091, 14.471414],
    distance: 750, // 750m from command center
  },
  {
    id: '11',
    type: 'fire',
    summary: 'Apartment Fire on Slovenska Road',
    status: 'critical',
    location: 'Slovenska Road',
    timestamp: '13:15PM',
    coordinates: [46.052781, 14.464834],
    distance: 550, // 550m from command center
  },
  {
    id: '12',
    type: 'medical',
    summary: 'Elderly Person Collapsed',
    status: 'moderate',
    location: 'Tivoli Park',
    timestamp: '13:30PM',
    coordinates: [46.056761, 14.461214],
    distance: 880, // 880m from command center
  },
  {
    id: '13',
    type: 'rescue',
    summary: 'Child Stuck in Elevator',
    status: 'moderate',
    location: 'City Centre Mall',
    timestamp: '13:45PM',
    coordinates: [46.051391, 14.475114],
    distance: 610, // 610m from command center
  },
  {
    id: '14',
    type: 'traffic_accident',
    summary: 'Bus Collision with Car',
    status: 'critical',
    location: 'Main Bus Station',
    timestamp: '14:00PM',
    coordinates: [46.057891, 14.471714],
    distance: 720, // 720m from command center
  },
  {
    id: '15',
    type: 'structural',
    summary: 'Roof Collapse Risk after Heavy Rain',
    status: 'critical',
    location: 'Ljubljana Castle',
    timestamp: '14:15PM',
    coordinates: [46.048891, 14.478314],
    distance: 1100, // 1.1km from command center
  },
  {
    id: '16',
    type: 'flood',
    summary: 'Small Flood on River Bank',
    status: 'moderate',
    location: 'Ljubljanica River',
    timestamp: '14:30PM',
    coordinates: [46.053091, 14.483414],
    distance: 1300, // 1.3km from command center
  },
  {
    id: '17',
    type: 'hazmat',
    summary: 'Gas Leak in Restaurant',
    status: 'critical',
    location: 'Old Town Square',
    timestamp: '14:45PM',
    coordinates: [46.049291, 14.475814],
    distance: 930, // 930m from command center
  },
  {
    id: '18',
    type: 'fire',
    summary: 'Kitchen Fire in Restaurant',
    status: 'resolved',
    location: 'City Market Area',
    timestamp: '12:15PM',
    coordinates: [46.051591, 14.466114],
    distance: 420, // 420m from command center
  },
  {
    id: '19',
    type: 'medical',
    summary: 'Sports Injury at Stadium',
    status: 'resolved',
    location: 'Sports Stadium',
    timestamp: '11:00AM',
    coordinates: [46.059091, 14.473414],
    distance: 870, // 870m from command center
  },
  {
    id: '20',
    type: 'power_outage',
    summary: 'Localized Power Cut',
    status: 'resolved',
    location: 'Residential Complex',
    timestamp: '10:15AM',
    coordinates: [46.055091, 14.458414],
    distance: 990, // 990m from command center
  }
];

export const useIncidentStore = create<IncidentStore>()(() => ({
  incidents: sampleIncidents,
  selectedIncidentId: null,
  selectIncident: (id) => useIncidentStore.setState({ selectedIncidentId: id }),
})); 