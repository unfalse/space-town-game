import { CONST } from './const';

export enum Who {
    COMPUTER = CONST.COMPUTER,
    USER = CONST.USER,
}

export type Direction = 0 | 1 | 2 | 3 | -1;
export type RectSize = {
    height: number;
    width: number;
};

export type Dimensions = { [key in Direction]: RectSize };

// type ObjectType = CONST.TYPES.OBSTACLE;

export enum ObjectType {
    ERASER = -1,
    SHIP = 0,
    OBSTACLE = 1,
    SPACEBRICK = 2,
    COUNTER = 3,
    BORDER = 4,
    WAYPOINT = 5,
    WAYPOINTERASER = 6,
    PLAYER = 7,
    STATICSHIP = 8,
    BULLET = 9,
    DELAYED_PIC = 10,
}

export type PathUnit = {
    d: Direction;
    accel: number;
    ms: number;
};

export type Point = {
    x: number;
    y: number;
};

export type WayPoints = number[];

// export { Who, ObjectType };
// export type { Direction, Dimensions, RectSize, PathUnit, Point, WayPoints };
