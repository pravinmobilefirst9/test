import { SbLayout } from './sb-layout';

export interface PanelLayout extends SbLayout {
  // These two are mutually exclusive
  panelLayouts?: PanelLayout[];
  panelId?: string;
  tabbedPanels?: TabbedPanel[];
}

export interface TabbedPanel {
  panelId: string;
  tabHeader: string;
}
