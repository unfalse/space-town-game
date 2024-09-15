import { CONST } from './const';
import { Bullet } from './bullet';
import { Images } from './images';
import { DelayedPic } from './delayedPic';
import { ObjectType } from './types';
import { BaseCSW } from './base/baseCsw';
import { Player } from './player';
import { Ghosts } from './ghosts';
import { PointXY } from './base/baseCoord';
// import { IPlayer } from './interfaces';

export type CollisionGridColumns = {
    [key in number]: BaseCSW[];
};

export type CollisionGridRows = {
    [key in number]: CollisionGridColumns;
};

// type CollisionMap = Array<number>[8];

// type CheckObjectsCrossResult = {
//     result: CollisionMap;
//     collidedObject: BaseCSW;
// } | false;

// -------------------------------------
//    TOFIX! bullet dep propagation
// -------------------------------------

// Tanks manager and draw manager
// BattleTankGame.deps.BTankManager = function (
export class BTankManager {
    cswArr: BaseCSW[];
    ghosts: Ghosts;
    bulletsArr: Bullet[];
    delayedPics: DelayedPic[];
    drawContext: CanvasRenderingContext2D;
    // infoContext: any;
    againBtn: HTMLButtonElement;
    gameOverBlock: HTMLDivElement;

    // cswAI: BaseCPU; // TODO: make it more easy to choose different AIs
    gameInfo: HTMLCanvasElement;
    titleBlock: HTMLDivElement;
    gameFieldBlock: HTMLCanvasElement;
    // gameCam: Camera;
    playerInstance: Player;

    dynamicCollisionGrid: CollisionGridRows;
    staticCollisionGrid: CollisionGridRows;

    constructor(player: Player) {
        // TODO: write the full paths to classes
        this.cswArr = [];
        this.ghosts = [];
        this.bulletsArr = [];
        this.delayedPics = [];
        this.drawContext = null;
        this.againBtn = null;
        this.gameOverBlock = null;
        this.playerInstance = player;
        this.dynamicCollisionGrid = [];
        this.staticCollisionGrid = [];
    }

    init(): void {
        const gameField: HTMLCanvasElement = document.getElementById(
            'gameField',
        ) as HTMLCanvasElement;

        gameField.height = document.body.clientHeight;
        // CONST.SCREENMAXY * CONST.CELLSIZES.MAXY * CONST.SCALE.Y;

        gameField.width = document.body.clientWidth;
        // CONST.SCREENMAXX * CONST.CELLSIZES.MAXX * CONST.SCALE.X;

        CONST.CAM.CENTERY = gameField.height / 2;
        CONST.CAM.CENTERX = gameField.width / 2;

        // TODO: create new ui class and move these things to it
        // this.gameInfo = document.getElementById("gameInfo");
        this.againBtn = document.querySelector('#playAgainBtn');
        this.gameOverBlock = document.querySelector('#gameOverBlock');
        this.titleBlock = document.querySelector('#titleBlock');
        this.gameFieldBlock = gameField;

        this.drawContext = gameField.getContext('2d');
        Images.drawContext = this.drawContext;
        //this.infoContext = this.gameInfo.getContext("2d");

        // TODO: make separate editor class?
        // current object chosen to place on the map
        // this.gameCam = new Camera(this);

        // TODO: it should be a function which will preload images.
        // First it should collect paths to images from classes (csw, cswai, obstacle, etc.)
        // Every class will have a variable with image. Now it can only call the "draw" function.
        // Image field should be in csw class. This way player should have a separate class.
    }

    pushNewObjects(objects: Array<BaseCSW>, ghost?: boolean): void {
        if (ghost) {
            this.ghosts = this.ghosts.concat(objects);
        } else {
            this.cswArr = this.cswArr.concat(objects);
        }
    }

    // x, y - coordinates of pixels, not cells
    checkCSWWithPixelPrecision(
        x: number,
        y: number,
        whoAsks: BaseCSW,
    ): boolean {
        const result = this.cswArr.filter((csw: BaseCSW) => {
            // console.log(whoAsks === csw);
            if (whoAsks === csw) {
                return false;
            }
            const { width, height } = csw.dimensions[csw.d];
            return (
                x >= csw.x &&
                x <= csw.x + width &&
                y >= csw.y &&
                y <= csw.y + height
            );
        });
        return result.length > 0;
    }

    checkIfTwoShipsCross(
        nx: number,
        ny: number,
        whoAsks: BaseCSW,
        typesToIgnore: ObjectType[],
    ): BaseCSW {
        // const debugDraw = (function(x,y,w,h) {
        //     this.drawContext.strokeStyle = "#0f0";
        //     this.drawContext.strokeRect(x, y, w, h);
        // }).bind(this);
        // const typeToCheck = typeToCheckParam || CONST.TYPES.SHIP;

        const checkSquare = (csw: BaseCSW, x: number, y: number) => {
            let { width, height } = csw.dimensions[csw.d];
            width--;
            height--;
            // debugDraw(csw.x, csw.y, width, height);

            return (
                x >= csw.x &&
                x <= csw.x + width &&
                y >= csw.y &&
                y <= csw.y + height
            );
        };

        let { width, height } = whoAsks.dimensions[whoAsks.d];
        width--;
        height--;

        const tArr = this.cswArr.filter((csw: BaseCSW) => {
            if (whoAsks === csw || typesToIgnore?.indexOf(csw.type) >= 0) {
                return false;
            }

            const checkResult =
                checkSquare(csw, nx, ny) ||
                checkSquare(csw, nx + width, ny) ||
                checkSquare(csw, nx, ny + height) ||
                checkSquare(csw, nx + width, ny + height) ||
                checkSquare(csw, nx + width / 2, ny) ||
                checkSquare(csw, nx, ny + height / 2) ||
                checkSquare(csw, nx + width, ny + height / 2) ||
                checkSquare(csw, nx + width / 2, ny + height);
            return checkResult;
        }, this);

        return tArr.length > 0 ? tArr[0] : null;
    }

