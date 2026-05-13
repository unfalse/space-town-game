import { CONST } from '../../const.js';
import { Direction } from '../../types.js';

export type PointXY = {
    x: number;
    y: number;
}

export class BaseCoordinates {
    x: number;
    y: number;
    centerx: number;
    centery: number;
    d: Direction;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.d = 0;
        this.centerx = 0;
        this.centery = 0;
    }

    // returns direction where to go in x and y coordinates
    getVXY(d: Direction): { vx: number; vy: number } {
        return {
            vx: (-(d >> 1) | 1) * ((d & 1) ^ 1),
            vy: (-(d >> 1) | 1) * (d & 1 & 1),
        };
    }

    initCoords(
        nx: number,
        ny: number,
        nd = CONST.DIRECTIONS.UP as Direction,
    ): void {
        this.x = nx;
        this.y = ny;
        this.d = nd;
        this.centerx = nx;
        this.centery = ny;
    }
}
