import { CONST } from "./const";
declare enum Who {
    COMPUTER,
    USER
}
declare type Direction = 0 | 1 | 2 | 3;
declare type RectSize = {
    height: number;
    width: number;
};
declare type Dimensions = {
    [key in Direction]: RectSize;
};
declare type ObjectType = typeof CONST.TYPES;
declare type PathUnit = {
    d: Direction;
    accel: number;
    ms: number;
};
export { Who };
export type { Direction, Dimensions, RectSize, ObjectType, PathUnit };
