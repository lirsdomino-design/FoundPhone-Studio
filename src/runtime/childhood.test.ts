import { describe, it, expect } from "vitest";
import raw from "../../stories/template/story.json";
import { compileStory } from "../story-engine/compiler";
import { choose, dispatch, visible } from "../engine";
import { initialRuntime } from "../schema";
import { personalizeWork } from "./personalize";
const work = compileStory(raw).work;
describe("four-month phone story", () => {
  it("opens with actual group bubbles in the current thread", () => {
    const s = dispatch(work, initialRuntime(work), "start");
    expect(
      work.data.kakao.filter(
        (i) => visible(i, s) && i.title === s.variables.storyThread,
      ).length,
    ).toBe(3);
  });
  it("preserves specifically approved dialogue", () => {
    const text = JSON.stringify(raw);
    for (const quote of [
      "好的，我记住了，那我们就点不需要等很久的菜。",
      "好，那我不反复问了，等你的讯息",
      "我正在看菜单，好饿呀。",
      "可能是上年纪了，容易忘事儿。",
      "没空的话我会做一只乖乖等你的小狗狗！",
    ])
      expect(text).toContain(quote);
    expect(text).not.toMatch(/bubble-share|bubble-memories|1b9a9e2k|志勋/);
  });
  it("moves weekdays and date references together when a player changes the start date", () => {
    const p = personalizeWork(work, {
      name: "夏宁",
      startDate: "2026-12-30",
      language: "both",
      passcode: "",
    });
    const serialized = JSON.stringify(p);
    expect(serialized).not.toContain("{{player}}");
    expect(serialized).not.toMatch(/\{\{(?:week|day)delta:/);
    expect(serialized).toContain("今天星期四，不用谢");
  });
  it("supports sampled alternative choices without a blank current chat or a dead end", () => {
    for (let seed = 1; seed <= 12; seed++) {
      let s = dispatch(work, initialRuntime(work), "start"),
        rng = seed;
      for (let step = 0; step < 600 && !s.endings.length; step++) {
        expect(
          s.choices.length,
          `seed=${seed}, day=${s.variables.dayIndex}`,
        ).toBeGreaterThan(0);
        const a = String(s.variables.storyApp),
          thread = s.variables.storyThread;
        if (a === "kakao")
          expect(
            work.data.kakao.some((i) => visible(i, s) && i.title === thread),
            `empty chat at day ${s.variables.dayIndex}`,
          ).toBe(true);
        for (const c of s.choices)
          expect(c.label).not.toMatch(/［|记录|愿靠近线|交往追加|第二轮/);
        rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
        s = choose(work, s, s.choices[rng % s.choices.length].target);
      }
      expect(s.endings.length, `seed=${seed}`).toBe(1);
    }
  });
});
