import { BTankManager } from '../btank';
import { DrawingManager } from '../drawingMan';
import { ObjectsFactory } from '../objFactory';
// import { IObjectsFactory } from "../interfaces";
import { Direction } from '../types';
import { BaseCoordinates } from './baseCoord';

console.log('BaseGameObject!');

export class BaseGameObject extends BaseCoordinates {
    BTankInst: BTankManager;
    drawingManagerInst: DrawingManager;
    objectsFactoryInst: ObjectsFactory;

    constructor() {
        super();
    }

    init(
        mx: number,
        my: number,
        d: Direction,
        drawingManagerInst: DrawingManager,
        BTankInst: BTankManager,
        objectsFactoryInst: ObjectsFactory,
    ): void {
        super.initCoords(mx, my, d);
        this.BTankInst = BTankInst;
        this.drawingManagerInst = drawingManagerInst;
        this.objectsFactoryInst = objectsFactoryInst;
    }
}
