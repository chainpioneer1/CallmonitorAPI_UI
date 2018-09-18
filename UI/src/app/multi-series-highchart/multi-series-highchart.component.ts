import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { DateFormatter } from 'ngx-bootstrap/datepicker';
import { LinechartService } from '../_services/linechart.service';
import * as $ from 'jquery';
import { Global } from '../_global/global';

@Component({
  selector: 'app-multi-series-highchart',
  templateUrl: './multi-series-highchart.component.html',
  styleUrls: ['./multi-series-highchart.component.css']
})
export class MultiSeriesHighchartComponent implements OnInit {
  chart: Chart;


  isLoading = false;
  isDataExist = true;

  // date
  dates: any;
  minDate;
  maxDate;

  // cat === legend
  cats: any;
  labels: any;
  units: any;
  // src data : for chart
  srcData: any;

  // period of chart
  period;

  constructor(private lineChartService: LinechartService) { }

  ngOnInit() {
    this.lineChartService.getChartData().subscribe(data => {

      if (data.status) {
        if (data.status === 'loading') {
          this.isLoading = true;
          return;
        }
      }
      if (data.success === false) {
        this.isDataExist = false;
        this.isLoading = false;

        return;
      }
      this.srcData = data.srcData;
      this.period = data.period;
      this.dates = data.srcData.dates;
      if (this.period == 3600000) {
        this.minDate = Global.formatAMPM_HOUR(this.dates[0]);
        this.maxDate = Global.formatAMPM_HOUR(this.dates[this.dates.length - 1]);
      } else {
        this.minDate = Global.formatDate(this.dates[0]);
        this.maxDate = Global.formatDate(this.dates[this.dates.length - 1]);
      }


      this.cats = data.cats;
      this.labels = data.labels;
      this.units = data.units;

      this.isDataExist = true;
      this.isLoading = false;
      this.initChart();
    })

  }

  initChart() {
    let categories = [];
    let length = this.dates.length;
    console.log('----------this.unit in main chart', this.units);
    for (let i = 0; i < length; i++) {
      // if(i === 0 || i === (this.dates.length - 1)){
      if (this.period == 3600000) {
        categories.push("" + Global.formatAMPM_HOUR(this.dates[i]) + " - " + Global.formatAMPM_HOUR(this.dates[(i + 1) % length]));
      } else {
        categories.push(Global.formatDate(this.dates[i]));
      }

    }

    let chart = new Chart({
      chart: {
        events: {
          load: function () {
            this.xAxis[0].update({
              title: {
                style: {
                  fontSize: '10px',
                  transform: "translate(0,0) rotate(0 0)"
                },
              }
            });
          }
        },
        height: '300px',
        margin: [20, 10, 40, 10],
      },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          let s = '<strong>' + this.x + '</strong><table>';
          let name;
          let unit;
          let val;
          $.each(this.points, function () {
            name = this.series.name.split('_')[0];
            unit = this.series.name.split('_')[1];
            val = unit==='s'?Global.getTimeStamp(this.y):this.y + unit;
            s += '<tr>' +'<td style="color:'+ this.series.color + '">'+ name + '</td><td>' + val + '</td></tr>'
          });
          s = s+'</table>'
          return s;
        },
        valueDecimals: 2
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: categories,
        labels: {
          rotation: 0
        }
      },
      yAxis: {
        title: {
          text: ''
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          animation: false
        }
      },
      series: [{
        color: this.cats[0] ? "#00AC5C" : "#FFFFFF",
        name: this.labels[0] + '_' + this.units[0],
        data: this.srcData[this.cats[0]]
      }, {
        color: this.cats[1] ? "#F5B723" : "#FFFFFF",
        name: this.labels[1]+ '_' + this.units[1],
        data: this.srcData[this.cats[1]]
      }, {
        color: this.cats[2] ? "#E5003F" : "#FFFFFF",
        name: this.labels[2]+ '_' + this.units[2],
        data: this.srcData[this.cats[2]]
      }, {
        color: this.cats[3] ? "#4c8efc" : "#FFFFFF",
        name: this.labels[3]+ '_' + this.units[3],
        data: this.srcData[this.cats[3]]
      }]
    });

    this.chart = chart;
    let parent = this;
    chart.ref$.subscribe(() => {
    });

    // this.updateXAxis();
  }

  updateXAxis() {
    // first label of x axis
    let fObj = $('.highcharts-xaxis-labels text:first-child');
    fObj.find('tspan').text(fObj.find('title').text());
    // last label of x axis
    let lObj = $('.highcharts-xaxis-labels text:last-child')
    lObj.find('tspan').text(lObj.find('title').text());
  }

}
