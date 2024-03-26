import sspawn from './sspawn.js';
export default function yarncmd(program, commandString, description, aliasString) {
    program
        .command(commandString)
        .description(description)
        .action(async () => {
        const nodeEnvString = process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
            ? `NODE_ENV=${process.env.NODE_ENV} `
            : '';
        const cmd = `${nodeEnvString}yarn ${aliasString || commandString}`;
        if (process.env.DEBUG === '1')
            console.log(`[DEBUG]: the following yarn command is being aliased by psychic cli: ${cmd}`);
        await sspawn(cmd);
    });
}
//# sourceMappingURL=yarncmd.js.map