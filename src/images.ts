type OnLoadHandler = (image: Images) => void;

type InternalOnLoadHandler = () => void;

export class Images {
    image: HTMLImageElement;
    loaded: boolean;
    static loadImage: (
        imagePath: string,
        onLoad: OnLoadHandler,
        onGetLoadingStatus?: OnGetLoadingStatusHandler,
    ) => Promise<void>;
    static loadManyImages: (
        imagePaths: Array<string>,
        targetImages: Array<Images>,
        onGetLoadingStatus?: OnGetLoadingStatusHandler,
    ) => Promise<void>;
    static drawContext: CanvasRenderingContext2D;

    constructor(src: string, onLoadHandler: InternalOnLoadHandler) {
        this.image = new Image();
        this.loaded = false;

        this.init(src, onLoadHandler);
    }

    init(src: string, onLoadHandler: InternalOnLoadHandler): void {
        this.image.addEventListener(
            'load',
            () => {
                this.loaded = true;
                console.log(src + ' has loaded!');
                onLoadHandler();
            },
            false,
        );

        this.image.src = src;
    }

    draw(
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx?: number,
        dy?: number,
        dw?: number,
        dh?: number,
    ): void {
        if (this.loaded) {
            if (
                dx !== undefined &&
                dy !== undefined &&
                dw !== undefined &&
                dh !== undefined
            ) {
                Images.drawContext.drawImage(
                    this.image,
                    sx,
                    sy,
                    sw,
                    sh,
                    dx,
                    dy,
                    dw,
                    dh,
                );
            } else {
                Images.drawContext.drawImage(this.image, sx, sy, sw, sh);
            }
        }
    }
}

export type OnGetLoadingStatusHandler = (total: number, resolved: number) => void;

let promisesTotal = 0;
let resolvedPromises = 0;

Images.loadImage = function (
    imagePath: string,
    onLoad: OnLoadHandler,
    onGetLoadingStatus: OnGetLoadingStatusHandler = () => {},
): Promise<void> {
    return new Promise((resolve) => {

        promisesTotal += 1;
        onGetLoadingStatus(promisesTotal, resolvedPromises);

        onLoad(
            new Images(imagePath, () => {

                resolvedPromises += 1;
                onGetLoadingStatus(promisesTotal, resolvedPromises);
                if (promisesTotal === resolvedPromises) {
                    promisesTotal = 0;
                    resolvedPromises = 0;
                }

                resolve();
            }),
        );
    });
};

Images.loadManyImages = function (
    imagePaths: Array<string>,
    targetImages: Array<Images>,
    onGetLoadingStatus: OnGetLoadingStatusHandler = () => {},
): Promise<void> {
    return new Promise(resolve => {
        const ps: Array<Promise<Images>> = imagePaths.map(
            (ip: string) =>
                new Promise<Images>(resolveImg => {

                    promisesTotal += 1;
                    onGetLoadingStatus(promisesTotal, resolvedPromises);

                    const newImage = new Images(ip, () => {

                        resolvedPromises += 1;
                        onGetLoadingStatus(promisesTotal, resolvedPromises);
                        if (promisesTotal === resolvedPromises) {
                            promisesTotal = 0;
                            resolvedPromises = 0;
                        }

                        resolveImg(newImage);
                    });
                }),
        );
        Promise.all(ps).then((images: Images[]) => {
            images.forEach((im: Images, i: number) => {
                targetImages[i] = im;
            });
            resolve();
        });
    });
};
