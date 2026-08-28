import { CONST } from '../const';
import { ObjectType, Who, WayPoints, Direction, InertiaDirections } from '../types';
import { DrawingManager } from '../drawingMan';
import { EntityId, createEntity } from './world';
import {
    transforms,
    inertias,
    shipDimensions,
    healths,
    typeTags,
    owners,
    ghostFlags,
    weapons,
    aiControls,
    waypointPaths,
    playerControls,
    bulletLinks,
    crashAnims,
    counterAnims,
} from './components';

export const MAX_LIFE = 5;
export const MAX_LIVES = 3;
export const RESPAWN_INVINCIBILITY_MS = 2000;
export const PLAYER_BULLETS_INTERVAL = 1400;
export const PLAYER_MAX_ACCEL = 1.5;
export const AI_MAX_ACCEL = 1;
export const CPU_BULLETS_INTERVAL = 1400;
export const SPACEBRICK_MAX_HITS = 10;

function freshDirections(): InertiaDirections {
    return { 0: 0, 1: 0, 2: 0, 3: 0, '-1': 0 };
}

// Ships: player, AI ships, obstacles, borders, static ships, space bricks.
// Only player/AI ships get an Inertia + Weapon component - the rest never
// move or fire, mirroring the fact that BaseCSW.move()/fire() were only
// ever invoked from the ship update loop in the original code.
export function createShip(
    x: number,
    y: number,
    who: Who,
    type: ObjectType,
    drawingManagerInst: DrawingManager,
    wayPoints?: WayPoints[],
): EntityId {
    const id = createEntity();

    const dimensions = drawingManagerInst.initDimensions(who);
    const { width, height } = dimensions[CONST.DIRECTIONS.RIGHT as Direction];

    transforms.set(id, {
        x,
        y,
        d: 0,
        centerx: x + width / 2,
        centery: y + height / 2,
    });
    shipDimensions.set(id, { dimensions });
    typeTags.set(id, { type });
    owners.set(id, { iam: who });
    ghostFlags.set(id, { ghost: false });

    if (who === CONST.USER) {
        healths.set(id, { life: MAX_LIFE, maxlife: MAX_LIFE });
        inertias.set(id, {
            directions: freshDirections(),
            maximumAcceleration: PLAYER_MAX_ACCEL,
        });
        weapons.set(id, {
            lastBulletTimeStamp: 0,
            bulletsAmountOnFire: CONST.MAXBULLETS,
        });
        playerControls.set(id, {
            lives: MAX_LIVES,
            spawnX: x,
            spawnY: y,
            isImmortal: false,
            respawnTime: -1,
            isHidden: false,
            bulletsInterval: PLAYER_BULLETS_INTERVAL,
        });
        return id;
    }

    const maxlife = type === ObjectType.SPACEBRICK ? SPACEBRICK_MAX_HITS : MAX_LIFE;
    healths.set(id, { life: maxlife, maxlife });

    if (type === ObjectType.SHIP) {
        inertias.set(id, {
            directions: freshDirections(),
            maximumAcceleration: AI_MAX_ACCEL,
        });
        weapons.set(id, {
            lastBulletTimeStamp: 0,
            bulletsAmountOnFire: CONST.MAXBULLETS,
        });
        aiControls.set(id, {
            cpuBulletsInterval: CPU_BULLETS_INTERVAL,
            fireStartTime: -1,
        });
        waypointPaths.set(id, {
            wayPoints: wayPoints ?? [],
            wpCounter: -1,
            currentWp: null,
        });
    }

    return id;
}

export function createBullet(
    x: number,
    y: number,
    d: Direction,
    parentShip: EntityId,
    parentIam: Who,
): EntityId {
    const id = createEntity();
    transforms.set(id, { x, y, d, centerx: x, centery: y });
    typeTags.set(id, { type: ObjectType.BULLET });
    bulletLinks.set(id, { parentShip, parentIam, bulletSpeed: 2 });
    return id;
}

export function createDelayedPic(x: number, y: number, framesLength = 4): EntityId {
    const id = createEntity();
    transforms.set(id, { x, y, d: 0, centerx: x, centery: y });
    typeTags.set(id, { type: ObjectType.DELAYED_PIC });
    crashAnims.set(id, {
        frameCounter: 0,
        framesLength,
        show: true,
        timerStarted: false,
        lastFrameTimeStamp: 0,
    });
    return id;
}

export function createCounter(x: number, y: number): EntityId {
    const id = createEntity();
    transforms.set(id, { x, y, d: 0, centerx: x, centery: y });
    typeTags.set(id, { type: ObjectType.COUNTER });
    counterAnims.set(id, { counter: 0 });
    return id;
}
