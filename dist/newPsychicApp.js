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
const confBuilder_1 = __importDefault(require("./confBuilder"));
const copyRecursive_1 = __importDefault(require("./copyRecursive"));
const envBuilder_1 = __importDefault(require("./envBuilder"));
const sspawn_1 = __importDefault(require("./sspawn"));
const logo_1 = __importDefault(require("./logo"));
function newHowlApp(appName, { api = false, ws = false, redis = false, uuids = false, }) {
    return __awaiter(this, void 0, void 0, function* () {
        let projectPath;
        let rootPath = `./${appName}`;
        const hiddenFiles = ['sequelizerc'];
        if (api) {
            projectPath = `./${appName}`;
            (0, copyRecursive_1.default)(__dirname + '/../boilerplate/api', `./${appName}`);
            hiddenFiles.forEach(file => {
                fs.cpSync(`./${appName}/${file}`, `./${appName}/.${file}`);
                fs.unlinkSync(`./${appName}/${file}`);
            });
        }
        else {
            projectPath = `./${appName}/api`;
            (0, copyRecursive_1.default)(__dirname + '/../boilerplate', `./${appName}`);
            hiddenFiles.forEach(file => {
                fs.cpSync(`./${appName}/api/${file}`, `./${appName}/api/.${file}`);
                fs.unlinkSync(`./${appName}/api/${file}`);
            });
        }
        fs.writeFileSync(`${projectPath}/.env`, envBuilder_1.default.build({ appName, env: 'development' }));
        fs.writeFileSync(`${projectPath}/.env.test`, envBuilder_1.default.build({ appName, env: 'test' }));
        console.log('building default configs');
        fs.writeFileSync(projectPath + '/src/conf/app.yml', confBuilder_1.default.buildAll({
            api,
            ws,
            redis,
            uuids,
        }));
        console.log('installing yarn dependencies...');
        yield (0, sspawn_1.default)(`cd ${projectPath} && yarn install`);
        console.log('initializing git repository...');
        yield (0, sspawn_1.default)(`cd ./${appName} && git init`);
        yield (0, sspawn_1.default)(`cd ./${appName} && git add --all && git commit -m 'psychic init'`);
        console.log('building project...');
        yield (0, sspawn_1.default)(`yarn --cwd=${projectPath} dream sync:existing`);
        yield (0, sspawn_1.default)(`yarn --cwd=${projectPath} sync`);
        if (!api) {
            console.log('building client dependencies...');
            yield (0, sspawn_1.default)(`yarn --cwd=${rootPath}/client install`);
        }
        const helloMessage = `
    finished! cd into ${appName} to get started

    to create a database,
      $ psy db:create
      $ NODE_ENV=test psy db:create

    to migrate a database,
      $ psy db:migrate
      $ NODE_ENV=test psy db:migrate

    to rollback a database
      $ psy db:rollback
      $ NODE_ENV=test psy db:rollback

    to drop a database
      $ psy db:drop
      $ NODE_ENV=test psy db:drop

    to create a resource (model, migration, serializer, and controller)
      $ psy g:resource user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

      # NOTE: doing it this way, you will still need to
      # plug the routes manually in your conf/routes.ts file

    to create a model
      $ psy g:model user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

    to create a migration
      $ psy g:migration create-user-profiles

    to start a dev server at localhost:7777,
      $ psy dev

    to run unit tests,
      $ psy uspec

    to run feature tests,
      $ psy fspec

    to run unit tests, and then if they pass, run feature tests,
      $ psy spec

    # NOTE: before you get started, be sure to visit your .env and .env.test
    # files and make sure they have database credentials set correctly.
    # you can see conf/db.js to see how those credentials are used.
`;
        console.log((0, logo_1.default)());
        console.log(helloMessage);
    });
}
exports.default = newHowlApp;
//# sourceMappingURL=newPsychicApp.js.map