import { BaseCPU } from './baseCpu';
import { BaseCSW } from './baseCsw';
import { CONST } from './const';

const CSWAI_0 = class extends BaseCPU {
    constructor() {
        super();
        this.path = null; // { d: 0, accel: 0, ms: 0 };
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
        const go = (d, accel, ms) => ({ d, accel, ms });
        const gpStop = () => [
            go(left, 0, STOP),
            go(right, 0, STOP),
            go(up, 0, STOP),
            go(down, 0, STOP),
        ];
        const goLeftAndRight = [
            go(left, 1, 2000),
            ...gpStop(),

            go(right, 1, 2000),
            ...gpStop(),
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

    AI_generateNewPath() {
        if (this.pathPresetCount > this.pathsPresets.length - 1) {
            this.pathPresetCount = 0;
        }
        const path = this.pathsPresets[this.pathPresetCount];
        this.pathPresetCount++;
        return path;
        // return {
        //     d: this.Utils.getRandomInt(0, 3),
        //     accel: this.Utils.getRandomInt(0, 5) / 10,
        //     ms: this.Utils.getRandomInt(0, 200),
        // };
    }

    AI_update(timestamp) {
        if (this.path && timestamp - this.pathStartTime <= this.path.ms) {
            this.setDirectionAndAccel(
                this.path.d,
                this.path.accel,
                this.path.ms
            );
        } else {
            do {
                this.path = this.AI_generateNewPath();
                if (this.path.ms === 0) {
                    this.setDirectionAndAccel(
                        this.path.d,
                        this.path.accel,
                        this.path.ms
                    );
                }
            } while (this.path.ms === 0);
            this.pathStartTime = timestamp;
        }
        this.fire(timestamp);
    }
};

const CSWAI_1 = class extends BaseCPU {
    constructor() {
        super();
        this.path = null; // { d: 0, accel: 0, ms: 0 };
        this.pathStartTime = -1;
        this.fireStartTime = -1;
        this.fireLastTime = -1;
        this.newFireTime = -1;
        this.disableAI = false;
        this.type = CONST.TYPES.SHIP;
        // d: 0...3, a: 0...1, ms: (0...1) *1000
    }

    init(mx, my, who, BTankInst) {
        super.init(mx, my, who, BTankInst);
        this.msCount = 0;
        this.msArray = [1000, 1200, 2000, 5000];
        this.accels = [6, 6, 4, 4, 4, 5, 5, 4, 4, 5, 5, 5, 6, 4, 4, 5, 5];
        this.dirs = [3, 0, 2, 1];
    }

    AI_generateNewPath() {
        // TODO: get numbers for ms from array [1000, 2500, 1200, 900, 2300, 5450, 3567, 4444]
        // this.msCount = this.msCount === this.msArray.length-1 ? 0 : (this.msCount + 1);
        return {
            // d: this.Utils.getRandomInt(0, 3),
            // accel: this.Utils.getRandomInt(0, 3),
            d: this.dirs[this.Utils.getRandomInt(0, this.dirs.length - 1)],
            accel: this.accels[
                this.Utils.getRandomInt(0, this.accels.length - 1)
            ],
            ms: this.msArray[
                this.Utils.getRandomInt(0, this.msArray.length - 1)
            ],
            // ms: this.Utils.getRandomInt(0, 6) * 1000
        };
    }

    AI_generateNewFireTime() {
        return this.Utils.getRandomInt(1, 30) * 100;
    }

    update(timestamp) {
        if (this.life > 0 && !this.disableAI) {
            if (this.path && timestamp - this.pathStartTime <= this.path.ms) {
                this.setDirectionAndAccel(
                    this.path.d,
                    this.path.accel,
                    this.path.ms
                );
            } else {
                do {
                    this.path = this.AI_generateNewPath();
                    if (this.path.ms === 0) {
                        this.setDirectionAndAccel(
                            this.path.d,
                            this.path.accel,
                            this.path.ms
                        );
                    }
                } while (this.path.ms === 0);
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
};

const CSWAI_customPaths = class extends BaseCPU {
    constructor() {
        super();
        this.type = CONST.TYPES.SHIP;
        this.wpCounter = -1;
        this.wpStartTime = -1;
        this.currentWp = null;
        this.wayPoints = [];
    }

    init(mx, my, who, BTankInst, wayPoints) {
        super.init(mx, my, who, BTankInst);
        const FIRST_PATH = [
            [80, 0],
            [80, 80],
            [0, 80],
            [0, 0],
        ];
        this.wayPoints = wayPoints || [];
    }

    // stop() {
    //     this.setDirectionAndAccel(0, 0);
    //     this.setDirectionAndAccel(1, 0);
    //     this.setDirectionAndAccel(2, 0);
    //     this.setDirectionAndAccel(3, 0);
    // }

    update(timestamp) {
        let currentWp = this.currentWp;
        let accel = 8;
        let d = -1;

        if (this.wayPoints.length !== 0) {

            if (
                !currentWp ||
                (this.x === currentWp[0] && this.y === currentWp[1])
            ) {
                this.wpCounter++;
                if (this.wpCounter === this.wayPoints.length) this.wpCounter = 0;
                this.currentWp = this.wayPoints[this.wpCounter];
                currentWp = this.currentWp;
            }
            const x = Math.floor(this.x);
            const y = Math.floor(this.y);
            if (x === currentWp[0] && y < currentWp[1]) {
                // to make corrections if player moved thip ship (not working!)
                // accel = Math.abs(y - currentWp[1]) <= accel ? 1 : accel;
                d = this.CONST.DOWN;
            }
            if (x > currentWp[0] && y === currentWp[1]) {
                // accel = Math.abs(x - currentWp[0]) <= accel ? 1 : accel;
                d = this.CONST.LEFT;
            }
            if (x === currentWp[0] && y > currentWp[1]) {
                // accel = Math.abs(y - currentWp[1]) <= accel ? 1 : accel;
                d = this.CONST.UP;
            }
            if (x < currentWp[0] && y === currentWp[1]) {
                // accel = Math.abs(x - currentWp[0]) <= accel ? 1 : accel;
                d = this.CONST.RIGHT;
            }
        }

        const scanResult = this.plusShapedScan(10);
        if (scanResult > -1) {
            this.stop();
            this.setDirectionAndAccel(scanResult, 0);
            this.fire(timestamp);
        } else {
            if (this.d != d) {
                this.stop();
            }
            this.d = d >= 0 ? d : this.d;
            this.setDirectionAndAccel(this.d, accel);
        }

        super.update(timestamp);
    }
};

const Obstacle = class extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.OBSTACLE;
    }

    draw() {
        this.BTankInst.drawObstacle(this.x, this.y);
    }

    hitByBullet() {}
};

const Border = class extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.BORDER;
    }

    draw() {
        this.BTankInst.drawBorder(this.x, this.y);
    }

    hitByBullet() {}
};

const StaticShip = class extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.SHIP;
        this.wayPoints = [];
    }

    init(mx, my, who, BTankInst, wayPoints) {
        super.init(mx, my, who, BTankInst);
        this.wayPoints = wayPoints || [];
    }

    draw() {
        this.BTankInst.drawStaticShip(this.x, this.y);
    }
};

const SpaceBrick = class extends BaseCSW {
    constructor() {
        super();
        this.type = CONST.TYPES.SPACEBRICK;
    }

    init(mx, my, who, BTankInst) {
        super.init(mx, my, who, BTankInst);
        this.life = 9;
    }
    draw() {
        this.BTankInst.drawSpaceBrick(
            this.x,
            this.y,
            Math.floor((this.life > 0 ? this.life : 0) / 2)
        );
    }

    hitByBullet(bulletInstance) {
        this.life--;
    }
};

export { CSWAI_0, CSWAI_1, CSWAI_customPaths, Border, SpaceBrick, StaticShip, Obstacle };