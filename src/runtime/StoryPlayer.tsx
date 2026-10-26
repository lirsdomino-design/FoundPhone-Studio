import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
import {
  PROFILE_KEY,
  localToday,
  personalizeWork,
  validProfile,
  type PlayerProfile,
} from "./personalize";
function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  const [profile, setProfile] = useState<PlayerProfile | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      return validProfile(stored) ? stored : null;
    } catch {
      return null;
    }
  });
  const [name, setName] = useState(""),
    [startDate, setStartDate] = useState(localToday()),
    [language, setLanguage] = useState<"zh" | "both">("both"),
    [passcode, setPasscode] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    fetch(
      new URLSearchParams(location.search).get("preview") === "test"
        ? "./test-work.json"
        : new URLSearchParams(location.search).get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json",
      { signal: abort.signal },
    )
      .then((r) => {
        if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title =
          w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);
  const personalized =
    work && profile && work.id === "baekhyun-after-hours"
      ? personalizeWork(work, profile)
      : work;
  if (work?.id === "baekhyun-after-hours" && !profile)
    return (
      <main className="story-runtime">
        <form
          className="player-onboarding"
          onSubmit={(e) => {
            e.preventDefault();
            const next = { name: name.trim(), startDate, language, passcode };
            if (!validProfile(next)) return;
            try {
              localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
            } catch {
              setError("无法保存设置，请检查浏览器是否允许本地存储。");
              return;
            }
            setProfile(next);
          }}
        >
          <small>백현 · AFTER HOURS</small>
          <h1>工作时间之外</h1>
          <p>从一次工作交接开始。手机属于你，靠近的速度也由你决定。</p>
          <label>
            你的名字
            <input
              required
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
            />
          </label>
          <label>
            故事起始日期
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            社交内容语言
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "zh" | "both")}
            >
              <option value="both">保留原文＋中文翻译</option>
              <option value="zh">中文译文</option>
            </select>
          </label>
          <label>
            手机密码（可留空）
            <input
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </label>
          <label className="player-consent">
            <input required type="checkbox" />
            我理解所有私人对白、行程和社交互动均为虚构，角色均为成年人。
          </label>
          <p className="player-disclaimer">
            不含付费Bubble记录，不连接现实社交平台。初版主剧情为中文；社交外语帖子提供人工预写译文。进度仅保存在当前浏览器。
          </p>
          {error && <p role="alert">{error}</p>}
          <button type="submit">创建我的手机 →</button>
        </form>
      </main>
    );
  return (
    <main className="story-runtime">
      {personalized ? (
        <Phone work={personalized} />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
