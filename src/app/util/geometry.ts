import { Node } from '../model/node.model';
import { Path } from '../model/path.model';

export class Geometry {

    public tWalk: any [] = [];

    public static euclideanDistance(a: Node, b: Node){

        const xDiff = Math.pow( (b.cartesianX - a.cartesianX) , 2);
        const yDiff = Math.pow( (b.cartesianY - a.cartesianY) , 2);

        return Math.sqrt(  xDiff + yDiff );


    }

    public static calculateFrechetDistance( distanceMatrix: number[][], aIndex: number, bIndex: number, pathA: Path, pathB: Path){

        if(distanceMatrix[aIndex][bIndex] > -1){
            return distanceMatrix[aIndex][bIndex];
        }else if(aIndex == 0 && bIndex == 0){
            distanceMatrix[aIndex][bIndex] =  this.euclideanDistance(pathA.nodes[aIndex], pathB.nodes[bIndex]) 
        }else if(aIndex > 0 && bIndex == 0){
            distanceMatrix[aIndex][bIndex] =  Math.max(  Geometry.calculateFrechetDistance(distanceMatrix, aIndex - 1, bIndex, pathA, pathB) , this.euclideanDistance(pathA.nodes[aIndex], pathB.nodes[bIndex] ));
        }else if(aIndex == 0 && bIndex > 0){
            distanceMatrix[aIndex][bIndex] =  Math.max(  Geometry.calculateFrechetDistance(distanceMatrix, aIndex, bIndex - 1, pathA, pathB) , this.euclideanDistance(pathA.nodes[aIndex], pathB.nodes[bIndex] ));
        }else if(aIndex > 0 && bIndex > 0){
            distanceMatrix[aIndex][bIndex] = Math.max( 
                
                Math.min( 
                    Geometry.calculateFrechetDistance(distanceMatrix, aIndex - 1, bIndex, pathA, pathB),
                    Geometry.calculateFrechetDistance(distanceMatrix, aIndex - 1, bIndex - 1, pathA, pathB),
                    Geometry.calculateFrechetDistance(distanceMatrix, aIndex, bIndex - 1, pathA, pathB)
                ), 

                this.euclideanDistance(pathA.nodes[aIndex], pathB.nodes[bIndex] )

            )
        }
        else {
            distanceMatrix[aIndex][bIndex] = Math.pow(10, 10000);
        }
        
        return distanceMatrix[aIndex][bIndex];


    }

    public static frechetDistancesMatrix(pathALen: number, pathBLen: number){

        const initialMatrix: number[][] = [];
        
        for(let i = 0; i < pathALen; i++){
            initialMatrix.push([]);
            for(let j = 0; j < pathBLen; j++){
                initialMatrix[i].push(-1);
            }
        }

        return initialMatrix;

    }


}