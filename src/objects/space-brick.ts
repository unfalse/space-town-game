import { CONST } from "../const";
import { BaseCSW } from "./base/baseCsw";
import { Bullet } from "./bullet";

const SPACEBRICK_MAX_HITS = 10;

class SpaceBrick extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.SPACEBRICK;
    }

    childInit(): void {
        this.maxlife = SPACEBRICK_MAX_HITS;
        this.life = SPACEBRICK_MAX_HITS;
        this.addThisObjectToStaticGrid(this.x, this.y);
    }

    draw(): void {
        const rawFrame = Math.floor((this.life > 0 ? this.life : 0) / 2);
        const frame = Math.min(4, rawFrame);
        this.drawingManagerInst.drawSpaceBrick(this.x, this.y, frame);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hitByBullet(_bulletInstance: Bullet): void {
        this.life--;
        if (this.life <= 0) {
            this.removeSelfFromStaticGrid();
            this.BTankInst.removeShip(this);
        }
    }
}

export { SpaceBrick };
