import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { MatDialog } from '@angular/material/dialog';
import { SbDialogComponent } from '../sb-dialog/sb-dialog.component';

@Component({
  selector: 'app-idle-sb-overlay',
  template: ``
})
export class SbIdleOverlayComponent implements OnInit, OnDestroy {

  constructor(private idleService: UserIdleService, public dialog: MatDialog)  {
  }

  close() {
    this.idleService.stopTimer();
  }

  cancel() {
    this.idleService.stopTimer();
  }

  ngOnInit() {
    const dialogRef = this.dialog.open(SbDialogComponent, {
      width: 'auto',
      disableClose: true,
      hasBackdrop: true,
      data: {
        type: 'overlay',
        title: 'Session Timeout Warning',
        details: 'Due to inactivity, your current work session is about to expire. For your security this session will automatically expire unless you click anywhere to continue.'
      }
    });
  }

  ngOnDestroy() {

    console.log('Stopping idle service timer...');
    this.idleService.stopTimer();
  }


}
