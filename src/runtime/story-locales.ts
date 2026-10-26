import type { Work } from "../schema";
import openingBatch from "../../stories/childhood/locales/opening-batch.json";
import weekOneBatch from "../../stories/childhood/locales/week-one-batch.json";
import novemberOpeningBatch from "../../stories/childhood/locales/november-opening-batch.json";
import jaComplete from "../../stories/childhood/locales/ja-complete.json";
import koComplete from "../../stories/childhood/locales/ko-complete.json";
import * as OpenCC from "opencc-js/cn2t";

export const storyLocales = {
  ja: "日本語",
  ko: "한국어",
  "zh-Hant-TW": "繁體中文 台灣",
  "yue-Hant-HK-MO": "繁體粵語 香港及澳門",
} as const;
export type StoryLocale = keyof typeof storyLocales;
export type StoryTranslations = Record<string, string>;
const toTaiwan = OpenCC.Converter({ from: "cn", to: "twp" });
const toHongKong = OpenCC.Converter({ from: "cn", to: "hk" });
const cantonese = (text: string) =>
  toHongKong(text)
    .replace(/沒有/g, "冇")
    .replace(/不用/g, "唔使")
    .replace(/不是/g, "唔係")
    .replace(/不能/g, "唔可以")
    .replace(/不要/g, "唔好")
    .replace(/不知道/g, "唔知")
    .replace(/不想/g, "唔想")
    .replace(/不會/g, "唔會")
    .replace(/不一定/g, "未必")
    .replace(/不方便/g, "唔方便")
    .replace(/今天/g, "今日")
    .replace(/明天/g, "聽日")
    .replace(/昨天/g, "琴日")
    .replace(/現在/g, "依家")
    .replace(/剛才/g, "頭先")
    .replace(/什麼/g, "乜嘢")
    .replace(/怎麼/g, "點樣")
    .replace(/哪裡/g, "邊度")
    .replace(/這個/g, "呢個")
    .replace(/那個/g, "嗰個")
    .replace(/這次/g, "今次")
    .replace(/那次/g, "嗰次")
    .replace(/這樣/g, "咁樣")
    .replace(/那樣/g, "嗰樣")
    .replace(/這幾天/g, "呢幾日")
    .replace(/一起/g, "一齊")
    .replace(/一點/g, "少少")
    .replace(/一些/g, "一啲")
    .replace(/東西/g, "嘢")
    .replace(/吃飯/g, "食飯")
    .replace(/吃/g, "食")
    .replace(/喝/g, "飲")
    .replace(/照片/g, "相片")
    .replace(/告訴/g, "話畀")
    .replace(/給你/g, "畀你")
    .replace(/給我/g, "畀我")
    .replace(/我們/g, "我哋")
    .replace(/你們/g, "你哋")
    .replace(/他們/g, "佢哋")
    .replace(/自己/g, "自己")
    .replace(/知道/g, "知")
    .replace(/覺得/g, "覺得")
    .replace(/還是/g, "定係")
    .replace(/還沒/g, "仲未")
    .replace(/已經/g, "已經")
    .replace(/可以嗎/g, "得唔得")
    .replace(/好嗎/g, "好唔好")
    .replace(/想說/g, "想講")
    .replace(/說清楚/g, "講清楚")
    .replace(/聊天/g, "傾偈")
    .replace(/晚安/g, "早唞");

export function sourceTranslator(locale: StoryLocale) {
  const column = Object.keys(storyLocales).indexOf(locale) + 1;
  const authored = new Map(
    [
      ...openingBatch.rows,
      ...weekOneBatch.rows,
      ...novemberOpeningBatch.rows,
    ].map((row) => [row[0], row[column]]),
  );
  const full: Record<string, string> =
    locale === "ja" ? jaComplete : locale === "ko" ? koComplete : {};
  return (source: string): string =>
    authored.get(source) ??
    full[source] ??
    (locale === "zh-Hant-TW"
      ? toTaiwan(source)
      : locale === "yue-Hant-HK-MO"
        ? cantonese(source)
        : source);
}

