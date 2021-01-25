import { BaseCSW } from './base/baseCsw';
// import { BaseGameObject } from './base/baseGameObj';
import { CONST } from './const';

export class Counter extends BaseCSW {
    counter: number;
    counterMax: number;

    constructor() {
      super();
      this.type = CONST.TYPES.COUNTER;
      this.counter = 0;
      this.counterMax = 10;
    }

    draw(): void {
      this.drawingManagerInst.drawCounter(this.x, this.y, this.counter);
    }

    update(): void {
      this.counter++;
      this.counter = this.counter > 9 ? 0 : this.counter;
      super.update(0);
    }
  }