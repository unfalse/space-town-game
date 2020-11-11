import { BaseCoordinates } from './baseCoord';
import { Direction, Who } from './types';
declare type DirectionObject = {
    vx: number;
    vy: number;
};
export declare class Bullet extends BaseCoordinates {
    BULLETSPEED: number;
    BTankInst: any;
    parentShip: any;
    constructor(BTankInst: any, whoFire: Who);
    init(nx: number, ny: number, nd: Direction, parentShip: any): void;
    setCoords(nx: number, ny: number, nd: Direction | DirectionObject): this;
    draw(): void;
    fly(): void;
}
export {};
