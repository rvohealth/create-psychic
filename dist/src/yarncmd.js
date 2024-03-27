"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sspawn_1 = __importDefault(require("./sspawn"));
function yarncmd(program, commandString, description, aliasString) {
    program
        .command(commandString)
        .description(description)
        .action(async () => {
        const nodeEnvString = process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
            ? `NODE_ENV=${process.env.NODE_ENV} `
            : '';
        const cmd = `${nodeEnvString}yarn ${aliasString || commandString}`;
        if (process.env.DEBUG === '1')
            console.log(`[DEBUG]: the following yarn command is being aliased by psychic cli: ${cmd}`);
        await (0, sspawn_1.default)(cmd);
    });
}
exports.default = yarncmd;
//# sourceMappingURL=yarncmd.js.map