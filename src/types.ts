import { CONST } from "./const";

enum Who {
    COMPUTER = CONST.COMPUTER,
    USER = CONST.USER,
}

type Direction = 0 | 1 | 2 | 3 | -1;
type RectSize = {
    height: number;
    width: number;
}

type Dimensions = { [key in Direction]: RectSize; }

// type ObjectType = CONST.TYPES.OBSTACLE;

enum ObjectType {
    ERASER = -1,
    SHIP = 0,
    OBSTACLE = 1,
    SPACEBRICK = 2,
    COUNTER = 3,
    BORDER = 4,
    WAYPOINT = 5,
    WAYPOINTERASER = 6,
    PLAYER = 7,
    STATICSHIP = 8
}

type PathUnit = {
    d: Direction;
    accel: number;
    ms: number;
}



type Point = {
    x: number;
    y: number;
}

type WayPoints = number[];

export { Who, ObjectType };
export type { Direction, Dimensions, RectSize, PathUnit, Point, WayPoints };
