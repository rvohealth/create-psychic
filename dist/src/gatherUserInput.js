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
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const prompts_1 = require("@inquirer/prompts");
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
    const answer = await (0, prompts_1.select)({
        message: 'api only?',
        choices: [
            {
                name: 'y',
                value: true,
                // description: 'npm is the most popular package manager',
            },
            {
                name: 'n',
                value: false,
            },
        ],
    });
    options.apiOnly = answer;
}
async function redisQuestion() {
    const answer = await (0, prompts_1.select)({
        message: 'redis?',
        choices: [
            {
                name: 'y',
                value: true,
                // description: 'npm is the most popular package manager',
            },
            {
                name: 'n',
                value: false,
            },
        ],
    });
    options.redis = answer;
}
async function wsQuestion() {
    const answer = await (0, prompts_1.select)({
        message: 'websockets?',
        choices: [
            {
                name: 'y',
                value: true,
                // description: 'npm is the most popular package manager',
            },
            {
                name: 'n',
                value: false,
            },
        ],
    });
    options.ws = answer;
}
async function primaryKeyTypeQuestion() {
    const answer = await (0, prompts_1.select)({
        message: 'primary key type?',
        choices: [
            {
                name: 'integer',
                value: 'integer',
                // description: 'npm is the most popular package manager',
            },
            {
                name: 'uuid',
                value: 'uuid',
            },
        ],
    });
    options.useUuids = answer === 'uuid';
}
async function clientQuestion() {
    if (options.apiOnly)
        return;
    const answer = await (0, prompts_1.select)({
        message: 'which front end client would you like to use?',
        choices: [
            {
                name: 'react',
                value: 'react',
                description: 'use a react app with typescript and redux',
            },
            {
                name: 'vue',
                value: 'vue',
                description: 'use a vue app with typescript',
            },
            {
                name: 'nuxt',
                value: 'nuxt',
                description: 'use a nuxt app with vue and typescript',
            },
        ],
    });
    options.client = answer;
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