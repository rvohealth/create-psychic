# AGENTS.md - AI Agent Instructions

## Committing

Always run `pnpm format` before committing to ensure code is properly formatted.

## Running Specs

### All Specs

```bash
DEBUG=1 pnpm spec
```

### Individual Spec File

```bash
DEBUG=1 pnpm spec <filepath>
```

**Note:** Always use `pnpm spec`, never `npx vitest run` directly.

## Troubleshooting Spec Failures

Spec failures typically show only `Unknown Error: 1` with no details. To diagnose:

1. **Narrow down the failing function.** Add `console.log` markers (e.g. `console.log('AAAA before X')`) before and after each major call in the spec helper chain (`newSpecPsychicApp` → `newPsychicApp` → `installApiDependencies`, etc.). Run the spec and check which markers print — the failure is between the last printed marker and the next missing one.

2. **Log the actual command.** Once you've identified the failing `sspawn` call, add a `console.log` of the command string being passed to `sspawn` so you can see it.

3. **Wrap in try/catch for stack traces.** When a call fails with no useful stack trace, wrap it in `try { await theCall() } catch(e: any) { console.log('FAIL:', e.message, e.stack); throw e }`. This reveals the actual error and file location that vitest otherwise swallows.

4. **Run commands manually.** The spec creates a `howyadoin` directory (each spec run automatically deletes and recreates it, so you never need to delete it manually). `cd` into it (or `howyadoin/api` for non-api-only setups) and run each `&&`-chained command from the `sspawn` call individually. This reveals the actual error output that `sspawn` swallows.

5. **Revert debug logs** after diagnosing.

### Common Failure: npm Peer Dependency Conflicts

npm specs (`spec/unit/newPsychicApp/package-managers/npm/`) commonly fail due to npm's strict peer dependency resolution. For example, if `@rvoh/psychic@alpha` declares a peer dependency on `@rvoh/dream@"^2.4.0"` (stable range), npm will reject `@rvoh/dream@2.4.0-alpha.1` because npm does not consider alpha/pre-release versions as satisfying stable semver ranges. Yarn and pnpm are more lenient here. This is typically resolved by publishing stable versions of the packages or by using `--legacy-peer-deps` in the npm install command.
