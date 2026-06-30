# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versions and releases of the packages in the `packages/*` workspace.

All publishable packages share a single version (fixed mode, see the `fixed` group in `config.json`). When a PR that touches a publishable package is merged, the `release.yml` workflow opens a follow-up "Version Packages" PR. Merging that PR publishes to npm and tags a GitHub release.

## Adding a changeset

When you make a change that should be released, add a changeset from the repository root:

```sh
pnpm changeset
```

This writes a new markdown file under `.changeset/` describing the kind of bump (major / minor / patch) and a changelog entry for each affected package. Commit that file alongside your code change.