const allSourceTexts = [
  ...new Set([
    ...openingBatch.rows.map((row) => row[0]),
    ...weekOneBatch.rows.map((row) => row[0]),
    ...novemberOpeningBatch.rows.map((row) => row[0]),
    ...Object.keys(jaComplete),
    ...Object.keys(koComplete),
  ]),
];
const storyAliases = (() => {
  const aliases = new Map<string, string>();
  for (const source of allSourceTexts) {
    aliases.set(source, source);
    for (const locale of Object.keys(storyLocales) as StoryLocale[])
      aliases.set(sourceTranslator(locale)(source), source);
  }
  return aliases;
})();
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const storyPatterns = allSourceTexts.flatMap((source) => {
  if (!source.includes("{{")) return [];
  return [
    source,
    ...(Object.keys(storyLocales) as StoryLocale[]).map((locale) =>
      sourceTranslator(locale)(source),
    ),
  ].map((template) => ({
    source,
    pattern: new RegExp(
      "^" +
        template
          .split(/\{\{[^}]+\}\}/g)
          .map(escapeRegExp)
          .join("(.+?)") +
        "$",
    ),
  }));
});

export function canonicalStoryText(value: string) {
  return (
    storyAliases.get(value) ??
    storyPatterns.find((entry) => entry.pattern.test(value))?.source ??
    value
  );
}

// Saved reply labels are display text rather than IDs. Resolve a label from any
// previously selected language back to its source before showing it again.
export function localizeStoredStoryText(
  value: string,
  locale: StoryLocale | "zh",
) {
  const source = canonicalStoryText(value);
  return locale === "zh" ? source : sourceTranslator(locale)(source);
}

export function completeTranslations(
  work: Work,
  locale: StoryLocale,
): StoryTranslations {
  const translate = sourceTranslator(locale);
  return Object.fromEntries(
    Object.entries(translationEntries(work)).map(([key, source]) => [
      key,
      translate(source),
    ]),
  );
}

export function openingTranslations(
  work: Work,
  locale: StoryLocale,
): StoryTranslations {
  const column = Object.keys(storyLocales).indexOf(locale) + 1;
  const dictionary = new Map(
    [
      ...openingBatch.rows,
      ...weekOneBatch.rows,
      ...novemberOpeningBatch.rows,
    ].map((row) => [row[0], row[column]]),
  );
  return Object.fromEntries(
    Object.entries(translationEntries(work))
      .filter(([, source]) => dictionary.has(source))
      .map(([key, source]) => [key, dictionary.get(source)!]),
  );
}

// Translate visible text only. IDs, conditions, saved branch values and media
// must stay unchanged when a player switches language.
export function translationEntries(work: Work): StoryTranslations {
  const entries: StoryTranslations = {};
  for (const [app, items] of Object.entries(work.data))
    for (const item of items) {
      if (item.body) entries[`${app}/${item.id}/body`] = item.body;
      item.comments.forEach(
        (text, i) => (entries[`${app}/${item.id}/comment/${i}`] = text),
      );
    }
  for (const node of work.nodes)
    node.actions.forEach((action, i) => {
      if (
        action.type === "choice" ||
        action.type === "notification" ||
        action.type === "ending"
      )
        entries[`event/${node.id}/${i}`] = String(action.value);
    });
  return entries;
}

export function translationCoverage(
  work: Work,
  translations: StoryTranslations,
) {
  const source = translationEntries(work);
  const missing = Object.keys(source).filter(
    (key) => !translations[key]?.trim(),
  );
  const invalid = Object.keys(source).filter((key) => {
    if (!translations[key]) return false;
    const tokens = (text: string) =>
      text
        .match(/\{\{[^}]+\}\}/g)
        ?.sort()
        .join("|") ?? "";
    return tokens(source[key]) !== tokens(translations[key]);
  });
  return {
    total: Object.keys(source).length,
    missing,
    invalid,
    ready: !missing.length && !invalid.length,
  };
}

export function translateStory(
  work: Work,
  translations: StoryTranslations,
): Work {
  const coverage = translationCoverage(work, translations);
  if (!coverage.ready)
    throw new Error(
      `Translation is incomplete: ${coverage.missing.length} missing, ${coverage.invalid.length} invalid`,
    );
  const result = structuredClone(work);
  for (const [app, items] of Object.entries(result.data))
    for (const item of items) {
      if (item.body) item.body = translations[`${app}/${item.id}/body`];
      item.comments = item.comments.map(
        (_, i) => translations[`${app}/${item.id}/comment/${i}`],
      );
    }
  for (const node of result.nodes)
    node.actions.forEach((action, i) => {
      if (
        action.type === "choice" ||
        action.type === "notification" ||
        action.type === "ending"
      )
        action.value = translations[`event/${node.id}/${i}`];
    });
  return result;
}
