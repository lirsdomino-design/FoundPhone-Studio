import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
import { storyLocales } from "./story-locales";
import { uiText, type UiLocale } from "./ui-locales";
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
  const [locale, setLocale] = useState<UiLocale>(() => profile?.locale ?? "zh");
  const t = (text: string) => uiText(text, locale);
  useEffect(() => {
    document.documentElement.lang =
      locale === "zh"
        ? "zh-CN"
        : locale === "yue-Hant-HK-MO"
          ? "yue-Hant-HK"
          : locale;
    const root = document.getElementById("root");
    if (!root || locale === "zh") return;
    // Display-only translation leaves internal thread IDs and saved variables intact.
    const originals = new WeakMap<
      Text,
      { source: string; translated: string }
    >();
    const originalAttrs = new WeakMap<Element, Record<string, string>>();
    let queued = false;
    const translate = () => {
      queued = false;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node as Text;
        if (text.parentElement?.closest("script,style,input,textarea"))
          continue;
        const old = originals.get(text);
        const source =
          old && text.data === old.translated ? old.source : text.data;
        const translated = uiText(source, locale);
        if (translated !== text.data) {
          originals.set(text, { source, translated });
          text.data = translated;
        }
      }
      for (const element of root.querySelectorAll("*"))
        for (const attr of ["aria-label", "title", "placeholder"]) {
          const current = element.getAttribute(attr);
          if (!current) continue;
          const saved = originalAttrs.get(element) ?? {};
          const source =
            saved[attr] && current === uiText(saved[attr], locale)
              ? saved[attr]
              : current;
          const translated = uiText(source, locale);
          if (translated !== current) {
            saved[attr] = source;
            originalAttrs.set(element, saved);
            element.setAttribute(attr, translated);
          }
        }
    };
    const observer = new MutationObserver(() => {
      if (!queued) {
        queued = true;
        queueMicrotask(translate);
      }
    });
    observer.observe(root, {
      childList: true,
      characterData: true,
      attributes: true,
      subtree: true,
    });
    translate();
    return () => {
      observer.disconnect();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const old = originals.get(n as Text);
        if (old && (n as Text).data === old.translated)
          (n as Text).data = old.source;
      }
    };
  }, [locale]);
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
  useEffect(() => {
    if (work)
      document.title = `${uiText(work.title, locale)} · ${uiText("捡手机", locale)}`;
  }, [work, locale]);
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
              locale,
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
          <label>
            {t("游戏语言")}
            <select
              aria-label="Language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as UiLocale)}
            >
              <option value="zh">简体中文</option>
              {Object.entries(storyLocales).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                  {value === "yue-Hant-HK-MO" ? " · 自動轉換版" : ""}
                </option>
              ))}
            </select>
          </label>
          <h1>{t("那家店还开着吗")}</h1>
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
                if (f.size > 20000000 || !f.type.startsWith("image/")) {
                  setError("请选择小于20MB的图片。");
                  return;
                }
                const r = new FileReader();
                r.onload = () => {
                  const image = new Image();
                  image.onload = () => {
                    const canvas = document.createElement("canvas");
                    const scale = Math.min(
                      1,
                      1080 / Math.max(image.width, image.height),
                    );
                    canvas.width = Math.round(image.width * scale);
                    canvas.height = Math.round(image.height * scale);
                    const context = canvas.getContext("2d");
                    if (!context) {
                      setError("无法处理这张图片，请换一张。");
                      return;
                    }
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    setWallpaper(canvas.toDataURL("image/jpeg", 0.82));
                    setError("图片已准备好，请点“应用壁纸”或底部保存按钮。");
                  };
                  image.onerror = () =>
                    setError("浏览器无法打开该图片，请转成JPG或PNG后再试。");
                  image.src = String(r.result);
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
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...profile, wallpaper };
                      try {
                        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
                        setProfile(next);
                        setCustomizing(false);
                      } catch {
                        setError("壁纸保存失败，请换一张较小的图片。");
                      }
                    }}
                  >
                    应用壁纸并返回手机
                  </button>
                )}
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
                  setLocale(profile.locale ?? "zh");
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
