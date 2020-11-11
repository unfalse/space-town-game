import { BaseCoordinates } from './baseCoord';

export class DelayedPic extends BaseCoordinates {
    constructor() {
        super();
    }

    init(nx, ny, BTankInst, framesLength) {
        this.initCoords(nx, ny, 0);
        this.show = true;
        this.timerStarted = false;
        this.BTankInst = BTankInst;
        this.frameCounter = 0;
        this.framesLength = framesLength;
    }

    setCoords(x, y) {
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
