// import { BaseCoordinates } from './base/baseCoord';
import { BaseCSW } from './base/baseCsw';
import { BTankManager } from './btank';

// export class DelayedPic extends BaseCoordinates {
export class DelayedPic extends BaseCSW {    
    show: boolean;
    timerStarted: boolean;
    BTankInst: BTankManager;
    frameCounter: number;
    framesLength: number;

    constructor(framesLength = 4) {
        super();
        this.frameCounter = 0;
        this.framesLength = framesLength;
    }

    // init(nx: number, ny: number, BTankInst: BTankManager) {
    // init() {
        // this.initCoords(nx, ny, 0);
        // this.BTankInst = BTankInst;
    // }

    delayedPicInit() {
        this.initCoords(this.x, this.y, 0);
        this.show = true;
        this.timerStarted = false;
    }

    setCoords(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.show = true;
    }

    draw() {
        this.drawingManagerInst.DrawCrash(this.x, this.y, this.frameCounter);

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
