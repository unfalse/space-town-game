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
import { addDemoCounters } from './demoUtils';

type Keys = {
    ArrowRight: boolean,
    ArrowLeft: boolean,
    ArrowUp: boolean,
    ArrowDown: boolean,
    a: boolean,
    s: boolean
};

type ControlsMap = {
    ArrowRight: number,
    ArrowLeft: number,
    ArrowUp: number,
    ArrowDown: number,
    a: number
}

// -----------------------------
//        Основная логика
// -----------------------------
const game = function () {
    let mainIntervalId = null;
    let gameOver = false;
    let win = false;
    let keys: Keys = {} as Keys;
    // let editor = false;
    // globalCom

    const controlsMap: ControlsMap = {
        ArrowUp: 3,
        ArrowLeft: 2,
        ArrowRight: 0,
        ArrowDown: 1,
        a: 4,
    };

    // TODO: move player1 into BTankManager
    let player1: Player = null;

    const gameField = document.getElementById("gameField");
    
    const cameraInst = new Camera();
    const imagesStoreInst = new ImagesStore();
    const drawingManagerInst = new DrawingManager(imagesStoreInst, cameraInst);
    const BTankInst = new BTankManager(player1);
    BTankInst.init();

    const objFactoryGameInst = new ObjectsFactory(drawingManagerInst, BTankInst);
    const EditorInst = new Editor(objFactoryGameInst);
    // const objFactoryEditorInst = new ObjectsFactory(drawingManagerInst, BTankInst);

    //     fetch('http://localhost:8080').then(r => { console.log(r); });
    //     fetch('http://localhost:8080/list').then(r => { console.log(r); return r.json(); }).then(r => { console.log(r); });

    this.start = function () {
        drawingManagerInst.init().then(
            function () {
                EditorInst.init(BTankInst);

                player1 = objFactoryGameInst.createCSW(0, 600, CONST.USER) as Player;
                BTankInst.pushNewObjects([player1])

                addDemoCounters(objFactoryGameInst, BTankInst);

                placeBorders(objFactoryGameInst, BTankInst);

                // for (let i = 0; i < 100; i++) {
                //     BTank.createCSW(940, 480, CONST.COMPUTER, 0);
                // }

                gameOver = false;
                win = false;

                document.addEventListener(
                    "keydown",
                    this.keysHandler.bind(this)
                );
                document.addEventListener("keyup", this.keysHandler.bind(this));

                BTankInst.gameFieldBlock.addEventListener(
                    "mousedown",
                    this.editorMouseDownHandler.bind(this)
                );
                BTankInst.gameFieldBlock.addEventListener(
                    "mousemove",
                    this.editorMouseDownHandler.bind(this)
                );

                mainIntervalId = window.requestAnimationFrame(
                    this.mainCycle.bind(this)
                );
            }.bind(this)
        );
    };

    this.mainCycle = function (timestamp: number) {
        // console.log(timestamp);
        drawingManagerInst.drawBackground();

        if (EditorInst.editorMode) {
            this.editorCycle(timestamp);
        } else {
            this.gameCycle(timestamp);
        }

        mainIntervalId = window.requestAnimationFrame(
            this.mainCycle.bind(this)
        );
    };

    this.editorCycle = function (timestamp: number) {
        this.detectEditorMovement(timestamp);
        // player1.update();
        // gameCam.setCoords(player1.x, player1.y);

        EditorInst.editorUnits.forEach((unit) => {
            unit.update(timestamp);
            // unit.draw();
        });

        EditorInst.editorGhosts.forEach((ghost) => {
            ghost.draw();
        });

        if (EditorInst.currentShipWithWaypoints) {
            EditorInst.currentShipWithWaypoints.wayPoints.forEach((
                wp,
                wpIndex
            ) => {
                drawingManagerInst.drawWayPoint(wp[0], wp[1], wpIndex + 1);
            });
        }
    };

    this.gameCycle = function (timestamp: number) {

        if (player1.life > 0) {
            this.detectMovement(timestamp);
            player1.update(timestamp);
            cameraInst.setCoords(player1.x, player1.y);
        }

        BTankInst.getAllBullets().forEach((bullet) => {
            bullet.fly();
        });

        BTankInst.getAllShips().forEach((ship) => {
            ship.update(timestamp);
        });

        BTankInst.getAllDelayedPics().forEach((pic) => {
            pic.draw();
        });

        BTankInst.getAllGhosts().forEach((ghost) => {
            ghost.draw();
        });

        // BTankInst.displayLifeBar(player1);

        if (!gameOver && (win || player1.life <= 0)) {
            if (win) {
                Utils.text("YOU WIN");
                BTankInst.showWin();
            } else {
                Utils.text("GAME OVER");
                BTankInst.showGameOver();
            }

            gameOver = true;
        }
        //console.log('cswArr = ', BTank.cswArr.length);
    };

    this.editorMouseDownHandler = function (event: MouseEvent) {
        if (EditorInst.editorMode && event.buttons === 1) {
            const leftTop = {
                x: cameraInst.x - CONST.CAM.CENTERX,
                y: cameraInst.y - CONST.CAM.CENTERY,
            };
            const x = event.offsetX + leftTop.x,
                y = event.offsetY + leftTop.y;

            // const relXY = BTank.gameCam.getRelCoords(x, y);
            const cellx =
                Math.floor(x / CONST.CELLSIZES.MAXX) * CONST.CELLSIZES.MAXX;
            const celly =
                Math.floor(y / CONST.CELLSIZES.MAXY) * CONST.CELLSIZES.MAXY;

            if (
                ![
                    CONST.TYPES.ERASER,
                    CONST.TYPES.WAYPOINTERASER,
                    CONST.TYPES.WAYPOINT,
                    CONST.TYPES.PLAYER
                ].includes(EditorInst.editorCurrentObjectBrush.type)
            ) {
                // place a level object (ship/obstacle/brick)
                EditorInst.createEditorUnit(
                    cellx,
                    celly,
                    EditorInst.editorCurrentObjectBrush.type
                );
            }
            if (EditorInst.editorCurrentObjectBrush.type === CONST.TYPES.PLAYER) {
                EditorInst.createEditorUnit(
                    cellx,
                    celly,
                    EditorInst.editorCurrentObjectBrush.type
                );
            }
            if (EditorInst.editorCurrentObjectBrush.type === CONST.TYPES.WAYPOINT) {
                if (!EditorInst.currentShipWithWaypoints) {
                    const unit = EditorInst.getEditorUnitAt(cellx, celly);
                    EditorInst.setCurrentShipWithWaypoints(unit as CSWAI_customPaths);
                } else {
                    if (!EditorInst.getEditorWaypointAt(cellx, celly)) {
                        EditorInst.addEditorWaypoint(cellx, celly);
                    }
                }
            }
            if (EditorInst.editorCurrentObjectBrush.type === CONST.TYPES.ERASER) {
                EditorInst.removeEditorObjectAt(cellx, celly);
            }
            if (
                EditorInst.editorCurrentObjectBrush.type ===
                CONST.TYPES.WAYPOINTERASER
            ) {
                EditorInst.removeEditorWaypointAt(cellx, celly);
            }
        }
    };

    this.keyUpHandler = function (kc: string) {
        // TODO: keysUp array for keys that are up to know which direction isn't getting acceleration
        player1.stopAccel = true;

        if (kc === Utils.KEY_CODE.F1_KEY) {
            EditorInst.editorUI.toggleEditorControls();
        }
    };

    // ----------- END -----------

    this.keysHandler = function (event: KeyboardEvent) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
        const kc = event.key as keyof Keys;
        keys[kc] = event.type == "keydown";

        if (event.type === "keyup") {
            this.keyUpHandler(kc);
        }
        this.editorKeys(kc);
    };

    this.editorKeys = function (kc: keyof Keys) {
        if (EditorInst.editorMode) {
            if (kc === Utils.KEY_CODE.N1_KEY) {
                EditorInst.setCurrentEditorBrushObject(CONST.TYPES.ERASER);
            }
            if (kc === Utils.KEY_CODE.N2_KEY) {
                EditorInst.setCurrentEditorBrushObject(CONST.TYPES.OBSTACLE);
            }
            if (kc === Utils.KEY_CODE.N3_KEY) {
                EditorInst.setCurrentEditorBrushObject(CONST.TYPES.SHIP);
            }
            if (kc === Utils.KEY_CODE.N4_KEY) {
                EditorInst.setCurrentEditorBrushObject(CONST.TYPES.SPACEBRICK);
            }
            if (kc === Utils.KEY_CODE.N5_KEY) {
                EditorInst.setCurrentEditorBrushObject(CONST.TYPES.WAYPOINT);
            }
            if (kc === Utils.KEY_CODE.N6_KEY) {
                EditorInst.setCurrentEditorBrushObject(CONST.TYPES.WAYPOINTERASER);
            }
            if (kc === Utils.KEY_CODE.N7_KEY) {
                EditorInst.setCurrentEditorBrushObject(CONST.TYPES.PLAYER);
            }
        }
    };

    this.detectEditorMovement = function () {
        const DX = 26;
        // TODO: move the screen
        if (keys[Utils.KEY_CODE.UP as keyof Keys]) {
            cameraInst.setCoords(cameraInst.x, cameraInst.y - DX);
        }
        if (keys[Utils.KEY_CODE.LEFT as keyof Keys]) {
            cameraInst.setCoords(cameraInst.x - DX, cameraInst.y);
        }
        if (keys[Utils.KEY_CODE.RIGHT as keyof Keys]) {
            cameraInst.setCoords(cameraInst.x + DX, cameraInst.y);
        }
        if (keys[Utils.KEY_CODE.DOWN as keyof Keys]) {
            cameraInst.setCoords(cameraInst.x, cameraInst.y + DX);
        }
    };

    this.detectMovement = function (timestamp: number) {
        // code here must change ONLY DIRECTION
        const ACCEL = 0.3; // 0.7; // 0.3;

        if (keys[Utils.KEY_CODE.UP as keyof Keys]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.UP as keyof ControlsMap] as Direction,
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.LEFT as keyof Keys]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.LEFT as keyof ControlsMap] as Direction,
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.RIGHT as keyof Keys]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.RIGHT as keyof ControlsMap] as Direction,
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.DOWN as keyof Keys]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.DOWN as keyof ControlsMap] as Direction,
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.a_KEY as keyof Keys]) {
            player1.fire(timestamp);
        }
        if (keys[Utils.KEY_CODE.s_KEY as keyof Keys]) {
            player1.stop();
        }
    };
};

// const dpTest = new DelayedPic(1);
// debugger;
// dpTest.init();

// @ts-ignore
const gameInstance = new game();

gameInstance.start();
