import { CONST } from "./const";

enum Who {
    COMPUTER = CONST.COMPUTER,
    USER = CONST.USER,
}

type Direction = 0|1|2|3;
type RectSize = {
    height: number;
    width: number;
}

type Dimensions = { [key in Direction]: RectSize; }

type ObjectType = typeof CONST.TYPES;

type PathUnit = {
    d: Direction;
    accel: number;
    ms: number;
}

export { Who };
export type { Direction, Dimensions, RectSize, ObjectType, PathUnit };
