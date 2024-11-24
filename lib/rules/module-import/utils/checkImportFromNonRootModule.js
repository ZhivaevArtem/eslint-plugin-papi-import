import sourceCondeExtensions from "../../../utils/sourceCodeExtensions.js";

export default function (allModules, importFile, importModules, containFile, containModules) {
    const isImportFromRoot = importModules.length === 1;
    const isImportFromModule = importModules.length > 0 && sourceCondeExtensions.some((ext) => importFile.endsWith(`/index.${ext}`));

    return isImportFromModule && !isImportFromRoot;
}
