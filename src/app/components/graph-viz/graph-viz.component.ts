import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { Path } from 'src/app/model/path.model';
import { StateService } from 'src/app/services/state.service';
import * as _ from 'lodash';
import { Geometry } from 'src/app/util/geometry';
import { EventsService } from 'src/app/services/event.service';
import { Node } from 'src/app/model/node.model';

@Component({
  selector: 'app-graph-viz',
  templateUrl: './graph-viz.component.html',
  styleUrls: ['./graph-viz.component.scss']
})


export class GraphVizComponent implements OnInit, AfterViewInit {

  @ViewChild('graphvizDivRef', {static: false}) graphVizDivRef: ElementRef;

  public divHeight = null;
  public divWidth = null;

  public svgRef = null;

  public pathA: Path = null;
  public pathB: Path = null;

  public lineA = null;
  public lineB = null;
  public distanceLine = null;

  public dragHandler = null;

  constructor(public stateService: StateService, public events: EventsService) { }



  ngOnInit(): void {

    this.events.mouseOverNodeOnDiagram.subscribe( () =>{
      this.updateGraphs();
    });

    this.events.createGraphVis.subscribe(() => {
      console.log('creating..');
      // this.createGraphViz();
    })

    // this.createGraphViz();
    
    // this.divWidth = this.graphVizDivRef.nativeElement.offsetWidth;
    // this.divHeight = this.graphVizDivRef.nativeElement.offsetHeight;

  }

  ngAfterViewInit(){

    if(this.stateService.graphVizHeight === null){
      this.stateService.graphVizHeight = this.graphVizDivRef.nativeElement.offsetHeight;
      this.stateService.graphVizWidth = this.graphVizDivRef.nativeElement.offsetWidth;
      // this.divWidth = this.graphVizDivRef.nativeElement.offsetWidth;
      // this.divHeight = this.graphVizDivRef.nativeElement.offsetHeight;
    }

    this.createGraphViz();
  }

  createGraphViz(){

    // const divWidth = this.graphVizDivRef.nativeElement.offsetWidth;
    // const divHeight = this.graphVizDivRef.nativeElement.offsetHeight;

    const divWidth =  this.stateService.graphVizWidth;
    const divHeight = this.stateService.graphVizHeight;

    console.log(divHeight);


    // console.log(this.graphVizDivRef.nativeElement);

    this.stateService.pathA = new Path(divWidth, divHeight);
    this.stateService.pathB = new Path(divWidth, divHeight);

    this.lineA = d3.line()
            .x( d => { return d['screenX'] })
            .y( d => { return d['screenY'] });

    this.lineB = d3.line()
            .x( d => { return d['screenX'] })
            .y( d => { return d['screenY'] });

    this.distanceLine = d3.line()
            .x( d => { return d['screenX'] })
            .y( d => { return d['screenY'] });
    
      

    this.appendSVG(divWidth, divHeight);
    this.setDragHandler();

  }


  setDragHandler(){

    this.dragHandler = d3.drag()
      .on('start', () => {
      })
      .on('drag', (element: Node, index, nodes) => {
        const clickX = d3.mouse(this.svgRef.node())[0];
        const clickY = d3.mouse(this.svgRef.node())[1];

        element.setNewCoordinates(clickX, clickY);
        this.updateGraphs();

        this.events.graphDragged.emit();
      })
      .on('end', (element: Node, index, nodes) => {

        const clickX = d3.mouse(this.svgRef.node())[0];
        const clickY = d3.mouse(this.svgRef.node())[1];

        element.setNewCoordinates(clickX, clickY);
        this.updateGraphs();

        this.events.graphDragged.emit();
      });

  }


  appendSVG(divWidth: number, divHeight: number){

    this.svgRef = d3.select('.graph-viz-container')
      .append('svg')
      .attr('width', divWidth)
      .attr('height', divHeight)
      .on('click', () => {
        
        const clickX = d3.mouse(this.svgRef.node())[0];
        const clickY = d3.mouse(this.svgRef.node())[1];

        this.addVertex(clickX, clickY);
      
      });

  } 


  addVertex(x: number, y: number) {

    if(this.stateService.isDrawingPathA){
      
      this.stateService.pathA.addNode(x, y);


    } else if(this.stateService.isDrawingPathB){

      this.stateService.pathB.addNode(x, y);

    }

    // this.stateService.updateDistancesEdges();
    this.updateGraphs();
  }

  
  updateGraphs() {

    this.svgRef
        .selectAll('.distanceEdge')
        .data(this.stateService.distancesEdges)
        .enter()
        .append('path')
        .attr('class', 'distanceEdge')
        .attr('d', d =>{  return `M${d.nodeOnA.screenX}, ${d.nodeOnA.screenY} L${d.nodeOnB.screenX}, ${d.nodeOnB.screenY}` })
        .attr('stroke', 'green')
        .attr("stroke-width", 2)
        // .attr('opacity', 0.1)
        .on('mouseover', (d, i, nodes) => {
          d3.select(nodes[i]).attr("opacity", 1); 
        })
        .on('mouseleave', (d, i, nodes) => {
          d3.select(nodes[i]).attr("opacity", 0.1); 
        });

      this.svgRef
        .selectAll('.distanceEdge')
        .data(this.stateService.distancesEdges)
        .exit()
        .remove();


    
    if(this.stateService.pathA.nodes.length > 1) {

      this.svgRef
          .selectAll('.edgeA')
          .remove();

      this.svgRef
            // .selectAll('.edge')
            .datum(this.stateService.pathA.nodes)
            // .enter()
            .append('path')
            .attr('class', 'edgeA')
            .attr('stroke', 'red')
            .attr('fill', 'none')
            .attr("stroke-width", 2)
            .attr('d', this.lineA);
      
    }

    if(this.stateService.pathB.nodes.length > 1){

      this.svgRef
          .selectAll('.edgeB')
          .remove();


      this.svgRef
            // .selectAll('.edge')
            .datum(this.stateService.pathB.nodes)
            // .enter()
            .append('path')
            .attr('class', 'edgeB')
            .attr('stroke', 'blue')
            .attr('fill', 'none')
            .attr('cx', d => { return d.screenX })
            .attr('cy', d => { return d.screenY })
            .attr("stroke-width", 2)
            .attr('d', this.lineB);
    }

    this.svgRef.selectAll(".nodeA")
          .data(this.stateService.pathA.nodes)
          .enter()
          .append('circle')
          .attr('class', 'nodeA')
          .attr('fill', 'black')
          .attr('cx', d => { return d.screenX })
          .attr('cy', d => { return d.screenY })
          .attr('r', 5)
          .call(this.dragHandler);

    this.svgRef.selectAll(".nodeA")
          .data(this.stateService.pathA.nodes)
          .attr('cx', d => { return d.screenX })
          .attr('cy', d => { return d.screenY })
          .attr('r', 5)
          .call(this.dragHandler);

          
    
    this.svgRef.selectAll(".nodeB")
          .data(this.stateService.pathB.nodes)
          .enter()
          .append('circle')
          .attr('class', 'nodeB')
          .attr('fill', 'black')
          .attr('cx', d => { return d.screenX })
          .attr('cy', d => { return d.screenY })
          .attr('r', 5)
          .call(this.dragHandler);

    this.svgRef.selectAll(".nodeB")
          .data(this.stateService.pathB.nodes)
          .attr('cx', d => { return d.screenX })
          .attr('cy', d => { return d.screenY })
          .attr('r', 5)
          .call(this.dragHandler);


  }

}



