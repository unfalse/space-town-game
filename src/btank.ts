import { CONST } from './const';
import { Obstacle, SpaceBrick, CSWAI_customPaths } from './cswai';
import { Bullet } from './bullet';
import { Counter } from './counter';
import { Camera } from './cam';
import { Images } from './images';
import { DelayedPic } from './delayedPic';
import { Direction, Ghosts, ObjectType, RectSize, WayPoints, Who } from './types';
import { Player } from './player';
import { BaseCSW } from './base/baseCsw';
import { BaseCPU } from './base/baseCpu';

// -------------------------------------
//    TOFIX! bullet dep propagation
// -------------------------------------

// Tanks manager and draw manager
// BattleTankGame.deps.BTankManager = function (
export class BTankManager {
    playerInstance: Player;
    playerImages: Images[];
    cswArr: BaseCSW[];
    ghosts: Ghosts;
    bulletsArr: Bullet[];
    delayedPics: DelayedPic[];
    drawContext: CanvasRenderingContext2D;
    // infoContext: any;
    againBtn: HTMLButtonElement;
    gameOverBlock: HTMLDivElement;

    crashImages: Images[];
    backgroundImage: Images;
    counterImages: Images[];

    // cswAI: BaseCPU; // TODO: make it more easy to choose different AIs
    gameInfo: HTMLCanvasElement;
    titleBlock: HTMLDivElement;
    gameFieldBlock: HTMLCanvasElement;
    cpuImages: Images[];
    blackbackgroundImage: Images;
    obstacleImage: Images;
    borderImage: Images;
    spaceBrickImages: Images[];
    gameCam: Camera;

    constructor() {
        // TODO: write the full paths to classes
        this.cswArr = [];
        this.ghosts = [];
        this.bulletsArr = [];
        this.delayedPics = [];
        this.drawContext = null;
        this.againBtn = null;
        this.gameOverBlock = null;
        this.crashImages = [];
        this.backgroundImage = null;
        this.counterImages = null;
        this.playerInstance = null;
    }

    init(): Promise<unknown[]> {
        const gameField: HTMLCanvasElement = document.getElementById("gameField") as HTMLCanvasElement;

        gameField.height = CONST.SCREENMAXY * CONST.CELLSIZES.MAXY * CONST.SCALE.Y;
        gameField.width = CONST.SCREENMAXX * CONST.CELLSIZES.MAXX * CONST.SCALE.X;

        // TODO: create new ui class and move these things to it
        // this.gameInfo = document.getElementById("gameInfo");
        this.againBtn = document.querySelector("#playAgainBtn");
        this.gameOverBlock = document.querySelector("#gameOverBlock");
        this.titleBlock = document.querySelector("#titleBlock");
        this.gameFieldBlock = gameField;

        this.drawContext = gameField.getContext("2d");
        Images.drawContext = this.drawContext;
        //this.infoContext = this.gameInfo.getContext("2d");

        // TODO: make separate editor class?
        // current object chosen to place on the map
        this.playerImages = [];
        this.cpuImages = [];
        this.crashImages = [];
        this.backgroundImage = null;
        this.blackbackgroundImage = null;
        this.obstacleImage = null;
        this.borderImage = null;
        this.spaceBrickImages = [];
        this.counterImages = [];
        this.gameCam = new Camera(this);

        const loadImage = Images.loadImage;
        const loadManyImages = Images.loadManyImages;

        // TODO: it should be a function which will preload images.
        // First it should collect paths to images from classes (csw, cswai, obstacle, etc.)
        // Every class will have a variable with image. Now it can only call the "draw" function.
        // Image field should be in csw class. This way player should have a separate class.
        const promises = [
            loadManyImages(
                [
                    "images/csw-mt9bigger2x_90.png",
                    "images/csw-mt9bigger2x_180.png",
                    "images/csw-mt9bigger2x_270.png",
                    "images/csw-mt9bigger2x_0.png",
                ],
                this.playerImages
            ),

            loadManyImages(
                [
                    "images/csw-mt5bigger2x_90.png",
                    "images/csw-mt5bigger2x_180.png",
                    "images/csw-mt5bigger2x_270.png",
                    "images/csw-mt5bigger2x_0.png",
                ],
                this.cpuImages
            ),

            loadManyImages(
                [
                    "images/crash.png",
                    "images/crash1.png",
                    "images/crash2.png",
                    "images/crash3.png",
                    "images/crash4.png",
                    "images/crash5.png",
                ],
                this.crashImages
            ),

            // loadImage.call(this, "images/background-cats.jpg", function (image) {
            //     this.backgroundImage = image;
            // }),

            loadImage("images/background.png", (image: Images) => {
                this.backgroundImage = image;
            }),

            loadImage("images/blackbackground.png", (image: Images) => {
                this.blackbackgroundImage = image;
            }),

            loadImage("images/obstacle3.png", (image: Images) => {
                this.obstacleImage = image;
            }),

            loadManyImages(
                [
                    "images/space_brick-4.png",
                    "images/space_brick-3.png",
                    "images/space_brick-2.png",
                    "images/space_brick-1.png",
                    "images/space_brick-0.png",
                ],
                this.spaceBrickImages
            ),

            loadImage("images/border.png", (image: Images) => {
                this.borderImage = image;
            }),

            // loadImage.call(this, "images/border.png", this.borderImage),

            loadManyImages(
                [
                    "images/counter-0.png",
                    "images/counter-1.png",
                    "images/counter-2.png",
                    "images/counter-3.png",
                    "images/counter-4.png",
                    "images/counter-5.png",
                    "images/counter-6.png",
                    "images/counter-7.png",
                    "images/counter-8.png",
                    "images/counter-9.png",
                ],
                this.counterImages
            ),
        ];
        return Promise.all(promises);
    }

