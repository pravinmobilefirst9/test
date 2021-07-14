import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SbDialogComponent } from '../sb-dialog/sb-dialog.component';

@Component({
  selector: 'app-connection-sb-overlay',
  template: ``
})
export class SbConnectionOverlayComponent implements OnInit {

  constructor(public dialog: MatDialog)  {
  }

  close() {
  }

  cancel() {
  }

  ngOnInit() {
    const dialogRef = this.dialog.open(SbDialogComponent, {
      width: 'auto',
      disableClose: true,
      hasBackdrop: true,
      data: {
        type: 'overlay',
        title: 'Oh, snap!',
        details: 'The server cannot be reached. Please check your network connection and VPN-settings.'
      }
    });
  }

}
