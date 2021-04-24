import { BaseCoordinates } from './base/baseCoord';
import { CONST } from './const';

export class Camera extends BaseCoordinates {
    constructor() {
        super();
    }

    setCoords(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    getRelCoords(x: number, y: number): { x: number; y: number } {
        return {
            x: Math.round(x - this.x + CONST.CAM.CENTERX),
            y: Math.round(y - this.y + CONST.CAM.CENTERY),
        };
    }
}
