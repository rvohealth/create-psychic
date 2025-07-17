import * as path from 'node:path'

export default function addRootPathForCoreSpecs(p: string): string {
  if (process.env.CREATE_PSYCHIC_CORE_TEST === '1') return path.join('howyadoin', p)
  return p
}
