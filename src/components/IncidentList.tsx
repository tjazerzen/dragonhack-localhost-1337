import { useIncidentStore } from '@/store/incidentStore';
import { IncidentStatus } from '@/types/incidents';
import { FaExclamationCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';

const statusConfig: Record<IncidentStatus, { color: string; icon: IconType }> = {
  critical: { color: 'bg-red-100 text-red-600', icon: FaExclamationCircle },
  moderate: { color: 'bg-orange-100 text-orange-600', icon: FaExclamationTriangle },
  resolved: { color: 'bg-green-100 text-green-600', icon: FaCheckCircle },
};

export default function IncidentList() {
  const incidents = useIncidentStore((state) => state.incidents);

  return (
    <div className="h-full bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Incidents</h2>
        <div className="flex justify-between mt-4">
          <div>
            <span className="text-gray-600">Total</span>
            <div className="text-2xl font-bold">{incidents.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Critical</span>
            <div className="text-2xl font-bold text-red-600">
              {incidents.filter(i => i.status === 'critical').length}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Resolved</span>
            <div className="text-2xl font-bold text-green-600">
              {incidents.filter(i => i.status === 'resolved').length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-130px)]">
        {incidents.map((incident) => {
          const StatusIcon = statusConfig[incident.status].icon;
          return (
            <div
              key={incident.id}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
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