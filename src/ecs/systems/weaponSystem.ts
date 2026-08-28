import { BTankManager } from '../../btank';
import { ObjectsFactory } from '../../objFactory';
import { EntityId } from '../world';
import {
    transforms,
    owners,
    weapons,
    shipDimensions,
    aiControls,
    playerControls,
    bulletLinks,
} from '../components';

// Spawns a bullet at the edge of the shooter's hull, in the direction it's
// currently facing - a port of Bullet.setCoords()'s numeric-direction case
// (the vector-based branch was dead code: every caller passed a plain
// Direction) plus the bulletsAmountOnFire cap from BaseCSW.createNewBullet.
export function spawnBulletFrom(
    shooterId: EntityId,
    factory: ObjectsFactory,
    btank: BTankManager,
): void {
    const t = transforms.get(shooterId);
    const owner = owners.get(shooterId);
    const weapon = weapons.get(shooterId);
    const dims = shipDimensions.get(shooterId)?.dimensions;
    if (!t || !owner || !weapon || !dims) return;

    const bulletCount = btank.bulletsArr.filter(
        id => bulletLinks.get(id)?.parentShip === shooterId,
    ).length;
    if (bulletCount >= weapon.bulletsAmountOnFire) return;

    const { width, height } = dims[t.d];
    let bx = t.x;
    let by = t.y;
    switch (t.d) {
        case 0:
            bx = t.x + width - 1;
            by = t.y + height / 2;
            break;
        case 1:
            bx = t.x + width / 2;
            by = t.y + height - 1;
            break;
        case 2:
            bx = t.x + 1;
            by = t.y + height / 2;
            break;
        case 3:
            bx = t.x + width / 2;
            by = t.y - 1;
            break;
        default:
            break;
    }

    const bulletId = factory.createBullet(bx, by, t.d, shooterId, owner.iam);
    btank.bulletsArr.push(bulletId);
}

export function playerFire(
    playerId: EntityId,
    timestamp: number,
    factory: ObjectsFactory,
    btank: BTankManager,
): void {
    const weapon = weapons.get(playerId);
    const player = playerControls.get(playerId);
    if (!weapon || !player) return;
    if (timestamp - weapon.lastBulletTimeStamp < player.bulletsInterval) return;
    weapon.lastBulletTimeStamp = timestamp;
    spawnBulletFrom(playerId, factory, btank);
}

// CPU fire cooldown: the first call only seeds the timer (matches
// BaseCPU.fire(), which never shoots on the very first tick after spawn).
export function aiFire(
    aiId: EntityId,
    timestamp: number,
    factory: ObjectsFactory,
    btank: BTankManager,
): void {
    const ai = aiControls.get(aiId);
    if (!ai) return;
    if (ai.fireStartTime === -1) {
        ai.fireStartTime = timestamp;
        return;
    }
    if (timestamp - ai.fireStartTime >= ai.cpuBulletsInterval) {
        ai.fireStartTime = timestamp;
        spawnBulletFrom(aiId, factory, btank);
    }
}
