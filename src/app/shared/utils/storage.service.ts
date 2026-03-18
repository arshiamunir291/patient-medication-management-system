import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
//service to handle saving,retrieving,and clear drafts from local storage
export class StorageService {
  //save draft in local storage
  saveDraft(key:string,data:unknown){
    const draft={data,timestamp:new Date().toISOString()};
    localStorage.setItem(key,JSON.stringify(draft));
  }
  //get draft from local storage
  getDraft(key:string){
    const draft=localStorage.getItem(key);
    if(!draft){
      return null;
    }
    return JSON.parse(draft);
  }
  // clear local storage
  clearDraft(key:string){
    localStorage.removeItem(key);
  }
}
