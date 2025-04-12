'use client';

import { useLayoutStore } from '@/store/layoutStore';
import { useIncidentStore } from '@/store/incidentStore';
import { FaPlus } from 'react-icons/fa';

export default function NavBar() {
  const { activeSidePanel, switchSidePanel } = useLayoutStore();
  const { startAddingIncident } = useIncidentStore();
  
  return (
    <nav className="bg-sidebar text-white w-full p-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold mr-6">Emergency Response</h1>
        <div className="flex">
          <button 
            className={`px-4 py-2 rounded-l-md text-sm font-medium flex items-center gap-1 ${
              activeSidePanel === 'incidents' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-black'
            }`}
            onClick={() => switchSidePanel('incidents')}
          >
            Emergencies
          </button>
          <button 
            className={`px-4 py-2 rounded-r-md text-sm font-medium flex items-center gap-1 ${
              activeSidePanel === 'forces' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-black'
            }`}
            onClick={() => switchSidePanel('forces')}
          >
            Support Units
          </button>
        </div>
      </div>
      <button 
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1"
        onClick={startAddingIncident}
      >
        <FaPlus size={12} />
        Add Incident
      </button>
    </nav>
  );
}