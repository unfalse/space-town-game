import { BaseCoordinates } from './baseCoord';
import { Bullet } from '../bullet';
import { Dimensions, Direction, Who } from '../types';
declare type InertiaDirections = {
    [key in Direction]: number;
};
export declare class BaseCSW extends BaseCoordinates {
    lastBulletTimeStamp: number;
    CSWSPEED: number;
    inertiaDirections: InertiaDirections;
    inertiaTimerIsRunning: boolean;
    d: Direction;
    stopAccel: boolean;
    MAXIMUM_ACCELERATION: number;
    dimensions: Dimensions;
    BTankInst: any;
    iam: Who;
    maxlife: number;
    life: number;
    bulletsAmountOnFire: number;
    x: number;
    y: number;
    type: any;
    constructor();
    init(mx: number, my: number, who: Who, BTankInst: any): void;
    draw(): void;
    createNewBullet(startX: number, startY: number, startD: Direction, whoFires?: Who): void;
    setDirectionAndAccel(d: Direction, accel: number, ms: number): void;
    getDirSum(): number;
    inertia(): void;
    waitAndCall(callback: Function, ms: number): void;
    inertiaStartAttempt(): void;
    stop(): void;
    move(direction: Direction): void;
    update(timestamp: number): void;
    hitByBullet(bulletInstance: Bullet): void;
}
export {};
