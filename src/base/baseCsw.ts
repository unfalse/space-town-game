import { CONST } from '../const';
import { Dimensions, Direction, ObjectType, Who } from '../types';
import { DrawingManager } from '../drawingMan';
import { BTankManager } from '../btank';
import { ObjectsFactory } from '../objFactory';
import { BaseGameObject } from './baseGameObj';
import { Bullet } from '../bullet';

type InertiaDirections = { [key in Direction]: number };

// TODO: csw: cosmo ship war, the old title
// TODO: rename csw to something more understandable - tank? SpaceShip ?
// TODO: maybe the CPU and player should have separate classes? And several base classes.
export class BaseCSW extends BaseGameObject {
    lastBulletTimeStamp: number;
    CSWSPEED: number;
    inertiaDirections: InertiaDirections;
    inertiaTimerIsRunning: boolean;
    d: Direction;
    stopAccel: boolean;
    MAXIMUM_ACCELERATION: number;
    dimensions: Dimensions;
    BTankInst: BTankManager;
    drawingManagerInst: DrawingManager;
    objectsFactoryInst: ObjectsFactory;
    iam: Who;
    maxlife: number;
    life: number;
    bulletsAmountOnFire: number;
    // x: number;
    // y: number;
    type: ObjectType;
    ghost: boolean;

    constructor() {
        super();
        this.lastBulletTimeStamp = 0;
        // this.CSWSPEED = 4;
        this.CSWSPEED = 0;
        // this.accel = 0;
        this.inertiaDirections = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            '-1': 0,
        };
        this.inertiaTimerIsRunning = false;
        this.d = 0; // direction
        this.stopAccel = true;
        // this.PLAYER_BULLETS_INTERVAL = 600;
        this.MAXIMUM_ACCELERATION = 50; //100; //30; //20;
        this.dimensions = null;

