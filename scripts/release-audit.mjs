import fs from 'node:fs';
const story=JSON.parse(fs.readFileSync('stories/template/story.json','utf8'));
const items=[...story.chats.flatMap(c=>c.messages.map(i=>({...i,app:c.app}))),...Object.entries(story.content).flatMap(([app,list])=>list.map(i=>({...i,app})))];
const social=items.filter(i=>i.app==='instagram'&&!i.outgoing&&i.comments?.length);
const batch=JSON.parse(fs.readFileSync('stories/childhood/locales/opening-batch.json','utf8'));
const knownSources=new Set(batch.rows.map(row=>row[0]));
const translatable=[...items.map(i=>i.body),...items.flatMap(i=>i.comments??[]),...story.events.flatMap(n=>n.actions.filter(a=>['choice','notification','ending'].includes(a.type)).map(a=>String(a.value)))].filter(Boolean);
const report={story:story.id,days:123,records:items.length,
  imageGaps:social.filter(i=>!i.media).map(i=>({id:i.id,date:i.time,body:i.body})),
  dialogueStrings:[...new Set(items.map(i=>i.body))].length,
  authoredTranslationBatch:{uniqueSourceRows:batch.rows.length,languages:4,coveredOccurrences:translatable.filter(s=>knownSources.has(s)).length,totalOccurrences:translatable.length,complete:false},
  languageStatus:{ja:'requires authored story translation',ko:'requires authored story translation','zh-Hant-TW':'requires regional review','yue-Hant-HK-MO':'requires Cantonese adaptation'},
  privacyCheck:!/(bubble-share|bubble-memories|1b9a9e2k)/.test(JSON.stringify(story)),
  emptyBodies:items.filter(i=>!i.body?.trim()).map(i=>i.id)};
console.log(JSON.stringify(report,null,2));
