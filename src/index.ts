// TODO: make a new project so everything is clean: git init from the start
import { CONST } from './const';
import { BTankManager } from './btank';
import { ImagesStore, DrawingManager } from './drawingMan';
import { Editor } from './editor/editor';
import { Utils } from './utils';
import { CSWAI_customPaths } from './cswai';
import { Player } from './player';
import { Camera } from './camera';
import { Direction } from './types';
import { ObjectsFactory } from './objFactory';
import { placeBorders } from './drawUtils';
import { EditorUI } from './editor/editorUI';
import { PointXY } from './base/baseCoord';
// import { IPlayer } from './interfaces';
// import { addDemoCounters } from './demoUtils';

type Keys = {
    ArrowRight: boolean;
    ArrowLeft: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
    a: boolean;
    s: boolean;
};

type ControlsMap = {
    ArrowRight: number;
    ArrowLeft: number;
    ArrowUp: number;
    ArrowDown: number;
    a: number;
};

// -----------------------------
//        Основная логика
// -----------------------------
class Game {
    mainIntervalId: number = null;
    gameOver = false;
    win = false;
    keys: Keys = {} as Keys;

    controlsMap: ControlsMap = {
        ArrowUp: 3,
        ArrowLeft: 2,
        ArrowRight: 0,
        ArrowDown: 1,
        a: 4,
    };

    // TODO: move player1 into BTankManager
    player1: Player = null;
    cameraInst: Camera;
    imagesStoreInst: ImagesStore;
    drawingManagerInst: DrawingManager;
    BTankInst: BTankManager;
    objFactoryGameInst: ObjectsFactory;
    EditorInst: Editor;
    EditorUIInst: EditorUI;

    constructor() {
        // const gameField = document.getElementById("gameField");

        this.cameraInst = new Camera();
        this.imagesStoreInst = new ImagesStore();
        this.drawingManagerInst = new DrawingManager(
            this.imagesStoreInst,
            this.cameraInst,
        );
        this.BTankInst = new BTankManager(this.player1);
        this.BTankInst.init();

        this.objFactoryGameInst = new ObjectsFactory(
            this.drawingManagerInst,
            this.BTankInst,
        );
        this.EditorInst = new Editor(this.objFactoryGameInst);
        this.EditorUIInst = new EditorUI(this.EditorInst);
    }

    start() {
        this.drawingManagerInst.init().then(
            function () {
                this.EditorInst.init(this.BTankInst, this.EditorUIInst);

                this.player1 = this.objFactoryGameInst.createCSW(
                    0,
                    600,
                    CONST.USER,
                ) as Player;
                this.BTankInst.pushNewObjects([this.player1]);

                // addDemoCounters(objFactoryGameInst, BTankInst);

                placeBorders(this.objFactoryGameInst, this.BTankInst);

                // for (let i = 0; i < 100; i++) {
                //     BTank.createCSW(940, 480, CONST.COMPUTER, 0);
                // }

                this.gameOver = false;
                this.win = false;

                document.addEventListener(
                    'keydown',
                    this.keysHandler.bind(this),
                );
                document.addEventListener('keyup', this.keysHandler.bind(this));

                this.BTankInst.gameFieldBlock.addEventListener(
                    'mousedown',
                    this.editorMouseDownHandler.bind(this),
                );
                this.BTankInst.gameFieldBlock.addEventListener(
                    'mousemove',
                    this.editorMouseDownHandler.bind(this),
                );

                this.mainIntervalId = window.requestAnimationFrame(
                    this.mainCycle.bind(this),
                );
            }.bind(this),
        );
    }

    mainCycle(timestamp: number) {
        // console.log(timestamp);
        this.drawingManagerInst.drawBackground();

        if (this.EditorInst.editorMode) {
            this.editorCycle(timestamp);
        } else {
            this.gameCycle(timestamp);
        }

        this.mainIntervalId = window.requestAnimationFrame(
            this.mainCycle.bind(this),
        );
    }