        // this.CONST = CONST;
        // this.bullet = Bullet;
        this.BTankInst = null;
    }

    // TODO: place code from init above!
    init(
        mx: number,
        my: number,
        who: Who,
        drawingManagerInst: DrawingManager,
        BTankInst: BTankManager,
        objectsFactoryInst: ObjectsFactory,
    ): void {
        // super.initCoords(mx, my, 0);
        super.init(
            mx,
            my,
            0,
            drawingManagerInst,
            BTankInst,
            objectsFactoryInst,
        );
        this.iam = who;
        this.maxlife = 5;
        this.life = this.maxlife;
        this.bulletsAmountOnFire = CONST.MAXBULLETS;
        // this.BTankInst = BTankInst;
        // this.drawingManagerInst = drawingManagerInst;
        // this.objectsFactoryInst = objectsFactoryInst;
        this.dimensions = this.drawingManagerInst.initDimensions(who);
        //this.ghost = !!ghost; // only display this object
        this.childInit();
    }

    childInit(): void {
        return null;
    }

    setGhost(ghost: boolean) {
        this.ghost = ghost;
    }

    draw() {
        this.drawingManagerInst.drawcswmt5(this.x, this.y, this.d);
    }

    createNewBullet(
        startX: number,
        startY: number,
        startD: Direction,
        whoFires?: Who,
    ): void {
        if (
            this.BTankInst.bulletsArr.filter(
                function (b: Bullet) {
                    return b.parentShip === this;
                }.bind(this),
            ).length === this.bulletsAmountOnFire
        )
            return;
        // const newBullet = new Bullet(this.BTankInst, this.drawingManagerInst, whoFires);
        const newBullet = <Bullet>(
            this.objectsFactoryInst.createBaseObj(
                startX,
                startY,
                whoFires,
                CONST.TYPES.BULLET,
            )
        );
        newBullet.initBullet(startX, startY, startD, this);
        this.BTankInst.bulletsArr.push(newBullet);
    }

    setDirectionAndAccel(d: Direction, accel: number): void {
        // const humanDir = (d: Direction) => {
        //     switch (d) {
        //         case 0:
        //             return "right";
        //         case 1:
        //             return "down";
        //         case 2:
        //             return "left";
        //         case 3:
        //             return "up";
        //     }
        // };
        // console.log(humanDir(d), ', ', accel, ', ', ms);
        this.d = d;
        this.inertiaDirections[d] = accel;
    }

    getDirSum(): number {
        return (
            this.inertiaDirections[0] +
            this.inertiaDirections[1] +
            this.inertiaDirections[2] +
            this.inertiaDirections[3]
        );
    }

    // TODO: move all this inertia in a separate class
    // There should be ability to make a lot of movement types
    inertia(): void {
        if (
            this.getDirSum() > 0 &&
            this.stopAccel &&
            this.inertiaTimerIsRunning
        ) {
            // TODO: WHERE TO PUT DECREASING AND INCREASING OF ACCELERATION ?
            // maybe use stopAccel from the main.js !!!
            // this way the momentum will be the same every time till zero acceleration
            // stopAccel should be for every direction!
            // Then inertia will stop fade only for directions which are not accelerated at the moment
            for (let d: Direction = 0; d < 4; d++) {
                if (this.inertiaDirections[d as Direction] > 0) {
                    // this.inertiaDirections[d] -= 0.1;
                } else {
                    this.inertiaDirections[d as Direction] = 0;
                }
                this.move(d as Direction);
            }
            // this.draw();
            // setTimeout(this.inertia.bind(this), 10);

            this.waitAndCall(this.inertia.bind(this), 10); // TODO: need investigation wtf is this
        } else {
            this.inertiaTimerIsRunning = false;
        }
    }

    waitAndCall(callback: () => void, ms: number): void {
        let waitStart: number = null;
        const doThings = function (timestamp: number) {
            if (waitStart == null) {
                waitStart = timestamp;
            }
            // naive
            if (timestamp - waitStart >= ms) {
                waitStart = null;
                callback();
            } else {
                window.requestAnimationFrame(doThings.bind(this));
            }
        };
        window.requestAnimationFrame(doThings.bind(this));
    }

    inertiaStartAttempt(): void {
        if (
            this.getDirSum() > 0 &&
            !this.inertiaTimerIsRunning &&
            this.stopAccel
        ) {
            this.inertiaTimerIsRunning = true;
            // setTimeout(this.inertia.bind(this), 10);
            this.waitAndCall(this.inertia.bind(this), 10);
        }
    }

    stop(): void {
        this.stopAccel = false;
        this.inertiaTimerIsRunning = false;
        for (let d = 0; d < 4; d++) {
            this.inertiaDirections[d as Direction] = 0;
        }
    }

    /*
    
    TODO: make this.x and this.y as the center of csw
    Right now this.x and this.y is point o (upper left point)
    
    o----------
    |
    |
    |
    |
    
    */
    move(direction: Direction): void {
        const nvxy = super.getVXY(direction);
        const acceleration = this.CSWSPEED + this.inertiaDirections[direction];

        let ux = nvxy.vx * acceleration;
        let uy = nvxy.vy * acceleration;

        // get ship dimensions by current direction and 'iam' flag
        let { width, height } = this.dimensions[direction];
        width--;
        height--;

        if (
            this.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX ||
            this.x + ux < 0
        ) {
            if (this.x + ux < 0) this.x = 0;
            if (this.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX) {
                this.x = CONST.MAXX * CONST.CELLSIZES.MAXX - width;
            }
            ux = 0;
            this.inertiaDirections[direction] = 0;
            return;
        }

        if (
            this.y + uy + height > CONST.MAXY * CONST.CELLSIZES.MAXY ||
            this.y + uy < 0
        ) {
            if (this.y + uy < 0) {
                this.y = 0;
            }
            if (this.y + uy + height > CONST.MAXY * CONST.CELLSIZES.MAXY) {
                this.y = CONST.MAXY * CONST.CELLSIZES.MAXY - height;
            }
            uy = 0;
            this.inertiaDirections[direction] = 0;
            return;
        }

        const disableCollisionChecks = false;
        if (!disableCollisionChecks) {
            if (ux != 0 || uy != 0) {
                const found = this.BTankInst.checkIfTwoShipsCross(
                    this.x + ux, //Math.floor(ux), //Math.ceil(ux),
                    this.y + uy, //Math.floor(uy),//Math.ceil(uy),
                    this,
                    [ObjectType.SHIP],
                );
                if (found) {
                    ux = 0;
                    uy = 0;
                    this.inertiaDirections[direction] = 0;
                    return;
                }
            }
        }
        this.x = this.x + ux;
        this.y = this.y + uy;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(timestamp: number): void {
        if (this.life <= 0) {
            this.BTankInst.removeShip(this);
        }

        this.inertiaStartAttempt();

        if (!this.stopAccel) {
            for (let d = 0; d < 4; d++) {
                this.move(d as Direction);
            }
        }

        this.draw();
    }

    hitByBullet(bulletInstance: Bullet): void {
        return null;
    }
}
