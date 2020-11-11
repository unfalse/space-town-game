import { CONST } from './const';
import { Obstacle, SpaceBrick } from './cswai';
import { Bullet } from './bullet';
import { Counter } from './counter';
import { Camera } from './cam';
import { Images } from './images';
import { DelayedPic } from './delayedPic';
import { ObjectType, Who } from './types';
import { Player } from './player';
import { BaseCSW } from './base/baseCsw';

// -------------------------------------
//    TOFIX! bullet dep propagation
// -------------------------------------

// Tanks manager and draw manager
// BattleTankGame.deps.BTankManager = function (
export class BTankManager {
    playerInstance: Player;
    playerImages: Images[];
    cswArr: BaseCSW[];
    ghosts: BaseCSW[];
    bulletsArr: any[];
    delayedPics: any[];
    drawContext: any;
    infoContext: any;
    againBtn: any;
    gameOverBlock: any;
    crashImages: any[];
    backgroundImage: any;
    counterImages: any;
    cswAI: any;
    delayedPic: any;
    gameInfo: HTMLElement;
    titleBlock: any;
    gameFieldBlock: HTMLElement;
    cpuImages: {};
    crashImage: any[];
    blackbackgroundImage: any;
    obstacleImage: any;
    borderImage: any;
    spaceBrickImages: any[];
    gameCam: any;
    constructor(
        cswAI,
        // obstacle,
        // spaceBrick,
        // bullet,
        // counter,
        // camera,
        // border,
        // images,
        // delayedPic
    ) {
        // TODO: dependencies in parameters are completely redundant! (CONST, csw, bullet, images)
        // TODO: write the full paths to classes
        this.cswArr = [];
        this.ghosts = [];
        this.bulletsArr = [];
        this.delayedPics = [];
        this.drawContext = null;
        this.infoContext = null;
        this.againBtn = null;
        this.gameOverBlock = null;
        this.crashImages = [];
        this.backgroundImage = null;
        this.counterImages = null;
        this.playerInstance = null;

        this.cswAI = cswAI;
        //this.obstacle = Obstacle;
        // this.spaceBrick = SpaceBrick;
        // Counter = Counter;
        // Camera = Camera;
        // Border = Border;
        Images = Images;
        this.delayedPic = DelayedPic;
    }

    init() {
        const gameField: HTMLCanvasElement = document.getElementById("gameField") as HTMLCanvasElement;
        // TODO: change 20 to CELLSIZES !!

        gameField.height = CONST.SCREENMAXY * CONST.CELLSIZES.MAXY * CONST.SCALE.Y;
        gameField.width = CONST.SCREENMAXX * CONST.CELLSIZES.MAXX * CONST.SCALE.X;

        // TODO: create new ui class and move these things to it
        this.gameInfo = document.getElementById("gameInfo");
        this.againBtn = document.querySelector("#playAgainBtn");
        this.gameOverBlock = document.querySelector("#gameOverBlock");
        this.titleBlock = document.querySelector("#titleBlock");
        this.gameFieldBlock = gameField;

        this.drawContext = gameField.getContext("2d");
        //this.infoContext = this.gameInfo.getContext("2d");

        // TODO: make separate editor class?
        // current object chosen to place on the map
        this.playerImages = [];
        this.cpuImages = {};
        this.crashImage = [];
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
            loadManyImages.call(
                this,
                [
                    "images/csw-mt9bigger2x_90.png",
                    "images/csw-mt9bigger2x_180.png",
                    "images/csw-mt9bigger2x_270.png",
                    "images/csw-mt9bigger2x_0.png",
                ],
                this.playerImages
            ),

            loadManyImages.call(
                this,
                [
                    "images/csw-mt5bigger2x_90.png",
                    "images/csw-mt5bigger2x_180.png",
                    "images/csw-mt5bigger2x_270.png",
                    "images/csw-mt5bigger2x_0.png",
                ],
                this.cpuImages
            ),

            loadManyImages.call(
                this,
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

            loadImage.call(this, "images/background.png", function (image) {
                this.backgroundImage = image;
            }),

            loadImage.call(this, "images/blackbackground.png", function (image) {
                this.blackbackgroundImage = image;
            }),

            loadImage.call(this, "images/obstacle3.png", function (image) {
                this.obstacleImage = image;
            }),

            loadManyImages.call(
                this,
                [
                    "images/space_brick-4.png",
                    "images/space_brick-3.png",
                    "images/space_brick-2.png",
                    "images/space_brick-1.png",
                    "images/space_brick-0.png",
                ],
                this.spaceBrickImages
            ),

            loadImage.call(this, "images/border.png", function (image) {
                this.borderImage = image;
            }),

            // loadImage.call(this, "images/border.png", this.borderImage),

            loadManyImages.call(
                this,
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

    placeBorders() {
        for (var x = 0; x < CONST.MAXX + 2; x++) {
            this.createCSW(
                (x - 1) * CONST.CELLSIZES.MAXX,
                -1 * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                CONST.TYPES.OBSTACLE,
                true
            );
            this.createCSW(
                (x - 1) * CONST.CELLSIZES.MAXX,
                CONST.MAXY * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                CONST.TYPES.OBSTACLE,
                true
            );
        }

        for (var y = 0; y < CONST.MAXY + 1; y++) {
            this.createCSW(
                -1 * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                CONST.TYPES.OBSTACLE,
                true
            );
            this.createCSW(
                CONST.MAXX * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                0,
                CONST.TYPES.OBSTACLE,
                true
            );
        }
    }

    pushNewObject(obj, ghost) {
        if (ghost) {
            this.ghosts.push(obj);
        } else {
            this.cswArr.push(obj);
        }
    }

    getGameCam() {
        return this.gameCam;
    }

    // TODO: is it good that BTankManager knows which fields CSW class contains ?
    createCSW(
        x: number,
        y: number,
        who: Who, // TODO: this field should be in ship class (csw or cswai or obstacle)
        delay: number,
        typeParam: ObjectType,
        ghost: boolean,
        wayPoints: number[]
    ) {
        let c1 = null;
        const type = typeParam || CONST.TYPES.SHIP;
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
                    if (type === CONST.TYPES.SHIP) {
                        c1 = new this.cswAI(CONST, Bullet);
                        c1.init(x, y, who, this, wayPoints);
                        this.pushNewObject(c1, ghost);
                    }
                }.bind(this),
                delay
            );

            if (type === CONST.TYPES.OBSTACLE) {
                c1 = new Obstacle(CONST, Bullet);
                c1.init(x, y, who, this);
                this.pushNewObject(c1, ghost);
            }

            if (type === CONST.TYPES.SPACEBRICK) {
                c1 = new SpaceBrick(CONST, Bullet);
                c1.init(x, y, who, this);
                this.pushNewObject(c1, ghost);
            }

            if (type === CONST.TYPES.COUNTER) {
                c1 = new Counter(CONST, this);
                c1.init(x, y, who, this);
                this.pushNewObject(c1);
            }
        }
    }

