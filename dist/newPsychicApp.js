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
const fs = __importStar(require("fs"));
const c = __importStar(require("colorette"));
const confBuilder_1 = __importDefault(require("./confBuilder"));
const copyRecursive_1 = __importDefault(require("./copyRecursive"));
const envBuilder_1 = __importDefault(require("./envBuilder"));
const sspawn_1 = __importDefault(require("./sspawn"));
const logo_1 = __importDefault(require("./logo"));
const log_1 = __importDefault(require("./log"));
const sleep_1 = __importDefault(require("./sleep"));
function newPsychiclApp(appName, { api = false, ws = false, redis = false, uuids = false, }) {
    return __awaiter(this, void 0, void 0, function* () {
        log_1.default.clear();
        log_1.default.write((0, logo_1.default)() + '\n\n', { cache: true });
        log_1.default.write(c.magentaBright(`Installing psychic framework to ./${appName}`), { cache: true });
        log_1.default.write(c.blue(`Step 1. writing boilerplate to ${appName}...`));
        let projectPath;
        let rootPath = `./${appName}`;
        if (api) {
            projectPath = `./${appName}`;
            (0, copyRecursive_1.default)(__dirname + '/../boilerplate/api', `./${appName}`);
        }
        else {
            projectPath = `./${appName}/api`;
            (0, copyRecursive_1.default)(__dirname + '/../boilerplate', `./${appName}`);
        }
        log_1.default.restoreCache();
        log_1.default.write(c.blue(`Step 1. write boilerplate to ${appName}: Done!`), { cache: true });
        log_1.default.write(c.blueBright(`Step 2. building default config files...`));
        fs.writeFileSync(`${projectPath}/.env`, envBuilder_1.default.build({ appName, env: 'development' }));
        fs.writeFileSync(`${projectPath}/.env.test`, envBuilder_1.default.build({ appName, env: 'test' }));
        fs.writeFileSync(projectPath + '/src/conf/app.yml', confBuilder_1.default.buildAll({
            api,
            ws,
            redis,
            uuids,
        }));
        log_1.default.restoreCache();
        log_1.default.write(c.blueBright(`Step 2. build default config files: Done!`), { cache: true });
        log_1.default.write(c.cyan(`Step 3. Installing psychic dependencies...`));
        yield (0, sspawn_1.default)(`cd ${projectPath} && yarn install`);
        // sleeping here because yarn has a delayed print that we need to clean up
        yield (0, sleep_1.default)(1000);
        log_1.default.restoreCache();
        log_1.default.write(c.cyan(`Step 3. Install psychic dependencies: Done!`), { cache: true });
        log_1.default.write(c.cyanBright(`Step 4. Initializing git repository...`));
        yield (0, sspawn_1.default)(`cd ./${appName} && git init`);
        yield (0, sspawn_1.default)(`cd ./${appName} && git add --all && git commit -m 'psychic init'`);
        log_1.default.restoreCache();
        log_1.default.write(c.cyanBright(`Step 4. Initialize git repository: Done!`), { cache: true });
        log_1.default.write(c.greenBright(`Step 5. Building project...`));
        yield (0, sspawn_1.default)(`yarn --cwd=${projectPath} dream sync:existing`);
        if (!api) {
            yield (0, sspawn_1.default)(`yarn --cwd=${rootPath}/client install`);
        }
        log_1.default.restoreCache();
        log_1.default.write(c.greenBright(`Step 5. Build project: Done!`), { cache: true });
        const helloMessage = `
${c.greenBright(c.bold(c.italic(`Welcome to Psychic! What fortunes await your futures?\ncd into ${c.magentaBright(appName)} to find out!`)))}

${c.magenta(`to create a database,`)}
  $ psy db:create
  $ NODE_ENV=test psy db:create

${c.magentaBright(`to migrate a database,`)}
  $ psy db:migrate
  $ NODE_ENV=test psy db:migrate

${c.redBright(`to rollback a database,`)}
  $ psy db:rollback
  $ NODE_ENV=test psy db:rollback

${c.blueBright(`to drop a database,`)}
  $ psy db:drop
  $ NODE_ENV=test psy db:drop

${c.green(`to create a resource (model, migration, serializer, and controller)`)}
  $ psy g:resource user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

  # NOTE: doing it this way, you will still need to
  # plug the routes manually in your conf/routes.ts file

${c.greenBright(`to create a model`)}
  $ psy g:model user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

${c.yellow(`to create a migration`)}
  $ psy g:migration create-user-profiles

${c.yellowBright(`to start a dev server at localhost:7777,`)}
  $ psy dev

${c.magentaBright(`to run unit tests,`)}
  $ psy uspec

${c.magentaBright(`to run feature tests,`)}
  $ psy fspec

${c.magentaBright(`to run unit tests, and then if they pass, run feature tests,`)}
  $ psy spec

# NOTE: before you get started, be sure to visit your ${c.magenta('.env')} and ${c.magenta('.env.test')}
# files and make sure they have database credentials set correctly.
# you can see conf/dream.ts to see how those credentials are used.
    `;
        console.log(helloMessage);
    });
}
exports.default = newPsychiclApp;
//# sourceMappingURL=newPsychicApp.js.map