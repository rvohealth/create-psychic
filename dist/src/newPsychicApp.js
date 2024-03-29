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
const fs = __importStar(require("fs"));
const c = __importStar(require("colorette"));
const copyRecursive_1 = __importDefault(require("./copyRecursive"));
const envBuilder_1 = __importDefault(require("./envBuilder"));
const sspawn_1 = __importDefault(require("./sspawn"));
const logo_1 = __importDefault(require("./logo"));
const log_1 = __importDefault(require("./log"));
const sleep_1 = __importDefault(require("./sleep"));
const gatherUserInput_1 = __importDefault(require("./gatherUserInput"));
const packagejsonBuilder_1 = __importDefault(require("./packagejsonBuilder"));
const viteConfBuilder_1 = __importDefault(require("./viteConfBuilder"));
const eslintConfBuilder_1 = __importDefault(require("./eslintConfBuilder"));
const appConfigBuilder_1 = __importDefault(require("./appConfigBuilder"));
const dreamYamlBuilder_1 = __importDefault(require("./dreamYamlBuilder"));
async function newPsychiclApp(appName) {
    const userOptions = await (0, gatherUserInput_1.default)();
    log_1.default.clear();
    log_1.default.write((0, logo_1.default)() + '\n\n', { cache: true });
    log_1.default.write(c.green(`Installing psychic framework to ./${appName}`), { cache: true });
    log_1.default.write(c.green(`Step 1. writing boilerplate to ${appName}...`));
    let projectPath;
    let rootPath = `./${appName}`;
    if (userOptions.apiOnly) {
        projectPath = `./${appName}`;
        (0, copyRecursive_1.default)(__dirname + '/../boilerplate/api', `./${appName}`);
    }
    else {
        projectPath = `./${appName}/api`;
        fs.mkdirSync(`./${appName}`);
        (0, copyRecursive_1.default)(__dirname + '/../boilerplate/api', projectPath);
    }
    log_1.default.restoreCache();
    log_1.default.write(c.green(`Step 1. write boilerplate to ${appName}: Done!`), { cache: true });
    log_1.default.write(c.green(`Step 2. building default config files...`));
    fs.writeFileSync(`${projectPath}/.env`, envBuilder_1.default.build({ appName, env: 'development' }));
    fs.writeFileSync(`${projectPath}/.env.test`, envBuilder_1.default.build({ appName, env: 'test' }));
    fs.writeFileSync(projectPath + '/package.json', await packagejsonBuilder_1.default.buildAPI(userOptions));
    fs.writeFileSync(`${projectPath}/src/conf/app.ts`, await appConfigBuilder_1.default.build({ appName, userOptions }));
    fs.writeFileSync(projectPath + '/.dream.yml', await dreamYamlBuilder_1.default.build(userOptions));
    log_1.default.restoreCache();
    log_1.default.write(c.green(`Step 2. build default config files: Done!`), { cache: true });
    log_1.default.write(c.green(`Step 3. Installing psychic dependencies...`));
    await (0, sspawn_1.default)(`cd ${projectPath} && yarn install`);
    // sleeping here because yarn has a delayed print that we need to clean up
    await (0, sleep_1.default)(1000);
    log_1.default.restoreCache();
    log_1.default.write(c.green(`Step 3. Install psychic dependencies: Done!`), { cache: true });
    log_1.default.write(c.green(`Step 4. Initializing git repository...`));
    await (0, sspawn_1.default)(`cd ./${appName} && git init`);
    log_1.default.restoreCache();
    log_1.default.write(c.green(`Step 4. Initialize git repository: Done!`), { cache: true });
    log_1.default.write(c.green(`Step 5. Building project...`));
    // don't sync yet, since we need to run migrations first
    // await sspawn(`yarn --cwd=${projectPath} dream sync:existing`)
    const errors = [];
    if (!userOptions.apiOnly) {
        switch (userOptions.client) {
            case 'react':
                await (0, sspawn_1.default)(`cd ${rootPath} && yarn create vite client --template react-ts && cd client`);
                fs.mkdirSync(`./${appName}/client/src/config`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/api', `${projectPath}/../client/src/api`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/config/routes.ts', `${projectPath}/../client/src/config/routes.ts`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/node-version', `${projectPath}/../client/.node-version`);
                fs.writeFileSync(projectPath + '/../client/vite.config.ts', viteConfBuilder_1.default.build(userOptions));
                fs.writeFileSync(projectPath + '/../client/.eslintrc.cjs', eslintConfBuilder_1.default.buildForViteReact());
                break;
            case 'vue':
                await (0, sspawn_1.default)(`cd ${rootPath} && yarn create vite client --template vue-ts`);
                fs.mkdirSync(`./${appName}/client/src/config`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/api', `${projectPath}/../client/src/api`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/config/routes.ts', `${projectPath}/../client/src/config/routes.ts`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/node-version', `${projectPath}/../client/.node-version`);
                fs.writeFileSync(projectPath + '/../client/vite.config.ts', viteConfBuilder_1.default.build(userOptions));
                break;
            case 'nuxt':
                await (0, sspawn_1.default)(`cd ${rootPath} && yarn create nuxt-app client`);
                fs.mkdirSync(`./${appName}/client/config`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/api', `${projectPath}/../client/src/api`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/config/routes.ts', `${projectPath}/../client/config/routes.ts`);
                (0, copyRecursive_1.default)(__dirname + '/../boilerplate/client/node-version', `${projectPath}/../client/.node-version`);
                break;
        }
        await (0, sspawn_1.default)(`cd ${projectPath}/../client && yarn install --ignore-engines`);
        try {
            await (0, sspawn_1.default)(`cd ${projectPath}/../client && yarn add axios --ignore-engines`);
        }
        catch (err) {
            errors.push(`
          ATTENTION:
            we attempted to install axios for you in your client folder,
            but it failed. The error we received was:

        `);
            console.error(err);
        }
    }
    await (0, sspawn_1.default)(`cd ./${appName} && git add --all && git commit -m 'psychic init'`);
    log_1.default.restoreCache();
    log_1.default.write(c.green(`Step 5. Build project: Done!`), { cache: true });
    const helloMessage = `
${c.green(c.bold(c.italic(`Welcome to Psychic! What fortunes await your futures?\ncd into ${c.magentaBright(appName)} to find out!`)))}

${c.magenta(`to create a database,`)}
  ${c.magenta(`$ NODE_ENV=development yarn psy db:create`)}
  ${c.magenta(`$ NODE_ENV=test yarn psy db:create`)}

${c.magentaBright(`to migrate a database,`)}
  ${c.magentaBright(`$ NODE_ENV=development yarn psy db:migrate`)}
  ${c.magentaBright(`$ NODE_ENV=test yarn psy db:migrate`)}

${c.redBright(`to rollback a database,`)}
  ${c.redBright(`$ NODE_ENV=development yarn psy db:rollback`)}
  ${c.redBright(`$ NODE_ENV=test yarn psy db:rollback --step=1`)}

${c.blueBright(`to drop a database,`)}
  ${c.blueBright(`$ NODE_ENV=development yarn psy db:drop`)}
  ${c.blueBright(`$ NODE_ENV=test yarn psy db:drop`)}

${c.green(`to create a resource (model, migration, serializer, and controller)`)}
  ${c.green(`$ yarn psy g:resource api/v1/users user organization:belongs_to favorites:enum:favorite_foods:Chalupas,Other`)}

  # NOTE: doing it this way, you will still need to
  # plug the routes manually in your api/src/app/conf/routes.ts file

${c.greenBright(`to create a model`)}
  ${c.greenBright(`$ yarn psy g:model user organization:belongs_to likes_chalupas:boolean some_id:uuid`)}

${c.yellow(`to create a migration`)}
  ${c.yellow(`$ yarn psy g:migration create-users`)}

${c.yellowBright(`to start a dev server at http://localhost:7777,`)}
  ${c.yellowBright(`$ yarn psy dev`)}

${c.magentaBright(`to run unit tests,`)}
  ${c.magentaBright(`$ yarn psy uspec`)}

${c.magentaBright(`to run feature tests,`)}
  ${c.magentaBright(`$ yarn psy fspec`)}

# NOTE: before you get started, be sure to visit your ${c.magenta('.env')} and ${c.magenta('.env.test')}
# files and make sure they have database credentials set correctly.
# you can see conf/dream.ts to see how those credentials are used.
    `;
    console.log(helloMessage);
    errors.forEach(err => {
        console.log(err);
    });
}
exports.default = newPsychiclApp;
//# sourceMappingURL=newPsychicApp.js.map