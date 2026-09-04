---
"@ceo.paludetto/pi-settings": patch
"@ceo.paludetto/pi-starship": patch
---

Reorganize internal source layout: errors now live in `configuration/errors.ts` with a barrel `configuration/index.ts`, path helpers move to `utilities/paths.ts` with a `utilities/index.ts` barrel, and the settings accessor lives directly in `src/index.ts`. Missing-file reads now recover through `better-result` instead of a native `try/catch`. The public API is unchanged.
