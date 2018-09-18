import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, AlertService } from '../../_services';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;
  currentUser;
  constructor(private formBuilder: FormBuilder, 
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.mainForm = this.formBuilder.group({
      current_password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });
  }

  get f(){
    return this.mainForm.controls;
  }

  onSubmit(){
    this.submitted = true;
    if(this.mainForm.invalid){
      return;
    }

    // if(this.mainForm.value.new_password !== this.mainForm.value.confirm_password){
    //   this.alertService.error("New password mismatch!");
    //   return;
    // }
    
    this.authenticationService.changePassword(this.mainForm.value, this.currentUser.username)
    .subscribe(res=>{
      if(res.success){
        this.alertService.success("Password is changed successfully.");
      }else{
        this.alertService.error(res.message);
      }
    })
    
  }

  onCancel(){
    history.back();
  }

}
