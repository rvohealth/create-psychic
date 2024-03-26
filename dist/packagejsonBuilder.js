import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export default class PackagejsonBuilder {
    static async buildAPI(userOptions) {
        const packagejson = require('../boilerplate/api/package.json');
        if (userOptions.apiOnly)
            return JSON.stringify(packagejson, null, 2);
        switch (userOptions.client) {
            case 'react':
                ;
                packagejson.scripts['client'] = `PORT=3000 yarn --cwd=../client dev`;
        }
        return JSON.stringify(packagejson, null, 2);
    }
}
//# sourceMappingURL=packagejsonBuilder.js.map