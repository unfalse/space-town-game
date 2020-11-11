import { BaseCoordinates } from './baseCoord';
import { CONST } from './const';

export class Camera extends BaseCoordinates {
      BTankInst: any;
      constructor(BTankInst: any) {
        super();
        this.BTankInst = BTankInst;
      }

      setCoords(x: number, y: number) {
        this.x = x;
        this.y = y;
      }

      getRelCoords(x: number, y: number) {
        return {
          x: Math.round(x - this.BTankInst.gameCam.x + CONST.CAM.CENTERX),
          y: Math.round(y - this.BTankInst.gameCam.y + CONST.CAM.CENTERY),
        }
      }
}