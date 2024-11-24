import sourceCondeExtensions from "../../../utils/sourceCodeExtensions.js";

export default function (allModules, importFile, importModules, containFile, containModules) {
    const isImportFromModule = importModules.length > 0 && sourceCondeExtensions.some((ext) => importFile.endsWith(`/index.${ext}`));
    const isContainInModule = containModules.length > 0 && sourceCondeExtensions.some((ext) => containFile.endsWith(`/index.${ext}`));
    const isImportModuleParentOfContainModule = containModules.slice(0, -1).includes(importModules.at(-1));;

    return isImportFromModule && isContainInModule && isImportModuleParentOfContainModule;
}
