import resolvePath from "../../utils/resolvePath.js";
import resolveImportPath from "../../utils/resolveImportPath.js";
import sourceCodeExtensions from "../../utils/sourceCodeExtensions.js";
import getAllParentModules from "../../utils/getAllParentFolders.js";
import checkDirectImportFromModule from "./utils/checkDirectImportFromModule.js";
import checkImportFromGrandchild from "./utils/checkImportFromGrandchild.js";
import checkImportFromNonRootModule from "./utils/checkImportFromNonRootModule.js";
import checkImportFromParentModule from "./utils/checkImportFromParentModule.js";
import checkWrongImportFromIndexFile from "./utils/checkWrongImportFromIndexFile.js";
import findAllModules from "./utils/findAllModules.js";
import RuleOptionsError from "../../errors/RuleOptionsError.js";

const RULE_NAME = "module-import";

function transformOptions(options) {
    const {
        sourceCodeDirs = ["src"],
        notModules = options.sourceCodeDirs ?? ["src"],
    } = options;
    return {
        sourceCodeDirs: sourceCodeDirs.map((dir) => resolvePath(dir)),
        notModules: notModules.map((dir) => resolvePath(dir)),
    };
}

function validateOptions(options) {
    const projectDir = resolvePath(".");
    options.sourceCodeDirs.forEach((p) => {
        if (!p.startsWith(projectDir)) {
            throw new RuleOptionsError(RULE_NAME, "sourceCodeDirs", "Directory must be in projec folder");
        }
    });
    options.notModules.forEach((p) => {
        if (!p.startsWith(projectDir)) {
            throw new RuleOptionsError(RULE_NAME, "notModules", "Directory must be in projec folder");
        }
    });
}

export default {
    meta: {
        type: "suggestion",
        schema: [{
            type: "object",
            properties: {
                sourceCodeDirs: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                notModules: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
            },
            default: transformOptions({}),
        }],
    },
    create(context) {
        const options = transformOptions(context?.options?.[0] ?? {});
        validateOptions(options);

        const allModules = findAllModules(options.sourceCodeDirs).filter((module) => !options.notModules.includes(module));
        const containFile = resolvePath(context.filename);
        const containModules = getAllParentModules(allModules, containFile);

        return {
            ImportDeclaration(node) {
                const importFile = resolveImportPath(node.source.value, containFile);
                const isImportFileInNodeModules = importFile.startsWith(resolvePath("node_modules"));
                const isImportFileJsSourceCode = sourceCodeExtensions.some((ext) => importFile.endsWith(`.${ext}`));
                const isContainFileJsSourceCode = sourceCodeExtensions.some((ext) => containFile.endsWith(`.${ext}`));
                if (!importFile || isImportFileInNodeModules || !isImportFileJsSourceCode || !isContainFileJsSourceCode) {
                    return;
                }
                const importModules = getAllParentModules(allModules, importFile);

                if (checkWrongImportFromIndexFile(allModules, importFile, importModules, containFile, containModules)) {
                    context.report({ node, message: "Index file is allowed to import from its own or child modules" });
                    return;
                }

                if (checkDirectImportFromModule(allModules, importFile, importModules, containFile, containModules)) {
                    context.report({ node, message: "Direct import from module" });
                    return;
                }

                if (checkImportFromNonRootModule(allModules, importFile, importModules, containFile, containModules)) {
                    context.report({ node, message: "Import from non-root module" });
                    return;
                }

                if (checkImportFromParentModule(allModules, importFile, importModules, containFile, containModules)) {
                    context.report({ node, message: "Import from parent module" });
                    return;
                }

                if (checkImportFromGrandchild(allModules, importFile, importModules, containFile, containModules)) {
                    context.report({ node, message: "Import from grandchild module" });
                    return;
                }
            },
        };
    },
};
