import { CONST } from './const';
import { Images } from './images';
import { CollisionDistance, ObjectType, Point } from './types';
import { EntityId } from './ecs/world';
import {
    transforms,
    shipDimensions,
    typeTags,
    bulletLinks,
    destroyEntity,
} from './ecs/components';

function rectForEntity(id: EntityId): { width: number; height: number } | null {
    const dims = shipDimensions.get(id)?.dimensions;
    const t = transforms.get(id);
    if (!dims || !t) return null;
    return dims[t.d];
}

// Tanks manager and draw manager: owns the live entity lists and the
// broad/narrow-phase collision queries every system relies on.
export class BTankManager {
    cswArr: EntityId[];
    ghosts: EntityId[];
    bulletsArr: EntityId[];
    delayedPics: EntityId[];
    // infoContext: any;
    againBtn!: HTMLButtonElement;
    gameOverBlock!: HTMLDivElement;

    gameInfo?: HTMLCanvasElement;
    titleBlock!: HTMLDivElement;
    gameFieldBlock!: HTMLCanvasElement;
    playerInstance: EntityId | null;

    constructor(player: EntityId | null) {
        this.cswArr = [];
        this.ghosts = [];
        this.bulletsArr = [];
        this.delayedPics = [];
        this.playerInstance = player;
    }

    init(): void {
        const gameField: HTMLCanvasElement = document.getElementById(
            'gameField',
        ) as HTMLCanvasElement;

        gameField.height = document.body.clientHeight;
        gameField.width = document.body.clientWidth;

        CONST.CAM.CENTERY = gameField.height / 2;
        CONST.CAM.CENTERX = gameField.width / 2;

        this.againBtn = document.querySelector(
            '#playAgainBtn',
        ) as HTMLButtonElement;
        this.gameOverBlock = document.querySelector(
            '#gameOverBlock',
        ) as HTMLDivElement;
        this.titleBlock = document.querySelector(
            '#titleBlock',
        ) as HTMLDivElement;
        this.gameFieldBlock = gameField;

        const ctx = gameField.getContext('2d');
        if (!ctx) throw new Error('Unable to acquire 2D canvas context');
        Images.drawContext = ctx;
    }

    pushNewObjects(entityIds: EntityId[], ghost?: boolean): void {
        if (ghost) {
            this.ghosts = this.ghosts.concat(entityIds);
        } else {
            this.cswArr = this.cswArr.concat(entityIds);
        }
    }

    // x, y - coordinates of pixels, not cells
    checkCSWWithPixelPrecision(x: number, y: number, whoAsks: EntityId): boolean {
        return this.getCSWWithPixelPrecision(x, y, whoAsks) !== null;
    }

    // Precise AABB check between `whoAsks` placed at (newX, newY) and any
    // blocking entity: ships (PLAYER, SHIP, STATICSHIP), OBSTACLE, SPACEBRICK.
    checkShipCollisionAt(
        newX: number,
        newY: number,
        whoAsks: EntityId,
    ): EntityId | null {
        const blockingTypes: ObjectType[] = [
            CONST.TYPES.PLAYER as ObjectType,
            CONST.TYPES.SHIP as ObjectType,
            CONST.TYPES.STATICSHIP as ObjectType,
            CONST.TYPES.OBSTACLE as ObjectType,
            CONST.TYPES.SPACEBRICK as ObjectType,
        ];

        const whoRect = rectForEntity(whoAsks);
        if (!whoRect) return null;
        const { width: aw, height: ah } = whoRect;

        for (const id of this.cswArr) {
            const type = typeTags.get(id)?.type;
            if (id === whoAsks || type === undefined || !blockingTypes.includes(type)) {
                continue;
            }
            const oppRect = rectForEntity(id);
            const oppT = transforms.get(id);
            if (!oppRect || !oppT) continue;
            const { width: bw, height: bh } = oppRect;
            // Standard AABB intersection test
            if (
                newX < oppT.x + bw &&
                newX + aw > oppT.x &&
                newY < oppT.y + bh &&
                newY + ah > oppT.y
            ) {
                return id;
            }
        }
        return null;
    }

    checkIfTwoShipsCross(
        nx: number,
        ny: number,
        whoAsks: EntityId,
        typesToIgnore: ObjectType[],
    ): EntityId | null {
        const checkSquare = (id: EntityId, x: number, y: number) => {
            const rd = rectForEntity(id);
            const t = transforms.get(id);
            if (!rd || !t) return false;
            let { width, height } = rd;
            width--;
            height--;
            return x >= t.x && x <= t.x + width && y >= t.y && y <= t.y + height;
        };

        const wr = rectForEntity(whoAsks);
        if (!wr) return null;
        let { width, height } = wr;
        width--;
        height--;

        const tArr = this.cswArr.filter((id: EntityId) => {
            const type = typeTags.get(id)?.type;
            if (
                whoAsks === id ||
                (type !== undefined && typesToIgnore?.includes(type))
            ) {
                return false;
            }

            return (
                checkSquare(id, nx, ny) ||
                checkSquare(id, nx + width, ny) ||
                checkSquare(id, nx, ny + height) ||
                checkSquare(id, nx + width, ny + height) ||
                checkSquare(id, nx + width / 2, ny) ||
                checkSquare(id, nx, ny + height / 2) ||
                checkSquare(id, nx + width, ny + height / 2) ||
                checkSquare(id, nx + width / 2, ny + height)
            );
        });

        return tArr.length > 0 ? tArr[0] : null;
    }