    // x, y - coordinates of pixels, not cells
    checkCSWWithPixelPrecision(x, y, whoAsks) {
        const result = this.cswArr.filter(function (csw) {
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

    getShipDimensions(direction, iam, type) {
        const image =
            iam === CONST.COMPUTER
                ? this.cpuImages[direction].image
                : this.playerImages[direction].image;
        // TODO: remove this little hack
        // if (type === CONST.TYPES.OBSTACLE) {
        //     image.width = 30;
        //     image.height = 30;
        // }
        return {
            width: image.width * CONST.SCALE.X, // CONST.CELLSIZES.MAXX
            height: image.height * CONST.SCALE.Y, // CONST.CELLSIZES.MAXY
        };
    }

    checkIfTwoShipsCross(nx, ny, whoAsks, typeToCheckParam) {
        // const debugDraw = (function(x,y,w,h) {
        //     this.drawContext.strokeStyle = "#0f0";
        //     this.drawContext.strokeRect(x, y, w, h);
        // }).bind(this);
        // const typeToCheck = typeToCheckParam || CONST.TYPES.SHIP;

        const checkSquare = function (csw, x, y) {
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

        const tArr = this.cswArr.filter(function (csw) {
            if (whoAsks === csw) {
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

    getBulletWithPixelPrecision(x, y, parentShip, bulletInst) {
        const tArr = this.bulletsArr.filter(function (b) {
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
    getCSWWithPixelPrecision(x, y, whoAsks) {
        const tArr = this.cswArr.filter(function (csw) {
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

    getAllGhosts() {
        return this.ghosts;
    }

    getAllShips() {
        return this.cswArr;
    }

    getAllBullets() {
        return this.bulletsArr;
    }

    addShip(ship) {
        this.cswArr.push(ship);
    }

    createDelayedPic(x, y) {
        const dp = new this.delayedPic(CONST);
        // const relXY = this.gameCam.getRelCoords(x, y);
        // dp.init(relXY.x, relXY.y, this);
        dp.init(x, y, this, this.crashImages.length);
        this.delayedPics.push(dp);
    }

    removeDelayedPic(dpObj) {
        this.delayedPics = this.delayedPics.filter(function (dp) {
            return dp !== dpObj;
        });
    }

    getAllDelayedPics() {
        return this.delayedPics;
    }

    removeBullet(bullet) {
        this.bulletsArr = this.bulletsArr.filter(function (b) {
            return b !== bullet;
        });
    }

    removeShip(ship) {
        this.cswArr = this.cswArr.filter(function (s) {
            return s !== ship;
        });
    }

    destroyAll() {
        this.cswArr = [];
    }

    // user
    // TODO: move entirely to the player class
    drawcswmt9(x, y, d) {
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

    drawcswmt9ghost(x, y, d) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.playerImages[d].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    // cpu
    drawcswmt5(x, y, d) {
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

    drawObstacle(x, y) {
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

    drawBorder(x, y) {
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

    drawStaticShip(x, y) {
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

    drawSpaceBrick(x, y, n) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.spaceBrickImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    drawWayPoint(x, y, n) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.counterImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    drawCounter(x, y, n) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.counterImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y
        );
    }

    DrawCrash(x, y, frameCounter) {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.crashImages[frameCounter].draw(
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
        for(let cx = 0; cx <= truncX; cx++) {
            for(let cy = 0; cy <= truncY; cy++) {
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

    displayLifeBar(player) {
        return;
        const LIFEBARMAXWIDTH = 200;
        const onePercent = player.maxlife / LIFEBARMAXWIDTH;
        if (player.iam) {
            // player
            this.infoContext.fillStyle = "#000";
            this.infoContext.fillRect(100, 40, 200, 20);

            this.infoContext.fillStyle = "#0F0";
            this.infoContext.strokeStyle = "#0F0";
            this.infoContext.strokeRect(100, 40, 200, 20);
            this.infoContext.fillRect(
                100,
                40,
                Math.ceil(player.life / onePercent),
                20
            );
        } else {
            this.infoContext.fillStyle = "#000";
            this.infoContext.fillRect(100, 70, 200, 20);

            this.infoContext.fillStyle = "#F00";
            this.infoContext.strokeStyle = "#F00";
            this.infoContext.strokeRect(100, 70, 200, 20);
            this.infoContext.fillRect(
                100,
                70,
                Math.ceil(player.life / onePercent),
                20
            );
        }
    }
};
