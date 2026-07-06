import { on } from 'process';
import { Camera } from './camera';
import { CONST } from './const';
import { Images, OnGetLoadingStatusHandler } from './images';
import { Dimensions, Who, Direction, RectSize } from './types';

const LOADING_STATUS_WIDTH = 400;

export class ImagesStore {
    crashImages: Images[];
    backgroundImage!: Images;
    counterImages: Images[];
    cpuImages: Images[];
    blackbackgroundImage!: Images;
    obstacleImage!: Images;
    borderImage!: Images;
    bulletImage!: Images;
    spaceBrickImages: Images[];
    playerImages: Images[];

    constructor() {
        this.crashImages = [];
        this.counterImages = [];
        this.cpuImages = [];
        this.spaceBrickImages = [];
        this.playerImages = [];
    }

    init(): Promise<unknown[]> {
        const loadImage = Images.loadImage;
        const loadManyImages = Images.loadManyImages;
        const onLoading: OnGetLoadingStatusHandler = (total, resolved) => {
            const loadingStatus = document.querySelector(
                '.loading-status',
            ) as HTMLDivElement;
            const loadingStatusContainer = document.querySelector(
                '.loading-status-container',
            ) as HTMLDivElement;
            if (
                loadingStatusContainer &&
                loadingStatusContainer.style.display === ''
            ) {
                loadingStatusContainer.style.display = 'block';
                loadingStatusContainer.style.width = `${LOADING_STATUS_WIDTH}px`;
            }
            if (loadingStatus) {
                loadingStatus.style.width = `${
                    (resolved / total) * LOADING_STATUS_WIDTH - 2
                }px`;
            }
        };

        const promises = [
            loadManyImages(
                [
                    'images/csw-mt9bigger2x_90.png',
                    'images/csw-mt9bigger2x_180.png',
                    'images/csw-mt9bigger2x_270.png',
                    'images/csw-mt9bigger2x_0.png',
                ],
                this.playerImages,
                onLoading,
            ),

            loadManyImages(
                [
                    'images/csw-mt5bigger2x_90.png',
                    'images/csw-mt5bigger2x_180.png',
                    'images/csw-mt5bigger2x_270.png',
                    'images/csw-mt5bigger2x_0.png',
                ],
                this.cpuImages,
                onLoading,
            ),

            loadManyImages(
                [
                    'images/crash.png',
                    'images/crash1.png',
                    'images/crash2.png',
                    'images/crash3.png',
                    'images/crash4.png',
                    'images/crash5.png',
                ],
                this.crashImages,
                onLoading,
            ),

            // loadImage.call(this, "images/background-cats.jpg", function (image) {
            //     this.backgroundImage = image;
            // }),

            loadImage(
                'images/skybox_right.png',
                (image: Images) => {
                    this.backgroundImage = image;
                },
                onLoading,
            ),

            loadImage(
                'images/blackbackground.png',
                (image: Images) => {
                    this.blackbackgroundImage = image;
                },
                onLoading,
            ),

            loadImage(
                'images/obstacle3.png',
                (image: Images) => {
                    this.obstacleImage = image;
                },
                onLoading,
            ),

            loadManyImages(
                [
                    'images/space_brick-4.png',
                    'images/space_brick-3.png',
                    'images/space_brick-2.png',
                    'images/space_brick-1.png',
                    'images/space_brick-0.png',
                ],
                this.spaceBrickImages,
                onLoading,
            ),

            loadImage(
                'images/border.png',
                (image: Images) => {
                    this.borderImage = image;
                },
                onLoading,
            ),

            loadImage(
                'images/border.png',
                (image: Images) => {
                    // TODO: create a picture of bullet in Aseprite later
                    this.bulletImage = image;
                },
                onLoading,
            ),

            // loadImage.call(this, "images/border.png", this.borderImage),

            loadManyImages(
                [
                    'images/counter-0.png',
                    'images/counter-1.png',
                    'images/counter-2.png',
                    'images/counter-3.png',
                    'images/counter-4.png',
                    'images/counter-5.png',
                    'images/counter-6.png',
                    'images/counter-7.png',
                    'images/counter-8.png',
                    'images/counter-9.png',
                ],
                this.counterImages,
                onLoading,
            ),
        ];
        return Promise.all(promises);
    }
}

export class DrawingManager {
    imagesStore: ImagesStore;
    gameCam: Camera;

    constructor(imagesStoreInstance: ImagesStore, cameraInstance: Camera) {
        this.imagesStore = imagesStoreInstance;
        this.gameCam = cameraInstance;
    }

    init(): Promise<unknown[]> {
        return this.imagesStore.init();
    }

    initDimensions(who: Who): Dimensions {
        return {
            0: this.getShipDimensions(0, who),
            1: this.getShipDimensions(1, who),
            2: this.getShipDimensions(2, who),
            3: this.getShipDimensions(3, who),
            '-1': { width: 0, height: 0 },
        };
    }

    getShipDimensions(direction: Direction, iam: number): RectSize {
        const image =
            iam === CONST.COMPUTER
                ? this.imagesStore.cpuImages[direction].image
                : this.imagesStore.playerImages[direction].image;
        return {
            width: image.width * CONST.SCALE.X,
            height: image.height * CONST.SCALE.Y,
        };
    }

