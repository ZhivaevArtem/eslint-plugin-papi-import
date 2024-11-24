import fs from "node:fs";
import resolvePath from "../../../utils/resolvePath.js";
import sourceCodeExtensions from "../../../utils/sourceCodeExtensions.js";

export default function findAllModules(sourceDir) {
    if (Array.isArray(sourceDir)) {
        return [...new Set(sourceDir.flatMap((dir) => {
            return findAllModules(dir);
        }))];
    }
    const absoluteSource = resolvePath(sourceDir);
    if (!fs.existsSync(absoluteSource)) {
        return [];
    }
    if (!fs.lstatSync(absoluteSource).isDirectory()) {
        return [];
    }

    const dirs = [];
    let hasIndex = false;
    fs.readdirSync(absoluteSource).forEach((child) => {
        const absoluteChild = resolvePath(absoluteSource, child);
        const lstat = fs.lstatSync(absoluteChild);
        if (lstat.isDirectory()) {
            dirs.push(absoluteChild);
        } else if (lstat.isFile() && sourceCodeExtensions.some((ext) => `index.${ext}` === child)) {
            hasIndex = true;
        }
    });

    const out = dirs.flatMap((child) => findAllModules(child));
    if (hasIndex) {
        out.push(absoluteSource);
    }
    return [...new Set(out)];
}
