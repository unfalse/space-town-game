import { BTankManager } from './btank';
import { Who } from './types';
export declare const Counter: {
    new (BTankInst: BTankManager): {
        BTankInst: BTankManager;
        type: number;
        counter: number;
        counterMax: number;
        y: number;
        x: number;
        init(mx: number, my: number, who: Who, BTankInst: BTankManager): void;
        draw(): void;
        update(timestamp: number): void;
        lastBulletTimeStamp: number;
        CSWSPEED: number;
        inertiaDirections: {
            0: number;
            1: number;
            2: number;
            3: number;
        };
        inertiaTimerIsRunning: boolean;
        d: import("./types").Direction;
        stopAccel: boolean;
        MAXIMUM_ACCELERATION: number;
        dimensions: import("./types").Dimensions;
        iam: Who;
        maxlife: number;
        life: number;
        bulletsAmountOnFire: number;
        createNewBullet(startX: number, startY: number, startD: import("./types").Direction, whoFires?: Who): void;
        setDirectionAndAccel(d: import("./types").Direction, accel: number, ms: number): void;
        getDirSum(): number;
        inertia(): void;
        waitAndCall(callback: Function, ms: number): void;
        inertiaStartAttempt(): void;
        stop(): void;
        move(direction: import("./types").Direction): void;
        hitByBullet(bulletInstance: import("./bullet").Bullet): void;
        getVXY(d: any): {
            vx: number;
            vy: number;
        };
        getVXYAndAngle(d: any): any;
        initCoords(nx: number, ny: number, nd: any): void;
    };
};
