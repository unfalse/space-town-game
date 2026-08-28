import { BTankManager } from '../../btank';
import { EntityId } from '../world';
import { crashAnims } from '../components';

const FRAME_INTERVAL_MS = 90;

// Advances a crash-pic's frame counter using the frame's timestamp instead
// of setTimeout, and removes it once the animation finishes.
export function updateCrash(id: EntityId, timestamp: number, btank: BTankManager): void {
    const crash = crashAnims.get(id);
    if (!crash) return;

    if (!crash.timerStarted && crash.show) {
        crash.timerStarted = true;
        crash.lastFrameTimeStamp = timestamp;
    }

    if (crash.timerStarted && timestamp - crash.lastFrameTimeStamp >= FRAME_INTERVAL_MS) {
        crash.lastFrameTimeStamp = timestamp;

        if (crash.frameCounter + 1 === crash.framesLength) {
            crash.show = false;
            crash.timerStarted = false;
            btank.removeDelayedPic(id);
        } else {
            crash.frameCounter++;
        }
    }
}
