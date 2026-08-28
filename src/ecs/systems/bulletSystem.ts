import { CONST } from '../../const';
import { ObjectType, Who } from '../../types';
import { BTankManager } from '../../btank';
import { ObjectsFactory } from '../../objFactory';
import { EntityId } from '../world';
import { transforms, bulletLinks, typeTags, healths } from '../components';
import { getVXY } from './movementSystem';
import { playerHitByBullet } from './playerSystem';

function spawnCrash(x: number, y: number, factory: ObjectsFactory, btank: BTankManager): void {
    const dp = factory.createCSW(x - 20, y - 20, Who.COMPUTER, ObjectType.DELAYED_PIC);
    btank.delayedPics.push(dp);
}

// Resolves what happens to the entity a bullet just hit - a port of the
// per-class hitByBullet() overrides. Obstacles/borders/static ships had no
// override (BaseCSW.hitByBullet is a no-op), so bullets are simply absorbed.
function applyBulletHit(targetId: EntityId, bulletParentIam: Who, btank: BTankManager): void {
    const type = typeTags.get(targetId)?.type;

    if (type === ObjectType.PLAYER) {
        playerHitByBullet(targetId, bulletParentIam);
        return;
    }
    if (type === ObjectType.SHIP) {
        const health = healths.get(targetId);
        if (health) health.life--;
        return;
    }
    if (type === ObjectType.SPACEBRICK) {
        const health = healths.get(targetId);
        if (health) {
            health.life--;
            if (health.life <= 0) btank.removeShip(targetId);
        }
        return;
    }
    // OBSTACLE, BORDER, STATICSHIP: no damage, the bullet is just absorbed.
}

// Bullet that flies every step per pixel - a port of Bullet.fly().
export function flyBullet(id: EntityId, btank: BTankManager, factory: ObjectsFactory): void {
    const t = transforms.get(id);
    const link = bulletLinks.get(id);
    if (!t || !link) return;

    const v = getVXY(t.d);
    const totalVx = v.vx * link.bulletSpeed;
    const totalVy = v.vy * link.bulletSpeed;

    const maxStep = 10;
    const travel = Math.hypot(totalVx, totalVy);
    const numSteps = Math.max(1, Math.ceil(travel / maxStep));
    const stepX = totalVx / numSteps;
    const stepY = totalVy / numSteps;

    for (let s = 0; s < numSteps; s++) {
        const nx = t.x + stepX;
        const ny = t.y + stepY;

        if (
            nx > CONST.MAXX * CONST.CELLSIZES.MAXX ||
            nx < 0 ||
            ny > CONST.MAXY * CONST.CELLSIZES.MAXY ||
            ny < 0
        ) {
            btank.removeBullet(id);
            spawnCrash(t.x, t.y, factory, btank);
            return;
        }

        const collidedBullet = btank.getBulletWithPixelPrecision(nx, ny, link.parentShip, id);
        if (collidedBullet) {
            btank.removeBullet(id);
            btank.removeBullet(collidedBullet);
            return;
        }

        const collidedShipId = btank.getCSWWithPixelPrecision(nx, ny, link.parentShip);
        if (collidedShipId !== null) {
            t.x = nx;
            t.y = ny;
            applyBulletHit(collidedShipId, link.parentIam, btank);
            spawnCrash(t.x, t.y, factory, btank);
            btank.removeBullet(id);
            return;
        }

        t.x = nx;
        t.y = ny;
    }
}
