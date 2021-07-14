import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-sb-dialog',
  templateUrl: './sb-dialog.component.html',
  styleUrls: ['./sb-dialog.component.scss']
})
export class SbDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SbDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
