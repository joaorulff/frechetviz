import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { StateService } from 'src/app/services/state.service';
import { EventsService } from 'src/app/services/event.service';
import { Geometry } from 'src/app/util/geometry';
import { Path } from 'src/app/model/path.model';

@Component({
  selector: 'app-free-space-diagram',
  templateUrl: './free-space-diagram.component.html',
  styleUrls: ['./free-space-diagram.component.scss']
})
export class FreeSpaceDiagramComponent implements OnInit {

  @ViewChild('diagramContainerRef', {static: true}) diagramContainerRef: ElementRef;

  // reference for SVG
  public svgRef = null;

  // main group chart
  public groupRef = null;

  // scales
  public xScale = null;
  public yScale = null;

  // chart margin
  public margin = { top: 30, bottom: 30, left: 30, right: 30};

  public tooltip = null;


  constructor(public stateService: StateService, public eventsService: EventsService) { }


  ngOnInit(): void {


    this.tooltip = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0)
      .style("position", 'absolute')
      .style("z-index", 2); 

    this.subscribeToEvents();

  }


  clearChart(){
    this.svgRef.remove();
  }


  subscribeToEvents(){

    this.eventsService.createFreeSpaceDiagram.subscribe( () => {
      this.createChart();
    });

  }

  createChart(){

    if(this.svgRef){
      this.clearChart();
    }
    
    this.appendSVG();
    this.appendGroup();

    const distancesBetweenPathNodes = this.stateService.distancesBetweenPathNodes();

    const xSum: number = distancesBetweenPathNodes.pathA[distancesBetweenPathNodes.pathA.length - 1];
    const ySum: number = distancesBetweenPathNodes.pathB[distancesBetweenPathNodes.pathB.length - 1];
    this.createScales(xSum, ySum);
    this.attachScales(distancesBetweenPathNodes.pathA, distancesBetweenPathNodes.pathB);
    this.updatePoints(this.stateService.pairWiseNodes(), this.stateService.currentFrechetDistance, this.stateService.getPaths());
    
  }


  updatePoints(pairs: any, distance: number, paths: any){

    this.groupRef
        .selectAll('.pathEdge')
        .data(paths)
        .enter()
        .append('path')
        .attr('class', 'pathEdge')
        .attr('d', d =>{ return `M${ this.xScale( d.startX ) }, ${  this.yScale(d.startY)} L${  this.xScale(d.endX)}, ${  this.yScale(d.endY) }` })
        .attr('stroke', 'red')
        .attr("stroke-width", 4);

      // this.svgRef
      //   .selectAll('.distanceEdge')
      //   .data(this.stateService.distancesEdges)
      //   .exit()
      //   .remove();

    

    this.groupRef.selectAll('.dot')
      .data(pairs)
      .enter()
      .append('circle')
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", d => { return this.xScale( d['distOnPathA'] ) })
      .attr("cy", d => { return this.yScale( d['distOnPathB'] ) })
      .attr('fill', d => { 
        if(Geometry.euclideanDistance(d.nodeOnA, d.nodeOnB) < distance ){
          return 'red';
        }else if(Geometry.euclideanDistance(d.nodeOnA, d.nodeOnB) == distance){
          return 'blue';
        }
        return 'black';
      })
      .on('mouseover', (element, index, nodes) => {

        this.tooltip.style("opacity", 1);		
        this.tooltip.html('<p>Distance: </p>' + Math.trunc(Geometry.euclideanDistance(element.nodeOnA, element.nodeOnB))  )
                .style("left", (d3.event.pageX + 50) + "px")		
                .style("top", (d3.event.pageY - 50) + "px");	


        this.stateService.setDistanceEdges(element.nodeOnA, element.nodeOnB)
        d3.select(nodes[index]).attr('r', 8);
        this.eventsService.mouseOverNodeOnDiagram.emit();
      })
      .on('mouseleave', (element, index, nodes) => {

        this.tooltip.style("opacity", 0);		
        this.tooltip
                .style("left", "0px")		
                .style("top", "0px");	


        this.stateService.clearDistanceEdges();
        d3.select(nodes[index]).attr('r', 5);
        this.eventsService.mouseOverNodeOnDiagram.emit();
      });


      this.groupRef.selectAll('.dot')
      .data(pairs)
      .append('circle')
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", d => { return this.xScale( d['distOnPathA'] ) })
      .attr("cy", d => { return this.yScale( d['distOnPathB'] ) })
      .on('mouseover', (element, index, nodes) => {
        this.stateService.setDistanceEdges(element.nodeOnA, element.nodeOnB)
        d3.select(nodes[index]).attr('r', 8);
        this.eventsService.mouseOverNodeOnDiagram.emit();
      })
      .on('mouseleave', (element, index, nodes) => {
        this.stateService.clearDistanceEdges();
        d3.select(nodes[index]).attr('r', 5);
        this.eventsService.mouseOverNodeOnDiagram.emit();
      });
    
  }



  attachScales(xPoints, yPoints){

    const chartWidht = this.diagramContainerRef.nativeElement.offsetHeight - this.margin.left - this.margin.right;
    const chartHeight = this.diagramContainerRef.nativeElement.offsetHeight - this.margin.left - this.margin.right;

    this.svgRef.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(' + this.margin.left + ',' + (this.diagramContainerRef.nativeElement.offsetHeight - this.margin.bottom) + ')'  )
            .call(d3.axisBottom(this.xScale).tickSize(-chartWidht).tickValues(xPoints));

    this.svgRef.append('g')
            .attr('class', 'y-axis')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .call(d3.axisLeft(this.yScale).tickSize(-chartHeight).tickValues(yPoints));

  }

  createScales(xSum: number, ySum: number){

    this.xScale = d3.scaleLinear()
            .domain([0, xSum])
            .range([0, this.diagramContainerRef.nativeElement.offsetHeight - this.margin.left - this.margin.right]);

    this.yScale = d3.scaleLinear()
            .domain([ySum, 0])
            .range([0, this.diagramContainerRef.nativeElement.offsetHeight - this.margin.left - this.margin.right]);
  }

  appendGroup(){

    // appending group to SVG            
    this.groupRef = this.svgRef.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

  }

  appendSVG(){

    const divWidth = this.diagramContainerRef.nativeElement.offsetWidth;
    const divHeight = this.diagramContainerRef.nativeElement.offsetHeight;

    // creating and appending svg
    this.svgRef = d3.select(this.diagramContainerRef.nativeElement)
        .append('svg')
        .attr('width', (divHeight))
        .attr('height', (divHeight));

  }




}
