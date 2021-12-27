#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const commandLine = require('./src/commandLine.js');
const resize = require('./src/imageTools.js');

const findInDirectory = (dir, query, recursive) => {
    let results = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });

    const rQuery = new RegExp(query.replace('.', '\\.').replace('*', '.'), (process.platform === "win32" ? "i" : ""));
    files.forEach((file) => {
        const filename = path.join(dir, file.name);
        if (file.isDirectory() && recursive)
            results = results.concat(findInDirectory(filename, query, recursive));


        if (file.isFile() && rQuery.test(file.name))
            results.push(filename);

    });
    return results;
};

const queryFiles = (inputParams) => {

    let files = [];
    for (var i = 0; i < inputParams.pathquery.length; i++) {
        const query = inputParams.pathquery[i];
        const queryResult = findInDirectory(path.dirname(query), path.basename(query), inputParams.recursive);
        files = files.concat(queryResult);
    };

    return files;
};


const getOutputPath = (filePath, inputParams) => {
    let { name, ext } = path.parse(filePath);

    if (inputParams.convertFormatNeeded())
        ext = "." + inputParams.format;

    const filename = name + ext;
    if (path.isAbsolute(inputParams.out))
        return path.join(inputParams.out, filename);
    else
        return path.join(path.parse(filePath).dir, inputParams.out, filename);
};

const checkOutputDirectory = (outputFile) => {
    const outputDir = path.parse(outputFile).dir;

    try {
        fs.accessSync(outputDir, fs.constants.W_OK);
    } catch (e) {
        fs.mkdirSync(outputDir);
    }
    if (!fs.statSync(outputDir).isDirectory())
        throw new Error("Output path is not a directory!");
};


const isFileExists = (file) => {
    try {
        fs.accessSync(file, fs.constants.R_OK);
        return true;
    } catch (e) {
        return false;
    }
};

let OverrideAll = false;
const checkOutputFileOverriding = (outputFile) => new Promise((resolve, reject) => {
    if (!isFileExists(outputFile))
        return resolve(true);

    if (OverrideAll)
        return resolve(true);

    commandLine.overridingConfirmFromConsole(outputFile, (answer) => {
        switch (answer) {
            case "all": OverrideAll = true; return resolve(true);
            case "stop": return reject();
            case "yes": return resolve(true);
            case "no": return resolve(false);
        }
    });
});

const processFiles = (files, inputParams) => {
    if (inputParams.rewrite)
        inputParams.out = os.tmpdir();

    let inputFilepath = null,
        outputFilepath = null;

    const totalFiles = files.length;
    const loopForFiles = () => new Promise((resolve, reject) => {
        inputFilepath = files.pop();
        commandLine.printProgressBar(100 - ((files.length + 1) / totalFiles * 100), "Process: " + inputFilepath);

        outputFilepath = getOutputPath(inputFilepath, inputParams);
        checkOutputDirectory(outputFilepath);
        checkOutputFileOverriding(outputFilepath).then(resolve).catch(() => {

        });
    }).then((isOk) => {
        if (isOk)
            return resize.process(inputFilepath, outputFilepath, inputParams).catch(error => reject({ error, inputFilepath }));
    }).catch((e) => {
        if (e.message)
            console.error('\x1b[31m', `Error: ${e.message}`, '\x1b[0m');
        else if (e.error)
            console.error('\x1b[31m', `Error in ${path.basename(e.file)}: ${e.error.message}`, '\x1b[0m');
    }).finally(() => {
        if (files.length !== 0)
            return loopForFiles();
        else
            commandLine.printProgressBar(100, "Done!\n");

    });

    loopForFiles();
};


let inputParams = {};
try {
    inputParams = commandLine.parser();
    if (inputParams.help)
        return commandLine.printHelp();

} catch (e) {
    commandLine.printError(e.message);
    return commandLine.printHelp();
}

try {
    const files = queryFiles(inputParams);
    if (files.length === 0)
        return console.log("** There is not any file. Please check your file(s) path. **");

    if (inputParams.warnings && inputParams.warnings.length > 0) {
        inputParams.warnings.forEach(warning => commandLine.printWarning(warning));
        commandLine.continueConfirmFromConsole(continueConfirm => {
            if (continueConfirm)
                processFiles(files, inputParams);
        });
    } else
        processFiles(files, inputParams);
} catch (e) {
    commandLine.printError(e.message);
}

