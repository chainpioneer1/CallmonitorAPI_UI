import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../_services';
import { Router, ActivatedRoute } from '@angular/router';

import * as CanvasJS from '../../../node_modules/canvasjs/dist/canvasjs.min';
import { NgxDateRangePickerOptions, NgxMenuItem } from 'ngx-daterangepicker';
import * as moment from 'moment';
import * as $ from 'jquery';

import { LinechartService } from '../_services/linechart.service';
import { BarchartService } from '../_services/barchart.service';
import { CategoryService } from '../_services/category.service';
import { Global } from '../_global/global';
import { VBarChartService } from '../_services/v-bar-chart.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})

export class EmployeeDetailComponent implements OnInit {

  isLoading = true;

  fromDate;
  toDate;
  isCallHistoryLoading = false;
  isCallHistoryLoadmoreLoading = false;
  iscallHistoryEnd = false;

  isSocialLoading = false;
  isSocialLoadmoreLoading = false;
  isSocialEnd = false;

  // audio
  audioSrc = "";
  audioType = "";
  currentPlayingIndex = -1;
  isPaused = false;

  playAudio: any;

  // employee
  employee;
  callHistoryList: any;
  socialHistoryList: any;

  nCurCall = 0;
  nCurSocial = 0;


  // search variable
  callFromDate;
  callToDate;
  curTitleDate;

  nCallFromDate = 0;
  nCallToDate = 0;

  callHistoryDateList = [];

  // return callers
  returnCallers = 1;

  // social search variable
  socialFromDate;
  socialToDate;
  subType = 1;
  type = "averageDurations";
  period = 1;
  special_period=14;


  // top blocks
  firstItem: any;
  secondItem: any;
  thirdItem: any;
  forthItem: any;
  ItemColors = Global._linechartcolors;

  // line chart variables
  lineChartData: any;
  curLineChartPeriod;

  // bar chart type
  barcharttype = 'day';
  categoryOfBarChart: any;
  
  hourlyChartData: any;
  dailyChartData: any;

  // period list for multi series chart
  periodList; any;
  dropdowns = [
    { id: "outCalls", label: "Outgoing", unit: "" },
    { id: "incomingCalls", label: "Incoming Calls", unit: "" },
    { id: "missedCalls", label: "Missed Calls", unit: "" },
    { id: "missedCallPercent", label: "Missed calls percentage", unit: "%" },
    { id: "newCalls", label: "New callers", unit: "" },
    { id: "newCallPercent", label: "New callers percentage", unit: "%" },
    { id: "incomingCallSum", label: "Incoming call duration", unit: "s" },
    { id: "outCallSum", label: "Outgoing call duration", unit: "s" },
    // {id: "newcall_number", label: "Number of new calls"},
    { id: "incomingCallAvg", label: "Average Incoming Call Duration", unit:"s" },
    { id: "outCallAvg", label: "Average Outgoing Call Duration", unit: "s" },
    { id: "callbackDelay", label: "Callback delay", unit: "s" }
  ]

  options: NgxDateRangePickerOptions; // date range option
  dateRange;
  rangeOption: any;

  flagForLegentItemChange = false;

  contact_photo_root_path = "callmonitor.app/files/contact-photos/";

  constructor(private _dashboardService: DashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private linechartservice: LinechartService,
    private barchartservice: BarchartService,
    private categoryService: CategoryService,
    private vbarchartservice: VBarChartService
  ) {

    
  }

  ngOnInit() {

    // let todate = new Date();
    // todate.setUTCHours(23, 59, 59, 999);
    // this.nCallToDate = Math.round(todate.getTime());

    // for (let dd = this.nCallToDate; dd >= 0; dd = dd - 86400000) {
    //   this.callHistoryDateList.push(dd);
    // }

    this.isCallHistoryLoading = true;
    this.isSocialLoading = true;

    this._dashboardService.getEmployee().subscribe(res => {
      if (!res) {
        return false;
      }
      this.employee = res;

      this.initialize();
      this.setHeadItems();
      this.getCallHistory();
      this.getSocial();
      this.setLineChartCategories();
      this.getLineChartData();
      this.updateBarChart();
      this.updateVBarChart();
      return true;
    })
    this.employee = JSON.parse(localStorage.getItem('cur_employee'));
    if(!this.employee){
      this.router.navigate(["/"]);
    }
    this.initialize();
    this.setHeadItems();
    this.getCallHistory();
    this.getSocial();

    this.setLineChartCategories();
    this.getLineChartData();
    this.updateBarChart();
    this.updateVBarChart();
    // this.drawLineChart();
  }