    checkIfTwoObjectsCrossInsideACell(
        whoAsks: EntityId,
        objects: EntityId[],
        newCoords?: Point,
        typesToIgnore?: ObjectType[],
    ): any {
        const checkSquare = (id: EntityId, x: number, y: number) => {
            const rd = rectForEntity(id);
            const t = transforms.get(id);
            if (!rd || !t) return false;
            const { width, height } = rd;
            return x >= t.x && x <= t.x + width && y >= t.y && y <= t.y + height;
        };

        const wo = rectForEntity(whoAsks);
        const whoT = transforms.get(whoAsks);
        if (!wo || !whoT) return null;
        const { width, height } = wo;
        const { x, y } = newCoords || whoT;

        const tArr = objects
            .map((id: EntityId) => {
                const type = typeTags.get(id)?.type;
                if (
                    whoAsks === id ||
                    (type !== undefined && typesToIgnore?.includes(type))
                ) {
                    return false;
                }

                const result = [
                    +checkSquare(id, x, y),
                    +checkSquare(id, x + width / 2, y),
                    +checkSquare(id, x + width, y),
                    +checkSquare(id, x, y + height / 2),
                    +checkSquare(id, x + width / 2, y + height / 2),
                    +checkSquare(id, x + width, y + height / 2),
                    +checkSquare(id, x, y + height),
                    +checkSquare(id, x + width / 2, y + height),
                    +checkSquare(id, x + width, y + height),
                ];
                return result.some(r => r !== 0)
                    ? { result, collidedObject: id }
                    : undefined;
            })
            .filter(obj => !!obj === true);

        if (tArr.length > 0) {
            return tArr;
        }
        return null;
    }

    getVectorsOfCollidedObjectsByCenter(
        whoAsks: EntityId,
        objects: EntityId[],
        newCoords?: Point, // x and y coordinates of object's center
        typesToIgnore?: ObjectType[],
    ): CollisionDistance[] {
        const whoT = transforms.get(whoAsks);
        const { x, y } = newCoords || whoT || { x: 0, y: 0 };

        return objects.reduce((prevValue: CollisionDistance[], id: EntityId) => {
            const type = typeTags.get(id)?.type;
            if (whoAsks === id || (type !== undefined && typesToIgnore?.includes(type))) {
                return prevValue;
            }

            const t = transforms.get(id);
            if (!t) return prevValue;

            const distance = Math.sqrt(
                (t.centerx - x) * (t.centerx - x) +
                    (t.centery - y) * (t.centery - y),
            );

            if (distance < CONST.CELLSIZES.MAXX) {
                return prevValue.concat({
                    distance,
                    distanceX: t.centerx - x,
                    distanceY: t.centery - y,
                    collidedObject: id,
                });
            }

            return prevValue;
        }, []);
    }

    getBulletWithPixelPrecision(
        x: number,
        y: number,
        parentShip: EntityId,
        bulletInst: EntityId,
    ): EntityId | null {
        const tArr = this.bulletsArr.filter((id: EntityId) => {
            const link = bulletLinks.get(id);
            const t = transforms.get(id);
            if (!link || !t) return false;
            return (
                link.parentShip !== parentShip &&
                id !== bulletInst &&
                x >= t.x &&
                x <= t.x + 4 &&
                y >= t.y &&
                y <= t.y + 4
            );
        });
        return tArr.length ? tArr[0] : null;
    }

    // Returns entity on coords in params (by pixel)
    getCSWWithPixelPrecision(
        x: number,
        y: number,
        whoAsks: EntityId,
    ): EntityId | null {
        const tArr = this.cswArr.filter((id: EntityId) => {
            if (whoAsks === id) return false;
            const rect = rectForEntity(id);
            const t = transforms.get(id);
            if (!rect || !t) return false;
            return (
                x >= t.x &&
                x <= t.x + rect.width &&
                y >= t.y &&
                y <= t.y + rect.height
            );
        });

        return tArr.length ? tArr[0] : null;
    }

    getAllGhosts(): EntityId[] {
        return this.ghosts;
    }

    getAllShips(): EntityId[] {
        return this.cswArr.filter(id => {
            const type = typeTags.get(id)?.type;
            return type === CONST.TYPES.PLAYER || type === CONST.TYPES.SHIP;
        });
    }

    getAllObstacles(): EntityId[] {
        return this.cswArr.filter(id => {
            const type = typeTags.get(id)?.type;
            return type !== CONST.TYPES.PLAYER && type !== CONST.TYPES.SHIP;
        });
    }

    getAllBullets(): EntityId[] {
        return this.bulletsArr;
    }

    addShip(ship: EntityId): void {
        this.cswArr.push(ship);
    }

    setPlayer(player: EntityId): void {
        this.playerInstance = player;
    }

    removeDelayedPic(dpObj: EntityId): void {
        destroyEntity(dpObj);
        this.delayedPics = this.delayedPics.filter(dp => dp !== dpObj);
    }

    getAllDelayedPics(): EntityId[] {
        return this.delayedPics;
    }

    removeBullet(bullet: EntityId): void {
        destroyEntity(bullet);
        this.bulletsArr = this.bulletsArr.filter(b => b !== bullet);
    }

    removeShip(ship: EntityId): void {
        destroyEntity(ship);
        this.cswArr = this.cswArr.filter(s => s !== ship);
    }

    // disposes every ship except `keep`, so it can be reused (e.g. the
    // player entity when the editor restarts a play session)
    destroyAll(keep?: EntityId): void {
        this.cswArr.forEach(id => {
            if (id !== keep) destroyEntity(id);
        });
        this.cswArr = [];
    }

    showGameOver(): void {
        this.gameOverBlock.innerText = 'GAME OVER';
        this.againBtn.style.display = 'block';
        this.gameOverBlock.style.display = 'block';
    }

    showWin(): void {
        this.againBtn.style.display = 'block';
        this.gameOverBlock.innerText = 'YOU WIN';
        this.gameOverBlock.style.display = 'block';
    }
}
