import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreadcrumbService } from 'src/app/breadcrumb.service';
import { Message } from 'primeng/primeng';
import { SbAuthenticationService } from '../../auth/sb-authentication.service';
import {AppConfig} from "../../config/app.config";

@Component({
  selector: 'app-file-upload-component',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  destination: String;

  msgs: Message[];

  uploadedFiles: any[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private authenticationService: SbAuthenticationService,
    private appConfig: AppConfig
  ) {
    this.destination = `${appConfig.gatewayBaseUrl}/csv`;
    this.breadcrumbService.setItems([
      { label: 'Portfolio' },
      { label: 'File Upload' }
    ]);
  }

  ngOnInit() { }

  onUpload(event) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  onBeforeSend(event) {
    this.authenticationService.addTokenToXhr(event.xhr);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }

  onError(event) { }
}
