import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { routing } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertComponent } from './_directives';
import { AuthGuard } from './_guard';
import { AlertService, AuthenticationService, DashboardService } from './_services';
import { NavbarComponent } from './navbar/navbar.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ChangepasswordComponent } from './login/changepassword/changepassword.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { MultiSeriesComponent } from './multi-series/multi-series.component';
import {NgxDateRangePickerModule, NgxMenuItem} from 'ngx-daterangepicker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { LinechartService } from './_services/linechart.service';
import { BarchartService } from './_services/barchart.service';
import { CategoryService } from './_services/category.service';
import { AutocompleteComponent } from './_directives/autocomplete/autocomplete.component';
import { TBarChartComponent } from './hbarchart/hbarchart.component';
import { MultiSeriesHighchartComponent } from './multi-series-highchart/multi-series-highchart.component';
import { ChartModule } from 'angular-highcharts';
import { VbarChartComponent } from './vbar-chart/vbar-chart.component';
import { VBarChartService } from './_services/v-bar-chart.service';
import { TimestampPipe } from './_pipes/timestamp.pipe';
import { SuperAdminComponent } from './super-admin/super-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    AlertComponent,
    NavbarComponent,
    ChangepasswordComponent,
    EmployeeDetailComponent,
    MultiSeriesComponent,
    BarChartComponent,
    AutocompleteComponent,
    TBarChartComponent,
    MultiSeriesHighchartComponent,
    VbarChartComponent,
    TimestampPipe,
    SuperAdminComponent
  ],
  imports: [
    NgxDateRangePickerModule,
    BrowserModule,
    routing,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxDaterangepickerMd,
    ChartModule
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    DashboardService,
    BsModalService,
    LinechartService,
    BarchartService,
    CategoryService,
    VBarChartService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
