import * as path from 'node:path'

export default function pathToArgs(p: string) {
  return p
    .split(path.sep)
    .map(segment => `'${segment}'`)
    .join(', ')
}
