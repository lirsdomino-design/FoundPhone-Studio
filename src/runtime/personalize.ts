import { validateWork, type Work } from "../schema";

export type PlayerProfile = {
  name: string;
  startDate: string;
  language: "zh" | "both";
  passcode: string;
  wallpaper?: string;
};
export const PROFILE_KEY = "baekhyun-childhood-profile-v3";
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function validProfile(p: unknown): p is PlayerProfile {
  if (!p || typeof p !== "object") return false;
  const v = p as PlayerProfile;
  return (
    typeof v.name === "string" &&
    !!v.name.trim() &&
    v.name.length <= 24 &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.startDate) &&
    !Number.isNaN(Date.parse(v.startDate + "T12:00:00Z")) &&
    ["zh", "both"].includes(v.language) &&
    typeof v.passcode === "string" &&
    /^(\d{4})?$/.test(v.passcode) &&
    (v.wallpaper === undefined ||
      v.wallpaper === "" ||
      (v.wallpaper.length < 2000000 &&
        /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(
          v.wallpaper,
        )))
  );
}
export function personalizeWork(source: Work, profile: PlayerProfile): Work {
  const dayMs = 86400000;
  const shift = Math.round(
    (Date.parse(profile.startDate + "T12:00:00Z") -
      Date.parse((source.phone.date || "2026-10-26") + "T12:00:00Z")) /
      dayMs,
  );
  const transform = (value: unknown): unknown => {
    if (typeof value === "string")
      return value
        .replace(/\{\{player\}\}/g, () => profile.name)
        .replace(/\b\d{4}-\d{2}-\d{2}\b/g, (date) => {
          const timestamp = Date.parse(date + "T12:00:00Z");
          return Number.isNaN(timestamp)
            ? date
            : new Date(timestamp + shift * dayMs).toISOString().slice(0, 10);
        })
        .replace(/\{\{(weekdelta|daydelta):(-?\d+)\}\}/g, (_, kind, delta) => {
          const d = new Date(
            Date.parse(profile.startDate + "T12:00:00Z") +
              Number(delta) * dayMs,
          );
          return kind === "weekdelta"
            ? "星期" + "日一二三四五六"[d.getUTCDay()]
            : `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
        });
    if (Array.isArray(value)) return value.map(transform);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, v]) => [key, transform(v)]),
      );
    return value;
  };
  const result = validateWork(transform(source));
  result.phone.owner = profile.name;
  result.phone.passcode = profile.passcode;
  if (profile.wallpaper) result.phone.wallpaper = profile.wallpaper;
  for (const items of Object.values(result.data))
    for (const item of items) {
      const translation = item.meta.translationZh;
      if (translation)
        item.body =
          profile.language === "both"
            ? item.body + "\n\n翻译：" + translation
            : translation;
    }
  return result;
}
