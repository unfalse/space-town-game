import { BaseCPU } from './base/baseCpu';
import { BaseCSW } from './base/baseCsw';
import { Bullet } from './bullet';
import { CONST } from './const';
import { Direction, PathUnit, WayPoints } from './types';
import { Utils } from './utils';

class CSWAI_0 extends BaseCPU {
    pathPresetCount: number;

    constructor() {
        super();
        this.pathUnit = null; // { d: 0, accel: 0, ms: 0 };
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
        // const goLeftAndRight: Array<PathUnit> = [
        //     go(left, 1, 2000),
        //     ...gpStop(),

        //     go(right, 1, 2000),
        //     ...gpStop(),
        // ];

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
        // return {
        //     d: this.Utils.getRandomInt(0, 3),
        //     accel: this.Utils.getRandomInt(0, 5) / 10,
        //     ms: this.Utils.getRandomInt(0, 200),
        // };
    }

    AI_update(timestamp: number): void {
        if (
            this.pathUnit &&
            timestamp - this.pathStartTime <= this.pathUnit.ms
        ) {
            super.setDirectionAndAccel(this.pathUnit.d, this.pathUnit.accel);
        } else {
            do {
                this.pathUnit = this.AI_generateNewPath();
                if (this.pathUnit.ms === 0) {
                    super.setDirectionAndAccel(
                        this.pathUnit.d,
                        this.pathUnit.accel,
                    );
                }
            } while (this.pathUnit.ms === 0);
            this.pathStartTime = timestamp;
        }
        super.fire(timestamp);
    }
}

// TODO: make class BaseAI with fields path, pathStartTime etc.
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
        this.type = CONST.TYPES.SHIP;
        // d: 0...3, a: 0...1, ms: (0...1) *1000
    }

    childInit(): void {
        this.msCount = 0;
        this.msArray = [1000, 1200, 2000, 5000];
        this.accels = [6, 6, 4, 4, 4, 5, 5, 4, 4, 5, 5, 5, 6, 4, 4, 5, 5];
        this.dirs = [3, 0, 2, 1];
    }

    AI_generateNewPath(): { d: Direction; accel: number; ms: number } {
        // TODO: get numbers for ms from array [1000, 2500, 1200, 900, 2300, 5450, 3567, 4444]
        // this.msCount = this.msCount === this.msArray.length-1 ? 0 : (this.msCount + 1);
        return {
            // d: this.Utils.getRandomInt(0, 3),
            // accel: this.Utils.getRandomInt(0, 3),
            d: this.dirs[
                Utils.getRandomInt(0, this.dirs.length - 1)
            ] as Direction,
            accel: this.accels[Utils.getRandomInt(0, this.accels.length - 1)],
            ms: this.msArray[Utils.getRandomInt(0, this.msArray.length - 1)],
            // ms: this.Utils.getRandomInt(0, 6) * 1000
        };
    }

    AI_generateNewFireTime(): number {
        return Utils.getRandomInt(1, 30) * 100;
    }

    update(timestamp: number): void {
        if (this.life > 0 && !this.disableAI) {
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

        if (this.life > 0 && !this.disableAI) {
            if (this.newFireTime < 0) {
                this.newFireTime = this.AI_generateNewFireTime();
                this.fireLastTime = timestamp;
            }
            if (
                this.newFireTime > 0 &&
                timestamp - this.fireLastTime >= this.newFireTime
            ) {
                this.fire(timestamp);
                this.newFireTime = this.AI_generateNewFireTime();
                this.fireLastTime = timestamp;
            }
        }

        super.update(timestamp);

        // TODO: try to call the update of the parent prototype (CSW !)
        // this way i don't need to check if this.iam equals CONST.COMPUTER in csw.update anymore!!
        // this.__proto__.update.call(this, timestamp);
        // this.baseUpdate(timestamp);
    }
}

class CSWAI_customPaths extends BaseCPU {
    wpCounter: number;
    wpStartTime: number;
    currentWp: WayPoints;
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
        // const FIRST_PATH = [
        //     [80, 0],
        //     [80, 80],
        //     [0, 80],
        //     [0, 0],
        // ];
        return null;
    }

    setWaypoints(wayPoints?: WayPoints[]): void {
        this.wayPoints = wayPoints || [];
    }

    // stop() {
    //     this.setDirectionAndAccel(0, 0);
    //     this.setDirectionAndAccel(1, 0);
    //     this.setDirectionAndAccel(2, 0);
    //     this.setDirectionAndAccel(3, 0);
    // }

    update(timestamp: number): void {
        let currentWp = this.currentWp;
        const accel = 8;
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
                // accel = Math.abs(y - currentWp[1]) <= accel ? 1 : accel;
                d = CONST.DOWN;
            }
            if (x > currentWp[0] && y === currentWp[1]) {
                // accel = Math.abs(x - currentWp[0]) <= accel ? 1 : accel;
                d = CONST.LEFT;
            }
            if (x === currentWp[0] && y > currentWp[1]) {
                // accel = Math.abs(y - currentWp[1]) <= accel ? 1 : accel;
                d = CONST.UP;
            }
            if (x < currentWp[0] && y === currentWp[1]) {
                // accel = Math.abs(x - currentWp[0]) <= accel ? 1 : accel;
                d = CONST.RIGHT;
            }
        }

        const scanResult: Direction = this.BTankInst.playerInstance.isHidden
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

class Obstacle extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.OBSTACLE;
    }

    draw(): void {
        this.drawingManagerInst.drawObstacle(this.x, this.y);
    }
}

class Border extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.BORDER;
    }

    draw(): void {
        this.drawingManagerInst.drawBorder(this.x, this.y);
    }
}

class StaticShip extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.SHIP;
    }

    draw(): void {
        this.drawingManagerInst.drawStaticShip(this.x, this.y);
    }
}

class SpaceBrick extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.SPACEBRICK;
    }

    childInit(): void {
        this.life = 9;
    }

    draw(): void {
        this.drawingManagerInst.drawSpaceBrick(
            this.x,
            this.y,
            Math.floor((this.life > 0 ? this.life : 0) / 2),
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hitByBullet(bulletInstance: Bullet): void {
        this.life--;
    }
}

export {
    CSWAI_0,
    CSWAI_1,
    CSWAI_customPaths,
    Border,
    SpaceBrick,
    StaticShip,
    Obstacle,
};
