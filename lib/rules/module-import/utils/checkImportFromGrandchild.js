import sourceCondeExtensions from "../../../utils/sourceCodeExtensions.js";

export default function (allModules, importFile, importModules, containFile, containModules) {
    const isImportFromModule = importModules.length > 0 && sourceCondeExtensions.some((ext) => importFile.endsWith(`/index.${ext}`));
    const isContainInModule = containModules.length > 0 && sourceCondeExtensions.some((ext) => containFile.endsWith(`/index.${ext}`));
    const isContainModuleParentOfImportModule = containModules.length > 0 && importModules.slice(0, -1).includes(containModules.at(-1));
    const isContainModuleFirstParentOfImportModule = containModules.length > 0 && importModules.slice(0, -1).at(-1) === containModules.at(-1);

    return isImportFromModule && isContainInModule && isContainModuleParentOfImportModule && !isContainModuleFirstParentOfImportModule;
}
