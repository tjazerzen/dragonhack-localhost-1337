import { create } from 'zustand';
import { Force, ForceStatus } from '@/types/forces';

interface ForceStore {
  forces: Force[];
  selectedForceId: string | null;
  selectForce: (id: string | null) => void;
  updateForceStatus: (id: string, status: ForceStatus) => void;
  updateForceCoordinates: (id: string, coordinates: [number, number]) => void;
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
    id: '6',
    type: 'firefighter',
    status: 'idle',
    location: 'East Fire Station',
    coordinates: [46.057091, 14.518414],
    callsign: 'Engine-3'
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
  }
})); 