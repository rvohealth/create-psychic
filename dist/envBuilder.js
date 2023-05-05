"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateEncryptionKey_1 = __importDefault(require("./generateEncryptionKey"));
class EnvBuilder {
    static build({ env, appName }) {
        return `\
DB_USER=
DB_NAME=${snakeify(appName)}_${env}
DB_PORT=5432
DB_HOST=localhost
APP_ENCRYPTION_KEY='${(0, generateEncryptionKey_1.default)()}'
`;
    }
}
exports.default = EnvBuilder;
function snakeify(str) {
    return str
        .replace(/(?:^|\.?)([A-Z])/g, (_, y) => '_' + y.toLowerCase())
        .replace(/^_/, '')
        .toLowerCase();
}
//# sourceMappingURL=envBuilder.js.map