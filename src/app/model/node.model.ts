export class Node {

    public cartesianX: number = 0;
    public cartesianY: number = 0;

    constructor(public screenX: number, public screenY: number, public divHeight: number){

        this.cartesianX = screenX;
        this.cartesianY = this.divHeight - screenY;

    }


    setNewCoordinates(screenX: number, screenY: number){

        this.screenX = screenX;
        this.screenY = screenY;
        this.cartesianX = screenX;
        this.cartesianY = this.divHeight - screenY;

    }



}