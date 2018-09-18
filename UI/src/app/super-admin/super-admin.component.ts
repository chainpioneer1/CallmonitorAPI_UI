import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../_services';
import { Global } from '../_global/global';

@Component({
  selector: 'app-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.css']
})
export class SuperAdminComponent implements OnInit {
  isLoading = false; // loading : true
  employerList: any;
  constructor(private dashboardservice: DashboardService) { }

  ngOnInit() {
    this.isLoading = true;
    this.dashboardservice.getEmployerList().subscribe( res => {
      console.log('------- super admin ---', res);
      if(res.success){
        this.isLoading = false;
        this.employerList = res.data;
      }
    })
  }

  // add seat
  addSeat(id){
    this.dashboardservice.addSeat(id).subscribe(res=>{
      if(res.success){
        location.reload();
      }
    })
  }
  
  // delete seat
  deleteSeat(id){
    this.dashboardservice.delSeat(id).subscribe(res=>{
      if(res.success){
        location.reload();
      }
    })
  }

  // deactivate
  deactivate(id){
    this.dashboardservice.deactivate(id).subscribe(res=>{
      if(res.success){
        location.reload();
      }
    })
  }

  // delete
  delete(id){
    
  }
}
