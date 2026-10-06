import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Reads a static boilerplate file (copied verbatim into generated apps).
function readBoilerplateFile(...segments: string[]): string {
  return readFileSync(join(process.cwd(), 'boilerplate', 'api', ...segments), 'utf8')
}

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
        return { errorName: block![1]!, body: block![2]! }
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

      // Dream's DecryptionError can carry the start of the token in its `cause`, and the logger
      // util.inspects non-string arguments, so the warning must not pass the caught error.
      it('logs one warning with fixed text: never the token, its contents, or the caught error', () => {
        const { body } = catchBlock()
        const logCalls = body.match(/PsychicApp\.log\w*\(/g) ?? []
        expect(logCalls).toEqual(['PsychicApp.logWithLevel('])
        // 'warn' plus one plain string literal: no interpolation and no further arguments
        expect(body).toMatch(/PsychicApp\.logWithLevel\(\s*'warn',\s*'[^'$`\n]+',?\s*\)/)
      })

      // A second parse would fail with a SyntaxError whose message carries the decrypted contents.
      it('does not JSON.parse the opened credential (Encrypt.decrypt already returns the parsed value)', () => {
        expect(source()).not.toContain('JSON.parse(')
      })

      it(`reads the ${helper.idKey} key that ${helper.minter} in spec/unit/helpers/authentication.ts mints`, () => {
        const text = source()
        expect(text).toContain(`payload?.${helper.idKey}`)
        if (helper.idKey !== 'userId') expect(text).not.toMatch(/\.userId\b/)

        const minter = functionBody(readBoilerplateFile('spec', 'unit', 'helpers', 'authentication.ts'), helper.minter)
        expect(minter).toMatch(new RegExp(`Encrypt\\.encrypt\\(\\s*\\{ ${helper.idKey}: `))
      })
    })
  })

  it('spec/unit/helpers/authentication.ts mints token payloads as objects, not JSON strings', () => {
    expect(readBoilerplateFile('spec', 'unit', 'helpers', 'authentication.ts')).not.toContain('JSON.stringify')
  })
})
