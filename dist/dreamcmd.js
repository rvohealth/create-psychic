"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sspawn_1 = __importDefault(require("./sspawn"));
function dreamcmd(program, commandString, description, aliasString) {
    program
        .command(commandString)
        .description(description)
        .action(() => __awaiter(this, void 0, void 0, function* () {
        const nodeEnvString = process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
            ? `NODE_ENV=${process.env.NODE_ENV} `
            : '';
        const cmd = `${nodeEnvString} ${commandString}`;
        if (process.env.DEBUG == '1')
            console.log(`[DEBUG]: the following yarn command is being aliased by psychic cli: ${cmd}`);
        yield (0, sspawn_1.default)(cmd);
    }));
}
exports.default = dreamcmd;
//# sourceMappingURL=dreamcmd.js.map