import { BaseCSW } from './baseCsw';
import { Bullet } from '../bullet';
import { CONST } from '../const';
import { Direction, PathUnit } from '../types';

export const BaseCPU = class extends BaseCSW {
    CPU_BULLETS_INTERVAL: number;
    fireStartTime: number;
    pathUnit: PathUnit;
    pathStartTime: number;
    pathsPresets: PathUnit[];

    constructor() {
        super();
        this.type = CONST.COMPUTER;
        this.CPU_BULLETS_INTERVAL = 700;
        this.fireStartTime = -1;
        this.pathUnit = null;
        this.pathStartTime = -1;
    }

    fire(timestamp: number) {
        if (this.fireStartTime === -1 || this.fireStartTime === undefined) {
            this.fireStartTime = timestamp;
        }
        if (timestamp - this.fireStartTime >= this.CPU_BULLETS_INTERVAL) {
            this.fireStartTime = timestamp;
            this.createNewBullet(this.x, this.y, this.d);
        }
    }

    draw() {
        this.BTankInst.drawcswmt5(this.x, this.y, this.d);
    }

    hitByBullet(bulletInstance: Bullet) {
        //if (bulletInstance.parentShip.iam === this.CONST.USER) {
        //    if (this.iam === this.CONST.COMPUTER) {
                this.life--;
        //    }
        // }
    }

    // distance is an amount of cells in 4 directions from the ship which is scanning
    plusShapedScan(distance: number): Direction {
        const player = this.BTankInst.playerInstance;
        if (player.life <= 0) return null;
        const { width, height } = this.dimensions[this.d];
        distance *= CONST.CELLSIZES.MAXX;
        if (
            player.x >= this.x - distance &&
            player.x <= this.x &&
            player.y >= this.y &&
            player.y <= this.y + height
        )
            return CONST.LEFT as Direction;
        if (
            player.x >= this.x + width &&
            player.x <= this.x + width + distance &&
            player.y >= this.y &&
            player.y <= this.y + height
        )
            return CONST.RIGHT as Direction;
        if (
            player.y >= this.y - distance &&
            player.y <= this.y &&
            player.x >= this.x &&
            player.x <= this.x + width
        )
            return CONST.UP as Direction;
        if (
            player.y >= this.y + height &&
            player.y <= this.y + height + distance &&
            player.x >= this.x &&
            player.x <= this.x + width
        )
            return CONST.DOWN as Direction;
        return null;
    }
};
