import { create } from 'zustand';

// Define panel types
export type SidePanelType = 'incidents' | 'forces';

interface LayoutStore {
  isIncidentPanelCollapsed: boolean;
  activeSidePanel: SidePanelType;
  toggleIncidentPanel: () => void;
  switchSidePanel: (panel: SidePanelType) => void;
}

export const useLayoutStore = create<LayoutStore>()((set) => ({
  isIncidentPanelCollapsed: false,
  activeSidePanel: 'incidents',
  toggleIncidentPanel: () => set((state) => ({ isIncidentPanelCollapsed: !state.isIncidentPanelCollapsed })),
  switchSidePanel: (panel) => set({ activeSidePanel: panel }),
})); 