export default function (allFolders, fileOrFolder) {
    return allFolders.filter((module) => fileOrFolder.startsWith(module) && fileOrFolder !== module).sort((l, r) => l.split("/").length - r.split("/").length);
}
