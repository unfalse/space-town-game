import { CONST } from '../../const.js';
import {
    InertiaDirections,
    Dimensions,
    Direction,
    ObjectType,
    Who,
} from '../../types.js';
import { DrawingManager } from '../../drawingMan.js';
import {
    BTankManager,
    CollisionGridColumns,
    CollisionGridRows,
} from '../../btank.js';
import { ObjectsFactory } from '../../objFactory.js';
import { BaseGameObject } from './baseGameObj.js';
import { Bullet } from '../bullet.js';
import { PointXY } from './baseCoord.js';

type CheckBoundsParameters = {
    ux: number;
    uy: number;
    width: number;
    height: number;
    direction?: Direction;
};

type BordersCheckResult = 'X' | 'Y' | 'OK';

// TODO: csw: cosmo ship war, the old title
// TODO: rename csw to something more understandable - tank? SpaceShip ?
export class BaseCSW extends BaseGameObject {
    lastBulletTimeStamp: number;
    CSWSPEED: number;
    inertiaDirections: InertiaDirections;
    inertiaTimerIsRunning: boolean;
    d: Direction;
    stopAccel: boolean;
    MAXIMUM_ACCELERATION: number;
    dimensions: Dimensions | null = null;
    declare BTankInst: BTankManager;
    declare drawingManagerInst: DrawingManager;
    declare objectsFactoryInst: ObjectsFactory;
    iam: Who = Who.COMPUTER;
    maxlife = 10;
    life = 0;
    bulletsAmountOnFire = 0;
    type: ObjectType = ObjectType.BORDER;
    ghost = false;
    centerx = 0;
    centery = 0;

