import { CONST } from '../const';
import { Direction } from '../types';

export class BaseCoordinates {
    x: number;
    y: number;
    d: Direction;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.d = 0;
    }

    getVXY(d: Direction): { vx: number; vy: number } {
        // returns direction where to go
        return {
            vx: (-(d >> 1) | 1) * ((d & 1) ^ 1),
            vy: (-(d >> 1) | 1) * (d & 1 & 1),
        };
    }

    //   >  0 - right
    //   v  1 - down
    //   <  2 - left
    //   ^  3 - up
    // getVXYAndAngle(d: Direction) {
    //   const mapDirections = {
    //     0: { vx: 1, vy: 0, angle: 90 },
    //     1: { vx: 0, vy: 1, angle: 180 },
    //     2: { vx: -1, vy: 0, angle: 270 },
    //     3: { vx: 0, vy: -1, angle: 0 },
    //     '-1': { vx: 0, vy: 0, angle: 0 },
    //   };
    //   return mapDirections[d];
    // }

    initCoords(nx: number, ny: number, nd = CONST.UP as Direction): void {
        //x: 0, // x coordinate
        //y: 0, // y coordinate
        //d: 0,  // direction { 0 - right > , 1 - down v, 2 - left <, 3 - up ^ }
        this.x = nx;
        this.y = ny;
        this.d = nd;
    }
}
