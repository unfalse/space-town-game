import { BaseCSW } from './base/baseCsw';
import { Bullet } from './bullet';
import { Direction, Who } from './types';
export declare class Player extends BaseCSW {
    PLAYER_BULLETS_INTERVAL: number;
    accel: number;
    constructor();
    init(mx: number, my: number, who: Who, BTankInst: any): void;
    addAccel(value: number): void;
    draw(ghost?: boolean): void;
    fire(timestamp: number): void;
    setDirectionAndAddAccel(d: Direction, accel: number): void;
    hitByBullet(bulletInstance: Bullet): void;
}
