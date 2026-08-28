import {
    Direction,
    Dimensions,
    ObjectType,
    Who,
    WayPoints,
    InertiaDirections,
} from '../types';
import { CONST } from '../const';
import { EntityId, ComponentStore } from './world';

export type Transform = {
    x: number;
    y: number;
    d: Direction;
    centerx: number;
    centery: number;
};

export type Inertia = {
    directions: InertiaDirections;
    maximumAcceleration: number;
};

export type ShipDimensions = {
    dimensions: Dimensions | null;
};

export type Health = {
    life: number;
    maxlife: number;
};

export type TypeTag = {
    type: ObjectType;
};

export type Owner = {
    iam: Who;
};

export type GhostFlag = {
    ghost: boolean;
};

export type Weapon = {
    lastBulletTimeStamp: number;
    bulletsAmountOnFire: number;
};

// AI-controlled ship: scans for the player and fires at it
export type AIControl = {
    cpuBulletsInterval: number;
    fireStartTime: number;
};

// waypoint patrol path an AI ship follows when it doesn't see the player
export type WaypointPath = {
    wayPoints: WayPoints[];
    wpCounter: number;
    currentWp: WayPoints | null;
};

export type PlayerControl = {
    lives: number;
    spawnX: number;
    spawnY: number;
    isImmortal: boolean;
    respawnTime: number;
    isHidden: boolean;
    bulletsInterval: number;
};

export type BulletLink = {
    parentShip: EntityId;
    parentIam: Who;
    bulletSpeed: number;
};

export type CrashAnim = {
    frameCounter: number;
    framesLength: number;
    show: boolean;
    timerStarted: boolean;
    lastFrameTimeStamp: number;
};

export type CounterAnim = {
    counter: number;
};

// One store per component type - the "database tables" of the world.
export const transforms = new ComponentStore<Transform>();
export const inertias = new ComponentStore<Inertia>();
export const shipDimensions = new ComponentStore<ShipDimensions>();
export const healths = new ComponentStore<Health>();
export const typeTags = new ComponentStore<TypeTag>();
export const owners = new ComponentStore<Owner>();
export const ghostFlags = new ComponentStore<GhostFlag>();
export const weapons = new ComponentStore<Weapon>();
export const aiControls = new ComponentStore<AIControl>();
export const waypointPaths = new ComponentStore<WaypointPath>();
export const playerControls = new ComponentStore<PlayerControl>();
export const bulletLinks = new ComponentStore<BulletLink>();
export const crashAnims = new ComponentStore<CrashAnim>();
export const counterAnims = new ComponentStore<CounterAnim>();

// Repositions an entity, resetting its facing direction and center point -
// a port of BaseCoordinates.initCoords().
export function setTransform(
    id: EntityId,
    x: number,
    y: number,
    d: Direction = CONST.DIRECTIONS.UP as Direction,
): void {
    const t = transforms.get(id);
    if (!t) return;
    t.x = x;
    t.y = y;
    t.d = d;
    t.centerx = x;
    t.centery = y;
}

export function destroyEntity(id: EntityId): void {
    transforms.remove(id);
    inertias.remove(id);
    shipDimensions.remove(id);
    healths.remove(id);
    typeTags.remove(id);
    owners.remove(id);
    ghostFlags.remove(id);
    weapons.remove(id);
    aiControls.remove(id);
    waypointPaths.remove(id);
    playerControls.remove(id);
    bulletLinks.remove(id);
    crashAnims.remove(id);
    counterAnims.remove(id);
}
