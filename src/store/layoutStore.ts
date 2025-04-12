import { create } from 'zustand';

interface LayoutStore {
  isIncidentPanelCollapsed: boolean;
  toggleIncidentPanel: () => void;
}

export const useLayoutStore = create<LayoutStore>()((set) => ({
  isIncidentPanelCollapsed: false,
  toggleIncidentPanel: () => set((state) => ({ isIncidentPanelCollapsed: !state.isIncidentPanelCollapsed })),
})); 