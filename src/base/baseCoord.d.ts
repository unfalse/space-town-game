export declare const BaseCoordinates: {
    new (): {
        x: number;
        y: number;
        d: any;
        getVXY(d: any): {
            vx: number;
            vy: number;
        };
        getVXYAndAngle(d: any): any;
        initCoords(nx: number, ny: number, nd: any): void;
    };
};