    constructor() {
        super();
        this.lastBulletTimeStamp = 0;
        this.CSWSPEED = 0.1;
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
        this.MAXIMUM_ACCELERATION = 1;
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
        this.dimensions = this.drawingManagerInst.initDimensions(who);
        //this.ghost = !!ghost; // only display this object
        if (this.dimensions === null) return;
        const { width, height } =
            this.dimensions[CONST.DIRECTIONS.RIGHT as Direction];
        this.centerx = this.x + width / 2;
        this.centery = this.y + height / 2;
        this.childInit();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    childInit(): void {}

    setGhost(ghost: boolean): void {
        this.ghost = ghost;
    }

    setType(type: ObjectType): void {
        this.type = type;
    }

    draw(): void {
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
                (b: Bullet) => b.parentShip === this,
            ).length === this.bulletsAmountOnFire
        )
            return;
        const newBullet = <Bullet>(
            this.objectsFactoryInst.createBaseObj(
                startX,
                startY,
                whoFires ?? this.iam,
                CONST.TYPES.BULLET,
            )
        );
        newBullet.initBullet(startX, startY, startD, this);
        this.BTankInst.bulletsArr.push(newBullet);
    }

    setDirectionAndAccel(d: Direction, accel: number): void {
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

    waitAndCall(callback: () => void, ms: number): void {
        let waitStart: number | null = null;
        const doThings = function (timestamp: number) {
            if (waitStart === null) {
                waitStart = timestamp;
            }
            // naive
            if (timestamp - waitStart >= ms) {
                waitStart = null;
                callback();
            } else {
                window.requestAnimationFrame(doThings);
            }
        };
        window.requestAnimationFrame(doThings);
    }

    stop(): void {
        this.stopAccel = false;
        for (let d = 0; d < 4; d++) {
            this.inertiaDirections[d as Direction] = 0;
        }
    }

    canItMove({
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
        const acceleration = this.inertiaDirections[direction];
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
    move(): void {
        if (!this.dimensions) return;

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
        const { width, height } =
            this.dimensions[CONST.DIRECTIONS.RIGHT as Direction];

        const horizontalUXY = {
            ux: uxR + uxL,
            uy: uyR + uyL,
        };

        const verticalUXY = {
            ux: uxD + uxU,
            uy: uyD + uyU,
        };

        const checkHorizontal = this.canItMove({
            ux: horizontalUXY.ux,
            uy: horizontalUXY.uy,
            width,
            height,
        });
        const checkVertical = this.canItMove({
            ux: verticalUXY.ux,
            uy: verticalUXY.uy,
            width,
            height,
        });

        let dx = horizontalUXY.ux + verticalUXY.ux;
        let dy = horizontalUXY.uy + verticalUXY.uy;

        // Ship / obstacle collision: if the proposed full move would overlap
        // another ship, obstacle, or space brick, try axis-only moves so we
        // slide along it. If both axes are blocked, stay put and zero inertia
        // on the blocked axes.
        if (
            (dx !== 0 || dy !== 0) &&
            this.BTankInst.checkShipCollisionAt(this.x + dx, this.y + dy, this)
        ) {
            const blockedX =
                dx !== 0 &&
                !!this.BTankInst.checkShipCollisionAt(
                    this.x + dx,
                    this.y,
                    this,
                );
            const blockedY =
                dy !== 0 &&
                !!this.BTankInst.checkShipCollisionAt(
                    this.x,
                    this.y + dy,
                    this,
                );

            // Special case: pure-diagonal collision where neither single axis
            // hits anything but the combined move does. Treat both axes as
            // blocked so we don't squeeze through corners.
            if (!blockedX && !blockedY) {
                dx = 0;
                dy = 0;
                this.inertiaDirections[CONST.DIRECTIONS.RIGHT as Direction] = 0;
                this.inertiaDirections[CONST.DIRECTIONS.LEFT as Direction] = 0;
                this.inertiaDirections[CONST.DIRECTIONS.DOWN as Direction] = 0;
                this.inertiaDirections[CONST.DIRECTIONS.UP as Direction] = 0;
            } else {
                if (blockedX) {
                    dx = 0;
                    this.inertiaDirections[
                        CONST.DIRECTIONS.RIGHT as Direction
                    ] = 0;
                    this.inertiaDirections[
                        CONST.DIRECTIONS.LEFT as Direction
                    ] = 0;
                }
                if (blockedY) {
                    dy = 0;
                    this.inertiaDirections[
                        CONST.DIRECTIONS.DOWN as Direction
                    ] = 0;
                    this.inertiaDirections[
                        CONST.DIRECTIONS.UP as Direction
                    ] = 0;
                }
            }
        }

        this.setInertiaDirections(checkHorizontal);
        this.setInertiaDirections(checkVertical);

        this.x = this.x + dx;
        this.y = this.y + dy;

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
                    const collision =
                        this.BTankInst.getVectorsOfCollidedObjectsByCenter(
                            gameObject,
                            objectsToCheck,
                            updatedCoords,
                        );
                    if (collision.length) collisions.push(collision);
                }
            }
        }

        return collisions;
    }

    setInertiaDirections(result: BordersCheckResult): void {
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

        this.move();
    }

    // collision detection: broad phase
    updateCollisionGrid(direction: Direction): void {
        if (!this.dimensions) return;
        const { width, height } = this.dimensions[direction];
        // TODO: check if object is already in grid's cell so there's no need to add it
        // pass only direction ?
        this.addFourPointsToDynamicGrid(width, height);
    }

    addFourPointsToDynamicGrid(width: number, height: number): void {
        this.addThisObjectToDynamicGrid(this.x, this.y);
        this.addThisObjectToDynamicGrid(this.x + width, this.y);
        this.addThisObjectToDynamicGrid(this.x, this.y + height);
        this.addThisObjectToDynamicGrid(this.x + width, this.y + height);
    }

    addFourPointsToStaticGrid(width: number, height: number): void {
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

    addThisObjectToDynamicGrid(x: number, y: number): void {
        this.addThisObjectToGrid(x, y, this.BTankInst.dynamicCollisionGrid);
    }

    addThisObjectToStaticGrid(x: number, y: number): void {
        this.addThisObjectToGrid(x, y, this.BTankInst.staticCollisionGrid);
    }

    removeSelfFromStaticGrid(): void {
        const grid = this.BTankInst.staticCollisionGrid;
        for (const rowKey of Object.keys(grid)) {
            const row = grid[Number(rowKey)];
            if (!row) continue;
            for (const colKey of Object.keys(row)) {
                const cell = row[Number(colKey)] as BaseCSW[];
                if (!cell?.length) continue;
                const idx = cell.indexOf(this);
                if (idx !== -1) {
                    cell.splice(idx, 1);
                }
            }
        }
    }

    hitByBullet(_bulletInstance: Bullet): void {}
}
