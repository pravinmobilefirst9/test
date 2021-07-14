import { SbWidgetLayout } from './sb-widget-layout';
export interface SbPanel {
  panelId: string;
  headerText?: string;
  subHeaderText?: string;
  hidePanelHeader?: boolean;
  divider?: boolean;
  enablePrinting?: boolean;
  widgetIds: Array<string>;
  widgetLayouts: Array<SbWidgetLayout>;
  disableCollapseBelowBreakpoint?: boolean;
  isStandaloneForm: boolean;
}
