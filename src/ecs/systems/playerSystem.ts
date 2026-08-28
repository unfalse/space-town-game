import { CONST } from '../../const';
import { Direction, Who } from '../../types';
import { BTankManager } from '../../btank';
import { EntityId } from '../world';
import { transforms, inertias, healths, playerControls } from '../components';
import { moveEntity, stopEntity } from './movementSystem';
import { RESPAWN_INVINCIBILITY_MS } from '../factory';

// Player movement input adds acceleration, cancelling the opposite
// direction first - a port of Player.setDirectionAndAddAccel().
export function playerAddAccel(playerId: EntityId, d: Direction, accel: number): void {
    const t = transforms.get(playerId);
    const inertia = inertias.get(playerId);
    if (!t || !inertia) return;

    t.d = d;

    const opposite = CONST.DIR_OPPOSITES[d] as Direction;
    if (inertia.directions[opposite] > 0) {
        inertia.directions[opposite] -= accel;
        if (inertia.directions[opposite] < 0) {
            inertia.directions[opposite] = 0;
        }
    } else {
        if (inertia.directions[d] + accel > inertia.maximumAcceleration) return;
        inertia.directions[d] += accel;
    }
}

export function playerStop(playerId: EntityId): void {
    const inertia = inertias.get(playerId);
    if (!inertia) return;
    stopEntity(inertia);
}

export function playerSetSpawn(playerId: EntityId, x: number, y: number): void {
    const player = playerControls.get(playerId);
    if (!player) return;
    player.spawnX = x;
    player.spawnY = y;
}

export function playerRespawn(playerId: EntityId, timestamp: number): void {
    const t = transforms.get(playerId);
    const player = playerControls.get(playerId);
    const health = healths.get(playerId);
    if (!t || !player || !health) return;

    t.x = player.spawnX;
    t.y = player.spawnY;
    health.life = health.maxlife;
    playerStop(playerId);
    player.isImmortal = true;
    player.respawnTime = timestamp + RESPAWN_INVINCIBILITY_MS;
}

export function playerUpdate(playerId: EntityId, timestamp: number, btank: BTankManager): void {
    const player = playerControls.get(playerId);
    if (!player) return;

    if (player.isImmortal && player.respawnTime > 0 && timestamp >= player.respawnTime) {
        player.isImmortal = false;
        player.respawnTime = -1;
    }

    moveEntity(playerId, btank);
}

export function playerHitByBullet(playerId: EntityId, bulletParentIam: Who): void {
    const player = playerControls.get(playerId);
    const health = healths.get(playerId);
    if (!player || !health) return;
    if (player.isImmortal) return;
    if (bulletParentIam === CONST.COMPUTER) {
        health.life--;
    }
}
