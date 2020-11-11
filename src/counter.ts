import { BaseCSW } from './baseCsw';
import { BTankManager } from './btank';
import { CONST } from './const';
import { Who } from './types';

export const Counter = class extends BaseCSW {
    BTankInst: BTankManager;
    type: number; // TODO: it exists in BaseCSW too!
    counter: number;
    counterMax: number;

    constructor(BTankInst: BTankManager) {
      super();
      // this.CONST = CONST;
      this.BTankInst = BTankInst;
      this.type = CONST.TYPES.COUNTER;
      this.counter = 0;
      this.counterMax = 10;
    }

    init(mx: number, my: number, who: Who, BTankInst: BTankManager) {
      super.init(mx, my, who, BTankInst);
    }

    draw() {
      this.BTankInst.drawCounter(this.x, this.y, this.counter);
    }

    update(timestamp) {
      this.counter++;
      this.counter = this.counter > 9 ? 0 : this.counter;
      super.update(timestamp);
    }
  };