import { BaseCSW } from './base/baseCsw.js';
import { Bullet } from './bullet.js';
import { CONST } from '../const.js';
import { Direction, InertiaDirections, Who } from '../types.js';

const MAX_LIFE = 5;
const MAX_LIVES = 3;
const RESPAWN_INVINCIBILITY_MS = 2000;

type InertiaBuffer = {
    direction: Direction;
    accel: number;
};

class Player extends BaseCSW {
    PLAYER_BULLETS_INTERVAL: number;
    isHidden: boolean;
    isImmortal: boolean;
    inertiaBuffer: InertiaBuffer[];
    declare inertiaDirections: InertiaDirections;
    lives: number;
    spawnX: number;
    spawnY: number;
    private respawnTime: number;

    constructor() {
        super();
        this.PLAYER_BULLETS_INTERVAL = 1400;
        this.isHidden = false;
        this.isImmortal = false;
        this.inertiaBuffer = [];
        this.lives = MAX_LIVES;
        this.spawnX = 0;
        this.spawnY = 0;
        this.respawnTime = -1;
        this.MAXIMUM_ACCELERATION = 1.5;
    }

    childInit(): void {
        this.maxlife = MAX_LIFE;
        this.life = this.maxlife;
    }

    setSpawn(x: number, y: number): void {
        this.spawnX = x;
        this.spawnY = y;
    }

    respawn(timestamp: number): void {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.life = MAX_LIFE;
        this.stop();
        this.isImmortal = true;
        this.respawnTime = timestamp + RESPAWN_INVINCIBILITY_MS;
    }

    update(timestamp: number): void {
        if (
            this.isImmortal &&
            this.respawnTime > 0 &&
            timestamp >= this.respawnTime
        ) {
            this.isImmortal = false;
            this.respawnTime = -1;
        }
        this.move();
    }

    draw(ghost?: boolean): void {
        if (ghost) {
            this.drawingManagerInst.drawcswmt9ghost(this.x, this.y, this.d);
        } else {
            this.drawingManagerInst.drawcswmt9(
                CONST.CAM.CENTERX,
                CONST.CAM.CENTERY,
                this.d,
            );
        }
    }

    fire(timestamp: number): void {
        if (
            timestamp - this.lastBulletTimeStamp >=
            this.PLAYER_BULLETS_INTERVAL
        ) {
            this.lastBulletTimeStamp = timestamp;
            this.createNewBullet(this.x, this.y, this.d, Who.USER);
        }
    }

    // TODO: maybe move acceleration, direction and inertia control functions into the separate class
    setDirectionAndAddAccel(d: Direction, accel: number): void {
        this.d = d;

        // TODO: not sure if it's a right place to change inertia directions
        if (this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] > 0) {
            this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] -=
                accel;
            if (
                this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] < 0
            ) {
                this.inertiaDirections[CONST.DIR_OPPOSITES[d] as Direction] = 0;
            }
        } else {
            if (this.inertiaDirections[d] + accel > this.MAXIMUM_ACCELERATION) {
                return;
            }
            this.inertiaDirections[d] += accel;
        }
    }

    hitByBullet(bulletInstance: Bullet): void {
        if (this.isImmortal) return;
        if (bulletInstance.parentShip.iam === CONST.COMPUTER) {
            if (this.iam === CONST.USER) {
                this.life--;
            }
        }
    }
}

export { Player };
