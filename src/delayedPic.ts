// import { BaseCoordinates } from './base/baseCoord';
import { BaseCSW } from './base/baseCsw';

// export class DelayedPic extends BaseCoordinates {
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

    // init(nx: number, ny: number, BTankInst: BTankManager) {
    // init() {
        // this.initCoords(nx, ny, 0);
        // this.BTankInst = BTankInst;
    // }

    // delayedPicInit() {
    //     this.initCoords(this.x, this.y, 0);
    //     this.show = true;
    //     this.timerStarted = false;
    // }

    setCoords(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.show = true;
    }

    draw(): void {
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
                180
            );
        }

        if (!this.timerStarted && this.show) {
            this.timerStarted = true;
            setDelay.call(this);
        }
    }
}
