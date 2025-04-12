import { useIncidentStore } from '@/store/incidentStore';
import { IncidentStatus, IncidentType } from '@/types/incidents';
import { FaExclamationCircle, FaExclamationTriangle, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useState, useMemo, useRef, useEffect } from 'react';

const statusConfig: Record<IncidentStatus, { color: string; icon: IconType }> = {
  critical: { color: 'bg-red-100 text-red-600', icon: FaExclamationCircle },
  moderate: { color: 'bg-orange-100 text-orange-600', icon: FaExclamationTriangle },
  resolved: { color: 'bg-green-100 text-green-600', icon: FaCheckCircle },
};

// Make incident type labels more readable
const typeLabels: Record<IncidentType, string> = {
  fire: 'Fire',
  flood: 'Flood',
  earthquake: 'Earthquake',
  traffic_accident: 'Traffic Accident',
  medical: 'Medical',
  hazmat: 'Hazmat',
  structural: 'Structural',
  rescue: 'Rescue',
  power_outage: 'Power Outage',
};

// Make status labels more readable
const statusLabels: Record<IncidentStatus, string> = {
  critical: 'Critical',
  moderate: 'Moderate',
  resolved: 'Resolved',
};

export default function IncidentList() {
  const incidents = useIncidentStore((state) => state.incidents);
  const selectIncident = useIncidentStore((state) => state.selectIncident);
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<IncidentType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<IncidentStatus[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle a type filter
  const toggleTypeFilter = (type: IncidentType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Toggle a status filter
  const toggleStatusFilter = (status: IncidentStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
  };

  // Check if filters are active
  const hasActiveFilters = selectedTypes.length > 0 || selectedStatuses.length > 0;

  const filteredIncidents = useMemo(() => {
    let filtered = incidents;
    
    // Apply text search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(incident => 
        incident.summary.toLowerCase().includes(searchLower) || 
        incident.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(incident => selectedTypes.includes(incident.type));
    }
    
    // Apply status filters
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(incident => selectedStatuses.includes(incident.status));
    }
    
    return filtered;
  }, [incidents, searchText, selectedTypes, selectedStatuses]);

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
          <div className="relative" ref={filterRef}>
            <button 
              className={`py-2 px-4 border rounded-md text-sm flex items-center ${hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filter
              {hasActiveFilters && (
                <span className="ml-1.5 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {selectedTypes.length + selectedStatuses.length}
                </span>
              )}
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">Filter by Type</h3>
                  <div className="mt-2 space-y-1.5">
                    {Object.entries(typeLabels).map(([type, label]) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type as IncidentType)}
                          onChange={() => toggleTypeFilter(type as IncidentType)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">Filter by Status</h3>
                  <div className="mt-2 space-y-1.5">
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <div key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status as IncidentStatus)}
                          onChange={() => toggleStatusFilter(status as IncidentStatus)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 flex justify-end">
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}
          </div>
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