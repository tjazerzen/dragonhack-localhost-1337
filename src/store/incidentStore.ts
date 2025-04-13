import { create } from 'zustand';
import { Incident } from '@/types/incidents';
import type { GeocodingResult } from '@/lib/geocoding';

interface IncidentStore {
  incidents: Incident[];
  selectedIncidentId: string | null;
  isAddingIncident: boolean;
  extractedLocation: string | null;
  extractedCoordinates: GeocodingResult | null;
  selectIncident: (id: string | null) => void;
  startAddingIncident: () => void;
  cancelAddingIncident: () => void;
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp'> & { coordinates: [number, number] }) => void;
  setExtractedLocation: (location: string | null) => void;
  setExtractedCoordinates: (coordinates: GeocodingResult | null) => void;
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
    noPoliceSupport: 2,
    noFirefighterSupport: 4
  },
  {
    id: '2',
    type: 'traffic_accident',
    summary: 'Multi-vehicle Collision',
    status: 'critical',
    location: 'Highway Junction',
    timestamp: '11:15AM',
    coordinates: [46.050091, 14.458414],
    noPoliceSupport: 4,
    noFirefighterSupport: 2
  },
  {
    id: '3',
    type: 'fire',
    summary: 'Factory Fire',
    status: 'resolved',
    location: 'Industrial Park',
    timestamp: '09:30AM',
    coordinates: [46.058091, 14.448414],
    noPoliceSupport: 3,
    noFirefighterSupport: 6
  },
  {
    id: '4',
    type: 'structural',
    summary: 'Building Collapse Risk',
    status: 'critical',
    location: 'Old Market Square',
    timestamp: '12:15PM',
    coordinates: [46.048091, 14.470414],
    noPoliceSupport: 2,
    noFirefighterSupport: 3
  },
  {
    id: '5',
    type: 'power_outage',
    summary: 'Widespread Power Failure',
    status: 'critical',
    location: 'Financial District',
    timestamp: '12:45PM',
    coordinates: [46.054091, 14.471414],
    noPoliceSupport: 3,
    noFirefighterSupport: 1
  },
  {
    id: '6',
    type: 'structural',
    summary: 'Roof Collapse Risk after Heavy Rain',
    status: 'critical',
    location: 'Ljubljana Castle',
    timestamp: '14:15PM',
    coordinates: [46.048891, 14.478314],
    noPoliceSupport: 2,
    noFirefighterSupport: 4
  },
  {
    id: '7',
    type: 'flood',
    summary: 'Small Flood on River Bank',
    status: 'moderate',
    location: 'Ljubljanica River',
    timestamp: '14:30PM',
    coordinates: [46.053091, 14.483414],
    noPoliceSupport: 1,
    noFirefighterSupport: 3
  },
  {
    id: '8',
    type: 'hazmat',
    summary: 'Gas Leak in Restaurant',
    status: 'critical',
    location: 'Old Town Square',
    timestamp: '14:45PM',
    coordinates: [46.049291, 14.475814],
    noPoliceSupport: 2,
    noFirefighterSupport: 3
  },
  {
    id: '17',
    type: 'hazmat',
    summary: 'Gas Leak in Restaurant',
    status: 'critical',
    location: 'Old Town Square',
    timestamp: '14:45PM',
    coordinates: [46.049291, 14.475814],
    noPoliceSupport: 3,
    noFirefighterSupport: 2
  },
  {
    id: '18',
    type: 'medical',
    summary: 'Mass Casualty Incident at Sports Event',
    status: 'critical',
    location: 'Stožice Stadium',
    timestamp: '15:20PM',
    coordinates: [46.081375, 14.534127],
    noPoliceSupport: 5,
    noFirefighterSupport: 4
  },
  {
    id: '19',
    type: 'earthquake',
    summary: 'Minor Structural Damage',
    status: 'moderate',
    location: 'Šiška District',
    timestamp: '15:30PM',
    coordinates: [46.073140, 14.486223],
    noPoliceSupport: 2,
    noFirefighterSupport: 3
  },
  {
    id: '20',
    type: 'rescue',
    summary: 'Elevator Malfunction with Trapped People',
    status: 'critical',
    location: 'BTC City Mall',
    timestamp: '15:45PM',
    coordinates: [46.066202, 14.539291],
    noPoliceSupport: 1,
    noFirefighterSupport: 2
  },
  {
    id: '21',
    type: 'traffic_accident',
    summary: 'Bus and Car Collision',
    status: 'critical',
    location: 'Dunajska Road',
    timestamp: '16:00PM',
    coordinates: [46.077557, 14.511919],
    noPoliceSupport: 4,
    noFirefighterSupport: 3
  },
  {
    id: '22',
    type: 'fire',
    summary: 'Apartment Complex Fire',
    status: 'moderate',
    location: 'Bežigrad District',
    timestamp: '16:15PM',
    coordinates: [46.069981, 14.546071],
    noPoliceSupport: 2,
    noFirefighterSupport: 5
  },
  {
    id: '23',
    type: 'flood',
    summary: 'Flash Flood After Heavy Rain',
    status: 'critical',
    location: 'Trnovo District',
    timestamp: '16:30PM',
    coordinates: [46.038030, 14.499781],
    noPoliceSupport: 3,
    noFirefighterSupport: 4
  },
  {
    id: '24',
    type: 'structural',
    summary: 'Bridge Structural Issue',
    status: 'moderate',
    location: 'Dragon Bridge',
    timestamp: '16:45PM',
    coordinates: [46.051072, 14.455576],
    noPoliceSupport: 2,
    noFirefighterSupport: 2
  },
  {
    id: '25',
    type: 'hazmat',
    summary: 'Chemical Spill',
    status: 'resolved',
    location: 'Industrial Zone',
    timestamp: '17:00PM',
    coordinates: [46.035722, 14.476467],
    noPoliceSupport: 2,
    noFirefighterSupport: 3
  },
  {
    id: '26',
    type: 'power_outage',
    summary: 'Transformer Explosion',
    status: 'critical',
    location: 'Vič District',
    timestamp: '17:15PM',
    coordinates: [46.043884, 14.446598],
    noPoliceSupport: 2,
    noFirefighterSupport: 3
  },
  {
    id: '27',
    type: 'medical',
    summary: 'Food Poisoning at Restaurant',
    status: 'moderate',
    location: 'City Center',
    timestamp: '17:30PM',
    coordinates: [46.056378, 14.552514],
    noPoliceSupport: 1,
    noFirefighterSupport: 2
  },
  {
    id: '28',
    type: 'rescue',
    summary: 'Hiker Lost in Park Area',
    status: 'resolved',
    location: 'Tivoli Park',
    timestamp: '17:45PM',
    coordinates: [46.055295, 14.570204],
    noPoliceSupport: 2,
    noFirefighterSupport: 1
  },
  {
    id: '29',
    type: 'fire',
    summary: 'Forest Fire Risk',
    status: 'moderate',
    location: 'Rožnik Hill',
    timestamp: '18:00PM',
    coordinates: [46.078759, 14.571244],
    noPoliceSupport: 1,
    noFirefighterSupport: 3
  },
  {
    id: '30',
    type: 'earthquake',
    summary: 'Building Foundation Check',
    status: 'resolved',
    location: 'Moste District',
    timestamp: '18:15PM',
    coordinates: [46.074238, 14.524785],
    noPoliceSupport: 1,
    noFirefighterSupport: 2
  },
  {
    id: '31',
    type: 'traffic_accident',
    summary: 'Multiple Vehicle Pile-up',
    status: 'critical',
    location: 'Ring Road',
    timestamp: '18:30PM',
    coordinates: [46.065604, 14.530836],
    noPoliceSupport: 5,
    noFirefighterSupport: 3
  },
  {
    id: '32',
    type: 'structural',
    summary: 'Construction Site Collapse',
    status: 'critical',
    location: 'New Development Area',
    timestamp: '18:45PM',
    coordinates: [46.046910, 14.551539],
    noPoliceSupport: 3,
    noFirefighterSupport: 5
  },
  {
    id: '33',
    type: 'flood',
    summary: 'Sewage System Overflow',
    status: 'moderate',
    location: 'Fužine District',
    timestamp: '19:00PM',
    coordinates: [46.032182, 14.529309],
    noPoliceSupport: 2,
    noFirefighterSupport: 3
  }
];

