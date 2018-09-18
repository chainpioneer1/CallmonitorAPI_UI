import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';

import { AlertService, AuthenticationService } from '../_services';
import { Config } from '../_models';
import { Global } from '../_global/global';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
    
    loading = false;
    returnUrl: string;
    state: string;
    alert: string;
    
    loginForm : FormGroup;
    submitted =  false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.state = this.route.snapshot.queryParams['state'];
        
        this.loginForm = this.formBuilder.group({
            // email: ['', [Validators.required, Validators.email]],
            email: ['', [Validators.required]],
            password:  ['', [Validators.required]]
        })
    }

    get f() {return this.loginForm.controls;}

    login(formVal: any) {
        this.submitted = true;
        
        if(this.loginForm.invalid){
            return; 
        }
        
        this.loading = true;
        this.authenticationService.login(formVal)
            .subscribe(
                data => {
                    console.log('form value ---------', formVal);
                    if(data.success === true){
                        localStorage.setItem("currentUser", JSON.stringify(data.user));
                        localStorage.setItem("isAdmin", data.isAdmin);
                        this.alertService.success("Login success");
                        // setTimeout(Global.sleep(2000), 0);
                        if(data.isAdmin){
                            this.returnUrl = '/super-admin';
                        }
                        this.router.navigate([this.returnUrl]);
                    }else{
                        this.alertService.error(data.message);
                        this.loading = false;
                    }
                },
                error => {
                    this.alertService.error("Server is not running. Please check status of server.");
                    this.loading = false;
                });
    }

    
    logout() {
        this.authenticationService.logout();
        this.router.navigate(['login']);
    }

}
