import { Node } from './node.model';
import * as _ from 'lodash';
import { Geometry } from '../util/geometry';

export class Path {

    public nodes: Node[] = [];

    constructor(public screenHeight: number, public screenWidth: number){

    }

    addNode(screenX: number, screenY: number) {

        const node: Node = new Node(screenX, screenY, this.screenHeight);
        this.nodes.push(node);

        console.log(node);

    }

    getNodes() {
        return this.nodes;
    }

    getLength(){
        return this.nodes.length;
    }


    getFormattedPath(): number[][]{

        const formattedPath: number[][] = [];
        _.forEach( this.nodes, node => {
            formattedPath.push( [node.cartesianX, node.cartesianY] );
        });

        return formattedPath;

    }


    distanceOnPath(nodeIndex: number){

        let distanceOnPath : number = 0;

        for(let i = nodeIndex; i > 0; i--){

            distanceOnPath += Geometry.euclideanDistance(this.nodes[i] , this.nodes[i-1])

        }

        return distanceOnPath;

    }


}
