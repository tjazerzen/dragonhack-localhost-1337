import { useForceStore } from '@/store/forceStore';
import { ForceType, ForceStatus } from '@/types/forces';
import { FaChevronLeft } from 'react-icons/fa6';
import { FaSearch, FaShieldAlt, FaFire, FaCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useLayoutStore } from '@/store/layoutStore';

const forceTypeConfig: Record<ForceType, { color: string; icon: IconType; label: string }> = {
  police: { color: 'bg-blue-100 text-blue-600', icon: FaShieldAlt, label: 'Police' },
  firefighter: { color: 'bg-red-100 text-red-600', icon: FaFire, label: 'Firefighter' },
};

const forceStatusConfig: Record<ForceStatus, { color: string; label: string }> = {
  idle: { color: 'bg-gray-100 text-gray-600', label: 'Idle' },
  on_road: { color: 'bg-blue-100 text-blue-600', label: 'On Road' },
};

export default function ForceList() {
  const forces = useForceStore((state) => state.forces);
  const selectedForceId = useForceStore((state) => state.selectedForceId);
  const selectForce = useForceStore((state) => state.selectForce);
  const { activeSidePanel, switchSidePanel } = useLayoutStore();
  
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ForceType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ForceStatus[]>([]);
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
    
    window.addEventListener('resetForceFilters', handleResetFilters);
    
    return () => {
      window.removeEventListener('resetForceFilters', handleResetFilters);
    };
  }, []);

  // Toggle a type filter
  const toggleTypeFilter = (type: ForceType) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    
    // Emit filter change event
    window.dispatchEvent(new CustomEvent('forceFiltersChanged', {
      detail: {
        searchText,
        selectedTypes: newSelectedTypes,
        selectedStatuses
      }
    }));
  };

  // Toggle a status filter
  const toggleStatusFilter = (status: ForceStatus) => {
    const newSelectedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    setSelectedStatuses(newSelectedStatuses);
    
    // Emit filter change event
    window.dispatchEvent(new CustomEvent('forceFiltersChanged', {
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
    window.dispatchEvent(new CustomEvent('forceFiltersChanged', {
      detail: {
        searchText,
        selectedTypes: [],
        selectedStatuses: []
      }
    }));
  };

  // Check if filters are active
  const hasActiveFilters = selectedTypes.length > 0 || selectedStatuses.length > 0;

  const filteredForces = useMemo(() => {
    let filtered = forces;
    
    // Apply text search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(force => 
        force.callsign.toLowerCase().includes(searchLower) || 
        force.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(force => selectedTypes.includes(force.type));
    }
    
    // Apply status filters
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(force => selectedStatuses.includes(force.status));
    }
    
    return filtered;
  }, [forces, searchText, selectedTypes, selectedStatuses]);

  // Emit initial filter state on component mount
  useEffect(() => {
    // Emit filter change event with initial state
    window.dispatchEvent(new CustomEvent('forceFiltersChanged', {
      detail: {
        searchText,
        selectedTypes,
        selectedStatuses
      }
    }));
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="h-full bg-white flex flex-col w-full">
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
        <div className="mt-3 flex gap-2 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search units"
              className="py-2 pl-10 pr-3 w-full border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => {
                const newSearchText = e.target.value;
                setSearchText(newSearchText);
                
                // Emit filter change event
                window.dispatchEvent(new CustomEvent('forceFiltersChanged', {
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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">Filter by Unit Type</h3>
                  <div className="mt-2 space-y-1.5">
                    {['police', 'firefighter'].map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type as ForceType)}
                          onChange={() => toggleTypeFilter(type as ForceType)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                          {type === 'police' ? 'Police' : 'Firefighter'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">Filter by Status</h3>
                  <div className="mt-2 space-y-1.5">
                    {['idle', 'on_road'].map((status) => (
                      <div key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status as ForceStatus)}
                          onChange={() => toggleStatusFilter(status as ForceStatus)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700">
                          {status === 'idle' ? 'Idle' : 'On Road'}
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
            <div className="text-2xl font-bold">{filteredForces.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Police</span>
            <div className="text-2xl font-bold text-blue-600">
              {filteredForces.filter(f => f.type === 'police').length}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Firefighters</span>
            <div className="text-2xl font-bold text-red-600">
              {filteredForces.filter(f => f.type === 'firefighter').length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {filteredForces.map((force) => {
          const ForceIcon = forceTypeConfig[force.type].icon;
          return (
            <div
              key={force.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${selectedForceId === force.id ? 'bg-blue-50' : ''}`}
              onClick={() => selectForce(force.id)}
            >
              <div className="flex items-start gap-3">
                <ForceIcon className={`mt-1 ${forceTypeConfig[force.type].color}`} />
                <div>
                  <h3 className="font-medium">{force.callsign}</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    {forceTypeConfig[force.type].label} • {force.location}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${forceStatusConfig[force.status].color}`}>
                      <FaCircle className={`mr-1 ${force.status === 'idle' ? 'text-gray-500' : 'text-blue-500'}`} size={8} />
                      {forceStatusConfig[force.status].label}
                    </div>
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