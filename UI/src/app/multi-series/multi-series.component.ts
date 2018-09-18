import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';


import { LinechartService } from '../_services/linechart.service';
import { CategoryService } from '../_services/category.service';
import { NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core/src/view/provider';
import { Global } from '../_global/global';

@Component({
  selector: 'app-multi-series-line-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './multi-series.component.html',
  styleUrls: ['./multi-series.component.css']
})
export class MultiSeriesComponent implements OnInit {

  @Input() categories: any;

  title = 'Multi-Series Line Chart';

  data: any;

  svg: any;
  margin = { top: 20, right: 50, bottom: 30, left: 50 };
  g: any;
  width: number;
  height: number;
  x;
  y;
  z;
  line;
  colors;
  container: any;
  aspect;

  srcData;
  isLoading = false;
  isDataExist = true;
  // categories: any;

  constructor(private lineChartService: LinechartService, private categoryService: CategoryService) {
  }

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
        if (this.srcData !== undefined && this.srcData.length > 0) {
          d3.select('#linechart').selectAll(".axis").remove();
          d3.select('#linechart').selectAll("path").remove();
          d3.select('#linechart').selectAll('text').remove();
          d3.select('#linechart').selectAll('.legend').remove();
        }
        return;
      }
      this.isDataExist = true;
      this.isLoading = false;

      this.srcData = this.makeChartData(data);
      this.data = this.srcData.map((v) => v.values.map((v) => v.date))[0];

      //.reduce((a, b) => a.concat(b), []);
      this.colors = Global._linechartcolors;

      d3.select('#linechart').selectAll("g").remove();
      if (this.initChart()) {
        this.drawAxis();
        this.drawPath();
      }

    })
  }

  makeChartData(rawData) {
    let res = [];
    let ids = rawData.cats;
    let labels = rawData.labels;

    let id;

    for (let i = 0; i < ids.length; i++) {
      id = ids[i];
      let item = { id: '', label: '', values: [], index: i };
      item.id = id;
      item.label = labels[i];

      item.values = rawData.srcData[id];

      res.push(item);
    }
    return res;
  }

  private initChart(): boolean {

    this.svg = d3.select('#linechart');
    this.container = d3.select(this.svg.node().parentNode);

    this.width = document.getElementById('chart-container').clientWidth - this.margin.left - this.margin.right;
    this.height = document.getElementById('chart-container').clientHeight - this.margin.top - this.margin.bottom;

    if (this.width < 0 || this.height < 0) {
      return false;
    }

    this.g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.z = d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);

    this.line = d3Shape.line()
      // .curve(d3Shape.curveBasis)
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.val));
    
    this.x.domain(d3Array.extent(this.data, (d) => d));


    this.y.domain([
      d3Array.min(this.srcData, function (c) { return d3Array.min(c.values, function (d) { return d.val; }); }),
      d3Array.max(this.srcData, function (c) { return d3Array.max(c.values, function (d) { return d.val; }); })
    ]);


    this.aspect = this.width / this.height;
    this.svg.attr("preserveAspectRatio", "xMinYMid");


    let heightArray = {};
    for(let i = 0; i<this.srcData.length; i++){
      heightArray[this.srcData[i].id] = 8 + 20*i;
    }
    let parent = this;
    
    let legend = this.svg.selectAll(".legend")
    .data(this.srcData).enter().append("g").attr("class", "legend")
    .attr("legend-id", function(d){
      return d.id;
    })
    .style("cursor", "pointer");
    let leg = legend;
    legend.append("circle")
    .attr("cx", 80).attr("cy", function(d){
      return heightArray[d.id]
    })
    .attr("r", 7)
    .style("fill", function(d){
      return parent.colors[d.index]
    });


    leg.append("text").attr("x", 90)
    .attr("y", function(d){
      return heightArray[d.id] + 3;
    })
    .style("font-size", 12)
    .style("margin-top", 2)
    .style("vertical-align", "middle")
    .text(function(d){
      let cat = parent.categories.filter(function(it){
        return it.id == d.id
      })[0];
      return cat.label;
    });
   

    return true;
  }

  onResize() {

    this.initChart();
    this.drawAxis();
    this.drawPath();
  }

  onLoad() {
  }

  private drawAxis(): void {
    d3.select('#linechart').selectAll(".axis").remove();
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));

    this.g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      // .append('text')
      // .attr('transform', 'rotate(-90)')
      // .attr('y', 6)
      // .attr('dy', '0.71em')
      // .attr('fill', '#efeff8')
    // .text('val, ºF');
  }

  private drawPath(): void {
    
    d3.select('#linechart').selectAll("path.line").remove();
    d3.select('#linechart').selectAll(".city").remove();
    // d3.selectAll("text").remove();
    let city = this.g.selectAll('.city')
      .data(this.srcData)
      .enter().append('g')
      .attr('class', 'city');

    city.append('path')
      .attr('class', 'line')
      .attr('d', (d) => this.line(d.values))
      // .style('stroke', (d) => this.z(d.id) );
      .style('stroke', (d) => this.colors[d.index])

    // city.append('text')
    //   .datum(function (d) { return { id: d.id, value: d.values[d.values.length - 1], label: d.label }; })
    //   .attr('transform', (d) => 'translate(' + this.x(d.value.date) + ',' + this.y(d.value.val) + ')')
    //   .attr('x', 3)
    //   .attr('dy', '0.35em')
    //   .style('font', '10px sans-serif')
    //   .text(function (d) { return d.label });

  }

}
