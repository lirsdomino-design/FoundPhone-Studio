import { describe, it, expect } from "vitest";
import { compileStory } from "../story-engine/compiler";
import story from "../../stories/template/story.json";
import { personalizeWork, validProfile } from "./personalize";
describe("player personalization", () => {
  const source = compileStory(story).work;
  it("resolves names throughout authored messages, actions and branches without editing the source", () => {
    const work = personalizeWork(source, {
      name: "Xena <宁>",
      startDate: "2026-12-30",
      language: "both",
      passcode: "1025",
    });
    expect(JSON.stringify(work)).not.toContain("{{player}}");
    expect(JSON.stringify(source)).toContain("{{player}}");
    expect(work.phone.owner).toBe("Xena <宁>");
    expect(work.phone.passcode).toBe("1025");
    expect(work.phone.date).toBe("2026-12-30");
    expect(
      work.nodes.flatMap((n) => n.actions).find((a) => a.type === "date")
        ?.value,
    ).toBe("2026-12-30");
  });
  it("keeps original and authored translation together", () => {
    const work = personalizeWork(source, {
      name: "宁",
      startDate: "2026-10-25",
      language: "both",
      passcode: "",
    });
    const translated = Object.values(work.data)
      .flat()
      .find((i) => i.meta.translationZh);
    expect(translated).toBeDefined();
    expect(translated?.body).toContain("翻译：");
    expect(translated?.body).toContain(translated?.meta.translationZh);
  });
  it("rejects invalid profile values", () => {
    expect(
      validProfile({
        name: "",
        startDate: "bad",
        language: "both",
        passcode: "12",
      }),
    ).toBe(false);
  });
  it('keeps the weekday in a choice consistent with the outgoing message',()=>{
    const work=personalizeWork(source,{name:'宁',startDate:'2026-12-30',language:'both',passcode:''});
    const choice=work.nodes.find(n=>n.id==='d0-main')!.actions.find(a=>a.type==='choice'&&a.key==='d0-main-reply-2');
    expect(choice?.value).toBe('星期一还不能确定，晚一点告诉你。');
    expect(work.data.kakao.find(i=>i.id==='line-30')?.body).toBe(choice?.value);
  });
});
