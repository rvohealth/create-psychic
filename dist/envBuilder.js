import generateEncryptionKey from './generateEncryptionKey.js';
export default class EnvBuilder {
    static build({ env, appName }) {
        return `\
DB_USER=
DB_NAME=${snakeify(appName)}_${env}
DB_PORT=5432
DB_HOST=localhost
APP_ENCRYPTION_KEY='${generateEncryptionKey()}'
TZ=UTC
`;
    }
}
// TODO: import from shared space. The version within dream contains the most robust variant of snakeify,
// though we don't really use it for anything other than string transformations, so this version has been simplified.
function snakeify(str) {
    return str
        .replace(/(?:^|\.?)([A-Z])/g, (_, y) => '_' + y.toLowerCase())
        .replace(/^_/, '')
        .replace(/\//g, '_')
        .replace(/-/g, '_')
        .toLowerCase();
}
//# sourceMappingURL=envBuilder.js.map