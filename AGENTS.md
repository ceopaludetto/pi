# AGENTS.md

## Coding Guidelines

- Prefer composability over inheritance.
- Prefer the functional paradigm over any other.
- Always use better-result instead of `try`/`catch` blocks.
- Do not write unnecessary comments. Do not add a comment when the code is self-explanatory; only comment to explain non-obvious intent or rationale (the "why", not the "what"). This also applies to single-line TSDoc comments (e.g. `/** ... */`) that merely restate a self-explanatory name — those are useless, omit them.
- Always write TSDocs for public functions in a package, but only when they add real information (parameters, return semantics, examples, caveats); skip trivial restatements.
- Never abbreviate identifiers or names. Always prefer the full word: `configuration` over `config`, `application` over `app`, `directory` over `dir`, `repository` over `repo`, `properties` over `props`, and so on.
- Always write tests.
- Tests must mirror the folder structure of the main code. For example, `src/a/b.ts` has a test at `test/a/b.test.ts`, and `src/a/b/c/d/a.ts` becomes `test/a/b/c/d/a.test.ts`.
- Always add a changeset for user-facing changes.

## Tooling

- This repository uses [Vite+](https://viteplus.dev) (`vp`) as its unified toolchain for building (`vp pack`), testing (`vp test`), and running tasks (`vp run`). There is no more tsdown, turbo, or rstest.
- Build and test configuration lives in each package's `vite.config.ts` (`pack` and `test` blocks). Do not add `tsdown.config.ts`, `rstest.config.ts`, or `vitest.config.ts`.
- Tests use Vitest through Vite+. Import test helpers from `vite-plus/test` instead of `@rstest/core` or `vitest`.
- `vp` is provided by mise. Always run commands through mise, e.g. `mise exec -- vp check`, `mise exec -- vp run -r build`, `mise exec -- vp run -r test`.
- Prefer `mise exec -- vp check` for the validation loop (format, lint, and type checks).
