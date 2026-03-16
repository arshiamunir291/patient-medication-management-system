import { Injectable } from '@angular/core';
import { timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  saveDraft(key:string,data:unknown){
    const draft={data,timestamp:new Date().toISOString()};
    localStorage.setItem(key,JSON.stringify(draft));
  }
  getDraft(key:string){
    const draft=localStorage.getItem(key);
    if(!draft){
      return null;
    }
    return JSON.parse(draft);
  }
  clearDraft(key:string){
    localStorage.removeItem(key);
  }
}
