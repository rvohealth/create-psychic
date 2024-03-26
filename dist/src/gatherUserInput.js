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
const prompts_1 = __importDefault(require("prompts"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const options = {
    apiOnly: false,
    redis: false,
    ws: false,
    useUuids: false,
    client: 'react',
};
async function apiOnlyQuestion() {
    const answer = await (0, prompts_1.default)([
        {
            type: 'multiselect',
            name: 'apiOnly',
            message: 'api only?',
            instructions: false,
            choices: [
                { title: 'y', value: true },
                { title: 'f', value: false },
            ],
        },
    ]);
    options.apiOnly = answer.apiOnly;
}
async function redisQuestion() {
    const answer = await (0, prompts_1.default)([
        {
            type: 'multiselect',
            name: 'redis',
            message: 'redis?',
            instructions: false,
            choices: [
                { title: 'y', value: true },
                { title: 'f', value: false },
            ],
        },
    ]);
    options.redis = answer.redis;
}
async function wsQuestion() {
    const answer = await (0, prompts_1.default)([
        {
            type: 'multiselect',
            name: 'websockets',
            message: 'websockets?',
            instructions: false,
            choices: [
                { title: 'y', value: true },
                { title: 'f', value: false },
            ],
        },
    ]);
    options.ws = answer.websockets;
}
async function primaryKeyTypeQuestion() {
    const answer = await (0, prompts_1.default)([
        {
            type: 'multiselect',
            name: 'primaryKeyType',
            message: 'primary key type?',
            instructions: false,
            choices: [
                { title: 'integer', value: 'integer' },
                { title: 'uuid', value: 'uuid' },
            ],
        },
    ]);
    options.useUuids = answer.primaryKeyType === 'uuid';
}
async function clientQuestion() {
    if (options.apiOnly)
        return;
    const answer = await (0, prompts_1.default)([
        {
            type: 'multiselect',
            name: 'clientFramework',
            message: 'which front end client would you like to use?',
            instructions: false,
            choices: [
                { title: 'redux', value: 'redux' },
                { title: 'vue', value: 'vue' },
                { title: 'nuxt', value: 'nuxt' },
            ],
        },
    ]);
    options.client = answer.clientFramework;
}
async function gatherUserInput() {
    await apiOnlyQuestion();
    await redisQuestion();
    await wsQuestion();
    await clientQuestion();
    await primaryKeyTypeQuestion();
    return options;
}
exports.default = gatherUserInput;
//# sourceMappingURL=gatherUserInput.js.map