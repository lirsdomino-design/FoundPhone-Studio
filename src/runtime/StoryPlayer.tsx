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
  const [wallpaper, setWallpaper] = useState("");
  const [customizing, setCustomizing] = useState(false);
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
    work &&
    profile &&
    ["baekhyun-after-hours", "baekhyun-childhood-phone"].includes(work.id)
      ? personalizeWork(work, profile)
      : work;
  if (
    work &&
    ["baekhyun-after-hours", "baekhyun-childhood-phone"].includes(work.id) &&
    (!profile || customizing)
  )
    return (
      <main className="story-runtime">
        <form
          className="player-onboarding"
          onSubmit={(e) => {
            e.preventDefault();
            const next = {
              name: name.trim(),
              startDate,
              language,
              passcode,
              wallpaper,
            };
            if (!validProfile(next)) return;
            try {
              localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
            } catch {
              setError("无法保存设置，请检查浏览器是否允许本地存储。");
              return;
            }
            setProfile(next);
            setCustomizing(false);
          }}
        >
          <small>백현 · AFTER HOURS</small>
          <h1>那家店还开着吗</h1>
          <p>从一次朋友聚餐重新联系。手机属于你，靠近的速度也由你决定。</p>
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
              disabled={!!profile}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            我的壁纸（可选，只保存在当前浏览器）
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (
                  f.size > 1400000 ||
                  !["image/jpeg", "image/png", "image/webp"].includes(f.type)
                ) {
                  setError("请选择小于1.4MB的JPG、PNG或WebP图片。");
                  return;
                }
                const r = new FileReader();
                r.onload = () => {
                  setWallpaper(String(r.result));
                  setError("");
                };
                r.onerror = () => setError("没有读到图片，请重新选择。");
                r.readAsDataURL(f);
              }}
            />
            {wallpaper && (
              <>
                <img
                  src={wallpaper}
                  alt="壁纸预览"
                  style={{
                    height: 100,
                    width: 70,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
                <button type="button" onClick={() => setWallpaper("")}>
                  恢复默认壁纸
                </button>
              </>
            )}
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
            <input required type="checkbox" defaultChecked={!!profile} />
            我理解所有私人对白、行程和社交互动均为虚构，角色均为成年人。
          </label>
          <p className="player-disclaimer">
            不含付费Bubble记录，不连接现实社交平台。初版主剧情为中文；社交外语帖子提供人工预写译文。进度仅保存在当前浏览器。
          </p>
          {error && <p role="alert">{error}</p>}
          <button type="submit">
            {profile ? "保存设置，继续故事" : "创建我的手机 →"}
          </button>
          {profile && (
            <button type="button" onClick={() => setCustomizing(false)}>
              取消，不更改
            </button>
          )}
        </form>
      </main>
    );
  return (
    <main className="story-runtime">
      {personalized ? (
        <Phone
          work={personalized}
          onSettings={
            profile
              ? () => {
                  setName(profile.name);
                  setStartDate(profile.startDate);
                  setLanguage(profile.language);
                  setPasscode(profile.passcode);
                  setWallpaper(profile.wallpaper || "");
                  setError("");
                  setCustomizing(true);
                }
              : undefined
          }
        />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
