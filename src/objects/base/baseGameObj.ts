import { BTankManager } from '../../btank.js';
import { DrawingManager } from '../../drawingMan.js';
import { ObjectsFactory } from '../../objFactory.js';
import { Direction } from '../../types.js';
import { BaseCoordinates } from './baseCoord.js';

console.log('BaseGameObject!');

export class BaseGameObject extends BaseCoordinates {
    BTankInst!: BTankManager;
    drawingManagerInst!: DrawingManager;
    objectsFactoryInst!: ObjectsFactory;

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
