import { CONST } from './const';
import { BTankManager } from './btank';
import { ImagesStore, DrawingManager } from './drawingMan';
import { Editor } from './editor/editor';
import { Utils } from './utils';
import { CSWAI_customPaths } from './objects/cswai';
import { Player } from './objects/player';
import { Camera } from './camera';
import { Direction, WayPoints } from './types';
import { BaseCSW } from './objects/base/baseCsw';
import { Bullet } from './objects/bullet';
import { DelayedPic } from './objects/delayedPic';
import { ObjectsFactory } from './objFactory';
import { placeBorders } from './drawUtils';
import { EditorUI } from './editor/editorUI';

type Keys = {
    ArrowRight: boolean;
    ArrowLeft: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
    a: boolean;
    s: boolean;
    w: boolean;
    d: boolean;
    SpaceKey: boolean;
};

type ControlsMap = {
    ArrowRight: number;
    ArrowLeft: number;
    ArrowUp: number;
    ArrowDown: number;
    a: number;
    w: number;
    d: number;
    s: number;
    SpaceKey: number;
};

// -----------------------------
//        Основная логика
// -----------------------------
class Game {
    mainIntervalId: number|null = null;
    gameOver = false;
    win = false;
    keys: Keys = {} as Keys;

    controlsMap: ControlsMap = {
        ArrowUp: 3,
        ArrowLeft: 2,
        ArrowRight: 0,
        ArrowDown: 1,
        SpaceKey: 4,
        w: 3,
        a: 2,
        d: 0,
        s: 1,
    };

    // TODO: move player1 into BTankManager
    player1: Player|null = null;
    cameraInst: Camera;
    imagesStoreInst: ImagesStore;
    drawingManagerInst: DrawingManager;
    BTankInst: BTankManager;
    objFactoryGameInst: ObjectsFactory;
    EditorInst: Editor;
    EditorUIInst: EditorUI;

    constructor() {
        this.cameraInst = new Camera();
        this.imagesStoreInst = new ImagesStore();
        this.drawingManagerInst = new DrawingManager(
            this.imagesStoreInst,
            this.cameraInst,
        );
        this.BTankInst = new BTankManager(this.player1 as Player);
        this.BTankInst.init();

        this.objFactoryGameInst = new ObjectsFactory(
            this.drawingManagerInst,
            this.BTankInst,
        );
        this.EditorInst = new Editor(this.objFactoryGameInst);
        this.EditorUIInst = new EditorUI(this.EditorInst);
    }

    start(levelId?: number) {
        this.drawingManagerInst.init().then(
            async () => {
                this.EditorInst.init(this.BTankInst, this.EditorUIInst);
                
                this.player1 = this.objFactoryGameInst.createCSW(
                    0,
                    600,
                    CONST.USER,
                ) as Player;
                this.BTankInst.pushNewObjects([this.player1]);

                placeBorders(this.objFactoryGameInst, this.BTankInst);

                this.gameOver = false;
                this.win = false;

                // uses the inputs import
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

                if (levelId !== undefined) {
                    await this.EditorInst.loadTheEditorLevel(levelId);
                    this.EditorInst.playEditorLevel();
                }
            },
        );
    }

    mainCycle(timestamp: number) {
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

        this.EditorInst.editorUnits.forEach((unit: BaseCSW) => {
            unit.draw();
        });

        this.EditorInst.editorGhosts.forEach((ghost: BaseCSW) => {
            ghost.draw();
        });

        if (this.EditorInst.currentShipWithWaypoints) {
            this.EditorInst.currentShipWithWaypoints.wayPoints.forEach(
                (wp: WayPoints, wpIndex: number) => {
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
        if (this.player1 && this.player1.life > 0) {
            this.detectMovement(timestamp);
            this.player1.update(timestamp);
            this.cameraInst.setCoords(this.player1.x, this.player1.y);
        }

        this.BTankInst.getAllShips().forEach((ship: BaseCSW) => {
            if (ship.iam !== 1) ship.update(timestamp);
        });

        [...this.BTankInst.getAllBullets()].forEach((bullet: Bullet) => {
            bullet.fly();
        });

        this.BTankInst.getAllShips().forEach((ship: BaseCSW) => {
            ship.draw();
        });

        this.BTankInst.getAllObstacles().forEach((ship: BaseCSW) => {
            ship.draw();
        });

        this.BTankInst.getAllBullets().forEach((bullet: Bullet) => {
            bullet.draw();
        });

        this.BTankInst.getAllDelayedPics().forEach((pic: DelayedPic) => {
            pic.draw();
        });

        this.BTankInst.getAllGhosts().forEach((ghost: BaseCSW) => {
            ghost.draw();
        });


        if (!this.gameOver && (this.win || (this.player1 && this.player1.life <= 0))) {
            if (this.win) {
                Utils.text('YOU WIN');
                this.BTankInst.showWin();
            } else {
                Utils.text('GAME OVER');
                this.BTankInst.showGameOver();
            }

            this.gameOver = true;
        }
    }

    editorMouseDownHandler(event: MouseEvent) {
        if (this.EditorInst.editorMode && event.buttons === 1) {
            const leftTop = {
                x: this.cameraInst.x - CONST.CAM.CENTERX,
                y: this.cameraInst.y - CONST.CAM.CENTERY,
            };
            const x = event.offsetX + leftTop.x,
                y = event.offsetY + leftTop.y;

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
                        unit as unknown as CSWAI_customPaths,
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
        (this.player1 as Player).stopAccel = true;

        if (kc === Utils.KEY_CODE.F1_KEY) {
            this.EditorInst.editorUI.toggleEditorControls();
        }
        if (kc === Utils.KEY_CODE.t_KEY) {
            this.EditorInst.editorUI.toggleEditorHint();
        }
        if (kc === Utils.KEY_CODE.p_KEY) {
            this.EditorInst.editorUI.toggleVideoHint();
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
        const player = this.player1 as Player;
        // code here must change ONLY DIRECTION
        const ACCEL = 0.5; // 0.7; // 0.3;

        if (this.keys[Utils.KEY_CODE.w_KEY as keyof Keys]) {
            player.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.w_KEY as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.a_KEY as keyof Keys]) {
            player.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.a_KEY as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.d_KEY as keyof Keys]) {
            player.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.d_KEY as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.s_KEY as keyof Keys]) {
            player.setDirectionAndAddAccel(
                this.controlsMap[
                    Utils.KEY_CODE.s_KEY as keyof ControlsMap
                ] as Direction,
                ACCEL,
            );
        }
        if (this.keys[Utils.KEY_CODE.SPACE as keyof Keys]) {
            player.fire(timestamp);
        }
        if (this.keys[Utils.KEY_CODE.h_KEY as keyof Keys]) {
            player.stop();
        }
        // if (this.keys[Utils.KEY_CODE.h_KEY as keyof Keys]) {
        //     player.isHidden = !player.isHidden;
        // }
    }
}

export { Game };