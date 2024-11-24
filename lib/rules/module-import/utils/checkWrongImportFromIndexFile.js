import sourceCondeExtensions from "../../../utils/sourceCodeExtensions.js";

export default function (allModules, importFile, importModules, containFile, containModules) {
    const isContainFileIndex = sourceCondeExtensions.some((ext) => containFile.endsWith(`/index.${ext}`));
    const isImportFromOwnModule = containModules.length > 0 && importModules.length > 0 && containModules.at(-1) === importModules.at(-1);
    const isImportFromChildModule = containModules.length > 0 && importModules.length > 1 && containModules.at(-1) === importModules.at(-2);

    return isContainFileIndex && !isImportFromOwnModule && !isImportFromChildModule;
}
