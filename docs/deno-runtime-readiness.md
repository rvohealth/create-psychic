# Deno runtime readiness — recurring check

**Status: Deno is built but NOT offered as a create-psychic runtime option** (it has
never shipped as one). Node and Bun are the offered runtimes. The full Deno plumbing
stays intact — it is simply omitted from `selectablePsychicRuntimes`. This document is the
checklist for deciding when Deno can be offered. Revisit it whenever Deno cuts a release
that mentions bumping SWC or decorator handling — and at minimum on a periodic sweep
(e.g. quarterly).

## Why it's not offered

Deno transpiles `.ts` with SWC, and SWC does **not** invoke `context.addInitializer()`
callbacks for **class field decorators** during construction. That is a TC39 Stage 3
decorators spec violation (SWC issue [#9708](https://github.com/swc-project/swc/issues/9708),
fixed in SWC's source but not yet vendored into any released Deno).

Dream and Psychic depend on this exact mechanism: at boot they construct one instance
of every model so field/accessor decorators' `addInitializer` callbacks fire and stamp
class metadata — has-one/has-many/belongs-to associations, `@Encrypted` column
getters/setters, virtual-attribute registration, etc. Under Deno-native `.ts` those
callbacks never run, so the boot markup silently no-ops. Result: `deno task web:dev`,
`worker:dev`, `ws:dev`, and **all** `deno task psy …` commands (including `psy sync`
and the generators) produce wrong behavior — e.g. `@Encrypted` writes throw a NOT NULL
violation (the setter was never installed) and `psy sync` emits `virtualColumns: []`.

### The trap that hid this (and why our specs were green)

`vitest` transpiles decorators via `@babel/plugin-proposal-decorators` (`version:
'2023-11'`), which **is** spec-compliant. So the generated-app spec suite — and our
own create-psychic integration specs that ran `deno task uspec` — passed, because the
test harness never used Deno's SWC decorator path. **Specs passing is NOT evidence Deno
works.** The only valid signal is running under the native Deno runtime (the gate test
below, or the framework confirmation), never through vitest.

This is also why the same testing did not flag a problem for **Bun**: Bun uses its own
transpiler, which honors the spec (it PASSES the gate). Bun is genuinely fine.

## The gate test (run this to decide)

Save as `decorator-gate.ts` and run with the candidate Deno: `deno run -A decorator-gate.ts`

```ts
/* Stage 3 field-decorator addInitializer gate test. No deps. */
function fieldDeco(_: unknown, ctx: ClassFieldDecoratorContext) {
  ctx.addInitializer(function (this: object) {
    const c = this.constructor as { marked?: string[] }
    c.marked = (c.marked ?? []).concat(String(ctx.name))
  })
}
class Foo {
  @fieldDeco bar = 1
}
new Foo()
const marked = (Foo as unknown as { marked?: string[] }).marked
if (Array.isArray(marked) && marked.length === 1 && marked[0] === 'bar') {
  console.log('PASS: field-decorator addInitializer fired')
} else {
  console.error('FAIL: addInitializer did not fire. marked =', JSON.stringify(marked))
  if (typeof (globalThis as { Deno?: unknown }).Deno !== 'undefined') Deno.exit(1)
}
```

Last verified results (2026-06-12):

| runtime             | gate                          |
| ------------------- | ----------------------------- |
| Deno 2.8.2          | ❌ FAIL                       |
| Deno 2.8.3          | ❌ FAIL (per upstream report) |
| Bun 1.3.11          | ✅ PASS                       |
| Node (tsc-compiled) | ✅ PASS                       |

**Only offer Deno when the gate prints `PASS` on a released Deno.**

## Upstream to watch

- SWC [#9708](https://github.com/swc-project/swc/issues/9708) — the exact bug
  (`addInitializer` of `ClassFieldDecoratorContext` not called during construction).
  Closed/fixed in SWC source; the trigger is **Deno vendoring the patched SWC**.
- Deno [#22253](https://github.com/denoland/deno/issues/22253) — Deno-side tracking
  (`swc`/`upstream` labels).
- Deno `Releases.md` — watch for notes mentioning SWC bump / decorator
  `addInitializer` / `ClassFieldDecoratorContext`.
- TC39 reference: https://github.com/tc39/proposal-decorators

## Offering Deno again (once the gate passes on a released Deno)

1. Re-run the gate test above on the candidate Deno — confirm `PASS`.
2. Add `'deno'` back to `selectablePsychicRuntimes` in `src/helpers/newPsychicApp.ts`.
   That is the only switch: the Deno runtime plumbing (builders, install, run/tsc commands,
   specs) was never removed — it is just not offered.
3. **Framework-level confirmation in a real generated project, run under native Deno
   (NOT vitest):**
   a. `deno task psy g:model --no-serializer User email:citext phone:encrypted`, migrate.
   b. `deno task psy sync` → `src/types/dream.ts` lists `virtualColumns: ['phone']`,
   not `[]`.
   c. `User.create({ email, phone })`, reload, assert `phone` round-trips and the raw
   column is ciphertext. Broken Deno throws a NOT NULL violation; fixed Deno
   round-trips.
4. Only after a–c pass natively should Deno be offered as a runtime again.

## Notes

- Do **not** work around this by running compiled JS instead of `.ts` for dev/sync.
  That masks the bug and isn't how the framework is meant to run on Deno.
- Source: `~/Documents/deno-decorator-blocker.md` (agent investigation, `@rvoh/dream`
  2.12.1).
