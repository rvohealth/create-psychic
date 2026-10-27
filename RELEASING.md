# Releasing

`@rvoh/create-psychic` is published to npm automatically by GitHub Actions using
[OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers/). No npm
token is stored anywhere, and every release is published with a signed
[provenance attestation](https://docs.npmjs.com/generating-provenance-statements/).

## One-time setup (per package, performed by an npm owner)

Automated releases do not work until a maintainer registers this repository as a
trusted publisher on npm:

1. Sign in to npmjs.com as an owner of `@rvoh/create-psychic`.
2. Open the package page → **Settings** → **Trusted Publishers**.
3. Add a **GitHub Actions** publisher:
   - Organization or user: `rvohealth`
   - Repository: `create-psychic`
   - Workflow filename: `release.yml`
   - Environment name: _(leave blank)_
4. Recommended hardening: under **Settings → Publishing access**, select
   **Require two-factor authentication and disallow tokens**. With trusted
   publishing in place, no automation token is needed.

## Cutting a release

1. Open a PR that bumps `version` in `package.json` and adds a `CHANGELOG.md`
   entry, then merge it to `main`.
2. On GitHub, go to **Releases → Draft a new release**.
3. Create a new tag named `vX.Y.Z` that exactly matches the `package.json`
   version (the workflow fails the publish if they differ). Target `main`.
4. Write the release notes and click **Publish release**.
5. The **Release** workflow builds the package and publishes it to npm with
   provenance. Confirm the new version appears on npm with a provenance badge.

## Notes

- The workflow runs on `release: published`, so a _draft_ release does not
  publish anything until you click **Publish release**.
- Never give the release workflow a real npm token as `NODE_AUTH_TOKEN`. npm
  tries OIDC trusted publishing first, but if that exchange fails it publishes
  with the token in `NODE_AUTH_TOKEN` instead, without a provenance attestation.
  The workflow leaves `NODE_AUTH_TOKEN` at the placeholder `actions/setup-node`
  sets, which is not a valid token, so a failed exchange fails the release.
- Publishing still runs the package's `prepack`/`build`, so a broken build
  blocks the release.
- The workflow runs `pnpm/action-setup` pinned to a full commit SHA, with that
  commit's release tag in a trailing comment (`# v6.0.10`). To move to a newer
  release, run `git ls-remote --tags https://github.com/pnpm/action-setup.git`,
  take the commit SHA, which is on that release's `refs/tags/vX.Y.Z^{}` line
  (the line without `^{}` names the annotated tag object, not the commit), and
  update both the SHA and the comment.
