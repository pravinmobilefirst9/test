import { Component, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sb-logout-confirm-dialog',
    templateUrl: 'sb-logout-confirm-dialog.component.html',
    encapsulation: ViewEncapsulation.None
})
export class SbLogoutConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<SbLogoutConfirmDialogComponent>,
        private router: Router,
        public dialog: MatDialog
    ) { }

    confirmLogout() {
        this.router.navigate(['logout']);
        this.dialogRef.close();
    }
    cancelLogout() {
        this.dialogRef.close();
    }
}