  ngAfterViewInit() {

    this.playAudio = document.getElementById("playAudio");
    this.playAudio.onended = () => {
      this.currentPlayingIndex = -1;
      if (this.audioSrc) {
        this.audioSrc = "";
      }
    }
  }

  initialize() {
    this.isLoading = true;

    this.fromDate = null;
    this.toDate = null;
    this.isCallHistoryLoading = false;
    this.isCallHistoryLoadmoreLoading = false;
    this.iscallHistoryEnd = false;

    this.isSocialLoading = false;
    this.isSocialLoadmoreLoading = false;
    this.isSocialEnd = false;

    // audio
    this.audioSrc = "";
    this.audioType = "";
    this.currentPlayingIndex = -1;
    this.isPaused = false;

    this.playAudio = null;

    // employee

    this.callHistoryList = null;
    this.socialHistoryList = null;

    this.nCurCall = 0;
    this.nCurSocial = 0;


    // search variable
    this.callFromDate = null;
    this.callToDate = null;

    // return callers
    this.returnCallers = 1;

    // social search variable
    this.socialFromDate = null;
    this.socialToDate = null;
    this.subType = 1;
    this.type = "averageDurations";
    this.period = 1;

    // top blocks
    // this.firstItem = ;
    // this.secondItem = null;
    // this.thirdItem = null;
    // this.forthItem = null;

    // bar chart type
    this.barcharttype = 'day';

    this.periodList = [
      { label: "Hourly", period: 3600000, level: 86400000, enabled: false, checked: false },
      { label: "Daily", period: 86400000, level: 8640000000, enabled: false, checked: false },
      { label: "Weekly", period: 604800000, level: 31536000000, enabled: false, checked: false },
      { label: "Monthly", period: 2592000000, level: 31536000000, enabled: false, checked: false },
    ];

    this.rangeOption = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      'All Time': [moment(this.employee.mindate), moment(this.employee.maxdate)]
    };

