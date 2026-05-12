import { CONST } from "../const";
import { BaseCSW } from "./base/baseCsw";

class Obstacle extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.OBSTACLE;
    }

    childInit(): void {
        this.addThisObjectToStaticGrid(this.x, this.y);
    }

    draw(): void {
        this.drawingManagerInst.drawObstacle(this.x, this.y);
    }
}

export { Obstacle };