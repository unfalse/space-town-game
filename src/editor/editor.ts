import { BaseCSW } from '../base/baseCsw';
import { BTankManager } from '../btank';
import { CONST } from '../const';
import { port } from '../server/server.json';
import { LevelObject, ObjectType, Point, WayPoints } from '../types';
import { CSWAI_customPaths } from '../cswai';
import { ObjectsFactory } from '../objFactory';
import { placeBorders } from '../drawUtils';
import { EditorUI } from './editorUI';
import { Ghosts } from '../ghosts';
import { Player } from '../player';

const PORT = process.env.NODE_ENV === 'production' ? 80 : port;

console.log(process.env.NODE_ENV);

const EDITOR_SERVER_ADDRESS = `${window.location.protocol}//${window.location.hostname}:${PORT}`;

type ObjectBrush = {
    type: ObjectType;
    imageUrl: string;
};

export class Editor {
    currentLevelObj: LevelObject;
    BTankInst: BTankManager;
    editorBlock: HTMLDivElement;
    editorCurrentObject: HTMLDivElement;
    editorCurrentObjectBrush: ObjectBrush;
    editorMode: boolean;
    editorUnits: BaseCSW[];
    editorGhosts: Ghosts;
    currentShipWithWaypoints: CSWAI_customPaths;
    playerCell: Point;
    objFactoryInst: ObjectsFactory;
    editorUI: EditorUI;
    mapHasEdited: boolean;

    constructor(objFactoryInst: ObjectsFactory) {
        this.currentLevelObj = {
            id: null,
            name: '',
            data: '',
        };
        this.objFactoryInst = objFactoryInst;
    }

    init(BTankInst: BTankManager, editorUIInst: EditorUI): void {
        this.BTankInst = BTankInst;

        this.editorUI = editorUIInst;
        this.editorUI.init();

        this.editorCurrentObjectBrush = {
            type: CONST.TYPES.OBSTACLE,
            imageUrl: "url('images/obstacle2.png')",
        };
        this.editorMode = false;
        this.editorUnits = [];
        this.editorGhosts = [];
        this.currentShipWithWaypoints = null;
        this.playerCell = { x: 0, y: 0 };
        this.mapHasEdited = false;
    }

    // newEditorLevel(): void {
    //     this.prepareLevelForSaving();
    // }

