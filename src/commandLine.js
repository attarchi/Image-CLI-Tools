const path = require('path');

const isEmptyString = (value) => !(value != null && value.length > 0);

const splitPairParameter = (parameter) => {
    const pos = parameter.indexOf('=');
    const key = parameter.substring(0, pos).trim();
    const value = parameter.substring(pos + 1).trim();
    if (isEmptyString(key)) throw new Error(`Invalid input parameters "${parameter}". Parameter is not correct!`);
    if (isEmptyString(value)) throw new Error(`Invalid input parameters "${parameter}". Value of parameter cannot be empty!`);
    return { key, value };
}

const isPairKeyValueParameter = (parameter) => parameter.indexOf('=') >= 0;
const isPathQueryParameter = (parameter) => (parameter.indexOf('/') >= 0 || parameter.indexOf('\\') >= 0);

const defaultOutputPath = `.${path.sep}modified${path.sep}`;

const validateFinalParameters = (parameters) => {

    const warnings = [];
    if (parameters.help)
        return null;

    if (parameters.pathquery.length === 0)
        throw new Error("There is no file query parameter in your command!");

    if ((parameters.width || parameters.height) && (parameters.maxwidth || parameters.maxheight))
        warnings.push("You can use either of width/height or maxwidth/maxheight. maxwidth/maxheight will be ignored!");

    if (parameters.width && parameters.height)
        warnings.push("Using both width and height parameter might cause your image to be cropped!");

    if (parameters.percentage && parameters.width && parameters.height)
        warnings.push("You can't use width and height parameter together while using percentage method for resizing. Height parameter will be ignored!");

    if (parameters.percentage && !(parameters.width || parameters.height))
        throw new Error("Passing at least one of width and height parameter is required while using percentage resizing mode.");

    if (parameters.percentage && (parameters.maxwidth || parameters.maxheight))
        warnings.push("If you use percentage method for resizing, maxwidth and maxheight parameters will be ignored!");

    if (parameters.rewrite)
        warnings.push("You are using rewrite switch, It causes losing your original images!");

    if (parameters.rewrite && parameters.out != defaultOutputPath)
        throw new Error("Oops! you can't use rewrite switch and output path together.");

    return warnings;
};

const readline = require('readline');


module.exports.parser = function () {

    const result = {
        pathquery: [],
        width: null,
        height: null,
        maxwidth: null,
        maxheight: null,
        percentage: null,
        recursive: false,
        optimaize: false,
        rewrite: false,
        out: defaultOutputPath,
        format: 'without change',
        convertFormatNeeded: () => {
            return result.format !== 'without change';
        },
        help: false
    };

    const processArgument = (arg) => {
        if (!arg) return;
        if (isPairKeyValueParameter(arg)) {
            const parameterPair = splitPairParameter(arg);
            if (result[parameterPair.key] !== null)
                throw new Error(`Invalid input parameters. "${parameterPair.key}" is not supported!`);

            if (parameterPair.key === 'width' || parameterPair.key === 'height' || parameterPair.key === 'maxwidth' || parameterPair.key === 'maxheight')
                parameterPair.value = parseInt(parameterPair.value);
            result[parameterPair.key] = parameterPair.value;
        } else if (isPathQueryParameter(arg)) {
            result.pathquery.push(arg);
        } else {
            switch (arg.trim()) {
                case '-rd':
                case '--recursive':
                    result.recursive = true; break;
                case '-o':
                case '--optimaize':
                    result.optimaize = true; break;
                case '-p':
                case '--percentage':
                    result.percentage = true; break;
                case '-rw':
                case '--rewrite':
                    result.rewrite = true; break;
                case '-png':
                    result.format = 'png'; break;
                case '-jpg':
                case '-jpeg':
                    result.format = 'jpeg'; break;
                case '-webp':
                    result.format = 'webp'; break;
                case '-gif':
                    result.format = 'gif'; break;
                case '-tiff':
                    result.format = 'tiff'; break;
                case '-raw':
                    result.format = 'raw'; break;
                case '-h':
                case '--help':
                    result.help = true; break;
                default: throw new Error(`Invalid input parameters. "${arg}" is not supported!`);
            }
        }
    };

    const onlyCommandLineArquments = process.argv.slice(2);
    onlyCommandLineArquments.forEach(processArgument);
    const warnings = validateFinalParameters(result);
    if (warnings)
        result.warnings = warnings;

    return result;
};

