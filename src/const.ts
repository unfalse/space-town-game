const CONST = {
    MAXLIFES: 10,
    MAXSPEED: 0,
    MAXBULLETS: 10,

    COMPUTER: 0,
    USER: 1,
    TYPES: {
        ERASER: -1,
        SHIP: 0,
        OBSTACLE: 1,
        SPACEBRICK: 2,
        COUNTER: 3,
        BORDER: 4,
        WAYPOINT: 5,
        WAYPOINTERASER: 6,
        PLAYER: 7,
        STATICSHIP: 8,
        BULLET: 9,
        DELAYED_PIC: 10,
    },
    CELLSIZES: {
        MAXX: 40,
        MAXY: 40,
    },

    SCALE: {
        X: 1,
        Y: 1,
    },

    MAXX: 500,
    MAXY: 500,
    SCREENMAXX: 25,
    SCREENMAXY: 18,

    CAM: {
        CENTERX: 500,
        CENTERY: 360,
    },

    RIGHT: 0,
    DOWN: 1,
    LEFT: 2,
    UP: 3,

    DIR_OPPOSITES: {
        0: 2,
        1: 3,
        2: 0,
        3: 1,
        '-1': -1,
    },

    COLLISION_GRID: {
        WIDTH: 200,
        HEIGHT: 200
    }
};

export { CONST };
