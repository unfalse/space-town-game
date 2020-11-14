import { BaseCoordinates } from './base/baseCoord';
import { BTankManager } from './btank';

export class DelayedPic extends BaseCoordinates {
    show: boolean;
    timerStarted: boolean;
    BTankInst: BTankManager;
    frameCounter: number;
    framesLength: number;

    constructor() {
        super();
    }

    init(nx: number, ny: number, BTankInst: BTankManager, framesLength: number) {
        this.initCoords(nx, ny, 0);
        this.show = true;
        this.timerStarted = false;
        this.BTankInst = BTankInst;
        this.frameCounter = 0;
        this.framesLength = framesLength;
    }

    setCoords(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.show = true;
    }

    draw() {
        this.BTankInst.DrawCrash(this.x, this.y, this.frameCounter);

        function setDelay() {
            setTimeout(
                function () {
                    if (this.frameCounter + 1 === this.framesLength) {
                        this.show = false;
                        this.timerStarted = false;
                        this.BTankInst.removeDelayedPic(this);
                    } else {
                        this.frameCounter++;
                        setDelay.call(this);
                    }
                }.bind(this),
                80
            );
        }

        if (!this.timerStarted && this.show) {
            this.timerStarted = true;
            setDelay.call(this);
        }
    }
};
