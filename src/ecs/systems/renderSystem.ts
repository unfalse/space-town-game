import { CONST } from '../../const';
import { ObjectType } from '../../types';
import { DrawingManager } from '../../drawingMan';
import { EntityId } from '../world';
import { transforms, typeTags, healths, counterAnims, bulletLinks, crashAnims } from '../components';

// Dispatches each entity to the right DrawingManager call based on its
// TypeTag - the ECS equivalent of the old per-class draw() overrides.
export function renderEntity(id: EntityId, drawingManagerInst: DrawingManager): void {
    const type = typeTags.get(id)?.type;
    const t = transforms.get(id);
    if (type === undefined || !t) return;

    switch (type) {
        case ObjectType.PLAYER:
            // the camera always centers on the player, so it renders at
            // screen center regardless of its world position
            drawingManagerInst.drawcswmt9(CONST.CAM.CENTERX, CONST.CAM.CENTERY, t.d);
            break;

        case ObjectType.SHIP:
            drawingManagerInst.drawcswmt5(t.x, t.y, t.d);
            break;

        case ObjectType.OBSTACLE:
            drawingManagerInst.drawObstacle(t.x, t.y);
            break;

        case ObjectType.BORDER:
            drawingManagerInst.drawBorder(t.x, t.y);
            break;

        case ObjectType.STATICSHIP:
            drawingManagerInst.drawStaticShip(t.x, t.y);
            break;

        case ObjectType.SPACEBRICK: {
            const life = healths.get(id)?.life ?? 0;
            const frame = Math.min(4, Math.floor((life > 0 ? life : 0) / 2));
            drawingManagerInst.drawSpaceBrick(t.x, t.y, frame);
            break;
        }

        case ObjectType.COUNTER: {
            const counter = counterAnims.get(id)?.counter ?? 0;
            drawingManagerInst.drawCounter(t.x, t.y, counter);
            break;
        }

        case ObjectType.BULLET: {
            const link = bulletLinks.get(id);
            if (link?.parentIam === CONST.USER) {
                drawingManagerInst.drawPlayerBullet(t.x, t.y);
            } else {
                drawingManagerInst.drawCPUBullet(t.x, t.y);
            }
            break;
        }

        case ObjectType.DELAYED_PIC: {
            const frameCounter = crashAnims.get(id)?.frameCounter ?? 0;
            drawingManagerInst.DrawCrash(t.x, t.y, frameCounter);
            break;
        }

        default:
            break;
    }
}
