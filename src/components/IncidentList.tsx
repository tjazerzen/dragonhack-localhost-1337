'use client';

import { useIncidentStore } from '@/store/incidentStore';
import { IncidentStatus, IncidentType } from '@/types/incidents';
import { FaSearch, FaChevronLeft } from 'react-icons/fa';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { statusIcons } from '@/utils/mapUtils';

// Helper function to parse time string (e.g., "10:31AM") into minutes since midnight
const parseTimeString = (timeString: string): number => {
  const [time, modifier] = timeString.split(/(AM|PM)/);
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) { // Midnight case
    hours = 0;
  }
  
  return hours * 60 + minutes;
};

// Severity order for sorting
const severityOrder: Record<IncidentStatus, number> = {
  critical: 1,
  moderate: 2,
  resolved: 3,
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

// Add new statusColor config based on original badges
const statusColorConfig: Record<IncidentStatus, string> = {
  critical: 'bg-red-100 text-red-600',
  moderate: 'bg-orange-100 text-orange-600',
  resolved: 'bg-green-100 text-green-600',
};

// Define subtle background colors for incident cards
const statusBgColorConfig: Record<IncidentStatus, string> = {
  critical: 'bg-red-50 hover:bg-red-100',
  moderate: 'bg-orange-50 hover:bg-orange-100',
  resolved: 'bg-green-50 hover:bg-green-100',
};

export default function IncidentList() {
  const incidents = useIncidentStore((state) => state.incidents);
  const selectIncident = useIncidentStore((state) => state.selectIncident);
  const { activeSidePanel, switchSidePanel } = useLayoutStore();
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

  // Listen for reset filters event
  useEffect(() => {
    const handleResetFilters = () => {
      resetFilters();
    };
    
    window.addEventListener('resetFilters', handleResetFilters);
    
    return () => {
      window.removeEventListener('resetFilters', handleResetFilters);
    };
  }, []);

  // Toggle a type filter
  const toggleTypeFilter = (type: IncidentType) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    
    // Emit filter change event
    window.dispatchEvent(new CustomEvent('filtersChanged', {
      detail: {
        searchText,
        selectedTypes: newSelectedTypes,
        selectedStatuses
      }
    }));
  };

  // Toggle a status filter
  const toggleStatusFilter = (status: IncidentStatus) => {
    const newSelectedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    setSelectedStatuses(newSelectedStatuses);
    
    // Emit filter change event
    window.dispatchEvent(new CustomEvent('filtersChanged', {
      detail: {
        searchText,
        selectedTypes,
        selectedStatuses: newSelectedStatuses
      }
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    
    // Emit filter change event
    window.dispatchEvent(new CustomEvent('filtersChanged', {
      detail: {
        searchText,
        selectedTypes: [],
        selectedStatuses: []
      }
    }));
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
    
    // Sort incidents: Severity (desc), then Time (desc)
    filtered.sort((a, b) => {
      // Compare severity
      const severityDiff = severityOrder[a.status] - severityOrder[b.status];
      if (severityDiff !== 0) {
        return severityDiff;
      }
      
      // Compare time (most recent first)
      const timeA = parseTimeString(a.timestamp);
      const timeB = parseTimeString(b.timestamp);
      return timeB - timeA; 
    });
    
    return filtered;
  }, [incidents, searchText, selectedTypes, selectedStatuses]);

  // Emit initial filter state on component mount
  useEffect(() => {
    // Emit filter change event with initial state
    window.dispatchEvent(new CustomEvent('filtersChanged', {
      detail: {
        searchText,
        selectedTypes,
        selectedStatuses
      }
    }));
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="h-full bg-sidebar flex flex-col w-full">
      <div className="flex">
        <button 
          className={`px-4 py-3 text-sm font-medium flex items-center justify-center flex-1 ${
            activeSidePanel === 'incidents' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
          onClick={() => switchSidePanel('incidents')}
        >
          Emergencies
        </button>
        <button 
          className={`px-4 py-3 text-sm font-medium flex items-center justify-center flex-1 ${
            activeSidePanel === 'forces' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
          onClick={() => switchSidePanel('forces')}
        >
          Support Units
        </button>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search incidents..."
              className="py-2 pl-10 pr-3 w-full border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => {
                const newSearchText = e.target.value;
                setSearchText(newSearchText);
                
                // Emit filter change event
                window.dispatchEvent(new CustomEvent('filtersChanged', {
                  detail: {
                    searchText: newSearchText,
                    selectedTypes,
                    selectedStatuses
                  }
                }));
              }}
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
              <div className="absolute right-0 mt-2 w-64 bg-sidebar rounded-lg shadow-lg border z-10">
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
          <div className="w-1/3 text-center">
            <span className="text-gray-600">Total</span>
            <div className="text-2xl font-bold">{filteredIncidents.length}</div>
          </div>
          <div className="w-1/3 text-center">
            <span className="text-gray-600">Critical</span>
            <div className="text-2xl font-bold text-red-600">
              {filteredIncidents.filter(i => i.status === 'critical').length}
            </div>
          </div>
          <div className="w-1/3 text-center">
            <span className="text-gray-600">Resolved</span>
            <div className="text-2xl font-bold text-green-600">
              {filteredIncidents.filter(i => i.status === 'resolved').length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {filteredIncidents.map((incident) => {
          return (
            <div
              key={incident.id}
              className={`p-4 border-b cursor-pointer ${statusBgColorConfig[incident.status]}`}
              onClick={() => selectIncident(incident.id)}
            >
              <div className="flex items-start gap-3">
                <img src={statusIcons[incident.status]} alt={`${incident.status} status`} className="mt-1 w-5 h-5" />
                <div>
                  <h3 className="font-medium">{incident.summary}</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    {incident.type.replace('_', ' ').toUpperCase()} • {incident.location}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {incident.timestamp}
                  </p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${statusColorConfig[incident.status]}`}>
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