module.exports.printWarning = function (message) {
    console.log(`\x1b[33mWarning: ${message}\x1b[0m`);
};

module.exports.printError = function (message) {
    console.error('\x1b[31m', `Error: ${message}`, '\x1b[0m');
};

module.exports.continueConfirmFromConsole = (callback) => {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt('Do you want to continue? (yes/[no]):');
    rl.on('line', function (line) {
        switch (line.toLowerCase().trim()) {
            case "y":
            case "yes":
                rl.close();
                return callback(true);
            case "":
            case "n":
            case "no":
                rl.close();
                return callback(false);
            default:
                return rl.prompt();
        }
    }).on('SIGINT', function () {
        rl.close();
        return callback(false);
    });
    rl.prompt();
};

module.exports.overridingConfirmFromConsole = (filepath, callback) => {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt(`File "${path.basename(filepath)}" already exists in "${path.dirname(filepath)}", Do you want to replace it? (yes/[no]/all/stop):`);
    rl.on('line', function (line) {
        switch (line.toLowerCase().trim()) {
            case "y":
            case "yes":
                rl.close();
                return callback('yes');
            case "":
            case "n":
            case "no":
                rl.close();
                return callback('no');
            case "a":
            case "all":
                rl.close();
                return callback('all');
            case "s":
            case "stop":
                rl.close();
                return callback('stop');
            default:
                return rl.prompt();
        }
    }).on('SIGINT', function () {
        rl.close();
        return callback('stop');
    });
    rl.prompt();

};

const progressBarLength = 20;

module.exports.printProgressBar = function (percentage, description) {
    const pointCount = parseInt(progressBarLength * percentage / 100);
    const dots = ".".repeat(pointCount);
    const left = progressBarLength - pointCount;
    const empty = " ".repeat(left);
    let line =`\r[${dots}${empty}] ${parseInt(percentage)}%  ${description}`;
    process.stdout.clearLine();
    process.stdout.write(line);
};

module.exports.printHelp = function () {
    const package = require('../package.json');
    const path = require('path');

    console.log(`
\x1b[33m${package.name} v${package.version} \x1b[0m    
    Author: ${package.author} 
    Homepage: ${package.homepage}    
    ==============================
\x1b[0m
\x1b[33mUsage:\x1b[0m

image-cli-tools [file query] width=100        Resizes all image width to 100 pixel
image-cli-tools [file query] width=25 -p      Reduces all image width to 25 percentage

image-cli-tools [file query] -o               Optimizes images
image-cli-tools --help                        Shows this help

\x1b[33mExample:\x1b[0m
image-cli-tools .${path.sep}*.png .${path.sep}thumbnail${path.sep}*.jpg  maxwidth=128 -o
This command resizes all png images in current folder and all jpg images in thumbnail folder so that maximum width will be 128 pixels.

\x1b[33mOptions:\x1b[0m
[file query]        Writes multiple queries for listing batch file with regex query
out=[output path]   Output file paths which can be either reletavie or absolute path. Default: ${defaultOutputPath} 
width=[value]       The exact width of output images in pixel unit
height=[value]      The exact height of output images in pixel unit
maxwidth=[value]    The maximum width of output images in pixel unit
maxheight=[value]   The maximum height of output images in pixel unit
-o,     --optimize      Compresses the images to the extent that the quality is not lost
-rd,    --recursive     Seraches image files in nested sub-directories based on the query
-p,     --percentage    Used for reducing the size of all images with a certain percenage
-rw     --rewrite       Saves the changes on the original files
-h,     --help          Shows this help
-png                    Sets output file formats to png
-jpg, -jpeg             Sets output file formats to jpg
-webp                   Sets output file formats to webp
-gif                    Sets output file formats to gif
-tiff                   Sets output file formats to tiff
    `,);
}

