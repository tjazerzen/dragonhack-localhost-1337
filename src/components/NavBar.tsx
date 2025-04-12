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
        <h1 className="text-2xl font-bold mr-6">
          <span className="text-red-500">nine</span><span className="text-blue-500">line</span>🚨
        </h1>
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