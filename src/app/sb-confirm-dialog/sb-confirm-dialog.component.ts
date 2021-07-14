import { Component, OnInit, Inject, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sb-confirm-dialog',
  templateUrl: './sb-confirm-dialog.component.html',
  styleUrls: ['./sb-confirm-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SbConfirmDialogComponent implements OnInit {
  @Output() submitConfirm: EventEmitter<any> = new EventEmitter();
  @Output() cancelConfirm: EventEmitter<any> = new EventEmitter();

  constructor(
    private dialogRef: MatDialogRef<SbConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void { }

  submit() {
    this.submitConfirm.emit(null);
    this.dialogRef.close();
  }

  cancel() {
    this.cancelConfirm.emit(null);
    this.dialogRef.close();
  }
}
