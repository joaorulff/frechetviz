import { Injectable } from '@angular/core';
import { Path } from '../model/path.model';
import { Node } from '../model/node.model';
import * as _ from 'lodash';
import { Geometry } from '../util/geometry';


@Injectable({
    providedIn: 'root'
})

export class StateService {

    public graphVizWidth = null;
    public graphVizHeight = null;

    public isDrawingPathB: boolean = false;
    public isDrawingPathA: boolean = false;

    public pathA: Path = null;
    public pathB: Path = null;

    public distancesEdges: {nodeOnA: Node, nodeOnB: Node} [] = [];

    public currentFrechetDistance: number = 0;

    public updateDistancesEdges() {

        for(let i = 0; i < this.pathA.nodes.length; i++) {
            
            const upperBound = Math.min( this.pathA.nodes.length, i + 3 )
            const lowerBound = Math.max(0, i - 3);

            for(let j = lowerBound; j < upperBound ; j++) {


                if(i < this.pathA.nodes.length && j < this.pathB.nodes.length) {

                    const currentEdge =  { nodeOnA: this.pathA.nodes[i],  nodeOnB: this.pathB.nodes[j] };
                    if( this.checkRepeatedEdges(currentEdge) ){
                        this.distancesEdges.push( currentEdge );
                    }
                }

            }
        }
    }


    public checkRepeatedEdges(edge: {nodeOnA: Node, nodeOnB: Node}  ){

        let flag = true;
        _.forEach(this.distancesEdges, currentEdge => {
            if(currentEdge.nodeOnA === edge.nodeOnA && currentEdge.nodeOnB === edge.nodeOnB){
                flag = false;
            }
        });

        return flag;

    }

    public pairWiseNodes(){

        const pairwiseNodes: {'nodeOnA': Node, 'nodeOnB': Node, 'distOnPathA': number, 'distOnPathB': number }[] = [];

        for(let i = 0; i < this.pathA.nodes.length; i++){
            for(let j = 0; j < this.pathB.nodes.length; j++){

                pairwiseNodes.push( { 'nodeOnA': this.pathA.nodes[i], 'nodeOnB': this.pathB.nodes[j], 'distOnPathA': this.pathA.distanceOnPath(i) , 'distOnPathB': this.pathB.distanceOnPath(j)} );

            }  
        }

        return pairwiseNodes;

    }


    public getPaths(){

        const paths = [];

        for(let i = 0; i < this.pathA.nodes.length - 1; i++){
            for(let j = 0; j < this.pathB.nodes.length - 1; j++){
                
                if( Geometry.euclideanDistance( this.pathA.nodes[i], this.pathB.nodes[j] ) <=  this.currentFrechetDistance && Geometry.euclideanDistance( this.pathA.nodes[i+1], this.pathB.nodes[j] ) <=  this.currentFrechetDistance ){
                    const currentOBJ = {
                        startX: this.pathA.distanceOnPath(i),
                        startY: this.pathB.distanceOnPath(j),
                        endX: this.pathA.distanceOnPath(i+1),
                        endY: this.pathB.distanceOnPath(j)
                    }

                    paths.push(currentOBJ);
                }

                if( Geometry.euclideanDistance( this.pathA.nodes[i], this.pathB.nodes[j] ) <=  this.currentFrechetDistance && Geometry.euclideanDistance( this.pathA.nodes[i+1], this.pathB.nodes[j+1] ) <=  this.currentFrechetDistance ){
                    const currentOBJ = {
                        startX: this.pathA.distanceOnPath(i),
                        startY: this.pathB.distanceOnPath(j),
                        endX: this.pathA.distanceOnPath(i+1),
                        endY: this.pathB.distanceOnPath(j+1)
                    }

                    paths.push(currentOBJ);
                }

                if( Geometry.euclideanDistance( this.pathA.nodes[i], this.pathB.nodes[j] ) <=  this.currentFrechetDistance && Geometry.euclideanDistance( this.pathA.nodes[i], this.pathB.nodes[j+1] ) <=  this.currentFrechetDistance ){
                    const currentOBJ = {
                        startX: this.pathA.distanceOnPath(i),
                        startY: this.pathB.distanceOnPath(j),
                        endX: this.pathA.distanceOnPath(i),
                        endY: this.pathB.distanceOnPath(j+1)
                    }

                    paths.push(currentOBJ);
                }



            }
        }

        return paths;
    }

    public distancesBetweenPathNodes(){

        const pathDict = {
            pathA: [],
            pathB: []
        };

        for(let i = 0; i < this.pathA.nodes.length - 1; i++){

            let currentDistA =  Geometry.euclideanDistance(this.pathA.nodes[i], this.pathA.nodes[i+1]);
            let currentDistB =  Geometry.euclideanDistance(this.pathB.nodes[i], this.pathB.nodes[i+1]);

            if(i > 0) {
                currentDistA = currentDistA + pathDict.pathA[i-1];
                currentDistB = currentDistB + pathDict.pathB[i-1];
            } 

            pathDict.pathA.push(currentDistA);
            pathDict.pathB.push(currentDistB);

        }

        return pathDict;


    }


    public calculateFrechetDistance(){
        
        const initializationMatrix: number [][] = Geometry.frechetDistancesMatrix(this.pathA.getLength(), this.pathB.getLength());
        const distance = Geometry.calculateFrechetDistance(initializationMatrix, this.pathA.getLength()-1, this.pathB.getLength()-1, this.pathA, this.pathB);
        this.currentFrechetDistance = distance;
        return distance;

    }

    public setDistanceEdges(nodeOnA: Node, nodeOnB: Node){

        this.distancesEdges = [{nodeOnA: nodeOnA, nodeOnB: nodeOnB}];

    }

    public clearDistanceEdges(){
        this.distancesEdges = [];
    }


}