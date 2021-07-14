import { Injectable } from '@angular/core';
import { SbAuthenticationService } from 'src/app/auth/sb-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SbStorageService {

  constructor(private authenticationService: SbAuthenticationService) { }

  public localSet(componentName: string, variableName: string, value: any) {
    const storageKey = this.getStorageKey(componentName, variableName);
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  public localGet(componentName: string, variableName: string) {
    const storageKey = this.getStorageKey(componentName, variableName);
    return JSON.parse(localStorage.getItem(storageKey));
  }

  public sessionSet(componentName: string, variableName: string, value: any) {
    const storageKey = this.getStorageKey(componentName, variableName);
    sessionStorage.setItem(storageKey, JSON.stringify(value));
  }

  public sessionGet(componentName: string, variableName: string) {
    const storageKey = this.getStorageKey(componentName, variableName);
    return JSON.parse(sessionStorage.getItem(storageKey));
  }
  // used if we want to restore the application state to default.
  public clear() {
    localStorage.clear();
    sessionStorage.clear();
  }

  public localRemove(componentName: string, variableName: string) {
    const storageKey = this.getStorageKey(componentName, variableName);
    localStorage.removeItem(storageKey);
  }

  public sessionRemove(componentName: string, variableName: string) {
    const storageKey = this.getStorageKey(componentName, variableName);
    sessionStorage.removeItem(storageKey);
  }

  getStorageKey(componentName: string, variableName: string): string {
    const userId = this.authenticationService.getUserName();
    return `${userId}:${componentName}:${variableName}`;
  }
}
