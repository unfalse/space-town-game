// Bullet that is flying every step per pixel
import { BaseCSW } from './base/baseCsw';
import { BaseGameObject } from './base/baseGameObj';
import { BTankManager } from './btank';
import { CONST } from './const';
import { DelayedPic } from './delayedPic';
import { DrawingManager } from './drawingMan';
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
    BTankInst: BTankManager;
    parentShip: BaseCSW;
    // drawingManagerInst: DrawingManager;

    constructor() {
        super();
        //this.BULLETSPEED = whoFire ? (whoFire.type === CONST.USER ? 2.5 : 2.5) : 2.5;
        // this.BULLETSPEED = whoFire ? (whoFire.type === CONST.USER ? 10 : 5) : 5;
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
        const { width, height } = this.parentShip.dimensions[
            typeof nd === 'number' ? nd : 0
        ];
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
        const vx = nvxy.vx * this.BULLETSPEED;
        const vy = nvxy.vy * this.BULLETSPEED;

        this.draw();

        const collidedShips = this.BTankInst.getCSWWithPixelPrecision(
            this.x,
            this.y,
            this.parentShip,
        ) as BaseCSW;
        const collidedBullet = this.BTankInst.getBulletWithPixelPrecision(
            this.x,
            this.y,
            this.parentShip,
            this,
        );
        if (collidedBullet) {
            // console.log('bullets collided!');
            this.BTankInst.removeBullet(this);
            this.BTankInst.removeBullet(collidedBullet);
            return;
        }

        // a bullet can't hurt its master!
        if (collidedShips) {
            if (collidedShips.hitByBullet) {
                collidedShips.hitByBullet(this);
                // this.BTankInst.createDelayedPic(this.x - 20, this.y - 20);
                this.addCrash();
            }
            this.BTankInst.removeBullet(this);
            return;
        }

        // TODO: добавить поле MaxSpeed в класс bullet и использовать
        // вместо MAXSPEED. Переименовать в StepsToGo
        // Поле speed переименовать в steps

        if (this.x > CONST.MAXX * CONST.CELLSIZES.MAXX || this.x < 0) {
            this.BTankInst.removeBullet(this);
            this.addCrash();
            // this.BTankInst.createDelayedPic(this.x - 10, this.y - 10);
            return;
        }

        if (this.y > CONST.MAXY * CONST.CELLSIZES.MAXY || this.y < 0) {
            this.BTankInst.removeBullet(this);
            this.addCrash();
            // this.BTankInst.createDelayedPic(this.x - 10, this.y - 10);
            return;
        }

        this.x = this.x + vx;
        this.y = this.y + vy;
    }
}
