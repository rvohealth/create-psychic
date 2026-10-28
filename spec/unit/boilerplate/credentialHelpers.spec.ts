import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Reads a static boilerplate file (copied verbatim into generated apps).
function readBoilerplateFile(...segments: string[]): string {
  return readFileSync(join(process.cwd(), 'boilerplate', 'api', ...segments), 'utf8')
}

// A call to Psychic's or Dream's logger, or to the console.
const logCall = /\b(?:PsychicApp|DreamApp)\.log\w*\(|\bconsole\.\w+\(/

// The text of `function <name>(...) { ... }` up to the next top-level closing brace.
function functionBody(source: string, name: string): string {
  const body = source.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`))?.[0]
  if (!body) throw new Error(`function ${name} not found`)
  return body
}

interface CredentialHelper {
  name: string
  path: string[]
  // the key the helper reads from the opened token, and the spec helper that mints that token
  idKey: string
  minter: string
}

const credentialHelpers: CredentialHelper[] = [
  {
    name: 'resolveCurrentUser',
    path: ['src', 'app', 'controllers', 'helpers', 'resolveCurrentUser.ts'],
    idKey: 'userId',
    minter: 'userBearerToken',
  },
  {
    name: 'resolveCurrentAdminUser',
    path: ['src', 'app', 'controllers', 'helpers', 'resolveCurrentAdminUser.ts'],
    idKey: 'adminUserId',
    minter: 'adminUserBearerToken',
  },
  {
    name: 'resolveCurrentInternalUser',
    path: ['src', 'app', 'controllers', 'helpers', 'resolveCurrentInternalUser.ts'],
    idKey: 'internalUserId',
    minter: 'internalUserBearerToken',
  },
  {
    name: 'resolveWebsocketUser',
    path: ['src', 'conf', 'system', 'resolveWebsocketUser.ts'],
    idKey: 'userId',
    minter: 'userBearerToken',
  },
]

// A credential the app cannot open (missing, empty, forged, garbled, or encrypted under another
// key) must make the request signed out instead of letting Dream's decryption error escape as a
// 500 (HTTP) or crash the websocket process. These checks read the template text; the helpers
// throw outside the test environment and are meant to be replaced, so no generated app ships
// specs for them.
describe('boilerplate credential helpers', () => {
  credentialHelpers.forEach(helper => {
    context(helper.path.join('/'), () => {
      const source = () => readBoilerplateFile(...helper.path)
      const catchBlock = () => {
        const block = source().match(/\} catch \((\w+)\) \{([\s\S]*?)\n {2}\}/)
        expect(block).not.toBeNull()
        return { errorName: block![1]!, body: block![2]!, end: block!.index! + block![0].length }
      }

      it('keeps the "replace before production" throw ahead of reading the credential', () => {
        const text = source()
        const nonTestThrow = text.indexOf('if (!AppEnv.isTest)')
        expect(nonTestThrow).toBeGreaterThan(-1)
        expect(text).toContain('only for early development. Replace with a production grade authentication scheme.')
        expect(nonTestThrow).toBeLessThan(text.indexOf('const token ='))
      })

      it('returns null for a missing or empty credential before decrypting', () => {
        const text = source()
        const guard = text.indexOf('if (!token) return null')
        expect(guard).toBeGreaterThan(-1)
        expect(guard).toBeLessThan(text.indexOf('Encrypt.decrypt'))
      })

      it('decrypts inside a try whose catch signs out only on errors Dream raises for a credential it cannot open', () => {
        const text = source()
        expect(text).toContain(`import { DecryptionError, DecryptionRotationError } from '@rvoh/dream/errors'`)
        expect(text.indexOf('try {')).toBeLessThan(text.indexOf('Encrypt.decrypt'))
        expect(text.indexOf('Encrypt.decrypt')).toBeLessThan(text.indexOf('} catch ('))

        const { errorName, body } = catchBlock()
        expect(body).toContain(
          `if (!(${errorName} instanceof DecryptionError || ${errorName} instanceof DecryptionRotationError)) throw ${errorName}`,
        )
        expect(body).toMatch(/\n\s+return null$/)
      })

      // Minting encrypts an object, so a token that opens to anything else (a string, such as one
      // minted the old way with JSON.stringify, a number, null or an array) means the app's minting
      // and this helper disagree. That is a bug in the app's own token code, so it fails loudly
      // instead of signing out, and the error carries fixed text only.
      it('throws a fixed-text error when the opened credential is not an object, before reading the id', () => {
        const text = source()
        const guard = text.match(
          /\n {2}if \(payload === null \|\| typeof payload !== 'object' \|\| Array\.isArray\(payload\)\)\n\s+throw new Error\(\s*'([^'$`\n]+)',?\s*\)\n/,
        )
        expect(guard).not.toBeNull()
        expect(guard![1]).toMatch(new RegExp(`^${helper.name}: `))
        expect(guard!.index).toBeGreaterThan(catchBlock().end)
        expect(guard!.index).toBeLessThan(text.indexOf(`payload.${helper.idKey}`))
      })

      // A token of another realm (a user token on an admin route) opens to an object without this
      // helper's key: signed out.
      it(`signs out a payload without ${helper.idKey}`, () => {
        const text = source()
        expect(text).toContain(
          `const ${helper.idKey} = payload.${helper.idKey}\n  if (!${helper.idKey}) return null`,
        )
      })

      it(`reads the ${helper.idKey} key that ${helper.minter} in spec/unit/helpers/authentication.ts mints`, () => {
        const text = source()
        expect(text).toContain(`payload.${helper.idKey}`)

        const minter = functionBody(readBoilerplateFile('spec', 'unit', 'helpers', 'authentication.ts'), helper.minter)
        expect(minter).toMatch(new RegExp(`Encrypt\\.encrypt\\(\\s*\\{ ${helper.idKey}: `))
      })
    })
  })
})
