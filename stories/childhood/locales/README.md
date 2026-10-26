# Story translation progress

Target language packs: Japanese, Korean, Traditional Chinese for Taiwan, and written Cantonese in Traditional Chinese for Hong Kong and Macau. Existing approved Simplified Chinese is the authoritative story source.

`opening-batch.json`, `week-one-batch.json` and `november-opening-batch.json` contain 178 reviewed source lines in all four target languages. `ja-complete.json` and `ko-complete.json` extend authored coverage to every visible four-month story message, comment, notification, ending and reply choice. Taiwan Traditional Chinese uses an offline OpenCC conversion with reviewed opening dialogue. The Hong Kong and Macau option combines the reviewed opening dialogue with an offline Cantonese conversion and is labelled as an automatic-conversion edition in the player.

`src/runtime/story-locales.ts` maps source-checked translations to stable message and choice keys. `translationCoverage` rejects missing entries and missing or changed player/calendar placeholders. IDs, conditions, media and saved relationship values are not translated. Message and option translations must be reviewed together, not just the app labels.

Language selection is stored with the player profile and can be changed later from the phone's appearance and personal settings without resetting progress. Date formatting and the principal player/system controls follow the selected language. Translation coverage tests protect placeholders, node IDs and branch conditions; saved reply labels are remapped when the language changes.

No external translation API or paid runtime service is configured. Do not send private Bubble archive content or credentials to translation services.
