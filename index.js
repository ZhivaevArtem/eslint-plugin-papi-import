import pkg from "./package.json" with { type: "json" };
import rules from "./lib/rules/index.js";

export default {
    meta: {
        name: pkg.name,
        version: "0.0.1",
    },
    rules,
};
