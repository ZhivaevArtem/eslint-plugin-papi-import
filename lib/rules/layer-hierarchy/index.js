import resolvePath from "../../utils/resolvePath.js";
import resolveModuleName from "../../utils/resolveImportPath.js";
import getAllParentFolders from "../../utils/getAllParentFolders.js";

function transformOptions(options) {
    const {
        allowSelfImport = false,
        hierarchy = [],
    } = options;
    return {
        allowSelfImport,
        hierarchy: hierarchy.map((dir) => resolvePath(dir)),
    };
}

function validateOptions(options) {
    for (let i = 1; i < options.layersHierarchy.length; i++) {
        for (let j = 0; j < options.layersHierarchy.length; j++) {
            if (options.layersHierarchy[i].startsWith(options.layersHierarchy[j])
                || options.layersHierarchy[j].startsWith(options.layersHierarchy[i])
            ) {
                throw new Error("Nested layers in layersHierarchy are not allowed");
            }
        }
    }
}

export default {
    meta: {
        type: "suggestion",
        schema: [{
            type: "object",
            properties: {
                allowSelfImport: {
                    type: "boolean",
                },
                hierarchy: {
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

        const containFile = resolvePath(context.filename);

        return {
            ImportDeclaration(node) {
                const importFile = resolveModuleName(node.source.value, containFile);
                if (!importFile || importFile.startsWith(resolve("node_modules"))) {
                    return;
                }

                const importLayer = getAllParentFolders(options.hierarchy, importFile).at(-1);
                const containLayer = getAllParentFolders(options.hierarchy, containFile).at(-1);

                if (importLayer != null && containLayer != null && +options.allowSelfImport + options.hierarchy.indexOf(containLayer) - options.hierarchy.indexOf(importLayer) < 0) {
                    context.report({
                        node,
                        message: "Violation hierarchy",
                    });
                }
            },
        };
    },
};
