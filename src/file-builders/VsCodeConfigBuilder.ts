/**
 * Builds the `.vscode/` editor config for a **Deno**-targeted generated app.
 *
 * Why this is Deno-only: the boilerplate source imports `.js` specifiers that
 * resolve to `.ts` files (so the same source runs through tsc/tsx on Node/Bun —
 * see `DenoJsonBuilder` + sloppy-imports). VS Code's built-in TypeScript language
 * server, reading the app's `nodenext` tsconfig, auto-imports NEW modules with the
 * `.js` extension. For a Deno app we instead want editors to auto-import the `.ts`
 * extension, which is the Deno language server's native behavior (Deno resolves
 * modules by exact specifier, so its LSP completes local files with their real
 * `.ts` path).
 *
 * The lever is therefore "make the Deno LSP authoritative for this project":
 * - `settings.json` sets `deno.enable: true`, which hands TypeScript features
 *   (type-checking, completions, AND auto-import specifiers) to the Deno extension
 *   instead of the built-in TS server. The Deno LSP then auto-imports `.ts`.
 * - `extensions.json` recommends `denoland.vscode-deno`, since `deno.enable` is
 *   inert without the extension installed (and VS Code would silently keep adding
 *   `.js` imports via the built-in TS server).
 *
 * Existing `.js` imports keep working under the Deno LSP because `deno.json`
 * enables `sloppy-imports`; only newly editor-generated imports change to `.ts`.
 *
 * Node and Bun apps deliberately get no `.vscode/` config: their tsc/tsx toolchain
 * emits `.js`, so the built-in TS server's `.js` auto-imports are already correct.
 */
export default class VsCodeConfigBuilder {
  public static buildSettings(): string {
    const settings = {
      'deno.enable': true,
    }

    return JSON.stringify(settings, null, 2) + '\n'
  }

  public static buildExtensions(): string {
    const extensions = {
      recommendations: ['denoland.vscode-deno'],
    }

    return JSON.stringify(extensions, null, 2) + '\n'
  }
}
