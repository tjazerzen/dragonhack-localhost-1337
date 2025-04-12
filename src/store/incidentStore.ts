import { create } from 'zustand';
import { Incident } from '@/types/incidents';

interface IncidentStore {
  incidents: Incident[];
  selectedIncidentId: string | null;
  isAddingIncident: boolean;
  selectIncident: (id: string | null) => void;
  startAddingIncident: () => void;
  cancelAddingIncident: () => void;
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp'> & { coordinates: [number, number] }) => void;
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
    coordinates: [46.055091, 14.468414]
  },
  {
    id: '4',
    type: 'traffic_accident',
    summary: 'Multi-vehicle Collision',
    status: 'critical',
    location: 'Highway Junction',
    timestamp: '11:15AM',
    coordinates: [46.050091, 14.458414]
  },
  {
    id: '5',
    type: 'fire',
    summary: 'Factory Fire',
    status: 'resolved',
    location: 'Industrial Park',
    timestamp: '09:30AM',
    coordinates: [46.058091, 14.448414]
  },
  {
    id: '8',
    type: 'structural',
    summary: 'Building Collapse Risk',
    status: 'critical',
    location: 'Old Market Square',
    timestamp: '12:15PM',
    coordinates: [46.048091, 14.470414]
  },
  {
    id: '10',
    type: 'power_outage',
    summary: 'Widespread Power Failure',
    status: 'critical',
    location: 'Financial District',
    timestamp: '12:45PM',
    coordinates: [46.054091, 14.471414]
  },
  {
    id: '15',
    type: 'structural',
    summary: 'Roof Collapse Risk after Heavy Rain',
    status: 'critical',
    location: 'Ljubljana Castle',
    timestamp: '14:15PM',
    coordinates: [46.048891, 14.478314]
  },
  {
    id: '16',
    type: 'flood',
    summary: 'Small Flood on River Bank',
    status: 'moderate',
    location: 'Ljubljanica River',
    timestamp: '14:30PM',
    coordinates: [46.053091, 14.483414]
  },
  {
    id: '17',
    type: 'hazmat',
    summary: 'Gas Leak in Restaurant',
    status: 'critical',
    location: 'Old Town Square',
    timestamp: '14:45PM',
    coordinates: [46.049291, 14.475814]
  },
];

export const useIncidentStore = create<IncidentStore>()((set, get) => ({
  incidents: sampleIncidents,
  selectedIncidentId: null,
  isAddingIncident: false,
  selectIncident: (id) => set({ selectedIncidentId: id }),
  startAddingIncident: () => set({ isAddingIncident: true }),
  cancelAddingIncident: () => set({ isAddingIncident: false }),
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
      coordinates: incidentData.coordinates
    };
    
    set({
      incidents: [...incidents, newIncident],
      isAddingIncident: false
    });
  }
})); 