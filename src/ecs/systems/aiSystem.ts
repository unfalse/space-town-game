import { CONST } from '../../const';
import { Direction } from '../../types';
import { BTankManager } from '../../btank';
import { ObjectsFactory } from '../../objFactory';
import { EntityId } from '../world';
import {
    transforms,
    shipDimensions,
    healths,
    waypointPaths,
    inertias,
    playerControls,
} from '../components';
import { moveEntity, setDirectionAndAccel, stopEntity } from './movementSystem';
import { aiFire } from './weaponSystem';

// distance is an amount of cells in 4 directions from the ship which is
// scanning - a port of BaseCPU.plusShapedScan().
export function plusShapedScan(
    shooterId: EntityId,
    playerId: EntityId,
    distanceCells: number,
): Direction | null {
    const t = transforms.get(shooterId);
    const dims = shipDimensions.get(shooterId)?.dimensions;
    const playerT = transforms.get(playerId);
    const playerHealth = healths.get(playerId);
    if (!t || !dims || !playerT || !playerHealth || playerHealth.life <= 0) {
        return null;
    }

    const { width, height } = dims[t.d];
    const distance = distanceCells * CONST.CELLSIZES.MAXX;

    if (
        playerT.x >= t.x - distance &&
        playerT.x <= t.x &&
        playerT.y >= t.y &&
        playerT.y <= t.y + height
    )
        return CONST.DIRECTIONS.LEFT as Direction;
    if (
        playerT.x >= t.x + width &&
        playerT.x <= t.x + width + distance &&
        playerT.y >= t.y &&
        playerT.y <= t.y + height
    )
        return CONST.DIRECTIONS.RIGHT as Direction;
    if (
        playerT.y >= t.y - distance &&
        playerT.y <= t.y &&
        playerT.x >= t.x &&
        playerT.x <= t.x + width
    )
        return CONST.DIRECTIONS.UP as Direction;
    if (
        playerT.y >= t.y + height &&
        playerT.y <= t.y + height + distance &&
        playerT.x >= t.x &&
        playerT.x <= t.x + width
    )
        return CONST.DIRECTIONS.DOWN as Direction;
    return -1;
}

// Waypoint patrol + player scan-and-fire - a port of
// CSWAI_customPaths.update().
export function updateAIShip(
    id: EntityId,
    timestamp: number,
    btank: BTankManager,
    factory: ObjectsFactory,
): void {
    const health = healths.get(id);
    if (health && health.life <= 0) {
        btank.removeShip(id);
        return;
    }

    const t = transforms.get(id);
    const wp = waypointPaths.get(id);
    const inertia = inertias.get(id);
    if (!t || !wp || !inertia) return;

    let currentWp = wp.currentWp;
    const accel = 1;
    let d: Direction = -1;

    if (wp.wayPoints.length !== 0) {
        if (!currentWp || (t.x === currentWp[0] && t.y === currentWp[1])) {
            wp.wpCounter++;
            if (wp.wpCounter === wp.wayPoints.length) wp.wpCounter = 0;
            wp.currentWp = wp.wayPoints[wp.wpCounter];
            currentWp = wp.currentWp;
        }
        const x = Math.floor(t.x);
        const y = Math.floor(t.y);
        if (currentWp) {
            if (x === currentWp[0] && y < currentWp[1]) {
                d = CONST.DIRECTIONS.DOWN as Direction;
            }
            if (x > currentWp[0] && y === currentWp[1]) {
                d = CONST.DIRECTIONS.LEFT as Direction;
            }
            if (x === currentWp[0] && y > currentWp[1]) {
                d = CONST.DIRECTIONS.UP as Direction;
            }
            if (x < currentWp[0] && y === currentWp[1]) {
                d = CONST.DIRECTIONS.RIGHT as Direction;
            }
        }
    }

    const playerId = btank.playerInstance;
    const playerHidden = playerId ? playerControls.get(playerId)?.isHidden : true;
    const scanResult =
        playerHidden || !playerId ? -1 : plusShapedScan(id, playerId, 10);

    if (scanResult !== null && scanResult > -1) {
        stopEntity(inertia);
        setDirectionAndAccel(t, inertia, scanResult, 0);
        aiFire(id, timestamp, factory, btank);
    } else {
        if (t.d !== d) {
            stopEntity(inertia);
        }
        t.d = d >= 0 ? d : t.d;
        setDirectionAndAccel(t, inertia, t.d, accel);
    }

    moveEntity(id, btank);
}
