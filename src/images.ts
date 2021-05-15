type OnLoadHandler = (image: Images) => void;

type InternalOnLoadHandler = () => void;

export class Images {
    image: HTMLImageElement;
    loaded: boolean;
    static loadImage: (
        imagePath: string,
        onLoad: OnLoadHandler,
    ) => Promise<unknown>;
    static loadManyImages: (
        imagePaths: Array<string>,
        targetImages: Array<Images>,
    ) => Promise<unknown>;
    static drawContext: CanvasRenderingContext2D;

    constructor(src: string, onLoadHandler: InternalOnLoadHandler) {
        this.image = new Image();
        this.loaded = false;

        this.init(src, onLoadHandler);
    }

    init(src: string, onLoadHandler: InternalOnLoadHandler): void {
        this.image.addEventListener(
            'load',
            function () {
                this.loaded = true;
                console.log(src + ' has loaded!');
                onLoadHandler();
            }.bind(this),
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
            if (!dx && !dy && !dw && !dh) {
                Images.drawContext.drawImage(this.image, sx, sy, sw, sh);
            } else {
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
            }
        }
    }
}

Images.loadImage = function (
    imagePath: string,
    onLoad: (image: Images) => void,
) {
    return new Promise(
        function (resolve: () => void) {
            onLoad.call(
                this,
                new Images(imagePath, function () {
                    resolve();
                }),
            );
        }.bind(this),
    );
};

Images.loadManyImages = function (
    imagePaths: Array<string>,
    targetImages: Array<Images>,
) {
    return new Promise((allResolved: (value?: unknown) => void) => {
        const ps: Array<Promise<unknown>> = imagePaths.map(
            (ip: string) =>
                new Promise((resolve: (value?: unknown) => void) => {
                    const newImage = new Images(ip, function () {
                        resolve(newImage);
                    });
                }),
        );
        Promise.all(ps).then((images: Array<Images>) => {
            images.forEach((im: Images, i: number) => {
                targetImages[i] = im;
            });
            allResolved();
        });
    });
};
