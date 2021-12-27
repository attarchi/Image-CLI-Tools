const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const getResizeOption = (metadata, inputParams) => {
    if (inputParams.percentage) {
        if (inputParams.width) {
            const width = parseInt(metadata.width * inputParams.width / 100);
            return { width };
        }
        else if (inputParams.height) {
            const height = parseInt(metadata.height * inputParams.height / 100);
            return { height };
        }
    }

    if (inputParams.width && !inputParams.height)
        return { width: inputParams.width };

    if (!inputParams.width && inputParams.height)
        return { height: inputParams.height };

    if (inputParams.width && inputParams.height)
        return { width: inputParams.width, height: inputParams.height };

    if (inputParams.maxwidth || inputParams.maxheight) {
        let newWidth = metadata.width;
        let newHeight = metadata.height;
        if (inputParams.maxwidth && inputParams.maxwidth < newWidth) {
            newWidth = inputParams.maxwidth;
            newHeight = parseInt(metadata.height * (newWidth / metadata.width));
        }

        if (inputParams.maxheight && inputParams.maxheight < newHeight) {
            newHeight = inputParams.maxheight;
            newWidth = parseInt(metadata.width * (newHeight / metadata.height));
        }
        return { width: newWidth, height: newHeight };
    }
    return null;
};

const OptimizeOption = {
    none: {},
    png: { compressionLevel: 9, palette: true, quality: 80 },
    jpeg: { quality: 80 },
    webp: { quality: 80, lossless: true },
    gif: {},
    tiff: { quality: 80, compression: 'lzw' },
    raw: {}
};


const rewrite = (inputFilepath, outputFilepath) => {
    if (!path.isAbsolute(inputFilepath))
        inputFilepath = path.resolve(inputFilepath);

    const newImputFilepath = path.join(path.parse(inputFilepath).dir, path.basename(outputFilepath));
    fs.unlinkSync(inputFilepath);
    fs.cpSync(outputFilepath, newImputFilepath);
    fs.unlinkSync(outputFilepath);
};


module.exports.process = (inputFilepath, outputFilepath, inputParams) => new Promise((resolve, reject) => {
    let sharpFile = sharp(inputFilepath).clone();
    sharpFile.metadata().then(metadata => {
        const resizeOption = getResizeOption(metadata, inputParams);
        if (resizeOption)
            sharpFile = sharpFile.resize(resizeOption);

        let fileformat = metadata.format;
        if (inputParams.convertFormatNeeded())
            fileformat = inputParams.format;

        let optimizeOption = OptimizeOption.none;
        if (inputParams.optimaize && OptimizeOption[fileformat])
            optimizeOption = OptimizeOption[fileformat];

        sharpFile
            .toFormat(fileformat, optimizeOption)
            .toFile(outputFilepath)
            .then(() => {
                if (inputParams.rewrite) {
                    rewrite(inputFilepath, outputFilepath);
                }
                resolve();
            }).catch(reject);

    }).catch(reject);
});