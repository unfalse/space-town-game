import { BaseCPU } from './base/baseCpu';
import { BaseCSW } from './base/baseCsw';
import { Bullet } from './bullet';
import { CONST } from '../const';
import { Direction, PathUnit, WayPoints } from '../types';
import { Utils } from '../utils';

// TODO: unused class, analyze and delete if not needed
class CSWAI_0 extends BaseCPU {
    pathPresetCount: number;

    constructor() {
        super();
        this.pathUnit = null;
        this.pathStartTime = -1;
        this.fireStartTime = -1;

        this.pathPresetCount = 0;
        // direction {
        //   >  0 - right
        //   v  1 - down
        //   <  2 - left
        //   ^  3 - up
        // TODO: add the persistent speed?
        const right = 0;
        const down = 1;
        const left = 2;
        const up = 3;
        const STOP = 0;
        const go = (d: Direction, accel: number, ms: number): PathUnit => ({
            d,
            accel,
            ms,
        });
        const gpStop = (): Array<PathUnit> => [
            go(left, 0, STOP),
            go(right, 0, STOP),
            go(up, 0, STOP),
            go(down, 0, STOP),
        ];

        this.pathsPresets = [
            go(left, 1, 1000),
            go(up, 1, 1000),
            ...gpStop(),

            go(left, 1, 1000),
            go(down, 1, 1000),
            ...gpStop(),

            go(down, 1, 1000),
            ...gpStop(),

            go(left, 1, 1000),
            go(up, 1, 1000),
            ...gpStop(),

            go(right, 1, 0),
            go(up, 1, 1000),
            ...gpStop(),

            go(right, 1, 1000),
            go(down, 1, 1000),
            ...gpStop(),

            go(down, 1, 1000),
            ...gpStop(),

            go(right, 1, 1000),
            go(up, 1, 1000),
            ...gpStop(),
        ];
    }

    AI_generateNewPath(): PathUnit {
        if (this.pathPresetCount > this.pathsPresets.length - 1) {
            this.pathPresetCount = 0;
        }
        const pathUnit = this.pathsPresets[this.pathPresetCount];
        this.pathPresetCount++;
        return pathUnit;
    }

    AI_update(timestamp: number): void {
        super.followPath(timestamp);
        super.fire(timestamp);
    }
}

// TODO: unused class, analyze and delete if not needed
class CSWAI_1 extends BaseCPU {
    fireLastTime: number;
    newFireTime: number;
    disableAI: boolean;
    msCount: number;
    msArray: number[];
    accels: number[];
    dirs: number[];

    constructor() {
        super();
        this.pathUnit = null; // { d: 0, accel: 0, ms: 0 };
        this.pathStartTime = -1;
        this.fireStartTime = -1;
        this.fireLastTime = -1;
        this.newFireTime = -1;
        this.disableAI = false;
        this.msCount = 0;
        this.msArray = [];
        this.accels = [];
        this.dirs = [];
        this.type = CONST.TYPES.SHIP;
        // d: 0...3, a: 0...1, ms: (0...1) *1000
    }

    childInit(): void {
        this.msCount = 0;
        this.msArray = [1000, 1200, 2000, 5000];
        this.accels = [6, 6, 4, 4, 4, 5, 5, 4, 4, 5, 5, 5, 6, 4, 4, 5, 5];
        this.dirs = [3, 0, 2, 1];
    }

    AI_generateNewPath(): PathUnit {
        return {
            d: this.dirs[Utils.getRandomInt(0, this.dirs.length - 1)] as Direction,
            accel: this.accels[Utils.getRandomInt(0, this.accels.length - 1)],
            ms: this.msArray[Utils.getRandomInt(0, this.msArray.length - 1)],
        };
    }

    AI_generateNewFireTime(): number {
        return Utils.getRandomInt(1, 30) * 100;
    }

    update(timestamp: number): void {
        if (this.life > 0 && !this.disableAI) {
            this.followPath(timestamp);

            if (this.newFireTime < 0) {
                this.newFireTime = this.AI_generateNewFireTime();
                this.fireLastTime = timestamp;
            }
            if (this.newFireTime > 0 && timestamp - this.fireLastTime >= this.newFireTime) {
                this.fire(timestamp);
                this.newFireTime = this.AI_generateNewFireTime();
                this.fireLastTime = timestamp;
            }
        }

        super.update(timestamp);
    }
}

class CSWAI_customPaths extends BaseCPU {
    wpCounter: number;
    wpStartTime: number;
    currentWp: WayPoints | null;
    wayPoints: WayPoints[];

    constructor() {
        super();
        this.type = CONST.TYPES.SHIP;
        this.wpCounter = -1;
        this.wpStartTime = -1;
        this.currentWp = null;
        this.wayPoints = [];
        // this.d = 0;
    }

    childInit(): void {
    }

    setWaypoints(wayPoints?: WayPoints[]): void {
        this.wayPoints = wayPoints || [];
    }

    update(timestamp: number): void {
        let currentWp = this.currentWp;
        const accel = 2;
        let d = -1;

        if (this.wayPoints.length !== 0) {
            if (
                !currentWp ||
                (this.x === currentWp[0] && this.y === currentWp[1])
            ) {
                this.wpCounter++;
                if (this.wpCounter === this.wayPoints.length)
                    this.wpCounter = 0;
                this.currentWp = this.wayPoints[this.wpCounter];
                currentWp = this.currentWp;
            }
            const x = Math.floor(this.x);
            const y = Math.floor(this.y);
            if (x === currentWp[0] && y < currentWp[1]) {
                // to make corrections if player moved thip ship (not working!)
                d = CONST.DIRECTIONS.DOWN;
            }
            if (x > currentWp[0] && y === currentWp[1]) {
                d = CONST.DIRECTIONS.LEFT;
            }
            if (x === currentWp[0] && y > currentWp[1]) {
                d = CONST.DIRECTIONS.UP;
            }
            if (x < currentWp[0] && y === currentWp[1]) {
                d = CONST.DIRECTIONS.RIGHT;
            }
        }

        const scanResult: Direction | null = this.BTankInst.playerInstance.isHidden
            ? -1
            : this.plusShapedScan(10);
        if (scanResult !== null && scanResult > -1) {
            this.stop();
            this.setDirectionAndAccel(scanResult, 0);
            this.fire(timestamp);
        } else {
            if (this.d != d) {
                this.stop();
            }
            this.d = (d >= 0 ? d : this.d) as Direction;
            this.setDirectionAndAccel(this.d, accel);
        }

        super.update(timestamp);
    }
}

export {
    CSWAI_0,
    CSWAI_1,
    CSWAI_customPaths,
};
