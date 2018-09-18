import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config} from '../_models/index';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BarchartService {
  private subject = new Subject<any>();
  srcData: any;
  cat: any;
  units: any;

  constructor(private http: HttpClient) { }

  // getBarChartData
  updateChartData(request){
    let headers = new HttpHeaders();
    headers = headers.append('Content-type', 'application/json');
    let body = JSON.stringify(request);
    this.subject.next({status: 'loading'});
    return this.http.post<any>(Config.API_URL + 'api/getBarChartData', body, { headers });
    
  }

  // load chart
  loadChart():Observable<any>{
    return this.subject.asObservable();
  }

  // set category
  setCategory(cat: any){
    this.cat = cat;
  }

  setChartData(res: any){
    if(res.success){
      this.srcData = res.chartDataOfDay;
      this.subject.next({success: res.success, srcData: this.srcData, units: this.units, cat: this.cat});
    }else{
      this.subject.next({
        success: false
      })
    }
  }
  
}
