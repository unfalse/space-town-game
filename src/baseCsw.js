import { BaseCoordinates } from './baseCoord';
import { CONST } from './const';
import { Bullet } from './bullet';
import { Utils } from './utils';

console.log("csw!");

// TODO: csw: cosmo ship war, the old title
// TODO: rename csw to something more understandable - tank? SpaceShip ?
// TODO: maybe the CPU and player should have separate classes? And several base classes.
export const BaseCSW = class extends BaseCoordinates {
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
        };
        this.inertiaTimerIsRunning = false;
        this.d = 0; // direction
        this.stopAccel = true;
        // this.PLAYER_BULLETS_INTERVAL = 600;
        this.MAXIMUM_ACCELERATION = 20;
        this.dimensions = {};

        this.CONST = CONST;
        this.bullet = Bullet;
        this.BTankInst = null;
        this.Utils = Utils;
    }

    // TODO: place code from init above!
    init(mx, my, who, BTankInst) {
        this.initCoords(mx, my, 0);
        this.iam = who;
        this.maxlife = 5;
        this.life = this.maxlife;
        this.bulletsAmountOnFire = this.CONST.MAXBULLETS;
        this.BTankInst = BTankInst;
        this.dimensions = {
            0: BTankInst.getShipDimensions(0, who, this.type),
            1: BTankInst.getShipDimensions(1, who, this.type),
            2: BTankInst.getShipDimensions(2, who, this.type),
            3: BTankInst.getShipDimensions(3, who, this.type),
        };
        //this.ghost = !!ghost; // only display this object
    }

    draw() {
        this.BTankInst.drawcswmt5(this.x, this.y, this.d);
    }

    createNewBullet(startX, startY, startD, whoFire) {
        if (
            this.BTankInst.bulletsArr.filter(
                function (b) {
                    return b.parentShip === this;
                }.bind(this)
            ).length === this.bulletsAmountOnFire
        )
            return;
        const newBullet = new this.bullet(this.BTankInst, whoFire);
        newBullet.init(startX, startY, startD, this, 0);
        this.BTankInst.bulletsArr.push(newBullet);
    }

    setDirectionAndAccel(d, accel, ms) {
        const humanDir = (d) => {
            switch (d) {
                case 0:
                    return "right";
                case 1:
                    return "down";
                case 2:
                    return "left";
                case 3:
                    return "up";
            }
        };
        // console.log(humanDir(d), ', ', accel, ', ', ms);
        this.d = d;
        this.inertiaDirections[d] = accel;
    }

    getDirSum() {
        return (
            this.inertiaDirections[0] +
            this.inertiaDirections[1] +
            this.inertiaDirections[2] +
            this.inertiaDirections[3]
        );
    }

    inertia() {
        if (
            this.getDirSum() > 0 &&
            this.stopAccel &&
            this.inertiaTimerIsRunning
        ) {
            // TODO: WHERE TO PUT DECREASING AND INCREASING OF ACCELERATION ?
            // maybe use stopAccel from the main.js !!!
            // this way the momentum will be the same every time till zero acceleration
            // stopAccel should be for every direction! Then inertia will stop fade only for directions which are not accelerated at the moment
            for (let d = 0; d < 4; d++) {
                if (this.inertiaDirections[d] > 0) {
                    // this.inertiaDirections[d] -= 0.1;
                } else {
                    this.inertiaDirections[d] = 0;
                }
                this.move(d);
            }
            // this.draw();
            // setTimeout(this.inertia.bind(this), 10);
            this.waitAndCall(this.inertia.bind(this), 10, this.waitInertia);
        } else {
            this.inertiaTimerIsRunning = false;
        }
    }

    waitAndCall(callback, ms, waitStart) {
        const doThings = function (timestamp) {
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

    inertiaStartAttempt() {
        if (
            this.getDirSum() > 0 &&
            !this.inertiaTimerIsRunning &&
            this.stopAccel
        ) {
            this.inertiaTimerIsRunning = true;
            // setTimeout(this.inertia.bind(this), 10);
            this.waitAndCall(
                this.inertia.bind(this),
                10,
                this.waitInertiaStartAttempt
            );
        }
    }

    stop() {
        this.stopAccel = false;
        this.inertiaTimerIsRunning = false;
        for (let d = 0; d < 4; d++) {
            this.inertiaDirections[d] = 0;
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
    move(direction) {
        const nvxy = this.getVXY(direction);
        const acceleration = this.CSWSPEED + this.inertiaDirections[direction];

        // console.log(acceleration);
        let ux = nvxy.vx * acceleration;
        let uy = nvxy.vy * acceleration;

        // get ship dimensions by current direction and 'iam' flag
        let { width, height } = this.dimensions[direction];
        width--;
        height--;

        // TODO: use this.CONST.CELLSIZES.MAXX instead of 20 !!!
        if (
            this.x + ux + width > this.CONST.MAXX * this.CONST.CELLSIZES.MAXX ||
            this.x + ux < 0
        ) {
            if (this.x + ux < 0) this.x = 0;
            if (
                this.x + ux + width >
                this.CONST.MAXX * this.CONST.CELLSIZES.MAXX
            )
                this.x = this.CONST.MAXX * this.CONST.CELLSIZES.MAXX - width;
            ux = 0;
            this.inertiaDirections[direction] = 0;
        }

        if (
            this.y + uy + height >
                this.CONST.MAXY * this.CONST.CELLSIZES.MAXY ||
            this.y + uy < 0
        ) {
            if (this.y + uy < 0) this.y = 0;
            if (
                this.y + uy + height >
                this.CONST.MAXY * this.CONST.CELLSIZES.MAXY
            )
                this.y = this.CONST.MAXY * this.CONST.CELLSIZES.MAXY - height;
            uy = 0;
            this.inertiaDirections[direction] = 0;
        }

        // checking if the ship is on the other ship already
        // const isOnTheOtherShip = this.BTankInst.checkIfTwoShipsCross(
        //     this.x,
        //     this.y,
        //     this
        // );

        // if (!isOnTheOtherShip) {
        if (ux != 0 || uy != 0) {
            const found = this.BTankInst.checkIfTwoShipsCross(
                this.x + ux, //Math.floor(ux), //Math.ceil(ux),
                this.y + uy, //Math.floor(uy),//Math.ceil(uy),
                this
            );
            if (found) {
                // if (this.iam === this.CONST.USER) {
                //     console.log(["a:", this.x, this.y, ux, uy]);
                // }
                // if (direction === this.CONST.RIGHT)
                //     this.x = found.x - width - 1;
                // if (direction === this.CONST.UP)
                //     this.y = found.y + found.dimensions[found.d].height+2;
                // if (direction === this.CONST.LEFT)
                //     this.x = found.x + found.dimensions[found.d].width;
                // if (direction === this.CONST.DOWN)
                //     this.y = found.y - height - 1;
                // if (this.iam === this.CONST.USER) {
                //     console.log(["b:", this.x, this.y, ux, uy]);
                // }
                ux = 0;
                uy = 0;
                this.inertiaDirections[direction] = 0;
            }
        }
        this.x = this.x + ux;
        this.y = this.y + uy;
        // console.log(["c:", this.x, this.y, ux, uy]);
        // }
    }

    update(timestamp) {
        if (this.life <= 0) {
            this.BTankInst.removeShip(this);
        }

        this.inertiaStartAttempt();

        if (!this.stopAccel) {
            for (let d = 0; d < 4; d++) {
                this.move(d);
            }
        }

        this.draw();
    }

    hitByBullet(bulletInstance) {}
};
