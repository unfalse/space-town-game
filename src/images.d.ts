import { BTankManager } from "./btank";
declare type OnLoadHandler = () => void;
export declare class Images {
    image: HTMLImageElement;
    loaded: boolean;
    BTankInst: BTankManager;
    static loadImage: (imagePath: string, onLoad: OnLoadHandler) => Promise<unknown>;
    static loadManyImages: (imagePaths: Array<string>, targetImages: Array<Images>) => Promise<unknown>;
    static drawContext: CanvasRenderingContext2D;
    constructor(src: string, onLoadHandler: OnLoadHandler);
    init(src: string, onLoadHandler: OnLoadHandler): void;
    draw(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
}
export {};
