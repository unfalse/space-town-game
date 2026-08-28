import { CONST } from '../../const';
import { Direction } from '../../types';
import { BTankManager } from '../../btank';
import { EntityId } from '../world';
import { Inertia, transforms, inertias, shipDimensions } from '../components';

type BordersCheckResult = 'X' | 'Y' | 'OK';

// returns direction where to go in x and y coordinates
export function getVXY(d: Direction): { vx: number; vy: number } {
    return {
        vx: (-(d >> 1) | 1) * ((d & 1) ^ 1),
        vy: (-(d >> 1) | 1) * (d & 1 & 1),
    };
}

export function setDirectionAndAccel(
    t: { d: Direction },
    inertia: Inertia,
    d: Direction,
    accel: number,
): void {
    t.d = d;
    inertia.directions[d] = accel;
}

export function stopEntity(inertia: Inertia): void {
    for (let d = 0; d < 4; d++) {
        inertia.directions[d as Direction] = 0;
    }
}

function canItMove(
    t: { x: number; y: number },
    ux: number,
    uy: number,
    width: number,
    height: number,
): BordersCheckResult {
    if (t.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX || t.x + ux < 0) {
        if (t.x + ux < 0) t.x = 0;
        if (t.x + ux + width > CONST.MAXX * CONST.CELLSIZES.MAXX) {
            t.x = CONST.MAXX * CONST.CELLSIZES.MAXX - width;
        }
        return 'X';
    }

    if (t.y + uy + height > CONST.MAXY * CONST.CELLSIZES.MAXY || t.y + uy < 0) {
        if (t.y + uy < 0) t.y = 0;
        if (t.y + uy + height > CONST.MAXY * CONST.CELLSIZES.MAXY) {
            t.y = CONST.MAXY * CONST.CELLSIZES.MAXY - height;
        }
        return 'Y';
    }
    return 'OK';
}

function setInertiaDirections(inertia: Inertia, result: BordersCheckResult): void {
    if (result === 'X') {
        inertia.directions[CONST.DIRECTIONS.RIGHT as Direction] = 0;
        inertia.directions[CONST.DIRECTIONS.LEFT as Direction] = 0;
    }
    if (result === 'Y') {
        inertia.directions[CONST.DIRECTIONS.DOWN as Direction] = 0;
        inertia.directions[CONST.DIRECTIONS.UP as Direction] = 0;
    }
}

// Applies inertia to move an entity, resolving both map-border and
// ship/obstacle collisions - a faithful port of BaseCSW.move().
export function moveEntity(id: EntityId, btank: BTankManager): void {
    const t = transforms.get(id);
    const inertia = inertias.get(id);
    const dims = shipDimensions.get(id)?.dimensions;
    if (!t || !inertia || !dims) return;

    const delta = (d: Direction) => {
        const v = getVXY(d);
        const accel = inertia.directions[d];
        return { ux: v.vx * accel, uy: v.vy * accel };
    };

    const { ux: uxR, uy: uyR } = delta(CONST.DIRECTIONS.RIGHT as Direction);
    const { ux: uxD, uy: uyD } = delta(CONST.DIRECTIONS.DOWN as Direction);
    const { ux: uxL, uy: uyL } = delta(CONST.DIRECTIONS.LEFT as Direction);
    const { ux: uxU, uy: uyU } = delta(CONST.DIRECTIONS.UP as Direction);
    const { width, height } = dims[CONST.DIRECTIONS.RIGHT as Direction];

    const horizontal = { ux: uxR + uxL, uy: uyR + uyL };
    const vertical = { ux: uxD + uxU, uy: uyD + uyU };

    const checkHorizontal = canItMove(t, horizontal.ux, horizontal.uy, width, height);
    const checkVertical = canItMove(t, vertical.ux, vertical.uy, width, height);

    let dx = horizontal.ux + vertical.ux;
    let dy = horizontal.uy + vertical.uy;

    // Ship / obstacle collision: if the proposed full move would overlap
    // another ship, obstacle, or space brick, try axis-only moves so we
    // slide along it. If both axes are blocked, stay put and zero inertia
    // on the blocked axes.
    if (
        (dx !== 0 || dy !== 0) &&
        btank.checkShipCollisionAt(t.x + dx, t.y + dy, id)
    ) {
        const blockedX = dx !== 0 && !!btank.checkShipCollisionAt(t.x + dx, t.y, id);
        const blockedY = dy !== 0 && !!btank.checkShipCollisionAt(t.x, t.y + dy, id);

        if (!blockedX && !blockedY) {
            dx = 0;
            dy = 0;
            inertia.directions[CONST.DIRECTIONS.RIGHT as Direction] = 0;
            inertia.directions[CONST.DIRECTIONS.LEFT as Direction] = 0;
            inertia.directions[CONST.DIRECTIONS.DOWN as Direction] = 0;
            inertia.directions[CONST.DIRECTIONS.UP as Direction] = 0;
        } else {
            if (blockedX) {
                dx = 0;
                inertia.directions[CONST.DIRECTIONS.RIGHT as Direction] = 0;
                inertia.directions[CONST.DIRECTIONS.LEFT as Direction] = 0;
            }
            if (blockedY) {
                dy = 0;
                inertia.directions[CONST.DIRECTIONS.DOWN as Direction] = 0;
                inertia.directions[CONST.DIRECTIONS.UP as Direction] = 0;
            }
        }
    }

    setInertiaDirections(inertia, checkHorizontal);
    setInertiaDirections(inertia, checkVertical);

    t.x = t.x + dx;
    t.y = t.y + dy;

    t.centerx = t.x + (CONST.CELLSIZES.MAXX * CONST.SCALE.X) / 2;
    t.centery = t.y + (CONST.CELLSIZES.MAXY * CONST.SCALE.Y) / 2;
}
