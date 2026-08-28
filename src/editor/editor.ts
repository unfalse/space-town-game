import { BTankManager } from '../btank';
import { CONST } from '../const';
import { ObjectType, Point, WayPoints } from '../types';
import { ObjectsFactory } from '../objFactory';
import { placeBorders } from '../drawUtils';
import { EditorUI } from './editorUI';
import { Ghosts } from '../objects/ghosts.js';
import { EntityId } from '../ecs/world';
import { transforms, typeTags, ghostFlags, waypointPaths, setTransform } from '../ecs/components';
import { playerSetSpawn } from '../ecs/systems/playerSystem';

type LevelObject = {
    id: number | null;
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
    editorUnits!: EntityId[];
    editorGhosts!: Ghosts;
    currentShipWithWaypoints!: EntityId | null;
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
        this.prepareLevelForSaving();
    }

    async uploadNewLevel(): Promise<void> {
        await fetch('/new', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: undefined,
        });
        alert('Level has been added!');
    }

    playEditorLevel(): void {
        // TODO: create player entity from scratch, also make only single way to create a player
        const player = this.BTankInst.getAllShips()[0];
        if (player === undefined) return;
        this.BTankInst.destroyAll(player);

        setTransform(player, this.playerCell.x, this.playerCell.y);
        this.BTankInst.addShip(player);
        this.BTankInst.setPlayer(player);
        const playerT = transforms.get(player);
        if (playerT) playerSetSpawn(player, playerT.x, playerT.y);

        placeBorders(this.objFactoryInst, this.BTankInst);

        this.editorUnits.forEach(unit => {
            const unitT = transforms.get(unit);
            const unitType = typeTags.get(unit)?.type;
            if (!unitT || unitType === undefined) return;

            if (unitType === CONST.TYPES.SHIP) {
                this.BTankInst.addShip(
                    this.objFactoryInst.createCSW(
                        unitT.x,
                        unitT.y,
                        CONST.COMPUTER,
                        CONST.TYPES.SHIP,
                        false,
                        waypointPaths.get(unit)?.wayPoints,
                    ),
                );
            } else {
                this.BTankInst.addShip(
                    this.objFactoryInst.createCSW(unitT.x, unitT.y, CONST.COMPUTER, unitType),
                );
            }
        });
    }

    prepareLevelForSaving(): string {
        let levelData = [this.playerCell.x, this.playerCell.y].join(';') + '|';

        levelData += this.editorUnits.reduce((prev: string, curr: EntityId) => {
            const t = transforms.get(curr);
            const type = typeTags.get(curr)?.type;
            const ghost = ghostFlags.get(curr)?.ghost ?? false;
            if (!t || type === undefined) return prev;

            let wayPoints = '';
            if (type === CONST.TYPES.SHIP) {
                wayPoints = JSON.stringify(waypointPaths.get(curr)?.wayPoints ?? []);
            }
            return prev + wayPoints + ';' + ghost + ';' + type + ';' + t.y + ';' + t.x + '|';
        }, '');

        return levelData;
    }

    async uploadLevel(): Promise<void> {
        try {
            await fetch('/save', {
                method: 'post',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentLevelObj),
            });
        } catch (error) {
            console.log('Error while saving: ', JSON.stringify(error));
        } finally {
            alert('Done');
        }
    }

    saveEditorLevel(): void {
        const levelString = this.prepareLevelForSaving();
        this.updateLevelData(levelString);
        this.uploadLevel();
    }

    saveAsEditorLevel() {
        // TODO: show an input to enter the new name and ok and cancel buttons
    }

    setCurrentShipWithWaypoints(ship: EntityId | null): void {
        this.currentShipWithWaypoints = ship;
    }

    setCurrentLevel(levelObj: LevelObject): void {
        this.currentLevelObj = levelObj;
    }

    updateLevelData(levelData: string): void {
        this.currentLevelObj.data = levelData;
    }

    async showLevelChooseDialog(editorFileListContainer: HTMLDivElement): Promise<void> {
        try {
            const result = await fetch('/list');
            const r = await result.json();

            editorFileListContainer.style.display = 'block';

            const ul = document.createElement('ul');
            const title = document.createElement('span');
            title.innerText = 'Which level to open?';

            editorFileListContainer.append(title);

            r.forEach((level: LevelObject) => {
                const li = document.createElement('li');
                li.innerText = level.name;
                li.addEventListener('click', async () => {
                    await this.loadTheEditorLevel(level.id as number);
                    editorFileListContainer.style.display = 'none';
                    title.innerText = '';
                    editorFileListContainer.removeChild(ul);
                });
                ul.append(li);
            });

            editorFileListContainer.append(ul);
        } catch (e) {
            console.log(e);
        }
    }

    async loadTheEditorLevel(id: number): Promise<void> {
        const DATA_SEPARATOR = '|';
        const response = await fetch(`/level?id=${id}`);
        const levelObj = (await response.json()) as LevelObject;
        this.setCurrentLevel(levelObj);

        this.editorUnits = [];

        levelObj.data.split(DATA_SEPARATOR).forEach((objStr: string, strIndex: number) => {
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
                if (fields.length === 1) {
                    const splitted = fields[0].split(',');
                    const [type, x, y] = splitted;

                    this.createEditorUnit(+x, +y, +type);
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
        });
    }

    async loadTheGameLevel(id: number): Promise<void> {
        const DATA_SEPARATOR = '|';
        const response = await fetch(`/level?id=${id}`);
        const r = await response.json();
        r.data.split(DATA_SEPARATOR).forEach((objStr: string, strIndex: number) => {
            const fields = objStr.split(';');
            if (strIndex === 0) {
                if (objStr !== '') {
                    if (fields.length === 1) {
                        const splitted = fields[0].split(',');
                        this.createEditorUnit(+splitted[1], +splitted[2], +splitted[0]);
                    } else {
                        this.createEditorUnit(+fields[0], +fields[1], CONST.TYPES.PLAYER, true);
                    }
                    if (strIndex > 0 && objStr !== '') {
                        if (fields.length === 1) {
                            const splitted = fields[0].split(',');
                            this.createEditorUnit(+splitted[1], +splitted[2], +splitted[0]);
                        } else {
                            this.createEditorUnit(
                                +fields[4],
                                +fields[3],
                                +fields[2],
                                false,
                                fields[0] ? JSON.parse(fields[0]) : [],
                            );
                        }
                    }
                }
            }
        });
    }

    pushNewObjects(objects: EntityId[], ghost: boolean): void {
        if (ghost) {
            this.editorGhosts = this.editorGhosts.concat(objects);
        } else {
            this.editorUnits = this.editorUnits.concat(objects);
        }
    }

    getEditorUnitAt(x: number, y: number): EntityId | undefined {
        return this.editorUnits.find((unit: EntityId) => {
            const t = transforms.get(unit);
            return t?.x === x && t?.y === y;
        });
    }

    getEditorWaypointAt(x: number, y: number): WayPoints | undefined {
        if (!this.currentShipWithWaypoints) return undefined;
        const wayPoints = waypointPaths.get(this.currentShipWithWaypoints)?.wayPoints ?? [];
        return wayPoints.find((wp: number[]) => wp[0] === x && wp[1] === y);
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
            this.editorUnits.some((unit: EntityId) => {
                const t = transforms.get(unit);
                return t?.x === x && t?.y === y;
            })
        ) {
            return;
        }

        if (
            this.editorGhosts.some((ghostId: EntityId) => {
                const t = transforms.get(ghostId);
                return t?.x === x && t?.y === y;
            })
        ) {
            return;
        }

        if (type === CONST.TYPES.PLAYER) {
            this.playerCell = { x: +x, y: +y };
            who = CONST.USER;
        }

        const newCSW = this.objFactoryInst.createCSW(x, y, who, type, false, wayPoints);
        this.pushNewObjects([newCSW], ghost ?? false);
    }

    addEditorWaypoint(x: number, y: number): void {
        if (!this.currentShipWithWaypoints) return;
        const wp = waypointPaths.get(this.currentShipWithWaypoints);
        if (!wp) return;
        wp.wayPoints.push([x, y]);
    }

    removeEditorObjectAt(x: number, y: number): void {
        this.editorUnits = this.editorUnits.filter((unit: EntityId) => {
            const t = transforms.get(unit);
            return !(t?.x === x && t?.y === y);
        });
    }

    removeEditorWaypointAt(x: number, y: number): void {
        if (!this.currentShipWithWaypoints) return;
        const wp = waypointPaths.get(this.currentShipWithWaypoints);
        if (!wp) return;
        wp.wayPoints = wp.wayPoints.filter((point: WayPoints) => {
            return !(point[0] === x && point[1] === y);
        });
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
