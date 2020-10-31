export const Images = class {
    constructor(BTankInst, src, onLoadHandler) {
        this.image = new Image();
        this.loaded = false;
        this.BTankInst = BTankInst;

        this.init(src, onLoadHandler);
    }

    init(src, onLoadHandler) {
        this.image.addEventListener(
            "load",
            function () {
                this.loaded = true;
                console.log(src + " has loaded!");
                onLoadHandler();
            }.bind(this),
            false
        );

        this.image.src = src;
    }

    draw(sx, sy, sw, sh, dx, dy, dw, dh) {
        if (this.loaded) {
            if (!dx && !dy && !dw && !dh) {
                this.BTankInst.drawContext.drawImage(this.image, sx, sy, sw, sh);
            } else {
                this.BTankInst.drawContext.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
            }
        }
    }
};

Images.loadImage = function(imagePath, onLoad) {
    return new Promise(
        function (resolve) {
            onLoad.call(
                this,
                new this.images(this, imagePath, function () {
                    resolve();
                })
            );
        }.bind(this)
    );
  };

Images.loadManyImages = function(
    imagePaths,
    targetImages
) {
    return new Promise((allResolved) => {
        const ps = imagePaths.map(
            (ip) =>
                new Promise((resolve) => {
                    const newImage = new this.images(this, ip, function () {
                        resolve(newImage);
                    });
                })
        );
        Promise.all(ps).then((images) => {
            images.forEach((im, i) => {
                targetImages[i] = im;
            });
            allResolved();
        });
    });
};