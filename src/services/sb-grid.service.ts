import { Injectable } from '@angular/core';
import { SbGrid } from 'src/model/sb-grid';
import { SbLayoutConfigurationService } from './sb-layout-configuration.service';

@Injectable({
  providedIn: 'root'
})
export class SbGridService {

  gridsLoaded = false;
  grids = new Map<string, SbGrid>();
  constructor(
    private layoutConfigurationService: SbLayoutConfigurationService
  ) { }

  async getGrid(id: string): Promise<SbGrid> {
    if (!this.gridsLoaded) {
      await this.loadGrids();
    }
    const grid = this.grids.get(id);
    if (grid) {
      return grid;
    }
    throw new Error('Grid not found for this user!');
  }

  async loadGrids() {
    await this.layoutConfigurationService
      .getGrids()
      .toPromise()
      .then(
        res => {
          const gridMap = new Map<string, SbGrid>(
            res.map(g => [g.gridPath, g] as [string, SbGrid])
          );
          this.grids = gridMap;
          this.gridsLoaded = true;
        },
        err => {
          console.log('Could not load grids: ' + err);
        }
      );
  }

  clear() {
    if (this.gridsLoaded) {
      this.grids = new Map<string, SbGrid>();
      this.gridsLoaded = false;
    }
  }
}
