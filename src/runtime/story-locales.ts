import type { Work } from '../schema';
import openingBatch from '../../stories/childhood/locales/opening-batch.json';

export const storyLocales = {
  ja: '日本語',
  ko: '한국어',
  'zh-Hant-TW': '繁體中文 台灣',
  'yue-Hant-HK-MO': '繁體粵語 香港及澳門',
} as const;
export type StoryLocale = keyof typeof storyLocales;
export type StoryTranslations = Record<string, string>;

export function openingTranslations(work: Work, locale: StoryLocale): StoryTranslations {
  const column = Object.keys(storyLocales).indexOf(locale) + 1;
  const dictionary = new Map(openingBatch.rows.map(row => [row[0], row[column]]));
  return Object.fromEntries(Object.entries(translationEntries(work))
    .filter(([,source]) => dictionary.has(source))
    .map(([key,source]) => [key,dictionary.get(source)!]));
}

// Translate visible text only. IDs, conditions, saved branch values and media
// must stay unchanged when a player switches language.
export function translationEntries(work: Work): StoryTranslations {
  const entries: StoryTranslations = {};
  for (const [app, items] of Object.entries(work.data))
    for (const item of items) {
      if(item.body) entries[`${app}/${item.id}/body`] = item.body;
      item.comments.forEach((text,i)=>entries[`${app}/${item.id}/comment/${i}`]=text);
    }
  for (const node of work.nodes)
    node.actions.forEach((action,i)=>{
      if(action.type==='choice'||action.type==='notification'||action.type==='ending')
        entries[`event/${node.id}/${i}`]=String(action.value);
    });
  return entries;
}

export function translationCoverage(work: Work, translations: StoryTranslations) {
  const source=translationEntries(work);
  const missing=Object.keys(source).filter(key=>!translations[key]?.trim());
  const invalid=Object.keys(source).filter(key=>{
    if(!translations[key])return false;
    const tokens=(text:string)=>text.match(/\{\{[^}]+\}\}/g)?.sort().join('|')??'';
    return tokens(source[key])!==tokens(translations[key]);
  });
  return {total:Object.keys(source).length,missing,invalid,ready:!missing.length&&!invalid.length};
}

export function translateStory(work: Work, translations: StoryTranslations): Work {
  const coverage=translationCoverage(work,translations);
  if(!coverage.ready)throw new Error(`Translation is incomplete: ${coverage.missing.length} missing, ${coverage.invalid.length} invalid`);
  const result=structuredClone(work);
  for(const [app,items] of Object.entries(result.data))for(const item of items){
    if(item.body)item.body=translations[`${app}/${item.id}/body`];
    item.comments=item.comments.map((_,i)=>translations[`${app}/${item.id}/comment/${i}`]);
  }
  for(const node of result.nodes)node.actions.forEach((action,i)=>{
    if(action.type==='choice'||action.type==='notification'||action.type==='ending')action.value=translations[`event/${node.id}/${i}`];
  });
  return result;
}
