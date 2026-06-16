import { spawn } from 'child_process'

export default function sspawn(
  command: string,
  opts: Record<string, unknown> & { onStdout?: (str: string) => void } = {},
) {
  return new Promise((accept, reject) => {
    const proc = ssspawn(command, opts)

    // Capture stderr so a failing child's actual error (npm ERESOLVE, tsc errors,
    // a failing generated-app spec, etc.) is surfaced instead of swallowed — the
    // bare "process exited with code N" is undebuggable on its own.
    let stderrTail = ''
    proc.stderr?.on('data', chunk => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const txt = (chunk?.toString() as string) ?? ''
      stderrTail = (stderrTail + txt).slice(-8000)
      if (process.env.NODE_ENV !== 'test' || process.env.DEBUG === '1') {
        const trimmed = txt.trim()
        if (trimmed) console.error(trimmed)
      }
    })

    proc.on('close', code => {
      if (code !== 0) {
        const detail = stderrTail.trim() ? `\n--- stderr (tail) ---\n${stderrTail.trim()}` : ''
        reject(new Error(`process exited with code ${code} running: ${command}${detail}`))
        return
      }
      accept({})
    })
  })
}

export function ssspawn(
  command: string,
  opts: Record<string, unknown> & { onStdout?: (str: string) => void } = {},
) {
  const proc = spawn(command, {
    // even though github security scans want to remove this,
    // it is necessary to allow the cli util to run as the current
    // user. This is only done to provision a new psychic application,
    // so it is safe from unknown execution contexts.
    shell: true,

    ...opts,
  })

  // NOTE: adding this stdout spy so that
  // when this cli utility runs node commands,
  // it can properly hijack the stdout from the command
  proc.stdout.on('data', chunk => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const txt = (chunk?.toString() as string)?.trim()
    if (typeof txt !== 'string' || !txt) return

    if (process.env.NODE_ENV !== 'test' || process.env.DEBUG === '1') {
      if (opts?.onStdout) {
        opts?.onStdout?.(txt)
      } else {
        console.log(txt)
      }
    }
  })

  proc.stdout.on('error', err => {
    console.log('sspawn error!')
    console.error(err)
  })

  proc.on('error', err => {
    console.log('sspawn error!')
    console.error(err)
  })

  return proc
}
