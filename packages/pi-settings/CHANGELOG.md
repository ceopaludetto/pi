# @ceo.paludetto/pi-settings

## 0.1.0

### Minor Changes

- [#11](https://github.com/ceopaludetto/pi/pull/11) [`0651b4b`](https://github.com/ceopaludetto/pi/commit/0651b4b887cc1b3378142b4ed64e90420fc5ee3a) - Add `@ceo.paludetto/pi-settings`, a standard-schema backed settings loader for pi plugins. Plugin identifiers map to `~/.pi/agent/settings/<plugin>/settings.json` and every failure is returned as a typed `better-result` `Result`.

### Patch Changes

- [#11](https://github.com/ceopaludetto/pi/pull/11) [`0651b4b`](https://github.com/ceopaludetto/pi/commit/0651b4b887cc1b3378142b4ed64e90420fc5ee3a) - Reorganize internal source layout: errors now live in `configuration/errors.ts` with a barrel `configuration/index.ts`, path helpers move to `utilities/paths.ts` with a `utilities/index.ts` barrel, and the settings accessor lives directly in `src/index.ts`. Missing-file reads now recover through `better-result` instead of a native `try/catch`. The public API is unchanged.

- [#11](https://github.com/ceopaludetto/pi/pull/11) [`0651b4b`](https://github.com/ceopaludetto/pi/commit/0651b4b887cc1b3378142b4ed64e90420fc5ee3a) - Upgrade `better-result` to 3.0.1 and migrate `TaggedError` declarations to the v3 class-heritage syntax.
