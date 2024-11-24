import pkg from "../../package.json" with { type: "json" };

export default class extends Errro {
    constructor(rule, option, message, errorOptions) {
        super(`${pkg.name}: RuleOptionsError: ${rule}: ${option}: ${message}`, errorOptions);
    }
}
