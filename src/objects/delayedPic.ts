import { BaseCSW } from './base/baseCsw';

// TODO: extend from BaseGameObject !!!
const FRAME_INTERVAL_MS = 90;

export class DelayedPic extends BaseCSW {
    show: boolean;
    timerStarted: boolean;
    frameCounter: number;
    framesLength: number;
    lastFrameTimeStamp: number;

    constructor(framesLength = 4) {
        super();
        this.frameCounter = 0;
        this.framesLength = framesLength;
        this.initCoords(this.x, this.y, 0);
        this.show = true;
        this.timerStarted = false;
        this.lastFrameTimeStamp = 0;
    }

    draw(timestamp = 0): void {
        this.drawingManagerInst.DrawCrash(this.x, this.y, this.frameCounter);

        if (!this.timerStarted && this.show) {
            this.timerStarted = true;
            this.lastFrameTimeStamp = timestamp;
        }

        if (
            this.timerStarted &&
            timestamp - this.lastFrameTimeStamp >= FRAME_INTERVAL_MS
        ) {
            this.lastFrameTimeStamp = timestamp;

            if (this.frameCounter + 1 === this.framesLength) {
                this.show = false;
                this.timerStarted = false;
                this.BTankInst.removeDelayedPic(this);
            } else {
                this.frameCounter++;
            }
        }
    }
}
