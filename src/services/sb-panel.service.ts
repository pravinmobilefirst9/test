import { SbLayoutConfigurationService } from './sb-layout-configuration.service';
import { SbMultiSelectComponent } from './../app/widgets/sb-multi-select/sb-multi-select.component';
import { SbTablePieComponent } from './../app/widgets/sb-table-pie/sb-table-pie.component';
import { SbKeyFigureAdvancedComponent } from './../app/widgets/sb-key-figure-advanced/sb-key-figure-advanced.component';
import { SbGaugeComponent } from './../app/widgets/sb-gauge/sb-gauge.component';
import { SbPiechartComponent } from './../app/widgets/sb-piechart/sb-piechart.component';
import { SbLinechartComponent } from './../app/widgets/sb-linechart/sb-linechart.component';
import { Injectable, Type } from '@angular/core';
import { SbPanel } from 'src/model/sb-panel';
import { SbWidgetType } from 'src/model/sb-widget-type.enum';
import { KeyFigureBasicComponent } from 'src/app/widgets/key-figure-basic/key-figure-basic.component';
import { SbColoredIconBoxComponent } from 'src/app/widgets/sb-colored-icon-box/sb-colored-icon-box.component';
import { SbAgTableComponent } from 'src/app/widgets/sb-ag-table/sb-ag-table.component';
import { SbFormWidgetComponent } from 'src/app/widgets/sb-form-widget/sb-form-widget.component';
import { SbUploadWithPreviewComponent } from '../app/sb-upload-with-preview/sb-upload-with-preview.component';

@Injectable({
  providedIn: 'root'
})
export class SbPanelService {

  panelTypeToComponent = new Map<SbWidgetType, Type<any>>([
    [SbWidgetType.KeyFigureBasic, KeyFigureBasicComponent],
    [SbWidgetType.LineChart, SbLinechartComponent],
    [SbWidgetType.PieChart, SbPiechartComponent],
    [SbWidgetType.Gauge, SbGaugeComponent],
    [SbWidgetType.ColoredIconBox, SbColoredIconBoxComponent],
    [SbWidgetType.AgDataTable, SbAgTableComponent],
    [SbWidgetType.KeyFigureAdvanced, SbKeyFigureAdvancedComponent],
    [SbWidgetType.MultiSelect, SbMultiSelectComponent],
    [SbWidgetType.PieChartTable, SbTablePieComponent],
    [SbWidgetType.FormWidget, SbFormWidgetComponent],
    [SbWidgetType.FileUpload, SbUploadWithPreviewComponent]
  ]);
  panelMap: Map<string, SbPanel> = new Map<string, SbPanel>();
  panelsLoaded = false;

  constructor(
    private layoutConfigurationService: SbLayoutConfigurationService
  ) { }

  async getAPanel(panelId: string): Promise<SbPanel> {
    if (!this.panelsLoaded) {
      // Todo - Why is this called multiple times?
      await this.loadPanels();
    }
    return this.panelMap.get(panelId);
  }

  async loadPanels() {
    await this.layoutConfigurationService
      .getPanels()
      .toPromise()
      .then(
        res => {
          const panelMap = new Map<string, SbPanel>(
            res.map(p => [p.panelId, p] as [string, SbPanel])
          );
          this.panelMap = panelMap;
          this.panelsLoaded = true;
        },
        err => {
          console.log('Could not load panels: ' + err);
        }
      );
  }

  resolveComponent(panelType: SbWidgetType): Type<any> {
    return this.panelTypeToComponent.get(panelType);
  }

  clear() {
    if (this.panelsLoaded) {
      this.panelMap = new Map<string, SbPanel>();
      this.panelsLoaded = false;
    }
  }
}
