import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { VBarChartService } from '../_services/v-bar-chart.service';
import { Global } from '../_global/global';
import * as $ from 'jquery';

@Component({
  selector: 'app-vbar-chart',
  templateUrl: './vbar-chart.component.html',
  styleUrls: ['./vbar-chart.component.css']
})
export class VbarChartComponent implements OnInit {
  @Input() show;
  title = 'Hour Bar Chart';

  private width: number;
  private height: number;
  private margin = { top: 20, right: 20, bottom: 30, left: 40 };

  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  chartData: any;
  isLoading = false;
  isExist = false;
  tooltip: any;
  cat: any; // category
  curField; // current field to show

  constructor(private vbarchartservice: VBarChartService) {
  }

  ngOnInit() {
    // this.show = false; 
    this.vbarchartservice.loadChart().subscribe(res => {

      if (res.status && res.status === 'loading') {
        this.isLoading = true;
        this.isExist = false;
        return;
      } else {
        if (!res.success) {
          this.isLoading = false;
          this.isExist = false;
        } else {
          this.cat = res.cat;
          console.log('---- bar chart cat', this.cat);
          this.curField = this.cat.id;
          if (this.validateData(res.srcData)) {
            this.isLoading = false;
            this.isExist = true;
            this.chartData = res.srcData;
            console.log('this.chartData --------- vbarchart', this.chartData);
            console.log('---- curField --------- vbarchart', this.curField);
            this.initSvg();
            this.initAxis();
            this.drawAxis();
            this.drawBars();
          } else {
            this.isLoading = false;
            this.isExist = false;
          }

        }
      }
    })

  }

  // validate chart data
  private validateData(data) {
    console.log('--- validate in vbar chart', this.curField);
    for (let i = 0; i < data.length; i++) {
      if (data[i][this.curField]) {
        return true;
      }
    }
    return false;
  }


  private initSvg() {
    this.svg = d3.select('#vbarchart');
    this.svg.selectAll("g").remove();

    this.tooltip = d3.select("#vbarchart-container").append("div").attr("class", "toolTip");

    this.width = document.getElementById('barChart').clientWidth - this.margin.left - this.margin.right;
    this.height = document.getElementById('barChart').clientHeight - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    let parent = this;
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.chartData.map((d) =>(d.label)));
    this.y.domain([0, d3Array.max(this.chartData, (d) => d[parent.curField])]);
  }

  
  private drawAxis() {
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    // this.g.append('g')
    //   .attr('class', 'axis axis--y')
    //   .call(d3Axis.axisLeft(this.y).ticks(10, '%'))
    //   .append('text')
    //   .attr('class', 'axis-title')
    //   .attr('transform', 'rotate(-90)')
    //   .attr('y', 6)
    //   .attr('dy', '0.71em')
    //   .attr('text-anchor', 'end')
    //   .text('Frequency');
    this.svg.select('.axis--x').selectAll('.tick').selectAll('text').remove();
    // this.svg.select('.axis--x').selectAll('.tick:nth-child(n+2):nth-child(-n+6)').selectAll('text').remove();
    // this.svg.select('.axis--x').selectAll('.tick:nth-child(n+8):nth-child(-n+12)').selectAll('text').remove();
    // this.svg.select('.axis--x').selectAll('.tick:nth-child(n+14):nth-child(-n+18)').selectAll('text').remove();
    // this.svg.select('.axis--x').selectAll('.tick:nth-child(n+20):nth-child(-n+24)').selectAll('text').remove();
    this.svg.select('.axis--x').select('.tick:nth-child(2)').append('text').text('12 AM').attr('y', 9).attr('dy', '0.71em').attr('fill','currentColor');
    this.svg.select('.axis--x').select('.tick:nth-child(8)').append('text').text('6 AM').attr('y', 9).attr('dy', '0.71em').attr('fill','currentColor');
    this.svg.select('.axis--x').select('.tick:nth-child(14)').append('text').text('12 PM').attr('y', 9).attr('dy', '0.71em').attr('fill','currentColor');
    this.svg.select('.axis--x').select('.tick:nth-child(20)').append('text').text('6 PM').attr('y', 9).attr('dy', '0.71em').attr('fill','currentColor');
    this.svg.select('.axis--x').select('.tick:nth-child(25)').append('text').text('12 AM').attr('y', 9).attr('dy', '0.71em').attr('fill','currentColor');
  }

  private drawBars() {
    let parent = this;
    let tooltip1 = '';
    let tooltip2 = '';
    let tooltip3 = '';
    this.g.selectAll('.bar')
      .data(this.chartData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => this.x(d.label))
      .attr('y', (d) => this.y(d[parent.curField]))
      .attr('width', this.x.bandwidth())
      .attr('height', (d) => this.height - this.y(d[parent.curField]))
      .on("mousemove", function (d) {
        tooltip1 ='<small>' +(parent.cat.unit==='s'?'Duration':'') +'</small></br>';
        tooltip2 = (parent.cat.unit==='s')?Global.getTimeStamp(d[parent.curField]):d[parent.curField];
        tooltip3 = (parent.cat.unit==='%')?'%':'';
        
        parent.tooltip
          .style("left", d3.event.offsetX - 50 + "px")
          .style("top", d3.event.offsetY - 100 + "px")
          .style("display", "inline-block")
          .html('<h6>' + (d.label) + '</h6>' + tooltip1 + tooltip2 + tooltip3);
      }).on("mouseout", function (d) { parent.tooltip.style("display", "none"); });
  }

  public onResize() {

  }
}
