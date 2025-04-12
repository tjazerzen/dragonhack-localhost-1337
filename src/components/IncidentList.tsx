import { useIncidentStore } from '@/store/incidentStore';
import { IncidentStatus } from '@/types/incidents';
import { FaExclamationCircle, FaExclamationTriangle, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useState, useMemo } from 'react';

const statusConfig: Record<IncidentStatus, { color: string; icon: IconType }> = {
  critical: { color: 'bg-red-100 text-red-600', icon: FaExclamationCircle },
  moderate: { color: 'bg-orange-100 text-orange-600', icon: FaExclamationTriangle },
  resolved: { color: 'bg-green-100 text-green-600', icon: FaCheckCircle },
};

export default function IncidentList() {
  const incidents = useIncidentStore((state) => state.incidents);
  const selectIncident = useIncidentStore((state) => state.selectIncident);
  const [searchText, setSearchText] = useState('');

  const filteredIncidents = useMemo(() => {
    if (!searchText.trim()) return incidents;
    
    const searchLower = searchText.toLowerCase().trim();
    return incidents.filter(incident => 
      incident.summary.toLowerCase().includes(searchLower) || 
      incident.location.toLowerCase().includes(searchLower)
    );
  }, [incidents, searchText]);

  return (
    <div className="h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Emergencies</h2>
          <button className="text-blue-600 text-sm font-medium">
            Alerts
          </button>
        </div>
        
        <div className="mt-3 flex gap-2 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search a location"
              className="py-2 pl-10 pr-3 w-full border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button className="py-2 px-4 border rounded-md text-sm">
            Filter
          </button>
        </div>
        
        <div className="flex justify-between mt-4">
          <div>
            <span className="text-gray-600">Total</span>
            <div className="text-2xl font-bold">{filteredIncidents.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Critical</span>
            <div className="text-2xl font-bold text-red-600">
              {filteredIncidents.filter(i => i.status === 'critical').length}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Resolved</span>
            <div className="text-2xl font-bold text-green-600">
              {filteredIncidents.filter(i => i.status === 'resolved').length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-180px)]">
        {filteredIncidents.map((incident) => {
          const StatusIcon = statusConfig[incident.status].icon;
          return (
            <div
              key={incident.id}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => selectIncident(incident.id)}
            >
              <div className="flex items-start gap-3">
                <StatusIcon className={`mt-1 ${statusConfig[incident.status].color}`} />
                <div>
                  <h3 className="font-medium">{incident.summary}</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    {incident.type.replace('_', ' ').toUpperCase()} • {incident.location}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {incident.timestamp} • {(incident.distance / 1000).toFixed(1)}km away
                  </p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${statusConfig[incident.status].color}`}>
                    {incident.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 