    editorCycle(_timestamp: number) {
        this.detectEditorMovement();
        // player1.update();
        // gameCam.setCoords(player1.x, player1.y);

        this.EditorInst.editorUnits.forEach(unit => {
            // unit.update(timestamp);
            unit.draw();
        });

        this.EditorInst.editorGhosts.forEach(ghost => {
            ghost.draw();
        });

        if (this.EditorInst.currentShipWithWaypoints) {
            this.EditorInst.currentShipWithWaypoints.wayPoints.forEach(
                (wp, wpIndex) => {
                    this.drawingManagerInst.drawWayPoint(
                        wp[0],
                        wp[1],
                        wpIndex + 1,
                    );
                },
            );
        }
    }

    gameCycle(timestamp: number) {
        if (this.player1.life > 0) {
            this.detectMovement(timestamp);
            this.player1.update(timestamp);
            this.cameraInst.setCoords(this.player1.x, this.player1.y);
        }

        // temporarily disabled bullets
        // I will deal with their collisions later
        // when collisions with ships will be finished
        /*
        this.BTankInst.getAllBullets().forEach(bullet => {
            bullet.fly();
        });
        */

        this.BTankInst.getAllShips().forEach(ship => {
            ship.update(timestamp);
        });

        this.processCollisions();

        this.BTankInst.getAllShips().forEach(ship => {
            ship.draw();
        });

        this.BTankInst.getAllObstacles().forEach(ship => {
            ship.draw();
        });

        this.BTankInst.getAllDelayedPics().forEach(pic => {
            pic.draw();
        });

        this.BTankInst.getAllGhosts().forEach(ghost => {
            ghost.draw();
        });

        // BTankInst.displayLifeBar(player1);

        if (!this.gameOver && (this.win || this.player1.life <= 0)) {
            if (this.win) {
                Utils.text('YOU WIN');
                this.BTankInst.showWin();
            } else {
                Utils.text('GAME OVER');
                this.BTankInst.showGameOver();
            }

            this.gameOver = true;
        }
        //console.log('cswArr = ', BTank.cswArr.length);
    }

    collisionFixX(result: number[]) {
        const resultMask = result.join(',').replace(/,/g, '');
        if (CONST.COLLISION_MASKS.RIGHT.includes(resultMask)) {
            return -40;
        }
        if (CONST.COLLISION_MASKS.LEFT.includes(resultMask)) {
            return 40;
        }
        return 0;
    }

    collisionFixY(result: number[]) {
        const resultMask = result.join(',').replace(/,/g, '');
        if (CONST.COLLISION_MASKS.DOWN.includes(resultMask)) {
            return -40;
        }
        if (CONST.COLLISION_MASKS.UP.includes(resultMask)) {
            return 40;
        }
        return 0;
    }