    placeBorders(): void {
        for (var x = 0; x < CONST.MAXX + 2; x++) {
            this.createCSW(
                (x - 1) * CONST.CELLSIZES.MAXX,
                -1 * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                ObjectType.OBSTACLE,
                true
            );
            this.createCSW(
                (x - 1) * CONST.CELLSIZES.MAXX,
                CONST.MAXY * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                ObjectType.OBSTACLE,
                true
            );
        }

        for (var y = 0; y < CONST.MAXY + 1; y++) {
            this.createCSW(
                -1 * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                ObjectType.OBSTACLE,
                true
            );
            this.createCSW(
                CONST.MAXX * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                ObjectType.OBSTACLE,
                true
            );
        }
    }

    pushNewObject(obj: BaseCSW, ghost: boolean): void {
        if (ghost) {
            this.ghosts.push(obj);
        } else {
            this.cswArr.push(obj);
        }
    }

    getGameCam(): Camera {
        return this.gameCam;
    }

    // TODO: is it good that BTankManager knows which fields CSW class contains ?
    createCSW(
        x: number,
        y: number,
        who: Who, // TODO: this field should be in ship class (csw or cswai or obstacle)
        delay?: number,
        typeParam?: ObjectType,
        ghost?: boolean,
        wayPoints?: WayPoints[]
    ): void | Player {
        let c1 = null;
        const type = typeParam || ObjectType.SHIP;
        if (who === CONST.USER) {
            c1 = new Player();
            this.playerInstance = c1;
            c1.init(x, y, who, this);
            this.pushNewObject(c1, ghost);
            return c1;
        } else if (who === CONST.COMPUTER) {
            // TODO: make delayed parameter as a field in class so BTankManager should decide from this field how to create new instance
            setTimeout(
                function () {
                    // this code should be extendable
                    // TODO: implement some pattern to not write thousands if-s
                    if (type === ObjectType.SHIP) {
                        c1 = new CSWAI_customPaths();
                        c1.init(x, y, who, this, wayPoints);
                        this.pushNewObject(c1, ghost);
                    }
                }.bind(this),
                delay
            );

            if (type === ObjectType.OBSTACLE) {
                c1 = new Obstacle();
                c1.init(x, y, who, this);
                this.pushNewObject(c1, ghost);
            }

            if (type === ObjectType.SPACEBRICK) {
                c1 = new SpaceBrick();
                c1.init(x, y, who, this);
                this.pushNewObject(c1, ghost);
            }

            if (type === ObjectType.COUNTER) {
                c1 = new Counter(this);
                c1.init(x, y, who, this);
                this.pushNewObject(c1, ghost);
            }
        }
    }

