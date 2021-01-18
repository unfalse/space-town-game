import { BaseCSW } from './base/baseCsw';
import { DrawingManager } from './drawingMan';
import { CONST } from './const';

export const Counter = class extends BaseCSW {
    type: number; // TODO: it exists in BaseCSW too!
    counter: number;
    counterMax: number;
    y: number;
    x: number;

    constructor() {
      super();
      this.type = CONST.TYPES.COUNTER;
      this.counter = 0;
      this.counterMax = 10;
    }

    draw() {
      this.drawingManagerInst.drawCounter(this.x, this.y, this.counter);
    }

    update(timestamp: number) {
      this.counter++;
      this.counter = this.counter > 9 ? 0 : this.counter;
      super.update(timestamp);
    }
  };