// Bullet that is flying every step per pixel
import { BaseCSW } from './base/baseCsw';
import { BaseGameObject } from './base/baseGameObj';
import { CONST } from './const';
import { DelayedPic } from './delayedPic';
import { Direction, Who } from './types';

type NewXY = {
    [key in number]: number;
};

type DirectionObject = {
    vx: number;
    vy: number;
};

export class Bullet extends BaseGameObject {
    BULLETSPEED: number;
    parentShip!: BaseCSW;
    // drawingManagerInst: DrawingManager;

    constructor() {
        super();
        //this.BULLETSPEED = whoFire ? (whoFire.iam === CONST.USER ? 2.5 : 2.5) : 2.5;
        // this.BULLETSPEED = whoFire ? (whoFire.iam === CONST.USER ? 10 : 5) : 5;
        this.BULLETSPEED = 30; //100; // 30;
    }

    initBullet(
        nx: number,
        ny: number,
        nd: Direction,
        parentShip: BaseCSW,
    ): void {
        this.parentShip = parentShip;
        this.setCoords(nx, ny, nd);
    }

    setCoords(nx: number, ny: number, nd: Direction | DirectionObject): Bullet {
        const dims = this.parentShip.dimensions;
        const key = typeof nd === 'number' ? nd : 0;
        if (!dims) {
            return this;
        }
        const { width, height } = dims[key];
        let x = 0,
            y = 0;
        if (typeof nd === 'number') {
            switch (nd) {
                case 0: {
                    x = nx + width - 1;
                    y = ny + height / 2;
                    break;
                }
                case 1: {
                    x = nx + width / 2;
                    y = ny + height - 1;
                    break;
                }
                case 2: {
                    x = nx + 1;
                    y = ny + height / 2;
                    break;
                }
                case 3: {
                    x = nx + width / 2;
                    y = ny - 1;
                    break;
                }
                default:
                    break;
            }
        } else if (typeof nd === 'object' && nd != null) {
            const newX: NewXY = { 0: width / 2, 1: width, '-1': -1 };
            const newY: NewXY = { 0: height / 2, 1: height + 1, '-1': -1 };
            x = nx + newX[nd.vx];
            y = ny + newY[nd.vy];
        }
        this.initCoords(x, y, nd as Direction);
        return this;
    }

    // TODO: create an image of bullet with transparent background
    draw(): void {
        if (this.parentShip.iam === CONST.USER) {
            this.drawingManagerInst.drawPlayerBullet(this.x, this.y);
        } else {
            this.drawingManagerInst.drawCPUBullet(this.x, this.y);
        }
    }

    addCrash(): void {
        const delayedPic = <DelayedPic>(
            this.objectsFactoryInst.createCSW(
                this.x - 20,
                this.y - 20,
                Who.COMPUTER,
                CONST.TYPES.DELAYED_PIC,
            )
        );
        this.BTankInst.delayedPics.push(delayedPic);
    }

    fly(): void {
        const nvxy = typeof this.d === 'number' ? this.getVXY(this.d) : this.d;
        const totalVx = nvxy.vx * this.BULLETSPEED;
        const totalVy = nvxy.vy * this.BULLETSPEED;

        const maxStep = 10;
        const travel = Math.hypot(totalVx, totalVy);
        const numSteps = Math.max(1, Math.ceil(travel / maxStep));
        const stepX = totalVx / numSteps;
        const stepY = totalVy / numSteps;

        for (let s = 0; s < numSteps; s++) {
            const nx = this.x + stepX;
            const ny = this.y + stepY;

            if (
                nx > CONST.MAXX * CONST.CELLSIZES.MAXX ||
                nx < 0 ||
                ny > CONST.MAXY * CONST.CELLSIZES.MAXY ||
                ny < 0
            ) {
                this.BTankInst.removeBullet(this);
                this.addCrash();
                return;
            }

            const collidedBullet = this.BTankInst.getBulletWithPixelPrecision(
                nx,
                ny,
                this.parentShip,
                this,
            );
            if (collidedBullet) {
                this.BTankInst.removeBullet(this);
                this.BTankInst.removeBullet(collidedBullet);
                return;
            }

            const collidedShips = this.BTankInst.getCSWWithPixelPrecision(
                nx,
                ny,
                this.parentShip,
            );
            if (collidedShips) {
                this.x = nx;
                this.y = ny;
                if (collidedShips.hitByBullet) {
                    collidedShips.hitByBullet(this);
                    this.addCrash();
                }
                this.BTankInst.removeBullet(this);
                return;
            }

            this.x = nx;
            this.y = ny;
        }
    }
}
