import { Injectable } from '@angular/core';
import { Observable, Subject , BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SbPrintService {
  private PrintStatus  = new BehaviorSubject(false);
  private EnablePrinting  = new BehaviorSubject(false);
  private SbPrintFormData  = new BehaviorSubject('');
  IsPrinting = this.PrintStatus.asObservable();
  IsEnabledPrinting = this.EnablePrinting.asObservable();
  PrintFormData = this.SbPrintFormData.asObservable();
  
  constructor() { }

  changePrintStatus(status: boolean) {
    this.PrintStatus.next(status)
  }

  checkPrintingEnables(printingEnabled: boolean) {
    this.EnablePrinting.next(printingEnabled)
  }

  changeSbPrintFormData(formData: string) {
    this.SbPrintFormData.next(formData);
  }
}
