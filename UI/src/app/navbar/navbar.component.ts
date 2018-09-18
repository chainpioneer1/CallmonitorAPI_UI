import { Component, OnInit, TemplateRef, Input} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {AuthenticationService, AlertService, DashboardService} from '../_services';
import { Global } from '../_global/global';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Input() isSearchShow;
  public modalRef: BsModalRef;
  addNewUserForm: FormGroup;
  submitted = false;

  // pwd form
  pwdForm: FormGroup;
  pwdSubmitted = false;

  // change emial form
  emailForm: FormGroup;
  emailSubmitted = false;
  
  currentUser;
  searchItemName;
  searchItemId;
  searchItem: any;

  searchUserList;
  isShowUserList=false;
 
  constructor(private modalService: BsModalService, 
    private authenticationService: AuthenticationService,
    private router: Router,
    private alertService: AlertService,
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.addNewUserForm = this.formBuilder.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      password: ['']
    });

    this.pwdForm = this.formBuilder.group({
    //  curPassword: ['', Validators.required],
      new_password: ['', Validators.required],
      cur_password: ['', Validators.required]
    });

    this.emailForm = this.formBuilder.group({
      new_email: ['', Validators.required],
      cur_email: ['', Validators.required]
    });

    this.dashboardService.getUserList(this.currentUser.id).subscribe(res=>{
      if(res.success){
        this.searchUserList = res.data;
      }
    })

  }

  get f(){
    return this.addNewUserForm.controls;
  }

  get pwd(){
    return this.pwdForm.controls;
  }

  get emailf(){
    return this.emailForm.controls;
  }


  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template); // {3}
  }


  // submit form
  onSubmit(formVal: any){
    this.submitted = true;
    if(this.addNewUserForm.invalid){
      return;
    }
    formVal.id = Global.getCurrentUser().id;

    this.authenticationService.createEmployee(formVal).subscribe(
      data=>{
        if(data.success){
            location.reload();

        }else{
          this.alertService.error(data.message);
        }
      }
    )
  }

  // logout
  logout(){
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }

  onSearch(){
    
    this.dashboardService.onSearch(this.searchItem);
  }

  // on select user
  onSelectUser(event, user){
    event.stopPropagation();
    this.searchItemId=user.id;
    this.searchItemName=user.username;
    this.searchItem = user;
    this.isShowUserList=false;
  }


  // password change modal submit
  onPwdSubmit(){
    this.pwdSubmitted = true;
    if(this.pwdForm.invalid){
      return;
    }

    // if(this.mainForm.value.new_password !== this.mainForm.value.confirm_password){
    //   this.alertService.error("New password mismatch!");
    //   return;
    // }
    let parent = this;
    this.authenticationService.changePassword(this.pwdForm.value, this.currentUser.username)
    .subscribe(res=>{
      if(res.success){
        this.alertService.success(res.message);
        setTimeout(function(){
          parent.modalService.hide(1);
        }, 1000);
      }else{
        this.alertService.error(res.message);
      }
    })
  }

  // change email submit
  onEmailSubmit(){
    this.emailSubmitted = true;
    if(this.emailForm.invalid){
      return;
    }
    let parent = this;
    this.authenticationService.changeEmail(this.emailForm.value, this.currentUser.id)
    .subscribe(res=>{
      if(res.success){
        
        this.alertService.success(res.message);
        setTimeout(function(){
          parent.modalService.hide(1);
          parent.authenticationService.logout();
          parent.router.navigate(['login']);
        }, 1000);
      }else{
        this.alertService.error(res.message);
      }
    })
  }
}