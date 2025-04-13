import { create } from 'zustand';
import { Force, ForceStatus } from '@/types/forces';

interface ForceStore {
  forces: Force[];
  selectedForceId: string | null;
  selectForce: (id: string | null) => void;
  updateForceStatus: (id: string, status: ForceStatus) => void;
  updateForceCoordinates: (id: string, coordinates: [number, number]) => void;
  dispatchForce: (id: string, incidentId: string) => void;
}

// Sample force data
const sampleForces: Force[] = [
  {
    id: '1',
    type: 'police',
    status: 'idle',
    location: 'Central Police Station',
    coordinates: [46.056091, 14.508414],
    callsign: 'Unit-1'
  },
  {
    id: '2',
    type: 'police',
    status: 'idle',
    location: 'South Precinct',
    coordinates: [46.046091, 14.498414],
    callsign: 'Unit-2'
  },
  {
    id: '3',
    type: 'police',
    status: 'on_road',
    location: 'Highway Patrol',
    coordinates: [46.061583, 14.507542],
    callsign: 'Unit-3'
  },
  {
    id: '4',
    type: 'firefighter',
    status: 'idle',
    location: 'Central Fire Station',
    coordinates: [46.052091, 14.503414],
    callsign: 'Engine-1'
  },
  {
    id: '5',
    type: 'firefighter',
    status: 'on_road',
    location: 'North Fire Station',
    coordinates: [46.057671, 14.511625],
    callsign: 'Engine-2'
  },
  {
    id: '7',
    type: 'police',
    status: 'idle',
    location: 'Šiška District Station',
    coordinates: [46.073140, 14.486223],
    callsign: 'Unit-4'
  },
  {
    id: '8',
    type: 'firefighter',
    status: 'on_road',
    location: 'Western Fire Station',
    coordinates: [46.071744, 14.468347],
    callsign: 'Engine-4'
  },
  {
    id: '9',
    type: 'police',
    status: 'on_road',
    location: 'Northwest Precinct',
    coordinates: [46.081045, 14.479519],
    callsign: 'Unit-5'
  },
  {
    id: '11',
    type: 'police',
    status: 'on_road',
    location: 'Eastern Patrol Unit',
    coordinates: [46.061202, 14.539291],
    callsign: 'Unit-6'
  },
  {
    id: '12',
    type: 'firefighter',
    status: 'idle',
    location: 'South Central Fire Station',
    coordinates: [46.038030, 14.499781],
    callsign: 'Engine-6'
  },
  {
    id: '14',
    type: 'firefighter',
    status: 'idle',
    location: 'Southwest Fire Station',
    coordinates: [46.037599, 14.452992],
    callsign: 'Engine-7'
  },
  {
    id: '15',
    type: 'police',
    status: 'on_road',
    location: 'Vič Patrol Unit',
    coordinates: [46.038046, 14.469085],
    callsign: 'Unit-8'
  },
  {
    id: '17',
    type: 'police',
    status: 'on_road',
    location: 'South Vič Precinct',
    coordinates: [46.035722, 14.476467],
    callsign: 'Unit-9'
  },
  {
    id: '19',
    type: 'police',
    status: 'on_road',
    location: 'Southeast Mobile Unit',
    coordinates: [46.032182, 14.529309],
    callsign: 'Unit-10'
  },
  {
    id: '21',
    type: 'police',
    status: 'idle',
    location: 'Far East Precinct',
    coordinates: [46.055295, 14.570204],
    callsign: 'Unit-11'
  },
  {
    id: '22',
    type: 'firefighter',
    status: 'on_road',
    location: 'Northeast District Fire Station',
    coordinates: [46.078759, 14.571244],
    callsign: 'Engine-11'
  },
  {
    id: '26',
    type: 'police',
    status: 'idle',
    location: 'North Central Police Station',
    coordinates: [46.069564, 14.510998],
    callsign: 'Unit-14'
  },
  {
    id: '28',
    type: 'police',
    status: 'on_road',
    location: 'North Highway Patrol',
    coordinates: [46.075056, 14.510126],
    callsign: 'Unit-16'
  },
  {
    id: '30',
    type: 'firefighter',
    status: 'on_road',
    location: 'Far North Fire Station',
    coordinates: [46.071144, 14.514209],
    callsign: 'Engine-14'
  },
  {
    id: '32',
    type: 'police',
    status: 'idle',
    location: 'North Šiška District Station',
    coordinates: [46.086613, 14.488807],
    callsign: 'Unit-17'
  },
  {
    id: '33',
    type: 'firefighter',
    status: 'on_road',
    location: 'North Western Fire Station',
    coordinates: [46.085217, 14.470931],
    callsign: 'Engine-16'
  },
  {
    id: '34',
    type: 'police',
    status: 'on_road',
    location: 'Far Northwest Precinct',
    coordinates: [46.094518, 14.482103],
    callsign: 'Unit-18'
  },
  {
    id: '35',
    type: 'firefighter',
    status: 'idle',
    location: 'Far Northeast Fire Station',
    coordinates: [46.091030, 14.514503],
    callsign: 'Engine-17'
  },
  {
    id: '37',
    type: 'firefighter',
    status: 'idle',
    location: 'North South Central Fire Station',
    coordinates: [46.051503, 14.502365],
    callsign: 'Engine-18'
  },
  {
    id: '39',
    type: 'firefighter',
    status: 'idle',
    location: 'North Southwest Fire Station',
    coordinates: [46.051072, 14.455576],
    callsign: 'Engine-19'
  },
  {
    id: '41',
    type: 'firefighter',
    status: 'idle',
    location: 'North Far West Fire Station',
    coordinates: [46.057357, 14.449182],
    callsign: 'Engine-20'
  },
  {
    id: '42',
    type: 'police',
    status: 'on_road',
    location: 'North South Vič Precinct',
    coordinates: [46.049195, 14.479051],
    callsign: 'Unit-22'
  },
  {
    id: '44',
    type: 'police',
    status: 'on_road',
    location: 'North Southeast Mobile Unit',
    coordinates: [46.045655, 14.531893],
    callsign: 'Unit-23'
  },
  {
    id: '45',
    type: 'firefighter',
    status: 'on_road',
    location: 'North East District Fire Station',
    coordinates: [46.069851, 14.555098],
    callsign: 'Engine-22'
  },
  {
    id: '46',
    type: 'police',
    status: 'idle',
    location: 'North Far East Precinct',
    coordinates: [46.068768, 14.572788],
    callsign: 'Unit-24'
  },
  {
    id: '47',
    type: 'firefighter',
    status: 'on_road',
    location: 'Far Northeast District Fire Station',
    coordinates: [46.092232, 14.573828],
    callsign: 'Engine-23'
  },
  {
    id: '48',
    type: 'police',
    status: 'idle',
    location: 'Far North Central Precinct',
    coordinates: [46.083454, 14.548655],
    callsign: 'Unit-25'
  },
  {
    id: '49',
    type: 'firefighter',
    status: 'on_road',
    location: 'Far North District Fire Station',
    coordinates: [46.087711, 14.527369],
    callsign: 'Engine-24'
  },
  {
    id: '50',
    type: 'police',
    status: 'idle',
    location: 'North Central East Precinct',
    coordinates: [46.079077, 14.533420],
    callsign: 'Unit-26'
  }
];

export const useForceStore = create<ForceStore>()((set, get) => ({
  forces: sampleForces,
  selectedForceId: null,
  selectForce: (id) => set({ selectedForceId: id }),
  updateForceStatus: (id, status) => {
    const { forces } = get();
    const updatedForces = forces.map(force => 
      force.id === id ? { ...force, status } : force
    );
    set({ forces: updatedForces });
  },
  updateForceCoordinates: (id, coordinates) => {
    const { forces } = get();
    const updatedForces = forces.map(force => 
      force.id === id ? { ...force, coordinates } : force
    );
    set({ forces: updatedForces });
  },
  dispatchForce: (id, incidentId) => set((state) => ({
    forces: state.forces.map((force) =>
      force.id === id 
        ? { ...force, status: 'on_road', dispatchedToIncidentId: incidentId } 
        : force
    ),
  })),
})); 