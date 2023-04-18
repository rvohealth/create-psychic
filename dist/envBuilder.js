"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EnvBuilder {
    static build({ env, appName }) {
        const key = Math.random().toString(36).substr(2, 3) +
            '-' +
            Math.random().toString(36).substr(2, 3) +
            '-' +
            Math.random().toString(36).substr(2, 4);
        return `\
DB_USER=
DB_NAME=${snakeify(appName)}_${env}
APP_ENCRYPTION_KEY='${key}'
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