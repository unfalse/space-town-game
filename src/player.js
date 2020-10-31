import { BaseCSW } from './baseCsw';
import { CONST } from './const';
// import { Bullet } from './bullet';

export const Player = class extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.USER;
        this.PLAYER_BULLETS_INTERVAL = 700;
    }

    // TODO: move BTankInst to a constructor
    init(mx, my, who, BTankInst) {
        super.init(mx, my, who, BTankInst);
        this.maxlife = 10000;
        this.life = this.maxlife;
    }

    addAccel(value) {
        this.accel += value;
    }

    draw(ghost) {
        if (ghost) {
            this.BTankInst.drawcswmt9ghost(
                this.x,
                this.y,
                this.d
            );
        } else {
            this.BTankInst.drawcswmt9(
                this.CONST.CAM.CENTERX,
                this.CONST.CAM.CENTERY,
                this.d
            );
        }
    }

    fire(timestamp) {
        if (
            timestamp - this.lastBulletTimeStamp >=
            this.PLAYER_BULLETS_INTERVAL
        ) {
            this.lastBulletTimeStamp = timestamp;
            this.createNewBullet(this.x, this.y, this.d, this);
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
    setDirectionAndAddAccel(d, accel) {
        this.d = d;

        if (this.inertiaDirections[this.CONST.DIR_OPPOSITES[d]] > 0) {
            this.inertiaDirections[this.CONST.DIR_OPPOSITES[d]] -= accel;
            if (this.inertiaDirections[this.CONST.DIR_OPPOSITES[d]] < 0) {
                this.inertiaDirections[this.CONST.DIR_OPPOSITES[d]] = 0;
            }
        } else {
            if (this.inertiaDirections[d] + accel > this.MAXIMUM_ACCELERATION) {
                return;
            }
            this.inertiaDirections[d] += accel;
        }
    }

    hitByBullet(bulletInstance) {
        if (bulletInstance.parentShip.iam === this.CONST.COMPUTER) {
            if (this.iam === this.CONST.USER) {
                this.life--;
            }
        }
    }
};
