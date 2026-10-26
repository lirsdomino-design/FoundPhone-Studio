import {describe,it,expect} from 'vitest';
import raw from '../../stories/template/story.json';
import {compileStory} from '../story-engine/compiler';
import {initialRuntime} from '../schema';
import {advance,choose,dispatch} from '../engine';
const w=compileStory(raw).work;
describe('paced phone conversation',()=>{
  it('delivers messages in order and withholds choices until the queue is empty',()=>{
    const initial=initialRuntime(w);initial.variables.pacedDelivery=true;
    const opening=dispatch(w,initial,'start');
    expect(opening.deliveryQueue?.length).toBeGreaterThan(1);
    expect(opening.choices).toHaveLength(0);
    const first=advance(w,opening,opening.deliveryQueue![0].due);
    expect(first.unlocked.length).toBe(opening.unlocked.length+1);
    expect(first.choices).toHaveLength(0);
    const ready=advance(w,JSON.parse(JSON.stringify(first)),30000);
    expect(ready.deliveryQueue).toHaveLength(0);
    expect(ready.choices.length).toBeGreaterThan(0);
    const reply=choose(w,ready,ready.choices[0].target);
    expect(reply.deliveryQueue?.length).toBeGreaterThan(0);
    expect(reply.choices).toHaveLength(0);
    expect(advance(w,reply,30000).choices.length).toBeGreaterThan(0);
  });
});
