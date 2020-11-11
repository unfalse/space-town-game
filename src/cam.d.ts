import { BaseCoordinates } from './baseCoord';
export declare class Camera extends BaseCoordinates {
    BTankInst: any;
    constructor(BTankInst: any);
    setCoords(x: number, y: number): void;
    getRelCoords(x: number, y: number): {
        x: number;
        y: number;
    };
}