    // user
    // TODO: move entirely to the player class
    drawcswmt9(x: number, y: number, d: Direction): void {
        // console.log(["gamecam:", this.gameCam.x, this.gameCam.y]);
        this.imagesStore.playerImages[d].draw(
            x,
            y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(Math.floor(x), Math.floor(y), 39,39);
        // this.drawContext.lineWidth=0.1;
    }

    drawcswmt9ghost(x: number, y: number, d: Direction): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.playerImages[d].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
    }

    // cpu
    drawcswmt5(x: number, y: number, d: Direction): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.cpuImages[d].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawObstacle(x: number, y: number): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.obstacleImage.draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawBorder(x: number, y: number): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.borderImage.draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawStaticShip(x: number, y: number): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.cpuImages[0].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
        // this.drawContext.strokeStyle="#f00";
        // this.drawContext.strokeRect(x, y, 39,39);
    }

    drawSpaceBrick(x: number, y: number, n: number): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.spaceBrickImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
    }

    drawWayPoint(x: number, y: number, n: number): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.counterImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
    }

    drawCounter(x: number, y: number, n: number): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.counterImages[n].draw(
            relXY.x,
            relXY.y,
            CONST.CELLSIZES.MAXX * CONST.SCALE.X,
            CONST.CELLSIZES.MAXY * CONST.SCALE.Y,
        );
    }

    DrawCrash(x: number, y: number, frameNumber: number): void {
        const relXY = this.gameCam.getRelCoords(x, y);
        this.imagesStore.crashImages[frameNumber].draw(
            relXY.x,
            relXY.y,
            20 * CONST.SCALE.X * 2,
            20 * CONST.SCALE.Y * 2,
        );
        // this.crashImage.draw(x, y, 0, onDelayEnd);
    }

    drawFPS(fps: number): void {
        const ctx = Images.drawContext;
        const padding = 12;
        ctx.save();
        ctx.font = 'bold 14pt monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(`FPS: ${fps}`, padding, padding + 14);
        ctx.restore();
    }

    drawLifeBar(life: number, maxLife: number): void {
        const ctx = Images.drawContext;
        const barWidth = 200;
        const barHeight = 20;
        const padding = 2;
        const top = 12;
        const left = (ctx.canvas.width - barWidth) / 2;

        const segmentGap = 2;
        const segmentWidth =
            (barWidth - padding * 2 - segmentGap * (maxLife - 1)) / maxLife;

        ctx.save();

        ctx.fillStyle = '#000';
        ctx.fillRect(left, top, barWidth, barHeight);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, barWidth, barHeight);

        for (let i = 0; i < maxLife; i++) {
            const segX = left + padding + i * (segmentWidth + segmentGap);
            ctx.fillStyle = i < life ? '#0f0' : '#333';
            ctx.fillRect(
                segX,
                top + padding,
                segmentWidth,
                barHeight - padding * 2,
            );
        }

        ctx.restore();
    }

    drawLives(lives: number): void {
        const ctx = Images.drawContext;
        const padding = 12;
        ctx.save();
        ctx.font = 'bold 14pt monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(`LIVES: ${lives}`, padding, ctx.canvas.height - padding);
        ctx.restore();
    }

    drawPlayerBullet(x: number, y: number): void {
        Images.drawContext.fillStyle = '#F00';
        const relXY = this.gameCam.getRelCoords(x, y);
        Images.drawContext.fillRect(relXY.x, relXY.y, 4, 4);
    }

    drawCPUBullet(x: number, y: number): void {
        Images.drawContext.fillStyle = '#FF0';
        const relXY = this.gameCam.getRelCoords(x, y);
        Images.drawContext.fillRect(relXY.x, relXY.y, 4, 4);
    }

    drawBackground(): void {
        const relXY = this.gameCam.getRelCoords(0, 0);
        const blackHeight = document.body.clientHeight;
        // CONST.SCREENMAXY * CONST.CELLSIZES.MAXY * CONST.SCALE.Y;
        const blackWidth = document.body.clientWidth;
        // CONST.SCREENMAXX * CONST.CELLSIZES.MAXX * CONST.SCALE.X;

        this.imagesStore.blackbackgroundImage.draw(
            0,
            0,
            blackWidth,
            blackHeight,
        );

        const bWidth = 4096,
            bHeight = 4096;
        // const bWidth = 1920,
        //     bHeight = 1080;
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
                    this.imagesStore.backgroundImage.draw(
                        0,
                        0,
                        cx === truncX ? Math.round(bWidth * frX) : bWidth,
                        cy === truncY ? Math.round(bHeight * frY) : bHeight,
                        relXY.x + bWidth * cx,
                        relXY.y + bHeight * cy,
                        cx === truncX ? Math.round(bWidth * frX) : bWidth,
                        cy === truncY ? Math.round(bHeight * frY) : bHeight,
                    );
                } else {
                    this.imagesStore.backgroundImage.draw(
                        // Math.round(relXY.x) + (bWidth * cx),
                        // Math.round(relXY.y) + (bHeight * cy),
                        relXY.x + bWidth * cx,
                        relXY.y + bHeight * cy,
                        bWidth,
                        bHeight,
                    );
                }
            }
        }
        // this.backgroundImage.draw(relXY.x, relXY.y, 1920, 1080);
    }
}
