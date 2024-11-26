import resolvePath from "../../utils/resolvePath.js";
import resolveModuleName from "../../utils/resolveImportPath.js";
import getAllParentFolders from "../../utils/getAllParentFolders.js";
import RuleOptionsError from "../../errors/RuleOptionsError.js";

const RULE_NAME = "layer-hierarchy";

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
    for (let i = 1; i < options.hierarchy.length; i++) {
        for (let j = 0; j < options.hierarchy.length; j++) {
            if (options.hierarchy[i].startsWith(options.hierarchy[j])
                || options.hierarchy[j].startsWith(options.hierarchy[i])
            ) {
                throw new RuleOptionsError(RULE_NAME, "hierarchy", "Nested directories are not allowed");
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

                const importParent = getAllParentFolders(options.hierarchy, importFile).at(-1);
                const containParent = getAllParentFolders(options.hierarchy, containFile).at(-1);

                if (importParent != null && containParent != null && +options.allowSelfImport + options.hierarchy.indexOf(containParent) - options.hierarchy.indexOf(importParent) < 0) {
                    context.report({
                        node,
                        message: "Violation hierarchy",
                    });
                }
            },
        };
    },
};
