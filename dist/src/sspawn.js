import { spawn } from 'child_process';
export default function sspawn(command, opts = {}) {
    return new Promise((accept, reject) => {
        ssspawn(command, opts).on('close', code => {
            if (code !== 0)
                reject(code);
            accept({});
        });
    });
}
export function ssspawn(command, opts = {}) {
    return spawn(command, {
        stdio: 'inherit',
        shell: true,
        ...opts,
    });
}
//# sourceMappingURL=sspawn.js.map