import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sb-snackbar',
  templateUrl: './sb-snackbar.component.html',
  styleUrls: ['./sb-snackbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SbSnackbarComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
  public snackBarRef: MatSnackBarRef<SbSnackbarComponent>) { }

  ngOnInit(): void {
  }

  getMessageIconsAndColor() {
    if (this.data.severity === 'error') {
      return { color: 'error-msg', icon: 'error_outline'};
    } else if (this.data.severity === 'success') {
      return { color: 'success-msg', icon: 'check_circle_outline'};
    } else if (this.data.severity === 'warn') {
      return { color: 'warn-msg', icon: 'report_problem'};
    }
  }

}
