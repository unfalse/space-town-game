import { BaseCSW } from './base/baseCsw';

// TODO: extend from BaseGameObject !!!
export class DelayedPic extends BaseCSW {
    show: boolean;
    timerStarted: boolean;
    frameCounter: number;
    framesLength: number;

    constructor(framesLength = 4) {
        super();
        this.frameCounter = 0;
        this.framesLength = framesLength;
        this.initCoords(this.x, this.y, 0);
        this.show = true;
        this.timerStarted = false;
    }

    setCoords(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.show = true;
    }

    draw(): void {
        this.drawingManagerInst.DrawCrash(this.x, this.y, this.frameCounter);

        const setDelay = (): void => {
            setTimeout(() => {
                if (this.frameCounter + 1 === this.framesLength) {
                    this.show = false;
                    this.timerStarted = false;
                    this.BTankInst.removeDelayedPic(this);
                } else {
                    this.frameCounter++;
                    setDelay();
                }
            }, 180);
        };

        if (!this.timerStarted && this.show) {
            this.timerStarted = true;
            setDelay();
        }
    }
}