    // x, y - coordinates of pixels, not cells
    checkCSWWithPixelPrecision(x: number, y: number, whoAsks: BaseCSW): boolean {
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

    getShipDimensions(direction: Direction, iam: number): RectSize {
        const image =
            iam === CONST.COMPUTER
                ? this.cpuImages[direction].image
                : this.playerImages[direction].image;
        return {
            width: image.width * CONST.SCALE.X,
            height: image.height * CONST.SCALE.Y,
        };
    }

    checkIfTwoShipsCross(nx: number, ny: number, whoAsks: BaseCSW, _typeToCheckParam: ObjectType): BaseCSW {
        // const debugDraw = (function(x,y,w,h) {
        //     this.drawContext.strokeStyle = "#0f0";
        //     this.drawContext.strokeRect(x, y, w, h);
        // }).bind(this);
        // const typeToCheck = typeToCheckParam || CONST.TYPES.SHIP;

        const checkSquare = function (csw: BaseCSW, x: number, y: number) {
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
                if (whoAsks === csw) {
                    return false;
                }

                const checkResult = checkSquare(csw, nx, ny) ||
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

    getBulletWithPixelPrecision(x: number, y: number, parentShip: BaseCSW, bulletInst: Bullet): Bullet {
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
        const tArr = this.cswArr.filter(function (csw: BaseCSW) {
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
        return this.cswArr;
    }

    getAllBullets(): Bullet[] {
        return this.bulletsArr;
    }

    addShip(ship: BaseCSW) {
        this.cswArr.push(ship);
    }

    createDelayedPic(x: number, y: number) {
        const dp = new DelayedPic();
        // const relXY = this.gameCam.getRelCoords(x, y);
        // dp.init(relXY.x, relXY.y, this);
        dp.init(x, y, this, this.crashImages.length);
        this.delayedPics.push(dp);
    }

    removeDelayedPic(dpObj: DelayedPic) {
        this.delayedPics = this.delayedPics.filter(dp => dp !== dpObj);
    }

    getAllDelayedPics(): DelayedPic[] {
        return this.delayedPics;
    }

    removeBullet(bullet: Bullet) {
        this.bulletsArr = this.bulletsArr.filter(b => b !== bullet);
    }

    removeShip(ship: BaseCSW) {
        this.cswArr = this.cswArr.filter(s => s !== ship);
    }

    destroyAll() {
        this.cswArr = [];
    }

    // user
    // TODO: move entirely to the player class
    drawcswmt9(x: number, y: number, d: Direction) {
        // console.log(["gamecam:", this.gameCam.x, this.gameCam.y]);
        this.playerImages[d].draw(
            x,
            y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(Math.floor(x), Math.floor(y), 39,39);
        // this.drawContext.lineWidth=0.1;
    }

    drawcswmt9ghost(x: number, y: number, d: Direction) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.playerImages[d].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    // cpu
    drawcswmt5(x: number, y: number, d: Direction) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.cpuImages[d].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawObstacle(x: number, y: number) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.obstacleImage.draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawBorder(x: number, y: number) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.borderImage.draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawStaticShip(x: number, y: number) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.cpuImages[0].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawSpaceBrick(x: number, y: number, n: number) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.spaceBrickImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    drawWayPoint(x: number, y: number, n: number) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.counterImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    drawCounter(x: number, y: number, n: number) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.counterImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    DrawCrash(x: number, y: number, frameNumber: number) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.crashImages[frameNumber].draw(
            relXY.x,
            relXY.y,
            20 * CONST.SCALE.X * 2,
            20 * CONST.SCALE.Y * 2
        );
        // this.crashImage.draw(x, y, 0, onDelayEnd);
    }

    drawBackground() {
        const relXY = this.gameCam.getRelCoords(0, 0);
        const blackHeight = CONST.SCREENMAXY * CONST.CELLSIZES.MAXY * CONST.SCALE.Y;
        const blackWidth = CONST.SCREENMAXX * CONST.CELLSIZES.MAXX * CONST.SCALE.X;
        this.blackbackgroundImage.draw(0, 0, blackWidth, blackHeight);

        const bWidth = 1920, bHeight = 1080;
        // const bWidth = 1024, bHeight = 1024;
        const backgroundCountX = (CONST.MAXX * CONST.CELLSIZES.MAXX) / bWidth;
        const backgroundCountY = (CONST.MAXY * CONST.CELLSIZES.MAXY) / bHeight;
        const truncX = Math.trunc(backgroundCountX);
        const truncY = Math.trunc(backgroundCountY);
        const frX = backgroundCountX % 1;
        const frY = backgroundCountY % 1;
        for (let cx = 0; cx <= truncX; cx++) {
            for (let cy = 0; cy <= truncY; cy++) {
                if (cx === truncX || cy === truncY) {
                    this.backgroundImage.draw(
                        0, 0,
                        cx === truncX ? Math.round(bWidth * frX) : bWidth,
                        cy === truncY ? Math.round(bHeight * frY) : bHeight,
                        relXY.x + (bWidth * cx),
                        relXY.y + (bHeight * cy),
                        cx === truncX ? Math.round(bWidth * frX) : bWidth,
                        cy === truncY ? Math.round(bHeight * frY) : bHeight,
                    );
                } else {
                    this.backgroundImage.draw(
                        // Math.round(relXY.x) + (bWidth * cx),
                        // Math.round(relXY.y) + (bHeight * cy),
                        relXY.x + (bWidth * cx),
                        relXY.y + (bHeight * cy),
                        bWidth,
                        bHeight
                    );
                }
            }
        }
        // this.backgroundImage.draw(relXY.x, relXY.y, 1920, 1080);
    }

    showLogo() {
        // this.infoContext.fillStyle = "lightgreen";
        // this.infoContext.strokeStyle = "#F00";
        // this.infoContext.font = "30pt Arial";
        // this.infoContext.fillText("Space Town!", 0, 30);
    }

    showNames() {
        // this.infoContext.fillStyle = "gray";
        // this.infoContext.strokeStyle = "#F00";
        // this.infoContext.font = "20pt Arial";
        // this.infoContext.fillText("p1 life:", 0, 60);

        // this.infoContext.fillStyle = "gray";
        // this.infoContext.strokeStyle = "#F00";
        // this.infoContext.font = "20pt Arial";
        // this.infoContext.fillText("cpu life:", 0, 90);
    }

    showGameOver() {
        this.gameOverBlock.innerText = "GAME OVER";
        this.againBtn.style.display = "block";
        this.gameOverBlock.style.display = "block";
    }

    showWin() {
        this.againBtn.style.display = "block";
        this.gameOverBlock.innerText = "YOU WIN";
        this.gameOverBlock.style.display = "block";
    }

    displayLifeBar(_player: Player) {
        // const LIFEBARMAXWIDTH = 200;
        // const onePercent = player.maxlife / LIFEBARMAXWIDTH;
        // if (player.iam) {
        //     // player
        //     this.infoContext.fillStyle = "#000";
        //     this.infoContext.fillRect(100, 40, 200, 20);

        //     this.infoContext.fillStyle = "#0F0";
        //     this.infoContext.strokeStyle = "#0F0";
        //     this.infoContext.strokeRect(100, 40, 200, 20);
        //     this.infoContext.fillRect(
        //         100,
        //         40,
        //         Math.ceil(player.life / onePercent),
        //         20
        //     );
        // } else {
        //     this.infoContext.fillStyle = "#000";
        //     this.infoContext.fillRect(100, 70, 200, 20);

        //     this.infoContext.fillStyle = "#F00";
        //     this.infoContext.strokeStyle = "#F00";
        //     this.infoContext.strokeRect(100, 70, 200, 20);
        //     this.infoContext.fillRect(
        //         100,
        //         70,
        //         Math.ceil(player.life / onePercent),
        //         20
        //     );
        // }
    }
};
