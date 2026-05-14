import { BaseCSW } from '../objects/base/baseCsw.js';
import { BTankManager } from '../btank';
import { CONST } from '../const';
import { ObjectType, Point, WayPoints } from '../types';
import { CSWAI_customPaths } from '../objects/cswai.js';
import { ObjectsFactory } from '../objFactory';
import { placeBorders } from '../drawUtils';
import { EditorUI } from './editorUI';
import { Ghosts } from '../objects/ghosts.js';
import { Player } from '../objects/player.js';

const EDITOR_SERVER_ADDRESS = `${window.location.protocol}//${window.location.hostname}`;

type LevelObject = {
    id: number|null;
    name: string;
    data: string;
};

type ObjectBrush = {
    type: ObjectType;
    imageUrl: string;
};

export class Editor {
    currentLevelObj: LevelObject;
    BTankInst!: BTankManager;
    editorBlock!: HTMLDivElement;
    editorCurrentObject!: HTMLDivElement;
    editorCurrentObjectBrush!: ObjectBrush;
    editorMode!: boolean;
    editorUnits!: BaseCSW[];
    editorGhosts!: Ghosts;
    currentShipWithWaypoints!: CSWAI_customPaths|null;
    playerCell!: Point;
    objFactoryInst: ObjectsFactory;
    editorUI!: EditorUI;

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
    }

    newEditorLevel(): void {
        const levelData = this.prepareLevelForSaving();
    }

    async uploadNewLevel(): Promise<void> {
        await fetch(`${EDITOR_SERVER_ADDRESS}/new`, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: undefined,
        })
        alert('Level has been added!');
    }

    playEditorLevel(): void {
        // TODO: create player object from scratch, also make only single way to create a player
        const player = this.BTankInst.getAllShips()[0] as Player;
        this.BTankInst.destroyAll();

        // TODO: add player1 to the empty array
        // player.init(this.playerCell.x, this.playerCell.y, CONST.USER, this.BTankInst);
        player.initCoords(this.playerCell.x, this.playerCell.y);
        this.BTankInst.addShip(player);
        this.BTankInst.setPlayer(player);
        player.setSpawn(player.x, player.y);

        placeBorders(this.objFactoryInst, this.BTankInst);

        this.editorUnits.forEach(unit => {
            if (unit.type === CONST.TYPES.SHIP) {
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
    }

    prepareLevelForSaving(): string {
        let levelData = [this.playerCell.x, this.playerCell.y].join(';') + '|';

        levelData += this.editorUnits.reduce(
            (prev: string, curr: BaseCSW) => {
                let wayPoints = '';
                if (curr.type === CONST.TYPES.SHIP) {
                    wayPoints = JSON.stringify(
                        (curr as CSWAI_customPaths).wayPoints,
                    );
                }
                return (
                    prev +
                    wayPoints +
                    ';' +
                    !!curr.ghost +
                    ';' +
                    curr.type +
                    ';' +
                    curr.y +
                    ';' +
                    curr.x +
                    '|'
                );
            },
            '',
        );

        return levelData;
    }

    async uploadLevel(): Promise<void> {
        try {
            await fetch(`${EDITOR_SERVER_ADDRESS}/save`, {
                method: 'post',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentLevelObj),
            });
        }
        catch (error) {
            console.log('Error while saving: ', JSON.stringify(error));
        } finally {
            alert('Done');
        }
    }

    saveEditorLevel(): void {
        const levelString = this.prepareLevelForSaving();
        this.updateLevelData(levelString)
        this.uploadLevel();
    }

    saveAsEditorLevel() {
        // TODO: show an input to enter the new name and ok and cancel buttons
    }

    setCurrentShipWithWaypoints(ship: CSWAI_customPaths|null): void {
        this.currentShipWithWaypoints = ship as CSWAI_customPaths;
    }

    setCurrentLevel(levelObj: LevelObject): void {
        this.currentLevelObj = levelObj;
    }

    updateLevelData(levelData: string): void {
        this.currentLevelObj.data = levelData;
    }

    async showLevelChooseDialog(editorFileListContainer: HTMLDivElement): Promise<void> {
        // this.editorGhosts = [];
        try {
            const result = await fetch(`${EDITOR_SERVER_ADDRESS}/list`)
            const r = await result.json();

            editorFileListContainer.style.display = 'block';

            const ul = document.createElement('ul');
            const title = document.createElement('span');
            title.innerText = 'Which level to open?';

            editorFileListContainer.append(title);

            r.forEach((level: LevelObject) => {
                const li = document.createElement('li');
                li.innerText = level.name;
                li.addEventListener(
                    'click',
                    async () => {
                        await this.loadTheEditorLevel(level.id as number);
                        editorFileListContainer.style.display = 'none';
                        title.innerText = '';
                        editorFileListContainer.removeChild(ul);
                    },
                );
                ul.append(li);
            });
        
            editorFileListContainer.append(ul);
        } catch (e) {
            console.log(e);
        }
    }

    async loadTheEditorLevel(id: number): Promise<void> {
        const DATA_SEPARATOR = '|';
        const response = await fetch(`${EDITOR_SERVER_ADDRESS}/level?id=${id}`);
        const levelObj = await response.json() as LevelObject;
        this.setCurrentLevel(levelObj);

        levelObj.data.split(DATA_SEPARATOR)
            .forEach((objStr: string, strIndex: number) => {
                const fields = objStr.split(';');

                if (strIndex === 0) {
                    const playerStartPosition = { x: fields[0], y: fields[1] };

                    this.createEditorUnit(
                        +playerStartPosition.x,
                        +playerStartPosition.y,
                        CONST.TYPES.PLAYER,
                        true,
                    );
                }
                if (strIndex > 0 && objStr !== '') {
                    if (objStr !== '') {
                        if (fields.length === 1) {
                            const splitted = fields[0].split(',');
                            const [type, x, y] = splitted;

                            this.createEditorUnit(
                                +x,
                                +y,
                                +type,
                            );
                        } else {
                            const [waypoints, , type, y, x] = fields;

                            this.createEditorUnit(
                                +x,
                                +y,
                                +type,
                                false,
                                waypoints ? JSON.parse(waypoints) : [],
                            );
                        }
                    }
                }
            });
    }

    async loadTheGameLevel(id: number): Promise<void> {
        const DATA_SEPARATOR = '|';
        const response = await fetch(`${EDITOR_SERVER_ADDRESS}/level?id=${id}`);
        const r = await response.json();
        r.data.split(DATA_SEPARATOR)
            .forEach((objStr: string, strIndex: number) => {
                const fields = objStr.split(';');
                if (strIndex === 0) {
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

    getEditorUnitAt(x: number, y: number): BaseCSW | undefined {
        return this.editorUnits.find((unit: BaseCSW) => {
            return unit.x === x && unit.y === y;
        });
    }

    getEditorWaypointAt(x: number, y: number): WayPoints | undefined {
        if (!this.currentShipWithWaypoints) return undefined;
        return this.currentShipWithWaypoints.wayPoints.find((wp: number[]) => {
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
        this.pushNewObjects([newCSW], ghost ?? false);
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