    uploadNewLevel(): void {
        fetch(`${EDITOR_SERVER_ADDRESS}/new`, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.currentLevelObj,
            }),
        }).then(() => {
            alert('Level has been added!');
        });
    }

    playEditorLevel(): void {
        const player = this.BTankInst.getPlayer() as Player; // this.BTankInst.getAllShips()[0] as Player;
        this.BTankInst.destroyAll();

        // TODO: add player1 to the empty array
        // player.init(this.playerCell.x, this.playerCell.y, CONST.USER, this.BTankInst);
        player.initCoords(this.playerCell.x, this.playerCell.y);
        this.BTankInst.addShip(player);
        this.BTankInst.setPlayer(player);

        placeBorders(this.objFactoryInst, this.BTankInst);

        this.editorUnits.forEach(unit => {
            if (unit.type === CONST.TYPES.SHIP /*&& unit.iam !== CONST.USER*/) {
                this.BTankInst.addShip(
                    this.objFactoryInst.createCSW(
                        unit.x,
                        unit.y,
                        CONST.COMPUTER,
                        CONST.TYPES.SHIP,
                        false,
                        (unit as CSWAI_customPaths).wayPoints,
                    ),
                );
            } else {
                this.BTankInst.addShip(
                    this.objFactoryInst.createCSW(
                        unit.x,
                        unit.y,
                        CONST.COMPUTER,
                        unit.type,
                    ),
                );
            }
        });

        this.editorUI.toggleEditorControls();
    }

    prepareLevelForSaving(
        playerCell: Point,
        currentLevelObj: LevelObject,
        editorUnits: BaseCSW[]
        // levelName: string
    ): LevelObject {

        let levelData = `${playerCell.x};${playerCell.y}|`;
        
        levelData += editorUnits.reduce(
            function (prev: string, curr: BaseCSW) {

                let wayPoints = '';

                if (curr.type === CONST.TYPES.SHIP) {
                    wayPoints = JSON.stringify(
                        (curr as CSWAI_customPaths).wayPoints,
                    );
                }

                return (
                    `${prev}${wayPoints};${!!curr.ghost};${curr.type};${curr.y};${curr.x}|`
                );
            },
            '',
        );

        return {
            ...currentLevelObj,
            data: levelData
        };
    }

    async uploadLevel(currentLevelObj: LevelObject): Promise<void> {

        try {
            const uploadingResponse =
                await fetch(`${EDITOR_SERVER_ADDRESS}/save`, {
                    method: 'post',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(currentLevelObj),
                });
            
            if (uploadingResponse.status === 200) {
                alert('Level has been saved!');
            }
        }
        catch(ex) {
            alert('Ошибка при сохранении уровня на сервер! Подробности в консоли.');
            console.error(ex);
        }

    }

    saveEditorLevel(): void {
        console.log(this.currentLevelObj);
        
        let levelName = this.currentLevelObj?.name;
        if (!levelName) {
            levelName = prompt('Enter the name of the level', '');
            console.log({ levelName });
            if (levelName !== null && levelName !== undefined && levelName !== '') {
                console.log('currentLevelName = levelName')
                this.currentLevelObj.name = levelName;
            } else {
                console.log('Nothing has been saved!');
                alert('Nothing has been saved!');
                return;
            }
        }

        this.mapHasEdited = false;

        this.currentLevelObj =
            this.prepareLevelForSaving(this.playerCell, this.currentLevelObj, this.editorUnits);
        this.uploadLevel(this.currentLevelObj);
    }

    saveAsEditorLevel(): void {
        // TODO: show an input to enter the new name and ok and cancel buttons
        return null;
    }

    setCurrentShipWithWaypoints(ship: CSWAI_customPaths): void {
        this.currentShipWithWaypoints = ship;
    }

    removeAllEditorUnits() {
        this.editorUnits.forEach((_unit: BaseCSW, i) => { delete this.editorUnits[i]; });
        this.editorUnits = [];
    }

    async showLevelChooseDialog(editorFileListContainer: HTMLDivElement): Promise<void> {

        let result;
        try {
            result = await fetch(`${EDITOR_SERVER_ADDRESS}/list`).then(r => r.json());
        } catch(e) {
            console.error(e);
            return;
        }

        editorFileListContainer.style.display = 'block';
        const ul = document.createElement('ul');
        const title = document.createElement('span');
        title.innerText = 'Which level to open?';
        editorFileListContainer.append(title);

        result.forEach((level: LevelObject) => {
            const li = document.createElement('li');
            li.innerText = level.name;

            li.addEventListener(
                'click',
                function () {

                    if (this.mapHasEdited && window.confirm('Do you want to save map?')) {
                        this.saveEditorLevel();
                    }

                    this.removeAllEditorUnits();

                    this.currentLevelObj = {
                        ...level,
                    };

                    this.loadTheEditorLevel(level.id);
                    editorFileListContainer.style.display = 'none';
                    title.innerText = '';
                    editorFileListContainer.removeChild(ul);

                }.bind(this),
            );

            ul.append(li);
        });
        
        editorFileListContainer.append(ul);
    }

    async loadTheEditorLevel(id: string): Promise<void> {

        const DATA_SEPARATOR = '|';

        let result;
        try {
            result = await fetch(`${EDITOR_SERVER_ADDRESS}/level?id=${id}`).then(r => r.json());
        } catch(e) {
            console.error(e);
            return;
        }

        this.mapHasEdited = false;

        result
            .data
            .split(DATA_SEPARATOR)
            .forEach((objStr: string, strIndex: number) => {

                const fields = objStr.split(';');

                if (strIndex === 0) {
                    //this.playerCell = { x: fields[0], y: fields[1] };
                    this.createEditorUnit(
                        +fields[0],
                        +fields[1],
                        CONST.TYPES.PLAYER,
                        true,
                    );
                }

                if (strIndex > 0 && objStr !== '') {
                    if (objStr !== '') {
                        if (fields.length === 1) {
                            const splitted = fields[0].split(',');
                            this.createEditorUnit(
                                +splitted[1], // x
                                +splitted[2], // y
                                +splitted[0], // type
                            );
                        } else {
                            this.createEditorUnit(
                                +fields[4], // x
                                +fields[3], // y
                                +fields[2], // type
                                //fields[1], // ghost
                                false,
                                fields[0] ? JSON.parse(fields[0]) : [], // wayPoints
                            );
                        }
                    }
                }
            });
    }

    pushNewObjects(objects: Array<BaseCSW>, ghost: boolean): void {
        if (ghost) {
            this.editorGhosts = this.editorGhosts.concat(objects);
        } else {
            this.editorUnits = this.editorUnits.concat(objects);
        }
    }

    getEditorUnitAt(x: number, y: number): BaseCSW {
        return this.editorUnits.find(unit => {
            return unit.x === x && unit.y === y;
        });
    }

    getEditorWaypointAt(x: number, y: number): WayPoints {
        if (!this.currentShipWithWaypoints) return null;
        return this.currentShipWithWaypoints.wayPoints.find(wp => {
            return wp[0] === x && wp[1] === y;
        });
    }

    createEditorUnit(
        x: number,
        y: number,
        type: ObjectType,
        ghost?: boolean,
        wayPoints?: WayPoints[],
    ): void {
        let who = CONST.COMPUTER;

        if (
            this.editorUnits.some((unit: BaseCSW) => {
                return unit.x === x && unit.y === y;
            })
        ) {
            return;
        }

        if (
            this.editorGhosts.some((ghost: BaseCSW, index: number) => {
                if (!ghost) {
                    console.log(index);
                    debugger;
                }
                return ghost.x === x && ghost.y === y;
            })
        ) {
            return;
        }

        if (type === CONST.TYPES.PLAYER) {
            this.playerCell = { x: +x, y: +y };
            who = CONST.USER;
        }

        const newCSW = this.objFactoryInst.createCSW(
            x,
            y,
            who,
            type,
            false,
            wayPoints,
        );
        if (!newCSW) debugger;
        this.pushNewObjects([newCSW], ghost);
    }

    addEditorWaypoint(x: number, y: number): void {
        if (!this.currentShipWithWaypoints) return;
        const newWp = [x, y];
        this.currentShipWithWaypoints.wayPoints.push(newWp);
    }

    removeEditorObjectAt(x: number, y: number): void {
        this.editorUnits = this.editorUnits.filter((unit: BaseCSW) => {
            return !(unit.x === x && unit.y === y);
        });
    }

    removeEditorWaypointAt(x: number, y: number): void {
        if (!this.currentShipWithWaypoints) return;
        this.currentShipWithWaypoints.wayPoints = this.currentShipWithWaypoints.wayPoints.filter(
            (wp: WayPoints) => {
                return !(wp[0] === x && wp[1] === y);
            },
        );
    }

    setCurrentEditorBrushObject(brushObjectType: ObjectType): void {
        switch (brushObjectType) {
            case CONST.TYPES.SHIP: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/csw-mt5bigger2x_0.png')",
                };
                break;
            }
            case CONST.TYPES.OBSTACLE: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/obstacle2.png')",
                };
                break;
            }
            case CONST.TYPES.SPACEBRICK: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/space_brick-0.png')",
                };
                break;
            }
            case CONST.TYPES.ERASER: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: '',
                };
                break;
            }
            case CONST.TYPES.WAYPOINT: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/counter-9.png')",
                };
                this.setCurrentShipWithWaypoints(null);
                break;
            }
            case CONST.TYPES.WAYPOINTERASER: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/counter-0.png')",
                };
                break;
            }
            case CONST.TYPES.PLAYER: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/csw-mt9bigger2x_90.png')",
                };
                break;
            }
            default:
                break;
        }
        this.editorUI.setEditorCurrentObjectIconImage();
    }

    placeBorders(): void {
        for (let x = 0; x < CONST.MAXX + 2; x++) {
            this.createEditorUnit(
                (x - 1) * CONST.CELLSIZES.MAXX,
                -1 * CONST.CELLSIZES.MAXY,
                CONST.TYPES.BORDER,
                true,
            );
            this.createEditorUnit(
                (x - 1) * CONST.CELLSIZES.MAXX,
                CONST.MAXY * CONST.CELLSIZES.MAXY,
                CONST.TYPES.BORDER,
                true,
            );
        }

        for (let y = 0; y < CONST.MAXY + 1; y++) {
            this.createEditorUnit(
                -1 * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.TYPES.BORDER,
                true,
            );
            this.createEditorUnit(
                CONST.MAXX * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.TYPES.BORDER,
                true,
            );
        }
    }
}
