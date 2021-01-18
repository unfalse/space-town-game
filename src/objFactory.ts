import { BaseCSW } from "./base/baseCsw";
import { BTankManager } from "./btank";
import { CONST } from "./const";
import { Counter } from "./counter";
import { Border, CSWAI_customPaths, Obstacle, SpaceBrick, StaticShip } from "./cswai";
import { DrawingManager } from "./drawingMan";
import { Player } from "./player";
import { ObjectType, Who, WayPoints } from "./types";

type FactoryTypes = Player | CSWAI_customPaths | Obstacle | SpaceBrick | CSWAI_customPaths | Border | StaticShip;

type CreateCSWParameters = {
    x: number,
    y: number,
    who: Who, // TODO: this field should be in ship class (csw or cswai or obstacle)
    typeParam?: ObjectType,
    ghost?: boolean,
    wayPoints?: WayPoints[]
};

const ObjectTypeToClass = {
    [ObjectType.SHIP]: CSWAI_customPaths,
    [ObjectType.OBSTACLE]: Obstacle,
    [ObjectType.SPACEBRICK]: SpaceBrick,
    [ObjectType.COUNTER]: Counter
}

export class ObjectsFactory {
    drawingManagerInst: DrawingManager;
    bTankManagerInst: BTankManager;

    constructor(drawingManagerInst: DrawingManager, bTankInst: BTankManager) {
        this.drawingManagerInst = drawingManagerInst;
        this.bTankManagerInst = bTankInst;
    }

    // TODO: is it good that BTankManager knows which fields CSW class contains ?
    createCSW(
        x: number,
        y: number,
        who: Who, // TODO: this field should be in ship class (csw or cswai or obstacle)
        typeParam?: ObjectType,
        ghost?: boolean,
        wayPoints?: WayPoints[]
    ): FactoryTypes {
        let c1 = null;
        const type = typeParam || ObjectType.SHIP;
        if (who === CONST.USER) {
            c1 = new Player();
            // this.playerInstance = c1;
            this.initNewObject(c1, x, y, who);
            c1.setGhost(ghost);
            return c1;
        } else if (who === CONST.COMPUTER) {
            // TODO: make delayed parameter as a field in class so BTankManager should decide from this field how to create new instance
            // this code should be extendable
            // TODO: implement some pattern to not write thousands if-s
            if (type === ObjectType.SHIP) {
                c1 = new CSWAI_customPaths();
                this.initNewObject(c1, x, y, who);
                c1.setWaypoints(wayPoints);
                c1.setGhost(ghost);
                return c1;
            }

            if (type === ObjectType.STATICSHIP) {
                c1 = new StaticShip();
                this.initNewObject(c1, x, y, who);
                c1.setGhost(ghost);
                return c1;
            }

            if (type === ObjectType.OBSTACLE) {
                c1 = new Obstacle();
                this.initNewObject(c1, x, y, who);
                c1.setGhost(ghost);
                return c1;
            }

            if (type === ObjectType.SPACEBRICK) {
                c1 = new SpaceBrick();
                this.initNewObject(c1, x, y, who);
                c1.setGhost(ghost);
                return c1;
            }

            if (type === ObjectType.COUNTER) {
                c1 = new Counter();
                this.initNewObject(c1, x, y, who);
                c1.setGhost(ghost);
                return c1;
            }

            if (type == ObjectType.BORDER) {
                c1 = new Border();
                this.initNewObject(c1, x, y, who);
                c1.setGhost(ghost);
                return c1;
            }
        }
    }

    initNewObject(obj: BaseCSW, x: number, y: number, who: Who) {
        obj.init(x, y, who, this.drawingManagerInst, this.bTankManagerInst);
    }
}
