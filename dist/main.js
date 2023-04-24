#!/usr/bin/env node
"use strict";
// nice reference for shell commands:
// https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
// commanderjs docs:
// https://github.com/tj/commander.js#quick-start
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
const commander_1 = require("commander");
const yarncmd_1 = __importDefault(require("./yarncmd"));
const dreamcmd_1 = __importDefault(require("./dreamcmd"));
const newPsychicApp_1 = __importDefault(require("./newPsychicApp"));
const sspawn_1 = __importDefault(require("./sspawn"));
const program = new commander_1.Command();
program
    .command('new')
    .description('create a new psychic app')
    .argument('<name>', 'name of the app you want to create')
    .option('--api', 'specifies apiOnly flag in app, omits client app')
    .option('--ws', 'indicate that you would like to have psychic provide a lean socket.io provider for you')
    .option('--redis', 'indicate that you would like to have psychic provide a lean redis client. This is used for performing background jobs, but can also be exploited for other queue operations.')
    .option('--uuids', 'indicate that you would like to have psychic provide a lean redis client. This is used for performing background jobs, but can also be exploited for other queue operations.')
    .action(newPsychicApp_1.default);
program
    .command('clean')
    .description('create a controller, model, migration, and serializer for a resource')
    .argument('<name>', 'name of the resource')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, sspawn_1.default)('yarn psy clean');
}));
program
    .command('generate:resource')
    .alias('g:resource')
    .description('create a controller, model, migration, and serializer for a resource')
    .argument('<name>', 'name of the resource')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const [_, ...args] = program.args;
    yield (0, sspawn_1.default)(`yarn psy g:resource ${args.join(' ')}`);
}));
program
    .command('generate:controller')
    .alias('g:controller')
    .description('g:controller <name> [...methods] create a new psychic controller')
    .argument('<name>', 'name of the controller')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const [_, ...args] = program.args;
    yield (0, sspawn_1.default)(`yarn psy g:controller ${args.join(' ')}`);
}));
program
    .command('generate:serializer')
    .alias('g:serializer')
    .description('g:serializer <name> [...attributes] create a new psychic serializer')
    .argument('<name>', 'name of the serializer')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const [_, ...args] = program.args;
    yield (0, sspawn_1.default)(`yarn psy g:serializer ${args.join(' ')}`);
}));
program
    .command('generate:model')
    .alias('g:model')
    .description('g:model <name> [...attributes] create a new dream model')
    .argument('<name>', 'name of the model')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const [_, ...args] = program.args;
    yield (0, sspawn_1.default)(`yarn dream g:model ${args.join(' ')}`);
}));
program
    .command('generate:migration')
    .alias('g:migration')
    .description('g:migration <name> create a new dream migration')
    .argument('<name>', 'name of the migration')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const [_, ...args] = program.args;
    yield (0, sspawn_1.default)(`yarn dream g:migration ${args.join(' ')}`);
}));
program
    .command('routes')
    .alias('routes:list')
    .description('lists the routes known by your application')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, sspawn_1.default)(`yarn psy routes`);
}));
(0, dreamcmd_1.default)(program, 'db:create', 'creates the database');
(0, dreamcmd_1.default)(program, 'db:drop', 'drops the database');
(0, dreamcmd_1.default)(program, 'db:migrate', 'runs migrations');
(0, dreamcmd_1.default)(program, 'db:rollback', 'rolls back migrations');
(0, yarncmd_1.default)(program, 'dev', 'starts the local dev server');
(0, yarncmd_1.default)(program, 'db', 'starts the local dev server');
(0, yarncmd_1.default)(program, 'build', 'builds typescript project');
(0, yarncmd_1.default)(program, 'prod', 'launches production server');
(0, yarncmd_1.default)(program, 'g:migration', 'generates a new migration');
(0, yarncmd_1.default)(program, 'spec', 'runs unit and feature specs');
(0, yarncmd_1.default)(program, 'uspec', 'runs unit specs');
(0, yarncmd_1.default)(program, 'fspec', 'runs feature specs');
(0, yarncmd_1.default)(program, 'console', 'starts repl');
(0, yarncmd_1.default)(program, 'c', 'starts repl (alias for console)');
program.parse();
//# sourceMappingURL=main.js.map