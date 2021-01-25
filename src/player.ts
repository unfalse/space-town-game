import { BaseCSW } from './base/baseCsw';
import { Bullet } from './bullet';
import { CONST } from './const';
import { IPlayer } from './interfaces';
import { Direction, Who } from './types';

export class Player extends BaseCSW implements IPlayer {
    PLAYER_BULLETS_INTERVAL: number;
    accel: number;
    stopAccel: boolean;

    constructor() {
        super();
        this.type = CONST.USER;
        this.PLAYER_BULLETS_INTERVAL = 700;
    }

    childInit(): void {
        this.maxlife = 10000;
        this.life = this.maxlife;
    }

    addAccel(value: number): void {
        this.accel += value;
    }

    draw(ghost?: boolean) {
        if (ghost) {
            this.drawingManagerInst.drawcswmt9ghost(
                this.x,
                this.y,
                this.d
            );
        } else {
            this.drawingManagerInst.drawcswmt9(
                CONST.CAM.CENTERX,
                CONST.CAM.CENTERY,
                this.d
            );
        }
    }

    fire(timestamp: number) {
        if (
            timestamp - this.lastBulletTimeStamp >=
            this.PLAYER_BULLETS_INTERVAL
        ) {
            this.lastBulletTimeStamp = timestamp;
            this.createNewBullet(this.x, this.y, this.d, Who.USER);
            // this.createNewBullet(this.x, this.y, { vx: 1, vy: 0 }, this);
            // this.createNewBullet(this.x, this.y, { vx: 0, vy: 1 }, this);
            // this.createNewBullet(this.x, this.y, { vx: -1, vy: 0 }, this);
            // this.createNewBullet(this.x, this.y, { vx: 0, vy: -1 }, this);

            // this.createNewBullet(this.x, this.y, { vx: 1, vy: 1 }, this);
            // this.createNewBullet(this.x, this.y, { vx: 1, vy: -1 }, this);
            // this.createNewBullet(this.x, this.y, { vx: -1, vy: 1 }, this);
            // this.createNewBullet(this.x, this.y, { vx: -1, vy: -1 }, this);
        }
    }

    // TODO: maybe move acceleration, direction and inertia control functions into the separate class
    setDirectionAndAddAccel(d: Direction, accel: number) {
        this.d = d;

        // TODO: not sure if it's a right place to change inertia directions
        if (this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] > 0) {
            this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] -= accel;
            if (this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] < 0) {
                this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] = 0;
            }
        } else {
            if (this.inertiaDirections[d] + accel > this.MAXIMUM_ACCELERATION) {
                return;
            }
            this.inertiaDirections[d] += accel;
        }
    }

    hitByBullet(bulletInstance: Bullet) {
        if (bulletInstance.parentShip.iam === CONST.COMPUTER) {
            if (this.iam === CONST.USER) {
                this.life--;
            }
        }
    }
}
