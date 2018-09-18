import { NgModule } from '@angular/core';
import {RouterModule, Routes, Router} from '@angular/router';

import { AuthGuard } from './_guard';
import { LoginComponent } from './login';
import { DashboardComponent } from './dashboard';
import { RegisterComponent } from './register';
import { ChangepasswordComponent } from './login/changepassword/changepassword.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';


const routes: Routes = [
  {path: '', component: DashboardComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
  {path: 'login', component: LoginComponent, runGuardsAndResolvers: 'always'},
  {path: 'register', component: RegisterComponent, runGuardsAndResolvers: 'always'},
  {path: 'logout', component: LoginComponent, runGuardsAndResolvers: 'always'},
  {path: 'change-password', component: ChangepasswordComponent, runGuardsAndResolvers: 'always'},
  {path: 'employee-detail', component: EmployeeDetailComponent, runGuardsAndResolvers: 'always'},
  {path: 'super-admin', component: SuperAdminComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},

  {path: '**', redirectTo: ''}
];

// @NgModule({
//   imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
//   exports: [RouterModule]
// })


// export class AppRoutingModule { }

export const routing = RouterModule.forRoot(routes);