import { CONST } from "../const";
import { BaseCSW } from "./base/baseCsw";

class StaticShip extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.SHIP;
        // this.BTankInst.staticCollisionGrid
    }

    draw(): void {
        this.drawingManagerInst.drawStaticShip(this.x, this.y);
    }
}

export { StaticShip };