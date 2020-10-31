import { BaseCSW } from './baseCsw';

export const BaseCPU = class extends BaseCSW {
    constructor() {
        super();
        this.type = this.CONST.COMPUTER;
        this.CPU_BULLETS_INTERVAL = 700;
    }

    fire(timestamp) {
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

    hitByBullet(bulletInstance) {
        //if (bulletInstance.parentShip.iam === this.CONST.USER) {
        //    if (this.iam === this.CONST.COMPUTER) {
                this.life--;
        //    }
        // }
    }

    // distance is an amount of cells in 4 directions from the ship which is scanning
    plusShapedScan(distance) {
        const player = this.BTankInst.playerInstance;
        if (player.life <= 0) return -1;
        const { width, height } = this.dimensions[this.d];
        distance *= this.CONST.CELLSIZES.MAXX;
        if (
            player.x >= this.x - distance &&
            player.x <= this.x &&
            player.y >= this.y &&
            player.y <= this.y + height
        )
            return this.CONST.LEFT;
        if (
            player.x >= this.x + width &&
            player.x <= this.x + width + distance &&
            player.y >= this.y &&
            player.y <= this.y + height
        )
            return this.CONST.RIGHT;
        if (
            player.y >= this.y - distance &&
            player.y <= this.y &&
            player.x >= this.x &&
            player.x <= this.x + width
        )
            return this.CONST.UP;
        if (
            player.y >= this.y + height &&
            player.y <= this.y + height + distance &&
            player.x >= this.x &&
            player.x <= this.x + width
        )
            return this.CONST.DOWN;
        return -1;
    }
};
