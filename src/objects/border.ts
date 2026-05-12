import { CONST } from "../const";
import { BaseCSW } from "./base/baseCsw";

class Border extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.BORDER;
    }

    draw(): void {
        this.drawingManagerInst.drawBorder(this.x, this.y);
    }
}

export { Border };