import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class EventsService {


    public mouseOverDistanceEdge = new EventEmitter<{distance: number}>();
    public createFreeSpaceDiagram = new EventEmitter<any>();  
    public mouseOverNodeOnDiagram = new EventEmitter<any>();
    public graphDragged = new EventEmitter<any>();
    public createGraphVis = new EventEmitter<any>();

}