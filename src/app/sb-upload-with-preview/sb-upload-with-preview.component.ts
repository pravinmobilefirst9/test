import { Component, OnInit, OnDestroy, ViewEncapsulation, Input } from '@angular/core';
import { BreadcrumbService } from 'src/app/breadcrumb.service';
import { Message } from 'primeng/primeng';
import { SbAuthenticationService } from '../auth/sb-authentication.service';
import { AppConfig } from '../config/app.config';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SbWidgetContext } from 'src/model/sb-widget-context';
import { SbDataService } from '../../services/sb-data.service';
import { SbHost } from 'src/model/sb-host-enum';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SbDialogComponent } from '../sb-dialog/sb-dialog.component';
import { SbSnackbarComponent } from '../sb-snackbar/sb-snackbar.component';
import {
  ColDef,
  GridApi,
  ColumnApi,
  ValueSetterParams,
  RowNode,
  GridOptions,
  GetMainMenuItemsParams
} from 'ag-grid-community';

@Component({
  selector: 'app-sb-upload-with-preview',
  templateUrl: './sb-upload-with-preview.component.html',
  styleUrls: ['./sb-upload-with-preview.component.scss'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class SbUploadWithPreviewComponent implements OnInit, OnDestroy {

  @Input() context: SbWidgetContext;
  PAGINATION_SIZE = 10;

  destination: String;
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;
  msgs: Message[];
  filetype = '.csv';
  maxFileSize = 10000000;
  contents: any = null;
  filename: string;
  JSONData: any;
  fileUploadResult: any;
  hasError = false;
  columnDefs: any[] = [];
  rowData: any[] = [];
  uploadedFiles: any[] = [];
  preview = true;
  displaySummary = false;
  fileSummary: any;
  isSummary = false;
  isLoading = false;
  remarksOnly = false;
  gridOptions = {};
  rowHeight = 32;
  commaSeparator = null;

  paginationPageSize;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private authenticationService: SbAuthenticationService,
    private messageService: MessageService,
    private appConfig: AppConfig,
    private dataservice: SbDataService,
    private http: HttpClient,
    private location: Location,
    public dialog: MatDialog,
    public _snackBar: MatSnackBar
  ) {
    this.paginationPageSize = this.PAGINATION_SIZE;
  }

  ngOnInit(): void {
    this.gridOptions = Object.assign({}, {
      context: {
        componentParent: this
      },
      getRowHeight: () => {
        return this.rowHeight;
      }
    });
  }

  getRowData(): any[] {
     if (this.remarksOnly) {
        return this.rowData.filter(element => this.hasRemarks(element));
     } else {
       return this.rowData;
     }
  }

  hasRowData(): boolean {
    return this.rowData.length > 0;
  }

  getLabel() {
    return this.preview ? 'Preview' : 'Save';
  }

  onUpload(event) {
    this.isLoading = true;
    this.rowData = [];
    const formData = new FormData();
    const params = new HttpParams().set('save', '' + !this.preview).set('columnSeparator', this.commaSeparator);
    formData.append('file', this.uploadedFiles[0], this.uploadedFiles[0].name);
    const method = this.context.path.httpMethod;
    const url = this.dataservice.getResourceUrl(
      this.context.path,
      SbHost.GatewayBaseUrl
    );
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    this.authenticationService.addTokenToXhr(xhr);
    this.http
      .request(method, url, {body: formData, params})
      .subscribe(
        response => {
          this.isLoading = false;
          this.preview = false;
          this.handleResponse(response);
          this.displaySummary = true;
        },
        err => {
          this.isLoading = false;
          this.preview = true;
          console.log(err);
        }
      );

  }

  private handleResponse(response) {
    if (response) {
      this.isLoading = false;
      this.fileUploadResult = response;
      this.fileSummary = this.fileUploadResult.fileSummary;
      this.isSummary = true;
      // tslint:disable-next-line: max-line-length
      if (this.fileSummary.recordsWithRemarksCount === 0 && this.fileSummary.recordsWithErrorsCount === 0 && this.fileUploadResult.parsingFailed === false) {
        if (!this.preview) {
          this.displaySnackbar('success', 'Success Message', 'File Parsed Successfully');
        } else {
          this.displaySnackbar('success', 'Success Message', 'File Uploaded Successfully');
        }
      // tslint:disable-next-line: max-line-length
      } else if (this.fileSummary.recordsWithRemarksCount === 0 && this.fileSummary.recordsWithErrorsCount === 0 && this.fileUploadResult.parsingFailed === true) {
        this.displaySnackbar('error', 'Error Message', this.fileUploadResult.parseErrorReason);
      } else {
        this.displaySnackbar('warn', 'Warning Message', 'Some Parsing error has occurred');
      }
      if (this.fileUploadResult.rowResults.length > 0 && this.gridColumnApi.getColumn('remarks') === null) {
        this.columnDefs.unshift({
          headerName: 'Remarks',
          field: 'remarks',
          width: 90,
          cellRenderer: (params) => {
            const check = this.checkForRemark(params.value);
            if (!check.hasRemarks.includes(true) && check.comment !== '') {
              return '<div class="warning-remark"><span class="material-icons" style="padding-top:7px;">warning</span></div>';
            } else if (check.hasRemarks.includes(true)) {
              return '<div class="error-remark"><span class="material-icons" style="padding-top:7px;">report</span></div>';
            } else {
              return '<div class="success-remark"><span class="material-icons" style="padding-top:7px;">check_circle</span></div>';
            }
          },
          tooltip: (params) => {
            const data = this.checkForRemark(params.value);
            if (data.hasRemarks.includes('true') || !data.hasRemarks.includes('true')) {
              return data.comment;
            } else {
              return 'No Comments';
            }
          }
        });
      }
      for (let i = 0; i <= this.fileUploadResult.rowResults.length; i++) {
        const row = this.fileUploadResult.rowResults[i];
        if (row) {
          this.rowData.push(row.originalColumnData);
          this.rowData[i].remarks = row.remarks;
        }
      }
    }
  }

  displaySnackbar(severity, summary, detail) {
    this._snackBar.openFromComponent(SbSnackbarComponent, {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      data: {
        severity: severity,
        summary: summary,
        detail: detail
      }
    });
  }

  clear() {
    this.messageService.clear();
  }

  private readFile(file: File) {
    const reader: FileReader = new FileReader();
    reader.onload = async () => {
      this.contents = reader.result;
      await this.parseCsvToJson(this.contents);
    };
    reader.readAsText(file);
    this.filename = file.name;
  }

  parseCsvToJson(csvText) {
    const lines = csvText.split('\n') || [];

    const result = [];
    const headerLine = lines[0];
    this.commaSeparator = this.detectColumnSeparator(headerLine);
    const headers = headerLine.split(this.commaSeparator);
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header !== '') {
        this.columnDefs.push({
          headerName: header,
          field: header,
          tooltip: (params) => {
            const data = this.checkForError(params.value);
            if (data.hasError) {
              return data.comment;
            } else {
              return 'No Comments';
            }
          },
          cellRenderer: (params) => {
            const check = this.checkForError(params.value);
            if (check.hasError) {
              return '<span class=\'remark\'>' + params.value + '</span>';
            } else {
              return params.value;
            }
          }
        });
      }
    }

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      // tslint:disable-next-line: max-line-length
      const delimiter = this.commaSeparator;
      const expression = String.raw`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`;
      const regExp = new RegExp(expression);
      const currentline = lines[i].split(regExp);
      for (let j = 0; j < headers.length; j++) {
        const cell = currentline[j];
        obj[headers[j]] = cell ? cell.replace(/['"]+/g, '') : '';
      }
      // Skip empty lines
      const emptyString = Array.isArray(currentline) && currentline.length === 1 && currentline[0] === '';
      if (!emptyString) {
        result.push(obj);
      }
    }

    this.JSONData = JSON.stringify(result);
    this.rowData = result;
  }

  private detectColumnSeparator(line: string): string {
    const commaSeparatorLength = line.split(',').length;
    const semiColonSeparatorLength = line.split(';').length;
    return commaSeparatorLength > semiColonSeparatorLength ? ',' : ';';
  }

  checkForRemark(cellValue) {
    const hasRemarks = [];
    let comment = '';
    for (let i = 0; i < cellValue.length; i++) {
      const remarks = cellValue[i];
      if (remarks) {
        for (let j = 0; j < remarks.remarks.length; j++) {
          const colRemarks = remarks.remarks[j];
          if (colRemarks) {
            const fullComment = colRemarks.column + ': ' + colRemarks.comment;
            comment += fullComment + '\n';
            hasRemarks.push(colRemarks.error);
          }
        }
      }
    }
    return {
      hasRemarks,
      comment
    };
  }

  checkForError(cellValue) {
    let hasError = false;
    let comment = '';
    if (this.fileUploadResult && this.fileUploadResult.fileSummary.rejectionSummaryByRow) {
      for (let i = 0; i <= this.fileUploadResult.fileSummary.rejectionSummaryByRow.length; i++) {
        const row = this.fileUploadResult.fileSummary.rejectionSummaryByRow[i];
        if (row) {
          for (let j = 0; j <= row.remarks.length; j++) {
            const error = row.remarks[j];
            if (error) {
              if (cellValue === error.invalidValue) {
                hasError = true;
                comment = error.comment;

              }
            }
          }
        }
      }
    }
    return {
      hasError,
      comment
    };
  }

  hasRemarks(element): boolean {
    if (this.fileUploadResult && this.fileUploadResult.fileSummary.rejectionSummaryByRow) {
      for (let i = 0; i <= this.fileUploadResult.fileSummary.rejectionSummaryByRow.length; i++) {
        const row = this.fileUploadResult.fileSummary.rejectionSummaryByRow[i];
        if (row) {
          for (let j = 0; j <= row.remarks.length; j++) {
            const error = row.remarks[j];
            if (error) {
              if (element[error.column] === error.invalidValue) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  onBeforeSend(event) {
    this.authenticationService.addTokenToXhr(event.xhr);
  }

  showFileSummary() {
    this.displaySummary = true;
    if (this.fileSummary) {
      const dialogRef = this.dialog.open(SbDialogComponent, {
        width: 'auto',
        disableClose: true,
        hasBackdrop: true,
        data: { type: 'file-upload', title: 'File Summary', details: this.fileSummary }
      });
    }
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }

  goBack() {
    this.location.back();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  checkForCsvFile(files) {
    if (!files[0].name.endsWith('.csv')) {
      this.displaySnackbar('warn', 'Warning Message', 'Please upload csv file');
    } else {
      this.prepareFilesList(files);
      this.readFile(files[0]);
    }
  }

  // on file drop handler
  onFileDropped(files) {
    this.checkForCsvFile(files);
  }

  // handle file from browsing
  fileBrowseHandler(files) {
   this.checkForCsvFile(files);
  }

  // Delete file from files list
  deleteFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    this.columnDefs = [];
    this.rowData = [];
    this.preview = true;
  }

  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.uploadedFiles.push(item);
    }
  }

  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
