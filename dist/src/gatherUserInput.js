"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const select_1 = __importDefault(require("./select"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const options = {
    apiOnly: false,
    redis: false,
    ws: false,
    useUuids: false,
    client: null,
};
async function redisQuestion() {
    const answer = await new select_1.default('redis?', ['yes', 'no']).run();
    options.redis = answer === 'yes';
}
async function wsQuestion() {
    const answer = await new select_1.default('websockets?', ['yes', 'no']).run();
    options.ws = answer === 'yes';
}
async function primaryKeyTypeQuestion() {
    const answer = await new select_1.default('what primary key type would you like to use?', [
        'integer',
        'uuid',
    ]).run();
    options.useUuids = answer === 'uuid';
}
async function clientQuestion() {
    if (options.apiOnly)
        return;
    const answer = await new select_1.default('which front end client would you like to use?', [
        'react',
        'vue',
        'nuxt',
        'none (api only)',
    ]).run();
    if (answer === 'none (api only)') {
        options.apiOnly = true;
    }
    else {
        options.client = answer;
    }
}
async function gatherUserInput() {
    await redisQuestion();
    await wsQuestion();
    await clientQuestion();
    await primaryKeyTypeQuestion();
    return options;
}
exports.default = gatherUserInput;
//# sourceMappingURL=gatherUserInput.js.map