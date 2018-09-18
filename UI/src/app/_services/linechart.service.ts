import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config} from '../_models/index';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LinechartService {

  private subject = new Subject<any>(); // for chart data

  private srcData: any;
  private cats: any;
  private labels: any;
  private units: any;

  constructor(private http: HttpClient) { }


  setCategory(cats, labels, units){
    this.cats = cats;
    this.labels = labels;
    this.units = units;
  }

  updateChart(request){
    let headers = new HttpHeaders();
    headers = headers.append('Content-type', 'application/json');
    let body = JSON.stringify(request);
    this.subject.next({status: 'loading'});
    return this.http.post<any>(Config.API_URL + 'api/getLineChartData', body, { headers })
  }


  getChartData():Observable<any>{
    return this.subject.asObservable();
  }

  
  loadChart(res: any){
    if(res.success){
      this.srcData = res.chartData;
      this.subject.next({srcData: this.srcData, cats: this.cats, labels: this.labels, units: this.units, totalData: res.totalData, period: res.period});
    }else{
      this.subject.next({
        success: false
      })
    }
  }


}
