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
    expect(work.data.twitter[0].body).toContain("연습 끝");
    expect(work.data.twitter[0].body).toContain("翻译：");
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
});
