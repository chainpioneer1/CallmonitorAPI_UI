import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { STATISTICS } from '../shared';
import { BarchartService } from '../_services/barchart.service';
import { Global } from '../_global/global';

@Component({
    selector: 'app-bar-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

    title = 'Bar Chart';

    private width: number;
    private height: number;
    private margin = { top: 40, right: 20, bottom: 30, left: 80 };

    private x: any;
    private y: any;
    private svg: any;
    private g: any;
    chartData: any;
    isLoading = false;
    isExist = false;
    tooltip: any;
    cat: any;
    curField; // current item to show in chart

    @Input() show;

    constructor(private barChartService: BarchartService) { }

    ngOnInit() {
        this.barChartService.loadChart().subscribe(res => {
            console.log('bar-chart-component ---------------- 37---', res);
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

        });

    }

    private validateData(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][this.curField]) {
                return true;
            }
        }
        return false;
    }

    private initSvg() {
        this.svg = d3.select('#barchart');
        this.svg.selectAll("g").remove();

        this.tooltip = d3.select("#barchart-container").append("div").attr("class", "toolTip");

        this.width = document.getElementById('barChart').clientWidth - this.margin.left - this.margin.right;
        this.height = document.getElementById('barChart').clientHeight - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    private initAxis() {
        let parent = this;
        this.y = d3Scale.scaleBand().rangeRound([0, this.height]).padding(0.1);
        this.x = d3Scale.scaleLinear().rangeRound([this.width, 0]);
        this.y.domain(this.chartData.map((d) => d.label));
        this.x.domain([0, d3Array.max(this.chartData, (d) => d[parent.curField])]);
    }

    private drawAxis() {
        // this.g.append('g')
        //     .attr('class', 'axis axis--x')
        //     .attr('transform', 'translate(0,' + this.height + ')')
        //     .call(d3Axis.axisLeft(this.x));
        this.g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y).ticks(10, '%'))
        // .append('text')
        // .attr('class', 'axis-title')
        // .attr('x', 700)
        // .attr('dy', '0.1em')
        // .attr('text-anchor', 'end')
        // .text('sum');
        d3.select("#barchart").selectAll("line").remove();
        d3.select("#barchart").selectAll("path").remove();
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
            .attr('y', (d) => this.y(d.label))
            .attr('x', 0)
            .attr('height', this.y.bandwidth())
            .attr('width', (d) => d[parent.curField] ? (this.width - this.x(d[parent.curField])) : 0)
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
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawBars();
    }

}
