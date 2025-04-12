import { FaChevronRight } from 'react-icons/fa';
import { useLayoutStore } from '@/store/layoutStore';

export default function CollapsedPanel() {
  const toggleIncidentPanel = useLayoutStore((state) => state.toggleIncidentPanel);
  
  return (
    <div className="h-full flex flex-col items-center bg-white border-r w-10">
      <button
        className="mt-4 p-2 hover:bg-gray-100 rounded-full"
        onClick={toggleIncidentPanel}
        title="Expand emergencies panel"
      >
        <FaChevronRight className="text-gray-500" />
      </button>
      <div className="mt-8 -rotate-90 whitespace-nowrap text-gray-600 font-medium">
        Emergencies
      </div>
    </div>
  );
} 