    checkIfTwoObjectsCrossInsideACell(
        whoAsks: BaseCSW,
        objects: BaseCSW[],
        newCoords?: PointXY,
        typesToIgnore?: ObjectType[],
    ): any {
        // ): CheckObjectsCrossResult {
        // const debugDraw = (function(x,y,w,h) {
        //     this.drawContext.strokeStyle = "#0f0";
        //     this.drawContext.strokeRect(x, y, w, h);
        // }).bind(this);
        // const typeToCheck = typeToCheckParam || CONST.TYPES.SHIP;

        const checkSquare = (csw: BaseCSW, x: number, y: number) => {
            let { width, height } = csw.dimensions[csw.d];
            // width--;
            // height--;
            // debugDraw(csw.x, csw.y, width, height);

            return (
                x >= csw.x &&
                x <= csw.x + width &&
                y >= csw.y &&
                y <= csw.y + height
            );
        };

        let { width, height } = whoAsks.dimensions[whoAsks.d];
        const { x, y } = newCoords || whoAsks;
        // width--;
        // height--;

        const tArr = objects
            .map((csw: BaseCSW) => {
                if (whoAsks === csw || typesToIgnore?.indexOf(csw.type) >= 0) {
                    return false;
                }

                const result = [
                    // left top
                    +checkSquare(csw, x, y),
                    // center top
                    +checkSquare(csw, x + width / 2, y),
                    // right top
                    +checkSquare(csw, x + width, y),
                    // left center
                    +checkSquare(csw, x, y + height / 2),
                    // center center (index = 4)
                    +checkSquare(csw, x + width / 2, y + height / 2),
                    // right center
                    +checkSquare(csw, x + width, y + height / 2),
                    // left bottom
                    +checkSquare(csw, x, y + height),
                    // center bottom
                    +checkSquare(csw, x + width / 2, y + height),
                    // right bottom
                    +checkSquare(csw, x + width, y + height),
                ];
                return result.some(r => r !== 0)
                    ? { result, collidedObject: csw }
                    : undefined;
            }, this)
            .filter(obj => !!obj === true);

        if (tArr.length > 0) {
            return tArr;
            // return tArr[0];
        }
        return null;
    }

    getBulletWithPixelPrecision(
        x: number,
        y: number,
        parentShip: BaseCSW,
        bulletInst: Bullet,
    ): Bullet {
        const tArr = this.bulletsArr.filter(function (b: Bullet) {
            return (
                b.parentShip !== parentShip &&
                b !== bulletInst &&
                x >= b.x &&
                x <= b.x + 4 &&
                y >= b.y &&
                y <= b.y + 4
            );
        });
        return tArr.length ? tArr[0] : null;
    }

    // Returns CSW on coords in params (by pixel)
    getCSWWithPixelPrecision(x: number, y: number, whoAsks: BaseCSW): BaseCSW {
        const tArr = this.cswArr.filter((csw: BaseCSW) => {
            if (whoAsks === csw) {
                return false;
            }
            const { width, height } = csw.dimensions[csw.d];
            return (
                x >= csw.x &&
                x <= csw.x + width &&
                y >= csw.y &&
                y <= csw.y + height
            );
        });

        return tArr.length ? tArr[0] : null;
    }

    getAllGhosts(): Ghosts {
        return this.ghosts;
    }

    getAllShips(): BaseCSW[] {
        const filtered = this.cswArr.filter(ship =>
            [CONST.TYPES.PLAYER, CONST.TYPES.SHIP].includes(ship.type),
        );
        return filtered;
    }

    getAllObstacles(): BaseCSW[] {
        const filtered = this.cswArr.filter(ship => {
            return ![CONST.TYPES.PLAYER, CONST.TYPES.SHIP].includes(ship.type);
        });
        return filtered;
    }

    getAllBullets(): Bullet[] {
        return this.bulletsArr;
    }

    addShip(ship: BaseCSW): void {
        this.cswArr.push(ship);
    }

    setPlayer(player: Player): void {
        this.playerInstance = player;
    }

    // TODO: move into the ParticleManager (define it firstly)
    // createDelayedPic(x: number, y: number) {
    //     const dp = new DelayedPic();
    //     // const relXY = this.gameCam.getRelCoords(x, y);
    //     // dp.init(relXY.x, relXY.y, this);
    //     // dp.init(x, y, this, );
    //     dp.delayedPicInit();
    //     this.delayedPics.push(dp);
    // }

    removeDelayedPic(dpObj: DelayedPic): void {
        this.delayedPics = this.delayedPics.filter(dp => dp !== dpObj);
    }

    getAllDelayedPics(): DelayedPic[] {
        return this.delayedPics;
    }

    removeBullet(bullet: Bullet): void {
        this.bulletsArr = this.bulletsArr.filter(b => b !== bullet);
    }

    removeShip(ship: BaseCSW): void {
        this.cswArr = this.cswArr.filter(s => s !== ship);
    }

    destroyAll(): void {
        this.cswArr = [];
        this.dynamicCollisionGrid = [];
        this.staticCollisionGrid = [];
    }

    showGameOver(): void {
        this.gameOverBlock.innerText = 'GAME OVER';
        this.againBtn.style.display = 'block';
        this.gameOverBlock.style.display = 'block';
    }

    showWin(): void {
        this.againBtn.style.display = 'block';
        this.gameOverBlock.innerText = 'YOU WIN';
        this.gameOverBlock.style.display = 'block';
    }
}
