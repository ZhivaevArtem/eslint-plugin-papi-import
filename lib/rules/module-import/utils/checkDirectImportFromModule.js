import sourceCondeExtensions from "../../../utils/sourceCodeExtensions.js";

export default function (allModules, importFile, importModules, containFile, containModules) {
    const isImportFromFile = !sourceCondeExtensions.some((ext) => importFile.endsWith(`/index.${ext}`));
    const isImportAndContainInTheSameModule = importModules.length > 0 && containModules.length > 0 && importModules.at(-1) === containModules.at(-1);

    return isImportFromFile && !isImportAndContainInTheSameModule;
}
