import { DrawingManager } from './drawingMan';
import { BTankManager } from './btank';
import { CONST } from './const';
import { ObjectType, Who, WayPoints, Direction } from './types';
import { EntityId } from './ecs/world';
import {
    createShip,
    createBullet as spawnBullet,
    createDelayedPic,
    createCounter,
} from './ecs/factory';

export class ObjectsFactory {
    drawingManagerInst: DrawingManager;
    bTankManagerInst: BTankManager;

    constructor(drawingManagerInst: DrawingManager, bTankInst: BTankManager) {
        this.drawingManagerInst = drawingManagerInst;
        this.bTankManagerInst = bTankInst;
    }

    createCSW(
        x: number,
        y: number,
        who: Who,
        typeParam?: ObjectType,
        _ghost?: boolean,
        wayPoints?: WayPoints[],
    ): EntityId {
        const type = typeParam ?? ObjectType.SHIP;

        if (type === ObjectType.DELAYED_PIC) {
            return createDelayedPic(x, y);
        }
        if (type === ObjectType.COUNTER && who !== CONST.USER) {
            return createCounter(x, y);
        }
        return createShip(x, y, who, type, this.drawingManagerInst, wayPoints);
    }

    createBullet(
        x: number,
        y: number,
        d: Direction,
        parentShip: EntityId,
        parentIam: Who,
    ): EntityId {
        return spawnBullet(x, y, d, parentShip, parentIam);
    }
}
