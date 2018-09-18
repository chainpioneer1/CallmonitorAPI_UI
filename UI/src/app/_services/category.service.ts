import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private subject = new Subject<any>();

  constructor() { }

  setCategory(cat){
    
    this.subject.next(cat);
  }

  getCategory(): Observable<any>{
    return this.subject.asObservable();
  }
}
