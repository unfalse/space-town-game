import { BaseCSW } from './baseCsw.js';
import { CONST } from '../../const.js';
import { Direction, PathUnit } from '../../types.js';

export class BaseCPU extends BaseCSW {
    CPU_BULLETS_INTERVAL: number;
    fireStartTime: number;
    pathStartTime: number;
    pathUnit: PathUnit | null = null;
    pathsPresets: PathUnit[];
    x = 0;
    y = 0;

    constructor() {
        super();
        this.type = CONST.COMPUTER;
        this.CPU_BULLETS_INTERVAL = 1400;
        this.fireStartTime = -1;
        this.pathStartTime = -1;
        this.pathsPresets = [];
    }

    followPath(timestamp: number): void {
        if (
            this.pathUnit &&
            timestamp - this.pathStartTime <= this.pathUnit.ms
        ) {
            this.setDirectionAndAccel(this.pathUnit.d, this.pathUnit.accel);
        } else {
            do {
                this.pathUnit = this.AI_generateNewPath();
                if (this.pathUnit.ms === 0) {
                    this.setDirectionAndAccel(
                        this.pathUnit.d,
                        this.pathUnit.accel,
                    );
                }
            } while (this.pathUnit.ms === 0);
            this.pathStartTime = timestamp;
        }
    }

    AI_generateNewPath(): PathUnit {
        return this.pathsPresets[0] ?? { d: 0 as Direction, accel: 0, ms: 0 };
    }

    fire(timestamp: number): void {
        if (this.fireStartTime === -1 || this.fireStartTime === undefined) {
            this.fireStartTime = timestamp;
        }
        if (timestamp - this.fireStartTime >= this.CPU_BULLETS_INTERVAL) {
            this.fireStartTime = timestamp;
            this.createNewBullet(this.x, this.y, this.d);
        }
    }

    draw(): void {
        this.drawingManagerInst.drawcswmt5(this.x, this.y, this.d);
    }

    hitByBullet(): void {
        this.life--;
    }

    // distance is an amount of cells in 4 directions from the ship which is scanning
    plusShapedScan(distance: number): Direction | null {
        const player = this.BTankInst.playerInstance;
        if (!player || player.life <= 0 || !this.dimensions) return null;
        const { width, height } = this.dimensions[this.d];
        distance *= CONST.CELLSIZES.MAXX;
        if (
            player.x >= this.x - distance &&
            player.x <= this.x &&
            player.y >= this.y &&
            player.y <= this.y + height
        )
            return CONST.DIRECTIONS.LEFT as Direction;
        if (
            player.x >= this.x + width &&
            player.x <= this.x + width + distance &&
            player.y >= this.y &&
            player.y <= this.y + height
        )
            return CONST.DIRECTIONS.RIGHT as Direction;
        if (
            player.y >= this.y - distance &&
            player.y <= this.y &&
            player.x >= this.x &&
            player.x <= this.x + width
        )
            return CONST.DIRECTIONS.UP as Direction;
        if (
            player.y >= this.y + height &&
            player.y <= this.y + height + distance &&
            player.x >= this.x &&
            player.x <= this.x + width
        )
            return CONST.DIRECTIONS.DOWN as Direction;
        return -1;
    }
}
