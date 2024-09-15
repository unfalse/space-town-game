import { CONST } from '../const';
import { CollisionDirections, CollisionInfo, CollisionMatrix, Dimensions, Direction, ObjectType, Who } from '../types';
import { DrawingManager } from '../drawingMan';
import {
    BTankManager,
    CollisionGridColumns,
    CollisionGridRows,
} from '../btank';
import { ObjectsFactory } from '../objFactory';
import { BaseGameObject } from './baseGameObj';
import { Bullet } from '../bullet';
import { PointXY } from './baseCoord';
// import { Player } from '../player';

type InertiaDirections = { [key in Direction]: number };

type CheckBoundsParameters = {
    ux: number;
    uy: number;
    width: number;
    height: number;
    direction?: Direction;
};

type StepsHistory = {
    x: number;
    y: number;
    ux: number;
    uy: number;
    direction: Direction;
};

type BordersCheckResult = 'X' | 'Y' | 'OK';



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
    stepsHistory: StepsHistory[];

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
        const { width, height } = this.dimensions[
            CONST.DIRECTIONS.RIGHT as Direction
        ];
        this.centerx = this.x + width / 2;
        this.centery = this.y + height / 2;
        this.childInit();
    }

    childInit(): void {
        return null;
    }

    setGhost(ghost: boolean): void {
        this.ghost = ghost;
    }

    setType(type: ObjectType): void {
        this.type = type;
    }

    draw(): void {
        this.drawingManagerInst.drawcswmt5(this.x, this.y, this.d);
    }

    getDirectionByCollisions(collisions: CollisionMatrix): CollisionDirections {
        const up = collisions[0] + collisions[1] + collisions[2] > 1;
        const down = collisions[6] + collisions[7] + collisions[8] > 1;
        const right = collisions[2] + collisions[5] + collisions[8] > 1;
        const left = collisions[0] + collisions[3] + collisions[6] > 1;
        return {
            down,
            up,
            left,
            right,
            upleft: collisions[0] === 1 && !up && !left,
            upright: collisions[2] === 1 && !up && !right,
            downleft: collisions[6] === 1 && !down && !left,
            downright: collisions[8] === 1 && !down && !right,
        };
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
            this.stepsHistory = [];
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

    canItMove({
        ux,
        uy,
        width,
        height,
        direction,
    }: CheckBoundsParameters): unknown {
        if (
            this.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX ||
            this.x + ux < 0
        ) {
            if (this.x + ux < 0) this.x = 0;
            if (this.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX) {
                this.x = CONST.MAXX * CONST.CELLSIZES.MAXX - width;
            }
            this.inertiaDirections[direction] = 0;
            return false;
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
            this.inertiaDirections[direction] = 0;
            return false;
        }
        return true;
    }

    canItMove2({
        ux,
        uy,
        width,
        height,
    }: CheckBoundsParameters): BordersCheckResult {
        if (
            this.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX ||
            this.x + ux < 0
        ) {
            if (this.x + ux < 0) this.x = 0;
            if (this.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX) {
                this.x = CONST.MAXX * CONST.CELLSIZES.MAXX - width;
            }

            return 'X';
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

            return 'Y';
        }
        return 'OK';
    }

    getNewCoordinatesDelta(direction: Direction): any {
        const nvxy = super.getVXY(direction);
        const acceleration = this.CSWSPEED + this.inertiaDirections[direction];

        return {
            ux: nvxy.vx * acceleration,
            uy: nvxy.vy * acceleration,
        };
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
        const { ux, uy } = this.getNewCoordinatesDelta(direction);

        // get ship dimensions by current direction and 'iam' flag
        let { width, height } = this.dimensions[direction];
        width--;
        height--;

        // TODO: these checks should be moved to processCollisions function
        if (!this.canItMove({ ux, uy, width, height, direction })) {
            this.stepsHistory.push({
                x: this.x,
                y: this.y,
                ux,
                uy,
                direction,
            });
            return;
        }

        this.stepsHistory.push({
            x: this.x,
            y: this.y,
            ux,
            uy,
            direction,
        });

        this.x = this.x + ux;
        this.y = this.y + uy;

        this.updateCollisionGrid(direction);
    }

    move2(): void {
        const { ux: uxR, uy: uyR } = this.getNewCoordinatesDelta(
            CONST.DIRECTIONS.RIGHT as Direction,
        );
        const { ux: uxD, uy: uyD } = this.getNewCoordinatesDelta(
            CONST.DIRECTIONS.DOWN as Direction,
        );
        const { ux: uxL, uy: uyL } = this.getNewCoordinatesDelta(
            CONST.DIRECTIONS.LEFT as Direction,
        );
        const { ux: uxU, uy: uyU } = this.getNewCoordinatesDelta(
            CONST.DIRECTIONS.UP as Direction,
        );
        let { width, height } = this.dimensions[
            CONST.DIRECTIONS.RIGHT as Direction
        ];
        // width--;
        // height--;

        const horizontalUXY = {
            ux: uxR + uxL,
            uy: uyR + uyL,
        };

        const verticalUXY = {
            ux: uxD + uxU,
            uy: uyD + uyU,
        };

        let checkHorizontal = this.canItMove2({
            ux: horizontalUXY.ux,
            uy: horizontalUXY.uy,
            width,
            height,
        });
        let checkVertical = this.canItMove2({
            ux: verticalUXY.ux,
            uy: verticalUXY.uy,
            width,
            height,
        });

        console.log({
            hx: horizontalUXY.ux,
            hy: horizontalUXY.uy,
            ux: horizontalUXY.ux + verticalUXY.ux,
            uy: horizontalUXY.uy + verticalUXY.uy,
        });
        console.log({
            vx: verticalUXY.ux,
            vy: verticalUXY.uy,
        });

        if (
            checkHorizontal === 'OK' &&
            checkVertical === 'OK' &&
            (horizontalUXY.ux !== 0 ||
                verticalUXY.uy !== 0 ||
                horizontalUXY.uy !== 0 ||
                verticalUXY.ux !== 0)
        ) {
            const dx = horizontalUXY.ux + verticalUXY.ux;
            const dy = horizontalUXY.uy + verticalUXY.uy;
            // const dx =
            //     horizontalUXY.ux + verticalUXY.ux !== 0
            //         ? (horizontalUXY.ux + verticalUXY.ux) /
            //           (horizontalUXY.ux + verticalUXY.ux)
            //         : 0;
            // const dy =
            //     horizontalUXY.uy + verticalUXY.uy !== 0
            //         ? (horizontalUXY.uy + verticalUXY.uy) /
            //           (horizontalUXY.uy + verticalUXY.uy)
            //         : 0;
            const updatedXY: PointXY = {
                x: this.x + dx,
                y: this.y + dy,
            };
            const collisions = this.checkCollisionsByGrid(this, updatedXY);
            if (collisions.length) {
                console.log({
                    checkedx: updatedXY.x,
                    checkedy: updatedXY.y,
                });
                console.log({
                    currentx: this.x,
                    currenty: this.y,
                    collisions,
                });

                const results: { ux: number }[] = [];
                // const collisionInfoArray: CollisionInfo[] = [];
                collisions.forEach((cl: any[]) =>
                    cl.forEach(cl2 => {
                        const dirInfo = this.getDirectionByCollisions(
                            cl2.result,
                        );

                        if (dirInfo.right) {
                            horizontalUXY.ux =
                                cl2.collidedObject.centerx - this.centerx - 40;
                        }

                        if (dirInfo.left) {
                            horizontalUXY.ux =
                                cl2.collidedObject.centerx - this.centerx + 40;
                        }

                        if (dirInfo.down) {
                            verticalUXY.uy =
                                cl2.collidedObject.centery - this.centery - 40;
                        }

                        if (dirInfo.up) {
                            verticalUXY.uy =
                                cl2.collidedObject.centery - this.centery + 40;
                        }

                        if (dirInfo.upleft) {
                            console.log('upleft!');
                        }

                        if (dirInfo.upright) {
                            console.log('upright!');
                        }

                        if (horizontalUXY.ux === 0) checkHorizontal = 'X';
                        if (verticalUXY.uy === 0) checkVertical = 'Y';

                        // if (this.d === 0)
                        //     results.push({
                        //         ux: cl2.collidedObject.x - this.x - 40,
                        //     });

                        // collisionInfoArray.push({
                        //     cd: this.getDirectionByCollisions(cl2.result),
                        //     object: cl2.collidedObject,
                        // });
                        // collisionDirections
                        // if (this.d === 3)
                        //     results.push({
                        //         ux: 1,
                        //     });
                    }),
                );
                // console.log({ results });

                // TODO: get the biggest ux and use it
                // if (this.d === 0) {
                //     horizontalUXY.ux = results[0].ux;
                //     if (horizontalUXY.ux === 0) {
                //         checkHorizontal = 'X';
                //     }
                // }

                // checkHorizontal = 'X';
                // checkVertical = 'Y';
                // }
            }
        }

        this.setInertiaDirections(checkHorizontal);
        this.setInertiaDirections(checkVertical);

        this.stepsHistory.push({
            x: this.x,
            y: this.y,
            ux: horizontalUXY.ux,
            uy: horizontalUXY.uy,
            direction: CONST.DIRECTIONS.RIGHT as Direction,
        });
        this.stepsHistory.push({
            x: this.x,
            y: this.y,
            ux: verticalUXY.ux,
            uy: verticalUXY.uy,
            direction: CONST.DIRECTIONS.DOWN as Direction,
        });

        // if (checkHorizontal !== 'OK' || checkVertical !== 'OK') {
        //     console.log('returned!');
        //     return;
        // }

        console.log('updating x!', {
            x: this.x,
            newx: this.x + horizontalUXY.ux + verticalUXY.ux,
            ux: horizontalUXY.ux + verticalUXY.ux,
        });
        console.log('updating y!', {
            y: this.y,
            newy: this.y + horizontalUXY.uy + verticalUXY.uy,
            uy: horizontalUXY.uy + verticalUXY.uy,
        });

        this.x = this.x + horizontalUXY.ux + verticalUXY.ux;
        this.y = this.y + horizontalUXY.uy + verticalUXY.uy;

        this.centerx = this.x + (CONST.CELLSIZES.MAXX * CONST.SCALE.X) / 2;
        this.centery = this.y + (CONST.CELLSIZES.MAXY * CONST.SCALE.Y) / 2;

        this.updateCollisionGrid(CONST.DIRECTIONS.RIGHT as Direction);
    }

    checkCollisionsByGrid(gameObject: BaseCSW, updatedCoords: PointXY): any {
        const btank = this.BTankInst;
        const dynamicGrid = btank.dynamicCollisionGrid;
        const staticGrid = btank.staticCollisionGrid;
        const rows = Object.keys(dynamicGrid);
        const collisions = [];

        for (const rowNum of rows) {
            const row = dynamicGrid[Number(rowNum)];
            const columns = Object.keys(row);
            const staticRow = staticGrid[Number(rowNum)];

            for (const columnNum of columns) {
                const ships = row[Number(columnNum)];
                const column = staticRow ? staticRow[Number(columnNum)] : [];
                const obstacles = column || [];
                const objectsToCheck = ships.concat(obstacles);
                if (objectsToCheck.length > 1) {
                    const collision = this.BTankInst.checkIfTwoObjectsCrossInsideACell(
                        gameObject,
                        objectsToCheck,
                        updatedCoords,
                    );
                    if (collision !== null) collisions.push(collision);
                }
            }
        }

        return collisions;
    }

    setInertiaDirections(result: BordersCheckResult): void {
        // if (result !== 'OK') console.log({ result });
        if (result === 'X') {
            this.inertiaDirections[CONST.DIRECTIONS.RIGHT as Direction] = 0;
            this.inertiaDirections[CONST.DIRECTIONS.LEFT as Direction] = 0;
        }
        if (result === 'Y') {
            this.inertiaDirections[CONST.DIRECTIONS.DOWN as Direction] = 0;
            this.inertiaDirections[CONST.DIRECTIONS.UP as Direction] = 0;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(timestamp: number): void {
        if (this.life <= 0) {
            this.BTankInst.removeShip(this);
        }

        // this.inertiaStartAttempt();

        // cpu ships cannot use inertia!
        // if (!this.stopAccel && this.iam === CONST.COMPUTER) {
        this.stepsHistory = [];
        // for (let d = 0; d < 4; d++) {
        //     this.move(d as Direction);
        // }
        this.move2();

        // this.draw();
    }

    // collision detection: broad phase
    updateCollisionGrid(direction: Direction): void {
        const { width, height } = this.dimensions[direction];
        // TODO: check if object is already in grid's cell so there's no need to add it
        // pass only direction ?
        this.addFourPointsToDynamicGrid(this.x, this.y, width, height);
    }

    addFourPointsToDynamicGrid(
        x: number,
        y: number,
        width: number,
        height: number,
    ): void {
        this.addThisObjectToDynamicGrid(this.x, this.y);
        this.addThisObjectToDynamicGrid(this.x + width, this.y);
        this.addThisObjectToDynamicGrid(this.x, this.y + height);
        this.addThisObjectToDynamicGrid(this.x + width, this.y + height);
    }

    addFourPointsToStaticGrid(
        x: number,
        y: number,
        width: number,
        height: number,
    ): void {
        this.addThisObjectToStaticGrid(this.x, this.y);
        this.addThisObjectToStaticGrid(this.x + width, this.y);
        this.addThisObjectToStaticGrid(this.x, this.y + height);
        this.addThisObjectToStaticGrid(this.x + width, this.y + height);
    }

    addThisObjectToGrid(x: number, y: number, grid: CollisionGridRows): void {
        const gridPoint: PointXY = {
            x: Math.floor(x / CONST.COLLISION_GRID.WIDTH),
            y: Math.floor(y / CONST.COLLISION_GRID.HEIGHT),
        };

        let gridRow = grid[gridPoint.y] as CollisionGridColumns;
        if (!gridRow) {
            grid[gridPoint.y] = {};
            gridRow = grid[gridPoint.y] as CollisionGridColumns;
        }

        let gridCell = gridRow[gridPoint.x] as BaseCSW[];
        if (!gridCell) {
            gridRow[gridPoint.x] = [];
            gridCell = gridRow[gridPoint.x] as BaseCSW[];
        }

        if (!gridCell.includes(this)) {
            gridCell.push(this);
        }
    }

    // TODO: check memory usage on cleanup
    addThisObjectToDynamicGrid(x: number, y: number): void {
        this.addThisObjectToGrid(x, y, this.BTankInst.dynamicCollisionGrid);
    }

    addThisObjectToStaticGrid(x: number, y: number): void {
        this.addThisObjectToGrid(x, y, this.BTankInst.staticCollisionGrid);
    }

    hitByBullet(_bulletInstance: Bullet): void {
        return null;
    }
}
