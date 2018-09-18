import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config} from '../_models/index';
import { Observable } from 'rxjs';


@Injectable()
export class AuthenticationService {
    constructor(private http: HttpClient) { }
   
    // validate email
    validateEmail(email:string) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // service for login
    login(req) {
        // return this.http.post<any>(Config.API_URL + 'api/login', { email: email, password: password });
        let headers = new HttpHeaders();
        headers = headers.append('Content-type', 'application/json');
        let body = JSON.stringify(req);
        return this.http.post<any>(Config.API_URL + 'api/login', body, { headers });
    }

    // add employee
    createEmployee(req){
        let headers = new HttpHeaders();
        headers = headers.append('content-type', 'application/json');
        let body = JSON.stringify(req);
        return this.http.post<any>(Config.API_URL + 'api/create_employee', body, { headers });
    }

    // service for register
    register(model: any[]){
        return this.http.post<any>(Config.API_URL + 'api/register', model);
    }

    // email verify for register
    emailVerify(email:string, token:string){
        return this.http.post<any>(Config.API_URL + 'api/emailConfirm', {email:email, token:token});
    }

    // service for logout
    logout() {
        // remove user from local storage to log user out
        localStorage.clear();
    }

    // service for profile
    profile(profile: any){
        return this.http.post<any>(Config.API_URL + 'api/profile', profile);
    }

   
    // service for forgot
    forgot(email: string){
        let replyUrl = Config.BASE_URL+'/recovery';
       return this.http.post<any>(Config.API_URL + 'api/forgotPassword', {email: email, callBack:replyUrl});
    }

    // recovery password
    recovery(email: string, token: string, password:string){
        return this.http.post<any>(Config.API_URL + 'api/recovery', {'email':email,'token':token,'password': password});
    }

    // change password
    changePassword(formVal: any, username){
        let headers = new HttpHeaders();
        headers = headers.append('Content-type', 'application/json');
        let body = JSON.stringify({new_password: formVal.new_password, cur_password: formVal.cur_password, username: username});
        return this.http.post<any>(Config.API_URL + 'api/changePassword', body, {headers});
    }

    // change email
    changeEmail(formVal: any, userId){
        let headers = new HttpHeaders();
        headers = headers.append('Content-type', 'application/json');
        let body = JSON.stringify({new_email: formVal.new_email, cur_email: formVal.cur_email, userID: userId});
        return this.http.post<any>(Config.API_URL + 'api/changeEmail', body, {headers});
    }

}