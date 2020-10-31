// TODO: make a new project so everything is clean: git init from the start

import { CONST } from './const';
import { BTankManager } from './btank';
import { Editor } from './editor';
import { Utils } from './utils';
import { CSWAI_customPaths } from './cswai';

console.log("mainnn!");

// -----------------------------
//        Основная логика
// -----------------------------
const game = function () {
    let mainIntervalId = null;
    let gameOver = false;
    let win = false;
    let keys = {};
    // let editor = false;
    // globalCom

    const controlsMap = {
        [Utils.KEY_CODE.UP]: 3,
        [Utils.KEY_CODE.LEFT]: 2,
        [Utils.KEY_CODE.RIGHT]: 0,
        [Utils.KEY_CODE.DOWN]: 1,
        [Utils.KEY_CODE.a_KEY]: 4,
    };

    // TODO: move player1 into BTankManager
    let player1 = null;
    let gameCam = null;

    const gameField = document.getElementById("gameField");
    const BTankInst = new BTankManager(CSWAI_customPaths);
    const EditorInst = new Editor();

//     fetch('http://localhost:8080').then(r => { console.log(r); });
//     fetch('http://localhost:8080/list').then(r => { console.log(r); return r.json(); }).then(r => { console.log(r); });
    
    this.start = function () {
        BTankInst.init().then(
            function () {
                EditorInst.init(BTankInst);
                BTankInst.showLogo();
                BTankInst.showNames();

                player1 = BTankInst.createCSW(0, 600, CONST.USER);
                gameCam = BTankInst.getGameCam();

                BTankInst.createCSW(10, 10, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(50, 10, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(90, 10, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(
                    130,
                    10,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    170,
                    10,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    210,
                    10,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    250,
                    10,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    290,
                    10,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    330,
                    10,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );

                BTankInst.createCSW(10, 50, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(50, 50, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(90, 50, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(
                    130,
                    50,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    170,
                    50,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    210,
                    50,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    250,
                    50,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    290,
                    50,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    330,
                    50,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );

                BTankInst.createCSW(10, 90, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(50, 90, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(90, 90, CONST.COMPUTER, 0, CONST.TYPES.COUNTER);
                BTankInst.createCSW(
                    130,
                    90,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    170,
                    90,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    210,
                    90,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    250,
                    90,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    290,
                    90,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );
                BTankInst.createCSW(
                    330,
                    90,
                    CONST.COMPUTER,
                    0,
                    CONST.TYPES.COUNTER
                );

                BTankInst.placeBorders();

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

    this.mainCycle = function (timestamp) {
        // console.log(timestamp);
        BTankInst.drawBackground();

        if (EditorInst.editorMode) {
            this.editorCycle(timestamp);
        } else {
            this.gameCycle(timestamp);
        }

        mainIntervalId = window.requestAnimationFrame(
            this.mainCycle.bind(this)
        );
    };

    this.editorCycle = function (timestamp) {
        this.detectEditorMovement(timestamp);
        // player1.update();
        // gameCam.setCoords(player1.x, player1.y);

        EditorInst.editorUnits.forEach(function (unit) {
            unit.update(timestamp);
            // unit.draw();
        }, this);

        EditorInst.editorGhosts.forEach(function (ghost) {
            ghost.draw(true);
        }, this);

        if (EditorInst.currentShipWithWaypoints) {
            EditorInst.currentShipWithWaypoints.wayPoints.forEach(function (
                wp,
                wpIndex
            ) {
                BTankInst.drawWayPoint(wp[0], wp[1], wpIndex + 1);
            });
        }
    };

    this.gameCycle = function (timestamp) {
        if (player1.life > 0) {
            this.detectMovement(timestamp);
            player1.update(timestamp);
            gameCam.setCoords(player1.x, player1.y);
        }

        BTankInst.getAllBullets().forEach(function (bullet) {
            bullet.fly(timestamp);
        });

        BTankInst.getAllShips().forEach(function (ship) {
            ship.update(timestamp);
        });

        BTankInst.getAllDelayedPics().forEach(function (pic) {
            pic.draw();
        });

        BTankInst.getAllGhosts().forEach(function (ghost) {
            ghost.draw();
        });

        BTankInst.displayLifeBar(player1);

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

    this.editorMouseDownHandler = function (event) {
        if (EditorInst.editorMode && event.buttons === 1) {
            const leftTop = {
                x: BTankInst.gameCam.x - BTankInst.CONST.CAM.CENTERX,
                y: BTankInst.gameCam.y - BTankInst.CONST.CAM.CENTERY,
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
                    EditorInst.setCurrentShipWithWaypoints(unit);
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

    this.keyUpHandler = function (kc) {
        // TODO: keysUp array for keys that are up to know which direction isn't getting acceleration
        player1.stopAccel = true;

        if (kc === Utils.KEY_CODE.F1_KEY) {
            //BTank.toggleEditorControls();
            EditorInst.toggleEditorControls();
        }
    };

    // ----------- END -----------

    this.keysHandler = function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
        const kc = event.keyCode || event.which;
        keys[kc] = event.type == "keydown";

        if (event.type === "keyup") {
            this.keyUpHandler(kc);
        }
        this.editorKeys(kc);
    };

    this.editorKeys = function (kc) {
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

    this.detectEditorMovement = function (timestamp) {
        const DX = 26;
        // TODO: move the screen
        if (keys[Utils.KEY_CODE.UP]) {
            gameCam.setCoords(BTankInst.gameCam.x, BTankInst.gameCam.y - DX);
        }
        if (keys[Utils.KEY_CODE.LEFT]) {
            gameCam.setCoords(BTankInst.gameCam.x - DX, BTankInst.gameCam.y);
        }
        if (keys[Utils.KEY_CODE.RIGHT]) {
            gameCam.setCoords(BTankInst.gameCam.x + DX, BTankInst.gameCam.y);
        }
        if (keys[Utils.KEY_CODE.DOWN]) {
            gameCam.setCoords(BTankInst.gameCam.x, BTankInst.gameCam.y + DX);
        }
    };

    this.detectMovement = function (timestamp) {
        // code here must change ONLY DIRECTION
        const ACCEL = 0.3;

        if (keys[Utils.KEY_CODE.UP]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.UP],
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.LEFT]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.LEFT],
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.RIGHT]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.RIGHT],
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.DOWN]) {
            player1.setDirectionAndAddAccel(
                controlsMap[Utils.KEY_CODE.DOWN],
                ACCEL
            );
        }
        if (keys[Utils.KEY_CODE.a_KEY]) {
            player1.fire(timestamp);
        }
        if (keys[Utils.KEY_CODE.s_KEY]) {
            player1.stop();
        }
    };
};

const gameInstance = new game(
    // BattleTankGame.deps.const,
    // new BattleTankGame.deps.BTankManager(
    //     BattleTankGame.deps.const,
    //     BattleTankGame.deps.csw,
    //     BattleTankGame.deps.player,
    //     // BattleTankGame.deps.cswAI_1,
    //     BattleTankGame.deps.cswAI_customPaths,
    //     BattleTankGame.deps.obstacle,
    //     BattleTankGame.deps.staticShip,
    //     BattleTankGame.deps.spaceBrick,
    //     BattleTankGame.deps.bulletPixel,
    //     BattleTankGame.deps.counter,
    //     BattleTankGame.deps.camera,
    //     BattleTankGame.deps.border,
    //     BattleTankGame.deps.images,
    //     BattleTankGame.deps.delayedPic
    // ),
    // new BattleTankGame.deps.editor(
    //     BattleTankGame.deps.const,
    //     BattleTankGame.deps.obstacle,
    //     BattleTankGame.deps.staticShip,
    //     BattleTankGame.deps.spaceBrick,
    //     BattleTankGame.deps.border,
    //     BattleTankGame.deps.player
    // ),
    // BattleTankGame.deps.utils
);

gameInstance.start();