export const useIncidentStore = create<IncidentStore>()((set, get) => ({
  incidents: sampleIncidents,
  selectedIncidentId: null,
  isAddingIncident: false,
  extractedLocation: null,
  extractedCoordinates: null,
  selectIncident: (id) => set({ selectedIncidentId: id }),
  startAddingIncident: () => set({ isAddingIncident: true }),
  cancelAddingIncident: () => set({ isAddingIncident: false }),
  setExtractedLocation: (location) => set({ extractedLocation: location }),
  setExtractedCoordinates: (coordinates) => set({ extractedCoordinates: coordinates }),
  addIncident: (incidentData) => {
    const { incidents } = get();

    // Generate a new ID based on the highest current ID
    const highestId = Math.max(...incidents.map(inc => parseInt(inc.id)));
    const newId = (highestId + 1).toString();

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newIncident: Incident = {
      id: newId,
      type: incidentData.type,
      summary: incidentData.summary,
      status: incidentData.status,
      location: incidentData.location,
      timestamp,
      coordinates: incidentData.coordinates,
      noPoliceSupport: incidentData.noPoliceSupport,
      noFirefighterSupport: incidentData.noFirefighterSupport
    };

    set({
      incidents: [...incidents, newIncident],
      isAddingIncident: false
    });
  }
})); 