import path from "node:path";

export default function (...paths) {
    return path.resolve(...paths).replaceAll("\\", "/").replace(/^[A-Z]+:/, "");
}
