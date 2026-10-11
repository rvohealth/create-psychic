import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const controllersDir = join(process.cwd(), 'boilerplate', 'api', 'src', 'app', 'controllers')

// Every controller template the generator copies verbatim into a new app.
function controllerTemplates(): string[] {
  return readdirSync(controllersDir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
    .map(entry => join(entry.parentPath, entry.name))
    .sort()
}

// The template text with every comment removed, so an "uncomment after creating User model"
// line does not count as a use of the import it names.
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !line.trimStart().startsWith('//'))
    .join('\n')
}

// The local names an import statement binds: `import A from`, `import { B, C as D } from`.
function importedNames(importStatement: string): string[] {
  const clause = importStatement.replace(/^import\s+(type\s+)?/, '').replace(/\s+from\s+.*$/, '')
  return clause
    .split(/[{},]/)
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(part => part.replace(/^.*\s+as\s+/, ''))
}

// A generated app's own lint runs @typescript-eslint/no-unused-vars over src/, so a template
// may not keep an import live when the only line that uses it is one of its "uncomment after
// creating the model" lines: that import must be commented out under the same marker and
// come back together with the line that uses it.
describe('boilerplate controller templates', () => {
  controllerTemplates().forEach(file => {
    it(`${relative(process.cwd(), file)} imports nothing it uses only in comments`, () => {
      const code = withoutComments(readFileSync(file, 'utf8'))
      const importStatements = code.match(/^import .*$/gm) ?? []
      const body = code.replace(/^import .*$/gm, '')

      const unused = importStatements
        .flatMap(statement => importedNames(statement))
        .filter(name => !new RegExp(`\\b${name}\\b`).test(body))

      expect(unused).toEqual([])
    })
  })

  it('MaybeAuthedController keeps the resolveCurrentUser import under the marker its only use is under', () => {
    const source = readFileSync(join(controllersDir, 'MaybeAuthedController.ts'), 'utf8')

    expect(source).toContain(
      "/** uncomment after creating User model */\n// import resolveCurrentUser from '@controllers/helpers/resolveCurrentUser.js'\n",
    )
    expect(source).toContain('// this.currentUser = await resolveCurrentUser(this)')
  })
})
