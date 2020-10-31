import { BaseCSW } from './baseCsw';
import { CONST } from './const';

export const Counter = class extends BaseCSW {
    constructor(BTankInst) {
      super();
      this.CONST = CONST;
      this.BTankInst = BTankInst;
      this.type = CONST.TYPES.COUNTER;
      this.counter = 0;
      this.counterMax = 10;
    }

    init(mx, my, who, BTankInst) {
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