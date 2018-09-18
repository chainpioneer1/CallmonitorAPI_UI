import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class BaseService{
public headers;
public baseUrl;

constructor(){
    let headers = new HttpHeaders();
    this.headers = headers.append('Content-type', 'application/json');
    this.baseUrl="http://52.14.148.96:3000/"; //server
    //this.baseUrl = "192.168.2.117:3000"; // local
}

}