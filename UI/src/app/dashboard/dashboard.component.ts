import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../_services';
import { Router } from '@angular/router';
import { async } from 'rxjs/internal/scheduler/async';
import {FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Loading............
  detailedEmployeeList = [];
  isLoading = true;
  currentUser;
  fromDate;
  toDate;

  constructor(private _dashboardService: DashboardService, 
    private router: Router) {

     }

  ngOnInit() {
   
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getEmployeeList();
  }

  getEmployeeList(){
      this.isLoading = true;
      this._dashboardService.getEmployeeList(this.currentUser.id).subscribe(async res=>{
        if(res.success){
          
          this.detailedEmployeeList = res.data;
          if(this.detailedEmployeeList.length > 0){
              await this.detailedEmployeeList.forEach(async (element, index)=>{
                  await this.getEmployeeDetails(element.id);
              });
          }

          this.isLoading = false;
        }else{
          this.isLoading = false;
        }
      })
  }

// get employee detail
getEmployeeDetails(empid){
    var request = {employeeId: empid, fromDate: this.fromDate, toDate: this.toDate};
    this._dashboardService.getEmployeeDetails(request).subscribe(res=>{
      if(res.success && res.data){
        var index = this.detailedEmployeeList.findIndex((emp)=>{
          return emp.id === empid;
        });
        if(index > -1){
          // if(res.data.incomingCalls.count + res.data.outcalls.count+res.data.missedCalls.count){
          //   res.data.missedCalls.percent = res.data.missedCalls.count/(res.data.incomingCalls.count + res.data.outcalls.count+res.data.missedCalls.count)*100;
          // }
          this.detailedEmployeeList[index] = Object.assign(this.detailedEmployeeList[index], res.data);
        }
      }
    })
}

// search
onDateChange = async()=>{
  this.getEmployeeList();
  // this.isLoading = true;
  // await(this.detailedEmployeeList.forEach(async(element, index)=>{
  //   await this.getEmployeeDetails(element.id);
  // }));
  // this.isLoading = false;
}

onDeactive(id){
  this._dashboardService.deactive(id)
  .subscribe(res=>{
    if(res.success){
      location.reload();
    }
  })
}

// delete employee
onDelete(id){
  this._dashboardService.delete(id)
  .subscribe(res=>{
    if(res.success){
     location.reload();
    }
  })
}

// go to detail page
goToDetail(emp){
  localStorage.setItem('cur_employee', JSON.stringify(emp));
  this.router.navigate(['employee-detail']);
}

}