    this.hourlyChartData = [];
    this.dailyChartData = [];
  }

  setHeadItems() {

    this.firstItem = { "label": "Incoming Calls", id: "incomingCalls", "active": true,unit: "" };
    this.secondItem = { "label": "Outgoing", id: "outCalls", "active": true, unit: "" };
    this.thirdItem = { "label": "Missed Calls", id: "missedCalls", "active": true, unit: "" };
    this.forthItem = { "label": "New callers", id: "newCalls", "active": true, unit: ""  };
    this.categoryOfBarChart = { "label": "Incoming Calls", id: "incomingCalls", "active": true,unit: ""}
  }

  getCallHistory() {
    let request = { "employeeId": this.employee.id, "fromdate": this.callFromDate, "todate": this.callToDate, limitFrom: this.nCurCall };
    if(!this.isCallHistoryLoadmoreLoading){
      this.isCallHistoryLoading = true;
    }
    this._dashboardService.getCallHistory(request).subscribe(res => {
      if (res.success) {
        if (res.data.length === 0) {
          this.iscallHistoryEnd = true;
        }
        if (!this.callHistoryList) {
          this.callHistoryList = res.data;
        } else {
          this.callHistoryList = this.callHistoryList.concat(res.data);
        }
        this.nCurCall = this.callHistoryList.length;
      }
      this.isCallHistoryLoading = false;
      this.isCallHistoryLoadmoreLoading = false;
    })
  }

  setCurTitleDate = (date) => {
  }

  loadMoreCallHistory() {

    this.isCallHistoryLoadmoreLoading = true;
    this.getCallHistory();
  }

  onChangeCallHistoryDate() {
    // this.callFromDate =obj.value;
    this.callHistoryList = [];
    this.iscallHistoryEnd = false;
    this.isCallHistoryLoading = true;

    this.nCallFromDate = Math.round(new Date(this.callFromDate).getTime());
    this.nCallToDate = Math.round(new Date(this.callToDate).getTime());

    this.getCallHistory();
  }


  playRecordedCall(name, index) {
    console.log(this.currentPlayingIndex, index);
    if (!name) {
      return false;
    }
    if (this.playAudio && this.currentPlayingIndex !== index) {
      this.isPaused = false;
      this.currentPlayingIndex = index;
      
      let rootPath = "https://callmonitor.app/files/recordings/";
      let fname = name;
      
      this.audioSrc = rootPath + fname;
      // for testing...
      // if(index%2===1){
      //   this.audioSrc = "https://callmonitor.app/files/recordings/4358db50-b70e-4b35-a304-a2f598df7982.wav";
      // }else{
      //   this.audioSrc = "http://localhost/mp3recordings/1b04c2b4-45f2-44a6-ab63-de86e09368f5.mp3";
      // }
      // ------ end testing---------
      this.playAudio.play();
     // this.playAudio.type = audioType;
    }
    else if (this.currentPlayingIndex === index) {
      if(!this.isPaused){
        this.playAudio.pause();
        this.isPaused = true;
        return;
      }else{
        this.playAudio.play();
        this.isPaused = false;
        return;
      }
    }
  }

  getSocial() {


    let request = {
      "employeeId": this.employee.id, type: this.type, subType: this.subType,special_period: this.special_period,
      "fromdate": this.socialFromDate, "todate": this.socialToDate, "limitFrom": this.nCurSocial, period: this.period
    };
    this.isSocialLoading = true;
    this._dashboardService.getSocial(request)
      .subscribe(res => {
        if (res.success) {
          if (res.data.length === 0) {
            this.isSocialEnd = true;
          }
          if (!this.socialHistoryList) {
            this.socialHistoryList = res.data;
          } else {
            this.socialHistoryList = this.socialHistoryList.concat(res.data);
          }
          this.nCurSocial = this.socialHistoryList.length;

        }
        this.isSocialLoading = false;
        this.isSocialLoadmoreLoading = false;
      })
  }

  loadMoreSocial() {
    this.isSocialLoadmoreLoading = true;
    this.getSocial();
  }

  onChangeSocialDate() {
    this.nCurSocial = 0;
    this.isSocialEnd = false;
    this.socialHistoryList = [];
    this.isSocialLoading = true;
    this.getSocial();
  }

  onCallDateChange() {
    this.getCallHistory();
  }

  onSocialDateChange() {
    this.getSocial();
  }

  onSubTypeChange() {
    this.getSocial();
  }


  // date range change event handle

  onTriggerDateRange(event: any){
    event.preventDefault();

    let element: HTMLElement = document.getElementById('dateRangePicker') as HTMLElement;
    element.click();
  }

  onDateRangeChanged(){
    let startdateOfLine = Date.parse(new Date().toDateString());
    let enddateOfLine = startdateOfLine + 86399000;
    if (this.dateRange) {
      startdateOfLine = Date.parse(this.dateRange.start.format());
      enddateOfLine = Date.parse(this.dateRange.end.format());
    }
    this.setPeriodListEnabled(startdateOfLine, enddateOfLine);
    this.getLineChartData(); // main chart
    this.updateBarChart(); // daily chart
    this.updateVBarChart(); // hourly chart
  }

  
  setPeriodListEnabled(start, end) {
    let timestamp = end - start;
    let index;
    for(index = 0; index<this.periodList.length; index++) {
        if(timestamp<this.periodList[index].level){
          break;
        }
    }
    
    for(let i = 0; i<this.periodList.length; i++) {
      if(index>i && i>=1){
        this.periodList[i].enabled = true;
      }else{
        this.periodList[i].enabled = false;
      }
    }
   // this.periodList[index].checked = true;
    this.curLineChartPeriod = this.periodList[index].period;
    this.periodList[index].enabled = true;
  }

  // set current period 
  onSetCurPeriod(pObj){
    if(!pObj.enabled){
      return;
    }
    if(this.curLineChartPeriod === pObj.period){
      return;
    }
    this.curLineChartPeriod = pObj.period;
    this.getLineChartData();
  }

  /** Line char functions */
  setLineChartCategories() {
    let ids = [];
    let labels = [];
    let units = [];
    if(this.firstItem.active){
      ids.push(this.firstItem.id);
      labels.push(this.firstItem.label);
      units.push(this.firstItem.unit);
    }else{
      ids.push(undefined);
      labels.push("");
      units.push("");
    }
    if(this.secondItem.active){
      ids.push(this.secondItem.id);
      labels.push(this.secondItem.label);
      units.push(this.secondItem.unit);
    }else{
      ids.push(undefined);
      labels.push("");
      units.push("");
    }
    if(this.thirdItem.active){
      ids.push(this.thirdItem.id);
      labels.push(this.thirdItem.label);
      units.push(this.thirdItem.unit);
    }else{
      ids.push(undefined);
      labels.push("");
      units.push("");
    }
    if(this.forthItem.active){
      ids.push(this.forthItem.id);
      labels.push(this.forthItem.label);
      units.push(this.forthItem.unit);
    }else{
      ids.push(undefined);
      labels.push("");
      units.push("");
    }
    this.linechartservice.setCategory(
      ids, labels, units
    );
  }

  loadLineChart(){
    this.setLineChartCategories();
    if (this.lineChartData) {
      this.linechartservice.loadChart(this.lineChartData);
    }
  }

  getLineChartData() {
    let startdateOfLine = Date.parse(new Date().toDateString());
    let enddateOfLine = startdateOfLine + 86399000;
    if (this.dateRange) {
      startdateOfLine = Date.parse(this.dateRange.start.format());
      enddateOfLine = Date.parse(this.dateRange.end.format());
    }
    if(!this.curLineChartPeriod){
      this.setPeriodListEnabled(startdateOfLine, enddateOfLine);
    }

    let request = {
      start: startdateOfLine,
      end: enddateOfLine,
      empid: this.employee.id,
      period: this.curLineChartPeriod
    }

    this.linechartservice.updateChart(request).subscribe(data => {
      if (data.success) {
        this.lineChartData = data;
        this.firstItem.value = this.lineChartData.totalData[this.firstItem.id];
        this.secondItem.value = this.lineChartData.totalData[this.secondItem.id];
        this.thirdItem.value = this.lineChartData.totalData[this.thirdItem.id];
        this.forthItem.value = this.lineChartData.totalData[this.forthItem.id];
      }
      this.linechartservice.loadChart(data);
      return;

    })
  }

  /** Line chart functions end */

  /** Legend Item functions */
  onLegendItemChange() {
    this.loadLineChart();
  }

  onLegendItemClick(item){
    
    this.flagForLegentItemChange = false;
    item.active =!item.active;
    this.loadLineChart();
  }

  onReturningCallChange() {
    this._dashboardService.getReturningCalls(this.returnCallers, this.employee.id);
  }

  formatLegendItemVal(val, unit){
      if(val===undefined || val===null){
        return '';
      }
      if(unit === 's'){
        return Global.getTimeStamp(val);
      }else{
        return Math.round(val*100)/100 + unit;
      }
  }

  /** Legend Item functions end */

  // bar chart
  updateBarChart() {
    let startdateOfBar = Date.parse(new Date().toDateString());
    let enddateOfBar = startdateOfBar + 86399000;
    if (this.dateRange) {
      startdateOfBar = Date.parse(this.dateRange.start.format());
      enddateOfBar = Date.parse(this.dateRange.end.format());
    }
    
    let request = {
      start: startdateOfBar,
      end: enddateOfBar,
      empid: this.employee.id
    }

    this.barchartservice.updateChartData(request).subscribe(res=>{
      this.dailyChartData = res;
      this.barchartservice.setCategory(this.categoryOfBarChart);
      this.barchartservice.setChartData(res);
    });

  }



  /**
   *  hourly chart = vertical bar chart
   */
  // change category of data
  onChangeCategoryOfHourly(){

    // upate hourly chart
    this.vbarchartservice.setCategory(this.categoryOfBarChart);
    this.vbarchartservice.setChartData(this.hourlyChartData);

    // update daily chart
    this.barchartservice.setCategory(this.categoryOfBarChart);
    this.barchartservice.setChartData(this.dailyChartData);
  }
  

  // update hourly chart data
  updateVBarChart() {
    let startdateOfBar = Date.parse(new Date().toDateString());
    let enddateOfBar = startdateOfBar + 86399000;
    if (this.dateRange) {
      startdateOfBar = Date.parse(this.dateRange.start.format());
      enddateOfBar = Date.parse(this.dateRange.end.format());
    }
    
    let request = {
      start: startdateOfBar,
      end: enddateOfBar,
      empid: this.employee.id
    }

    this.vbarchartservice.updateChartData(request).subscribe(res=>{
      this.hourlyChartData = res;
      this.vbarchartservice.setCategory(this.categoryOfBarChart);
      this.vbarchartservice.setChartData(res);
    });

  }

  public getIncomvsOutgoing(incom, outgoing){
    if(outgoing == 0){
      outgoing = 1;
    }
    return Math.round(Math.round(incom)/Math.round(outgoing)*10)/10;
  }

}