    processCollisions() {
        const btank = this.BTankInst;
        const dynamicGrid = btank.dynamicCollisionGrid;
        const staticGrid = btank.staticCollisionGrid;
        const rows = Object.keys(dynamicGrid);

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
                    for (const gameObject of ships) {
                        const collision = this.BTankInst.checkIfTwoObjectsCrossInsideACell(
                            gameObject,
                            objectsToCheck,
                        );
                        if (collision) {
                            const { stepsHistory } = gameObject;
                            const initialXY: PointXY = {
                                x: stepsHistory[0].x,
                                y: stepsHistory[0].y,
                            };
                            const newCoords_horizontal: PointXY = {
                                x: initialXY.x + stepsHistory[0].ux,
                                y: initialXY.y + stepsHistory[0].uy,
                            };
                            const newCoords_vertical: PointXY = {
                                x: initialXY.x + stepsHistory[1].ux,
                                y: initialXY.y + stepsHistory[1].uy,
                            };

                            // let newX = gameObject.x,
                            //     newY = gameObject.y;

                            // newX =
                            //     collision.collidedObject.x +
                            //     this.collisionFixX(collision.result);
                            // newY =
                            //     collision.collidedObject.y +
                            //     this.collisionFixY(collision.result);
                            const collisionHorizontal = this.BTankInst.checkIfTwoObjectsCrossInsideACell(
                                gameObject,
                                objectsToCheck,
                                newCoords_horizontal,
                            );

                            let newX = gameObject.x,
                                newY = gameObject.y;
                            if (collisionHorizontal) {
                                gameObject.inertiaDirections[
                                    CONST.DIRECTIONS.LEFT as Direction
                                ] = 0;
                                gameObject.inertiaDirections[
                                    CONST.DIRECTIONS.RIGHT as Direction
                                ] = 0;
                                const fixX = this.collisionFixX(
                                    collisionHorizontal.result,
                                );
                                newX =
                                    fixX === 0
                                        ? gameObject.x
                                        : collisionHorizontal.collidedObject.x +
                                          fixX;
                            }

                            const collisionVertical = this.BTankInst.checkIfTwoObjectsCrossInsideACell(
                                gameObject,
                                objectsToCheck,
                                newCoords_vertical,
                            );
                            if (collisionVertical) {
                                gameObject.inertiaDirections[
                                    CONST.DIRECTIONS.UP as Direction
                                ] = 0;
                                gameObject.inertiaDirections[
                                    CONST.DIRECTIONS.DOWN as Direction
                                ] = 0;
                                const fixY = this.collisionFixY(
                                    collisionVertical.result,
                                );
                                newY =
                                    fixY === 0
                                        ? gameObject.y
                                        : collisionVertical.collidedObject.y +
                                          fixY;
                            }

                            gameObject.initCoords(newX, newY, gameObject.d);
                        }
                    }
                }
            }
        }

        // clear dynamic grid
        this.BTankInst.dynamicCollisionGrid = [];
    }

    editorMouseDownHandler(event: MouseEvent) {
        if (this.EditorInst.editorMode && event.buttons === 1) {
            const leftTop = {
                x: this.cameraInst.x - CONST.CAM.CENTERX,
                y: this.cameraInst.y - CONST.CAM.CENTERY,
            };
            const x = event.offsetX + leftTop.x,
                y = event.offsetY + leftTop.y;

            // const relXY = BTank.gameCam.getRelCoords(x, y);
            const cellx =
                Math.floor(x / CONST.CELLSIZES.MAXX) * CONST.CELLSIZES.MAXX;
            const celly =
                Math.floor(y / CONST.CELLSIZES.MAXY) * CONST.CELLSIZES.MAXY;

            // place a level object (ship/obstacle/brick)
            if (
                ![
                    CONST.TYPES.ERASER,
                    CONST.TYPES.WAYPOINTERASER,
                    CONST.TYPES.WAYPOINT,
                    CONST.TYPES.PLAYER,
                ].includes(this.EditorInst.editorCurrentObjectBrush.type)
            ) {
                this.EditorInst.createEditorUnit(
                    cellx,
                    celly,
                    this.EditorInst.editorCurrentObjectBrush.type,
                );
            }

            // place player
            if (
                this.EditorInst.editorCurrentObjectBrush.type ===
                CONST.TYPES.PLAYER
            ) {
                this.EditorInst.createEditorUnit(
                    cellx,
                    celly,
                    this.EditorInst.editorCurrentObjectBrush.type,
                );
            }

            // place waypoint
            if (
                this.EditorInst.editorCurrentObjectBrush.type ===
                CONST.TYPES.WAYPOINT
            ) {
                if (!this.EditorInst.currentShipWithWaypoints) {
                    const unit = this.EditorInst.getEditorUnitAt(cellx, celly);
                    this.EditorInst.setCurrentShipWithWaypoints(
                        unit as CSWAI_customPaths,
                    );
                } else {
                    if (!this.EditorInst.getEditorWaypointAt(cellx, celly)) {
                        this.EditorInst.addEditorWaypoint(cellx, celly);
                    }
                }
            }

            // use eraser
            if (
                this.EditorInst.editorCurrentObjectBrush.type ===
                CONST.TYPES.ERASER
            ) {
                this.EditorInst.removeEditorObjectAt(cellx, celly);
            }

            // use waypointeraser
            if (
                this.EditorInst.editorCurrentObjectBrush.type ===
                CONST.TYPES.WAYPOINTERASER
            ) {
                this.EditorInst.removeEditorWaypointAt(cellx, celly);
            }
        }
    }

    keyUpHandler(kc: string) {
        // TODO: keysUp array for keys that are up to know which direction isn't getting acceleration
        this.player1.stopAccel = true;

        if (kc === Utils.KEY_CODE.F1_KEY) {
            this.EditorInst.editorUI.toggleEditorControls();
        }
    }

    // ----------- END -----------

    keysHandler(event: KeyboardEvent) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
        const kc = event.key as keyof Keys;
        this.keys[kc] = event.type == 'keydown';

        if (event.type === 'keyup') {
            this.keyUpHandler(kc);
        }
        this.editorKeys(kc);
    }

    editorKeys(kc: keyof Keys) {
        if (this.EditorInst.editorMode) {
            if (kc === Utils.KEY_CODE.N1_KEY) {
                this.EditorInst.setCurrentEditorBrushObject(CONST.TYPES.ERASER);
            }
            if (kc === Utils.KEY_CODE.N2_KEY) {
                this.EditorInst.setCurrentEditorBrushObject(
                    CONST.TYPES.OBSTACLE,
                );
            }
            if (kc === Utils.KEY_CODE.N3_KEY) {
                this.EditorInst.setCurrentEditorBrushObject(CONST.TYPES.SHIP);
            }
            if (kc === Utils.KEY_CODE.N4_KEY) {
                this.EditorInst.setCurrentEditorBrushObject(
                    CONST.TYPES.SPACEBRICK,
                );
            }
            if (kc === Utils.KEY_CODE.N5_KEY) {
                this.EditorInst.setCurrentEditorBrushObject(
                    CONST.TYPES.WAYPOINT,
                );
            }
            if (kc === Utils.KEY_CODE.N6_KEY) {
                this.EditorInst.setCurrentEditorBrushObject(
                    CONST.TYPES.WAYPOINTERASER,
                );
            }
            if (kc === Utils.KEY_CODE.N7_KEY) {
                this.EditorInst.setCurrentEditorBrushObject(CONST.TYPES.PLAYER);
            }
        }
    }

    detectEditorMovement() {
        const DX = 26;
        // TODO: move the screen
        if (this.keys[Utils.KEY_CODE.UP as keyof Keys]) {
            this.cameraInst.setCoords(
                this.cameraInst.x,
                this.cameraInst.y - DX,
            );
        }
        if (this.keys[Utils.KEY_CODE.LEFT as keyof Keys]) {
            this.cameraInst.setCoords(
                this.cameraInst.x - DX,
                this.cameraInst.y,
            );
        }
        if (this.keys[Utils.KEY_CODE.RIGHT as keyof Keys]) {
            this.cameraInst.setCoords(
                this.cameraInst.x + DX,
                this.cameraInst.y,
            );
        }
        if (this.keys[Utils.KEY_CODE.DOWN as keyof Keys]) {
            this.cameraInst.setCoords(
                this.cameraInst.x,
                this.cameraInst.y + DX,
            );
        }
    }

    // TODO: move to keyboard.js or something like controls.js
    detectMovement(timestamp: number) {
        // code here must change ONLY DIRECTION
        const ACCEL = 0.5; // 0.7; // 0.3;

        if (this.keys[Utils.KEY_CODE.UP as keyof Keys]) {
            this.player1.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.UP as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.LEFT as keyof Keys]) {
            this.player1.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.LEFT as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.RIGHT as keyof Keys]) {
            this.player1.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.RIGHT as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.DOWN as keyof Keys]) {
            this.player1.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.DOWN as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.a_KEY as keyof Keys]) {
            this.player1.fire(timestamp);
        }
        if (this.keys[Utils.KEY_CODE.s_KEY as keyof Keys]) {
            this.player1.stop();
        }
        if (this.keys[Utils.KEY_CODE.h_KEY as keyof Keys]) {
            this.player1.isHidden = !this.player1.isHidden;
        }
    }
}

// const dpTest = new DelayedPic(1);
// debugger;
// dpTest.init();

const gameInstance = new Game();

gameInstance.start();
