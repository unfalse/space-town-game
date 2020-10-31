// Bullet that is flying every step per pixel
import { BaseCoordinates } from './baseCoord';
import { CONST } from './const';

console.log("bulletPixel!");
export const Bullet = class extends BaseCoordinates {
    // BattleTankGame.deps.baseCoordinates.call(this);
    constructor(BTankInst, whoFire) {
        super();
        //this.BULLETSPEED = whoFire ? (whoFire.type === CONST.USER ? 2.5 : 2.5) : 2.5;
        this.BULLETSPEED = whoFire ? (whoFire.type === CONST.USER ? 10 : 5) : 5;

        this.CONST = CONST;
        this.BTankInst = BTankInst;
    }

    init(nx, ny, nd, parentShip) {
        this.parentShip = parentShip;
        this.setCoords(nx, ny, nd);
    }

    setCoords(nx, ny, nd) {
        const { width, height } = this.parentShip.dimensions[typeof nd === 'number' ? nd : 0];
        let x = 0,
            y = 0;
        if (typeof nd === 'number') {
            switch (nd) {
                case 0: {
                    x = nx + width - 1;
                    y = ny + height / 2;
                    break;
                }
                case 1: {
                    x = nx + width / 2;
                    y = ny + height - 1;
                    break;
                }
                case 2: {
                    x = nx + 1;
                    y = ny + height / 2;
                    break;
                }
                case 3: {
                    x = nx + width / 2;
                    y = ny - 1;
                    break;
                }
                default:
                    break;
            }
        } else if (typeof nd === 'object') {
            const newX = { 0: width / 2, 1: width, '-1': -1 };
            const newY = { 0: height / 2, 1: height + 1, '-1': -1 };
            x = nx + newX[nd.vx];
            y = ny + newY[nd.vy];
        }
        this.initCoords(x, y, nd);
        return this;
    }

    draw() {
        this.BTankInst.drawContext.fillStyle =
            this.parentShip.iam === this.CONST.USER ? "#F00" : "#FF0";
        const relXY = this.BTankInst.gameCam.getRelCoords(this.x, this.y);
        this.BTankInst.drawContext.fillRect(
            relXY.x,
            relXY.y,
        4, 4);
    }

    fly() {
        const nvxy = (typeof this.d === 'number') ? this.getVXY(this.d) : this.d;
        let vx = nvxy.vx * this.BULLETSPEED;
        let vy = nvxy.vy * this.BULLETSPEED;

        // TODO: дописать
        // Проверка попадания в танк

        // TODO: убрать сильную связанность с BTank
        const collidedShips = this.BTankInst.getCSWWithPixelPrecision(
            this.x,
            this.y,
            this.parentShip
        );
        const collidedBullets = this.BTankInst.getBulletWithPixelPrecision(
            this.x,
            this.y,
            this.parentShip,
            this
        );
        if (collidedBullets) {
            // console.log('bullets collided!');
            this.BTankInst.removeBullet(this);
            this.BTankInst.removeBullet(collidedBullets);
        }
        // a bullet can't hurt it's master! :)
        if (collidedShips) {
            if (collidedShips.hitByBullet) {
                collidedShips.hitByBullet(this);
                this.BTankInst.createDelayedPic(this.x - 20, this.y - 20);
            }
            this.BTankInst.removeBullet(this);
        }

        // TODO: добавить поле MaxSpeed в класс bullet и использовать
        // вместо MAXSPEED. Переименовать в StepsToGo
        // Поле speed переименовать в steps
        this.x = this.x + vx;
        this.y = this.y + vy;
        this.draw();

        if (this.x > this.CONST.MAXX * this.CONST.CELLSIZES.MAXX || this.x < 0) {
            this.BTankInst.removeBullet(this);
            // this.BTankInst.createDelayedPic(this.x - 10, this.y - 10);
        }

        if (this.y > this.CONST.MAXY * this.CONST.CELLSIZES.MAXY || this.y < 0) {
            this.BTankInst.removeBullet(this);
            // this.BTankInst.createDelayedPic(this.x - 10, this.y - 10);
        }
    }
};
