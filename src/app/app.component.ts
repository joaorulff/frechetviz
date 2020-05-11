import { Component, OnInit, AfterViewInit } from '@angular/core';
import { StateService } from './services/state.service';
import { EventsService } from './services/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})



export class AppComponent implements OnInit, AfterViewInit {

  public formattedDistance = Math.trunc(this.stateService.currentFrechetDistance);

  public aboutPage: boolean = true;

  constructor(public stateService: StateService, public eventsService: EventsService){}

  title = 'graphviz';

  changeAboutPage(){

    this.aboutPage = !this.aboutPage;
    if(this.aboutPage === true){
      this.eventsService.createGraphVis.emit();
    }
  }

  ngOnInit(): void {

    this.eventsService.graphDragged.subscribe( () => {
      this.createFreeSpaceDiagram();
    });

    

  }

  ngAfterViewInit(): void {

    this.eventsService.createGraphVis.emit();
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    
  }

  changeDrawingSliderTogle(event) {
    
    if(event.source.id === 'pathAToggle'){
      this.stateService.isDrawingPathA = event.checked;
    } else {
      this.stateService.isDrawingPathB = event.checked;
    }

    if(event.checked === true){

      if(event.source.id === 'pathAToggle'){
        this.stateService.isDrawingPathB = false;
      }else {
        this.stateService.isDrawingPathA = false;
      }

    }

  }


  createFreeSpaceDiagram(){

    this.stateService.calculateFrechetDistance();
    this.formattedDistance = Math.trunc(this.stateService.currentFrechetDistance);
    this.eventsService.createFreeSpaceDiagram.emit();

  }




}
