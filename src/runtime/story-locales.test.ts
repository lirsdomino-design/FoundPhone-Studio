import {describe,it,expect} from 'vitest';
import {compileStory} from '../story-engine/compiler';
import raw from '../../stories/template/story.json';
import {storyLocales,completeTranslations,openingTranslations,translationEntries,translationCoverage,translateStory} from './story-locales';
import {personalizeWork} from './personalize';
import type {StoryLocale} from './story-locales';
const work=compileStory(raw).work;
describe('story localization safety',()=>{
  it('covers the full four-month story in every available locale',()=>{
    for(const locale of Object.keys(storyLocales) as StoryLocale[]){
      const pack=completeTranslations(work,locale);
      expect(translationCoverage(work,pack).missing).toEqual([]);
      expect(translationCoverage(work,pack).invalid).toEqual([]);
      const localized=personalizeWork(work,{name:'Aoi',startDate:'2026-12-30',language:'zh',locale,passcode:''});
      expect(localized.phone.owner).toBe('Aoi');
      expect(localized.data.kakao.find(i=>i.id==='line-1')?.body).not.toContain('{{');
      expect(localized.nodes.map(n=>n.id)).toEqual(work.nodes.map(n=>n.id));
      expect(localized.nodes.map(n=>n.conditions)).toEqual(work.nodes.map(n=>n.conditions));
    }
  });
  it('preserves calendar tokens in every authored opening language',()=>{
    for(const locale of Object.keys(storyLocales) as StoryLocale[]){
      const pack=openingTranslations(work,locale);
      expect(Object.keys(pack).length).toBeGreaterThan(100);
      expect(translationCoverage(work,pack).invalid).toEqual([]);
      expect(translationCoverage(work,pack).ready).toBe(false);
      expect(pack['kakao/line-1/body']).toContain('{{weekdelta:5}}');
    }
  });
  it('does not label an incomplete language as playable',()=>{
    expect(translationCoverage(work,{}).ready).toBe(false);
    expect(()=>translateStory(work,{})).toThrow('incomplete');
  });
  it('preserves IDs, branch conditions, media and the source story',()=>{
    const entries=translationEntries(work);
    const translated=translateStory(work,entries);
    expect(translated).toEqual(work);
    expect(translated).not.toBe(work);
    expect(translationCoverage(work,entries).ready).toBe(true);
  });
  it('requires player and calendar tokens to survive translation',()=>{
    const entries=translationEntries(work);
    const key=Object.keys(entries).find(k=>entries[k].includes('{{'))!;
    expect(key).toBeDefined();
    entries[key]=entries[key].replace(/\{\{[^}]+\}\}/g,'');
    expect(translationCoverage(work,entries).invalid).toContain(key);
  });
});
