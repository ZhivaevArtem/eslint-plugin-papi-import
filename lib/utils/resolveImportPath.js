import fs from "node:fs";
import console from "node:console";
import ts from "typescript";
import resolvePath from "./resolvePath.js";

const host = {
    fileExists(fileName) {
        return fs.existsSync(fileName) && fs.lstatSync(fileName).isFile();
    },
    readFile(fileName) {
        return fs.readFileSync(fileName).toString();
    },
    directoryExists(directoryName) {
        return fs.existsSync(directoryName) && fs.lstatSync(directoryName).isDirectory();
    },
    getCurrentDirectory() {
        return resolvePath(".");
    },
    realpath(path) {
        return fs.realpathSync(path);
    },
    trace(s) {
        console.log(s);
    },
};


const jsConfigPath = resolvePath("jsconfig.json");
const tsConfigPath = resolvePath("tsconfig.json");

let compilerOptions = {};
if (fs.existsSync(tsConfigPath) && fs.lstatSync(tsConfigPath).isFile()) {
    compilerOptions = ts.readConfigFile(tsConfigPath, host.readFile)?.config?.compilerOptions ?? {};
} else if (fs.existsSync(jsConfigPath) && fs.lstatSync(jsConfigPath).isFile()) {
    compilerOptions = ts.readConfigFile(jsConfigPath, host.readFile)?.config?.compilerOptions ?? {};
}

compilerOptions.moduleResolution = ts.ModuleResolutionKind.NodeNext;
compilerOptions.module = ts.ModuleKind.ESNext;


export default function (moduleName, containingFile) {
    const module = ts.resolveModuleName(moduleName, resolvePath(containingFile), compilerOptions, host);
    const resolvedName = module?.resolvedModule?.resolvedFileName;
    return resolvedName ? resolvePath(resolvedName) : void 0;
}
