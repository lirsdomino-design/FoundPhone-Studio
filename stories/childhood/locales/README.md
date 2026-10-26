# Story translation progress

Target language packs: Japanese, Korean, Traditional Chinese for Taiwan, and written Cantonese in Traditional Chinese for Hong Kong and Macau. Existing approved Simplified Chinese is the authoritative story source.

`opening-batch.json` contains 83 source lines with four authored translations, covering the opening three days and recurring navigation replies. This is not a complete four-month translation. The runtime language picker must not advertise these packs as complete yet.

`src/runtime/story-locales.ts` maps source-checked translations to stable message and choice keys. `translationCoverage` rejects missing entries and missing or changed player/calendar placeholders. IDs, conditions, media and saved relationship values are not translated. Message and option translations must be reviewed together, not just the app labels.

Next work: translate the remaining days, social comments, notifications, endings and visible app controls; localize date formatting; connect the completed packs to profile settings; verify switching language without resetting saves. Keep source checkpoints and translation coverage tests in sync. Run `node scripts/release-audit.mjs` to see the current counts.

No external translation API or paid runtime service is configured. Do not send private Bubble archive content or credentials to translation services.
