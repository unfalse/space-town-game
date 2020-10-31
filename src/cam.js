import { BaseCoordinates } from './baseCoord';
import { CONST } from './const';

export const Camera = class extends BaseCoordinates {
      constructor(BTankInst) {
        super();
        this.BTankInst = BTankInst;
      }

      setCoords(x, y) {
        this.x = x;
        this.y = y;
      }

      getRelCoords(x, y) {
        return {
          x: Math.round(x - this.BTankInst.gameCam.x + CONST.CAM.CENTERX),
          y: Math.round(y - this.BTankInst.gameCam.y + CONST.CAM.CENTERY),
        }
      }
}