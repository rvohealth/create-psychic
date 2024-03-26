export default class PackagejsonBuilder {
    static async buildAPI(userOptions) {
        const packagejson = (await import('../boilerplate/api/package.json')).default;
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