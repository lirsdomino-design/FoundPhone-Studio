import fs from "node:fs";
import { revised } from "../stories/childhood/revisions.mjs";
const rows = fs
  .readFileSync("stories/childhood/days.txt", "utf8")
  .trim()
  .split("\n")
  .map((line) => {
    const [day, thread, opening, a, ar, b, br] = line.split("|");
    return {
      day,
      thread,
      opening,
      options: [
        { text: a, reply: ar },
        { text: b, reply: br },
      ],
    };
  })
  .map((d) => ({ ...d, ...revised[d.day] }));
const eq = (key, value) => ({ key, op: "eq", value });
const ne = (key, value) => ({ key, op: "neq", value });
const near = [ne("relation", "friend"), eq("fade", false)];
const friend = [eq("relation", "friend"), eq("fade", false)];
const guards = {
  参加: [eq("attend", true)],
  缺席: [eq("attend", false)],
  选图: [eq("selected", true)],
  选左图: [eq("selected", true)],
  选图线: [eq("selected", true)],
  谈主题: [eq("selected", false)],
  谈主题线: [eq("selected", false)],
  提醒线: [eq("reminder", true)],
  无提醒线: [eq("reminder", false)],
  先取消线: [eq("cancelEarly", true)],
  "截止线15:42": [eq("cancelEarly", false)],
  短提示线: [eq("shortReply", true)],
  接续线: [eq("shortReply", false)],
  "18日见面线": [eq("mealDate", 18)],
  "18日赴约线，饭后": [eq("mealDate", 18)],
  "19日赴约线": [eq("mealDate", 19)],
  "19日见面线，饭后": [eq("mealDate", 19)],
  已见: [eq("mealDate", 18)],
  未见: [eq("mealDate", 19)],
  饭后: [eq("mealDate", 19)],
  参观: [eq("exhibit", true)],
  参观线: [eq("exhibit", true)],
  线上: [eq("exhibit", false)],
  线上线: [eq("exhibit", false)],
  暖色线: [eq("warm", true)],
  未指定线: [eq("warm", false)],
  愿靠近: near,
  愿靠近线: near,
  "愿靠近线，见面后": near,
  "愿靠近线，饭后": near,
  靠近: near,
  友情: friend,
  友情线: friend,
  交往: [eq("relation", "dating")],
  交往追加: [eq("relation", "dating")],
  非交往追加: [ne("relation", "dating")],
  慢热: [eq("relation", "slow")],
  慢热安静线: [eq("relation", "slow"), eq("quiet", true)],
  待表达: [eq("relation", "pending")],
  "18日待表达": [eq("relation", "pending")],
  愿听: [eq("relation", "pending")],
  愿听表达: [eq("relation", "pending")],
  表达日14日: [eq("confessing", true)],
  表达日18日: [eq("relation", "pending"), eq("confessDate", 18)],
  表白: [eq("confessing", true)],
  搭车: [eq("ride", true), ...near],
  未搭车: [eq("ride", false), ...near],
  搭车且愿靠近: [eq("ride", true), ...near],
  未搭车且愿靠近: [eq("ride", false), ...near],
  关系: [eq("relationshipTalk", true)],
  其他: [eq("primary", false)],
  未淡出: [eq("fade", false)],
  淡出: [eq("fade", true)],
  淡出候选: [eq("fade", true)],
  笑话待续: [eq("jokePending", true)],
};
// These aliases are represented by booleans refreshed at every day entry.
guards["交往或慢热"] = [eq("relationshipTalk", true)];
guards["友情或待表达"] = [eq("relationshipTalk", false)];
guards["慢热或友情"] = [eq("ordinaryToday", true)];
guards["交往或友情"] = [ne("relation", "pending"), ne("relation", "slow")];
guards["慢热或待定"] = [ne("relation", "dating"), ne("relation", "friend")];
const script = {
  scriptVersion: 1,
  id: "baekhyun-childhood-phone",
  title: "那家店还开着吗｜伯贤的小手机",
  revision: 4,
  description:
    "原创虚构互动故事：成年旧识重新联络，四个月逐日聊天与四种结局。人物不参与制作；不连接真实社交服务，不含付费Bubble记录。",
  phone: {
    owner: "{{player}}",
    date: "2026-10-26",
    time: "18:42",
    wallpaper: "sage",
    passcode: "",
  },
  installedApps: [
    "kakao",
    "instagram",
    "twitter",
    "calendar",
    "photos",
    "phone",
    "spotify",
    "notes",
    "contacts",
    "settings",
    "appstore",
  ].map((id) => ({
    id,
    name: {
      kakao: "KakaoTalk",
      twitter: "X",
      instagram: "Instagram",
      calendar: "日历",
      photos: "相册",
      phone: "电话",
      spotify: "Spotify",
      notes: "备忘录",
      contacts: "通讯录",
      settings: "设置",
      appstore: "App Store",
    }[id],
    installed: true,
    visible: true,
    dock: ["kakao", "phone", "photos", "settings"].includes(id),
    folder: "",
    icon: "",
  })),
  contacts: ["伯贤", "允书", "珉澄", "知安"].map((name, i) => ({
    id: "contact-" + i,
    name,
    bio: name === "伯贤" ? "成年旧识 · 虚构角色" : "共同朋友 · 原创角色",
  })),
  chats: [],
  content: {
    instagram: [],
    twitter: [],
    photos: [],
    calendar: [],
    spotify: [],
    phone: [],
  },
  variables: {
    attend: false,
    selected: false,
    reminder: false,
    meet: false,
    cancelEarly: false,
    shortReply: false,
    mealDate: 18,
    exhibit: false,
    warm: false,
    ride: false,
    relation: "near",
    willing: false,
    confessDate: 14,
    quiet: false,
    quietToday: false,
    fade: false,
    jokePending: false,
    confessing: false,
    relationshipTalk: false,
    ordinaryToday: false,
    primary: false,
    storyApp: "kakao",
    storyThread: "这次别迟到",
    dayIndex: 0,
  },
  events: [],
  tests: [],
};
const chars = ["伯贤", "允书", "珉澄", "知安"];
// Fictional posts already on the phone before the playable timeline begins.
script.content.instagram.push({id:"ig-seed-room",title:"允书",body:"箱子还没拆完，灯也还没装好。{{weekdelta:5}}来吃饭，顺便拯救一下我的客厅 ☕",sender:"允书",time:"2026-10-25 18:40",kind:"post",folder:"正在关注",hidden:false,comments:["珉澄：所以吃饭之前先装灯是吗？"],meta:{handle:"@yoonseo_story",fictional:"true"}});
script.content.twitter.push({id:"x-seed-work",title:"演出记录",body:"明天现场降温，候场区的热饮和备用围巾已经安排上了。辛苦每一位早到的人。",sender:"演出记录",time:"2026-10-25 20:12",kind:"post",folder:"正在关注",hidden:false,comments:["路过的粉丝：希望大家都别着凉。","另一位粉丝：天气预报说明天会很冷，注意保暖。"],meta:{handle:"@stage_note",fictional:"true"}});
const v = (key, value) => ({ type: "variable", key, value });
const unlock = (key) => ({ type: "unlock", key, value: true });
const node = (id, label, extra = {}) => {
  const n = {
    id,
    label,
    type: "action",
    event: "",
    target: "",
    conditions: [],
    actions: [],
    next: [],
    once: true,
    ...extra,
  };
  script.events.push(n);
  return n;
};
const threads = new Map();
let counter = 0;
const dates = rows.map(
  (r) => (r.day.startsWith("0") ? "2027-" : "2026-") + r.day,
);
function calendarize(text, date) {
  const t = Date.parse(date + "T12:00:00Z"),
    base = Date.parse(dates[0] + "T12:00:00Z"),
    weekday = new Date(t).getUTCDay();
  const offset = (delta) => Math.round((t - base) / 86400000) + delta;
  return text
    .replace(/(下周|星期|周)([一二三四五六日天])/g, (_, prefix, day) => {
      const wanted = "日一二三四五六".indexOf(day === "天" ? "日" : day);
      const delta =
        prefix === "下周"
          ? 7 - ((weekday + 6) % 7) + ((wanted + 6) % 7)
          : (wanted - weekday + 7) % 7;
      return "{{weekdelta:" + offset(delta) + "}}";
    })
    .replace(/(二十七|二十二|十九|十八|二十)号/g, (match, num) => {
      const n = { 二十七: 27, 二十二: 22, 十九: 19, 十八: 18, 二十: 20 }[num];
      const target = Date.parse(
        date.slice(0, 8) + String(n).padStart(2, "0") + "T12:00:00Z",
      );
      return "{{daydelta:" + Math.round((target - base) / 86400000) + "}}";
    });
}
function appFor(thread) {
  return /Instagram|动态/.test(thread)
    ? "instagram"
    : /^X/.test(thread)
      ? "twitter"
      : "kakao";
}
function threadFor(thread) {
  return /朋友群/.test(thread)
    ? "这次别迟到"
    : chars.find((c) => thread.startsWith(c)) || "伯贤";
}
function pieces(raw = "") {
  const parts = [];
  for (const line of raw.split(/~(?=［|[^~：\n]{1,40}：)/).filter(Boolean)) {
    // Move a tag before its speaker when an authored sentence puts it after the colon.
    const text = line.replace(/^([^：]+)：(［[^］]+］)/, "$2$1：");
    let tag = "",
      pos = 0;
    for (const m of text.matchAll(/［([^］]+)］/g)) {
      const prefix = text.slice(pos, m.index).trim();
      if (prefix) parts.push({ tag, text: prefix });
      tag = m[1].split("：聚餐")[0];
      pos = m.index + m[0].length;
    }
    const rest = text.slice(pos).trim();
    if (rest) parts.push({ tag, text: rest });
  }
  return parts.filter(
    (p) =>
      !p.tag ||
      guards[p.tag] ||
      !/^记录|显示|返回|只|不|需|创建|保留|当|按|中性|开局|所有|第二|依/.test(
        p.tag,
      ),
  );
}
function groupItems(raw, ctx) {
  const groups = new Map();
  for (const { tag, text } of pieces(raw)) {
    if (tag && !guards[tag] && text.indexOf("：") < 0) continue;
    if (/正在输入短暂|他没有正面作答/.test(text)) continue; // not delivered as spoken messages
    const condition = guards[tag] || [];
    const key = JSON.stringify(condition);
    if (!groups.has(key)) groups.set(key, { conditions: condition, ids: [] });
    const m = text.match(/^([^：\n]+)：([\s\S]*)$/);
    if (!m) continue;
    let [, who, body] = m;
    who = who.replace(/虚构动态$/, "");
    if (!body.trim()) continue;
    const outgoing = who === "你";
    const senderId = outgoing
      ? "owner"
      : "contact-" + Math.max(0, chars.indexOf(who));
    const id = "line-" + ++counter;
    const translation = body.match(/^([\s\S]*?)(?:\n| )中文：([\s\S]+)$/);
    const item = {
      id,
      body: calendarize(translation ? translation[1] : body, ctx.date),
      time: ctx.date + " " + (ctx.time || "20:00"),
      hidden: true,
      sender: outgoing ? "{{player}}" : who,
      outgoing,
      meta: translation ? { translationZh: translation[2] } : {},
    };
    if (ctx.app === "kakao") {
      const title =
        ctx.thread === "这次别迟到"
          ? ctx.thread
          : who === "你"
            ? ctx.thread
            : chars.includes(who)
              ? who
              : ctx.thread;
      if (!threads.has(title)) {
        const chat = {
          id: "chat-" + threads.size,
          app: "kakao",
          title,
          participants: chars.map((_, i) => "contact-" + i),
          messages: [],
        };
        threads.set(title, chat);
        script.chats.push(chat);
      }
      threads.get(title).messages.push({ ...item, senderId });
    } else {
      item.title = outgoing ? "{{player}}" : who;
      item.kind = "post";
      item.meta = {
        ...item.meta,
        handle: who.startsWith("@")
          ? who
          : "@story_" + (chars.indexOf(who) + 1),
        fictional: "true",
      };
      // Native social replies are attached to the active authored post, not emitted as fake new posts.
      if (ctx.socialParent) {
        ctx.socialParent.comments.push(`${item.sender}：${body}`);
        continue;
      }
      item.comments = [];
      script.content[ctx.app].push(item);
      if (ctx.isOpening) ctx.socialParent = item;
    }
    groups.get(key).ids.push(id);
  }
  return [...groups.values()].filter((g) => g.ids.length);
}
function deliver(parent, raw, ctx) {
  for (const g of groupItems(raw, ctx)) {
    if (!g.conditions.length) parent.actions.push(...g.ids.map(unlock));
    else {
      const n = node(parent.id + "-lines-" + parent.next.length, "分支消息", {
        conditions: g.conditions,
        actions: g.ids.map(unlock),
      });
      parent.next.push(n.id);
    }
  }
}
const addChoice = (parent, target, text, conditions = []) => {
  if (!conditions.length)
    parent.actions.push({ type: "choice", key: target, value: text });
  else {
    const n = node(parent.id + "-offer-" + parent.next.length, "可用回复", {
      conditions,
      actions: [{ type: "choice", key: target, value: text }],
    });
    parent.next.push(n.id);
  }
};
const nextDay = (dayIndex, parent) =>
  addChoice(parent, "day-" + (dayIndex + 1), "今天先到这里 · 进入下一天");
function stage(dayIndex, key, scene, first = false) {
  const times = {
    "0-main": "18:42",
    "0-bakery": "19:07",
    "0-bakery-memory": "19:08",
    "0-dinner": "19:16",
    "1-main": "12:18",
    "1-recent": "22:08",
    "1-reminder": "22:09",
    "2-main": "08:16",
    "2-call": "21:47",
  };
  const date = dates[dayIndex],
    id = "d" + dayIndex + "-" + key,
    ctx = {
      date,
      time: times[dayIndex + "-" + key] || "20:00",
      app: appFor(scene.thread || rows[dayIndex].thread),
      thread: threadFor(scene.thread || rows[dayIndex].thread),
    };
  const start = node(id, "阅读消息");
  start.actions.push(v("storyApp", ctx.app), v("storyThread", ctx.thread), {
    type: "time",
    key: "",
    value: ctx.time,
  });
  deliver(start, scene.opening, { ...ctx, isOpening: true });
  scene.options.forEach((o, i) => {
    const choiceId = id + "-reply-" + i;
    const n = node(choiceId, o.text.replace(/［[^］]+］/g, ""));
    for (const p of pieces(o.text)) {
      if (p.text) addChoice(start, choiceId, calendarize(p.text, date), guards[p.tag] || []);
    }
    const sendPlayer = !/只浏览|划走|展开|查看|看看|返回|进入|等他回|留在/.test(
      o.text,
    );
    if (sendPlayer) {
      const raw = pieces(o.text)
        .map((p) => (p.tag ? "［" + p.tag + "］" : "") + "你：" + p.text)
        .join("~");
      deliver(n, raw, ctx);
    }
    // Determine response guards using the state before this choice updates relationship variables.
    deliver(n, o.reply || "", ctx);
    const changes = { ...(o.set || {}) };
    const base = rows[dayIndex].day;
    const defaults = {
      "10-29": { attend: i === 0 },
      "11-01": { meet: i === 0 },
      "11-03": { selected: i === 0 },
      "11-07": { cancelEarly: i === 1 },
      "11-09": { shortReply: i === 0 },
      "11-14": { mealDate: i === 0 ? 18 : 19 },
      "12-05": { exhibit: i === 0 },
      "12-15": { warm: i === 0 },
      "12-25": { relation: i === 0 ? "near" : "friend" },
      "01-25": { relation: i === 0 ? "near" : "friend" },
      "02-06": { ride: i === 0 },
    };
    if (key === "main" && !revised[base])
      Object.assign(changes, defaults[base] || {});
    if (base === "02-12" && i === 0) {
      const update = node(choiceId + "-pending", "准备认真聊", {
        conditions: near,
        actions: [v("relation", "pending"), v("willing", true)],
      });
      n.next.push(update.id);
    }
    if (base === "02-13" && i === 1) {
      const u = node(choiceId + "-date", "另约表达日", {
        conditions: [eq("relation", "pending")],
        actions: [v("confessDate", 18)],
      });
      n.next.push(u.id);
    }
    if (Object.keys(changes).length) {
      // Run state changes after conditional response delivery, not before.
      const update = node(choiceId + "-state", "保存已发生的选择", {
        conditions: base === "02-12" && i === 1 ? near : [],
        actions: Object.entries(changes).map(([k, value]) => v(k, value)),
      });
      n.next.push(update.id);
    }
    if (o.next) {
      const child = customStage(dayIndex, o.next);
      if (child) {
        const destination = script.events
          .find((x) => x.id === child)
          ?.actions.find(
            (a) => a.type === "variable" && a.key === "storyThread",
          )?.value;
        if (o.next.startsWith("confession-")) {
          const yes = node(choiceId + "-confession-route", "接续认真谈话", {
            conditions: [eq("confessing", true)],
            next: [child],
          });
          const no = node(choiceId + "-ordinary-route", "结束普通聊天", {
            conditions: [eq("confessing", false)],
          });
          nextDay(dayIndex, no);
          n.next.push(yes.id, no.id);
        } else if (destination && destination !== ctx.thread)
          addChoice(n, child, `${String(destination)}发来新消息 · 打开私聊`);
        else n.next.push(child);
      } else nextDay(dayIndex, n);
    } else nextDay(dayIndex, n);
  });
  return id;
}
const customMemo = new Map();
function customStage(dayIndex, key) {
  const memo = dayIndex + "-" + key;
  if (customMemo.has(memo)) return customMemo.get(memo);
  // Reserve the ordinary stage id before descending into shared continuations.
  customMemo.set(memo, "d" + dayIndex + "-" + key);
  const thread = "伯贤";
  let x;
  if (key === "meeting-after")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "你不用每次都付。",
          reply: "伯贤：好，那我们下次出来见面你付款。",
        },
        {
          text: "最近见得比去年还多。",
          reply:
            "伯贤：去年也没几次，不过是最近见得比较频繁。~伯贤：你觉得烦吗？",
          next: "meeting-feeling",
        },
        {
          text: "没什么，下次再说。",
          reply: "伯贤：行，那下次是什么时候啊？。",
        },
      ],
    };
  if (key === "meeting-feeling")
    x = {
      thread,
      opening: "",
      options: [
        { text: "不烦呀，挺好的。", reply: "伯贤：那就好,呼~^^" },
        { text: "再发三个问号可能会烦。", reply: "伯贤：那我忍住了><" },
        { text: "有时回得慢，别介意。", reply: "伯贤：好，有空再回^^。" },
      ],
    };
  if (key === "bakery")
    x = {
      thread,
      opening: "伯贤：你以前买的那个盐面包，门口有两级台阶那家，还开着吗？",
      options: [
        {
          text: "你竟然还记得门口几级台阶。",
          reply:
            "伯贤：因为你上次因为台阶差点摔倒把咖啡洒我身上。这种一般忘不掉。",
          next: "bakery-memory",
        },
        {
          text: "应该还在，你要买？",
          reply:
            "伯贤：嗯，想起你们就想起来那家面包，是友情的味道啊，要多买几个。",
          next: "dinner",
        },
        {
          text: "我也好久没去了。",
          reply:
            "伯贤：搬走以后，连这种店都不知道去哪找了。~你：我找到地址发你。~伯贤：好，等你有空。",
          next: "dinner",
        },
      ],
    };
  if (key === "bakery-memory")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "你当时明明说没关系。",
          reply: "伯贤：没关系和我记得，又不冲突ㅋㅋ",
          next: "dinner",
        },
        {
          text: "那我找一家平地上的。",
          reply: "伯贤：谢谢，终于考虑到我的衣服了。",
          next: "dinner",
        },
      ],
    };
  if (key === "dinner")
    x = {
      thread,
      opening: "伯贤：找到了！他们周一休息。还好先问了。你吃饭了吗？",
      options: [
        {
          text: "正准备吃。",
          reply: "伯贤：那我也去找点东西，刚才看面包看饿了。",
        },
        {
          text: "吃过了，你呢？",
          reply:
            "伯贤：还没。刚有人问吃什么，我说都行，现在开始后悔，突然很想吃汉堡包。",
        },
        {
          text: "还没，今天有点忙。",
          reply: "伯贤：我还想问你另一家店。等你吃完再问，不是急事。",
        },
      ],
    };
  if (key === "drink")
    x = {
      thread,
      opening: "伯贤：你今天喝什么了？",
      options: [
        {
          text: "咖啡，今天靠它撑着。",
          reply:
            "伯贤：已经喝了吗？还是拿在手里准备靠它撑着ㅋㅋ~你：喝了，但是好像没什么用。~伯贤：那今天是你自己撑下来的，咖啡只是陪你坐了一会儿。晚上别再给它加班了，你也早点休息。",
        },
        {
          text: "茶，慢慢喝了一下午。",
          reply: "伯贤：什么茶呀？",
          next: "tea",
        },
        {
          text: "水，今天很朴素。",
          reply:
            "伯贤：挺好的，很健康。~伯贤：我不会因为没有尝过你喝的饮料，而感觉没有办法去评价你喝的东西ㅋㅋ",
          next: "water",
        },
      ],
    };
  if (key === "tea")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "清茶，没加别的。",
          reply:
            "伯贤：听起来好适合慢慢喝。你是不是喝到最后，又给自己添了一杯热水？~你：被你猜到了。~伯贤：ㅋㅋ 那这一杯陪你待了一下午。",
        },
        {
          text: "水果茶，里面的水果快被我吃完了。",
          reply:
            "伯贤：那现在是不是只剩茶了？你这个顺序也不错，先吃点东西，再慢慢喝。~你：主要是水果一直挡着吸管。~伯贤：原来不是你想吃，是它们先妨碍你的。",
        },
      ],
    };
  if (key === "water")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "评价一杯水也这么认真？",
          reply:
            "伯贤：当然，你都告诉我了，我总得认真说两句吧。今天这杯可以多喝一点。",
        },
        {
          text: "那你也喝点水。",
          reply: "伯贤：好，等一下。~伯贤：喝了，不是只嘴上答应你。",
        },
      ],
    };
  if (key === "joke-ready")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "方便。",
          reply:
            "伯贤：那我讲一个很短的冷笑话。~伯贤：我今天找了半天的笔，最后发现是自己一直拿着。~伯贤：你说是不是很搞笑？~你：那确实很短，可能是上年纪了，容易忘事儿。~伯贤：呀，原来你在这里等我ㅋㅋ 我只是手比脑子早一点找到而已。",
          next: "joke-answer",
        },
        {
          text: "我准备睡了。",
          reply:
            "伯贤：好，那我们明天再聊这个很短的事情，我要到明天再告诉你，晚安。",
          set: { jokePending: true },
        },
      ],
    };
  if (key === "joke-answer")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "好好好，是手比较聪明。",
          reply:
            "伯贤：对，所以以后找东西先让它负责。不过它今天也没提醒我，还是得再教育一下。",
        },
        {
          text: "下次先问问你的手。",
          reply: "伯贤：知道了，下次先问。如果它也不说话，我再来找你。",
        },
      ],
    };
  if (key === "recent")
    x = {
      thread,
      opening: "伯贤：昨天本来想问你最近怎么样，结果聊了半天面包。",
      options: [
        {
          text: "挺好的，就是每天有点重复。",
          reply:
            "伯贤：重复到什么程度？~你：星期几都得看手机，人生太重复了真的很无聊。~伯贤：今天星期二，不用谢。下次想不起来直接问我吧。~你：非常有帮助。~伯贤：明天还要吗？",
          next: "reminder",
        },
        {
          text: "你呢，感觉很忙。",
          reply:
            "伯贤：白天有点，现在没有。我们是不是很久没好好聊过了？~你：现在不就在聊吗？怎么开始忆往昔了。~伯贤：嗯，可能是时间比较晚了吧。",
        },
      ],
    };
  if (key === "reminder")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "包月多少钱？",
          reply: "伯贤：先试用一天，不满意再退。",
          set: { reminder: true },
        },
        {
          text: "不用，我自己会看。",
          reply: "伯贤：好，失业了。",
          set: { reminder: false },
        },
      ],
    };
  if (key === "call")
    x = {
      thread,
      opening: "伯贤：现在方便接一下电话吗？五分钟左右。",
      options: [
        {
          text: "可以。",
          reply:
            "伯贤：听得到吗？~你：怎么了？~伯贤：没怎么，本来想回你，打了两行又删了。~你：你又要问店？~伯贤：不是，你最近都这么晚才有空吗？~伯贤：五分钟失败了。你去忙吧，晚安。",
        },
        {
          text: "不方便电话，打字吧。",
          reply: "伯贤：好吧，你晚上都这么忙吗？怕每次刚好挑到你有事。",
        },
        {
          text: "晚一点可以吗？",
          reply: "伯贤：可以，不过十一点后我可能不方便，碰不上就明天。",
        },
      ],
    };
  if (key === "confession-answer") {
    // Non-confession variants must not become a relationship through a generic daily reply.
    const gate = node("d" + dayIndex + "-confession-gate-" + counter, "接续", {
      actions: [],
    });
    const n = node(gate.id + "-yes", "确认双方意愿", {
      conditions: [eq("confessing", true)],
      actions: [v("relation", "dating")],
    });
    gate.next.push(n.id);
    const child = stage(dayIndex, key, {
      thread,
      opening: "",
      options: [
        {
          text: "［交往］没看错。［其他］好，那先这样。",
          reply:
            "［交往］伯贤：嗯，真的开心。那先约一顿不用赶的。~［其他］伯贤：好，今天不再加题。",
        },
        {
          text: "［交往］那男朋友早点睡。［其他］早点休息。",
          reply:
            "［交往］伯贤：适应得这么快。……再叫一次吧，拜托拜托。~［其他］伯贤：好，你也是。",
        },
      ],
    });
    gate.next.push(child);
    customMemo.set(memo, gate.id);
    return gate.id;
  }
  if (key === "confession-worry")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "［表白］怕以后一直等。［其他］好，晚安。",
          reply:
            "［表白］伯贤：那不能只跟你说不会。定不了时间我会直说，不让你一直留着。~［其他］伯贤：晚安。",
          next: "worry-answer",
        },
        {
          text: "［表白］怕以后不再自在。",
          reply:
            "伯贤：你可以像现在这样跟我讲不喜欢的事。我也得学着听，不是说在一起你就得顺着我。",
          next: "worry-answer",
        },
        {
          text: "［表白］怕公开身份的压力。",
          reply:
            "伯贤：我不想让你的日常被别人拿来猜。但这件事也不能只让我决定，我们一起商量怎么做。",
          next: "worry-answer",
        },
      ],
    };
  if (key === "worry-answer")
    x = {
      thread,
      opening: "",
      options: [
        {
          text: "［表白］我愿意开始。［其他］今天先休息。",
          reply: "［表白］伯贤：好，我也想跟你在一起。~［其他］伯贤：好。",
          next: "confession-answer",
        },
        {
          text: "［表白］我还是想慢一点。",
          reply: "伯贤：可以。还能像现在这样找你吗，还是想安静几天？",
          set: { relation: "slow", willing: false },
        },
      ],
    };
  if (key === "stay-slow") {
    const gate = node("d" + dayIndex + "-slow-gate", "按当天状态接续");
    const u = node(gate.id + "-update", "继续了解", {
      conditions: [eq("confessing", true)],
      actions: [v("relation", "slow"), v("willing", false)],
    });
    gate.next.push(u.id);
    nextDay(dayIndex, gate);
    customMemo.set(memo, gate.id);
    return gate.id;
  }
  return x ? stage(dayIndex, key, x) : null;
}
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  if (r.day === "02-25") continue;
  const entry = node("day-" + i, "进入 " + dates[i], {
    type: i === 0 ? "start" : "action",
    actions: [
      { type: "date", key: "", value: dates[i] },
      { type: "time", key: "", value: i === 0 ? "18:42" : "20:00" },
      v("dayIndex", i),
      v("confessing", false),
      v("quietToday", false),
      v("primary", false),
      v("relationshipTalk", false),
      v("ordinaryToday", false),
    ],
  });
  const nearNode = node("flags-" + i + "-rel", "当天相处状态", {
    conditions: [ne("relation", "friend"), ne("relation", "pending")],
    actions: [v("relationshipTalk", true)],
  });
  entry.next.push(nearNode.id);
  const ordinary = node("flags-" + i + "-ordinary", "普通日常", {
    conditions: [ne("relation", "pending"), ne("relation", "dating")],
    actions: [v("ordinaryToday", true)],
  });
  entry.next.push(ordinary.id);
  if (["02-14", "02-18"].includes(r.day)) {
    const n = node("flags-" + i + "-confess", "表达日", {
      conditions: [
        eq("relation", "pending"),
        eq("confessDate", r.day === "02-14" ? 14 : 18),
        eq("willing", true),
      ],
      actions: [v("confessing", true), v("primary", true)],
    });
    entry.next.push(n.id);
  } else {
    const primaryCond =
      r.day === "02-16"
        ? [ne("relation", "friend"), ne("relation", "pending")]
        : r.day === "02-13"
          ? [eq("relation", "pending")]
          : [eq("relation", "dating")];
    entry.next.push(
      node("flags-" + i + "-primary", "当天主要对话", {
        conditions: primaryCond,
        actions: [v("primary", true)],
      }).id,
    );
  }
  if (r.day === "02-18")
    entry.next.push(
      node("flags-" + i + "-quiet", "兑现安静两天", {
        conditions: [eq("relation", "slow"), eq("quiet", true)],
        actions: [v("quietToday", true)],
      }).id,
    );
  const sid = stage(i, "main", r, true);
  entry.next.push(sid);
  if (r.day === "02-18") {
    script.events.find((n) => n.id === sid).conditions = [
      eq("quietToday", false),
    ];
    const alt = stage(i, "quiet", {
      thread: "Instagram",
      opening: "允书：今天终于好好吃了晚饭，不是站着吃完的那种。",
      options: [{ text: "只浏览。", reply: "" }],
    });
    script.events.find((n) => n.id === alt).conditions = [
      eq("quietToday", true),
    ];
    entry.next.push(alt);
  }
}
// Final explicit choice, not score thresholds. A player cannot obtain dating without mutual confirmation.
const confirm = script.events.find((n) => n.id === "d121-main");
if (confirm) {
  confirm.actions = confirm.actions.filter((a) => a.type !== "choice");
  confirm.next = confirm.next.filter((id) => !id.includes("-offer-"));
  // Remove unreachable generated replies for this day before replacing.
  script.events = script.events.filter(
    (n) =>
      !n.id.startsWith("d121-main-reply-") &&
      !n.id.startsWith("d121-main-offer-"),
  );
  const endingOptions = [
    [
      "dating",
      "继续交往",
      "好，下一次换我先把时间确认好，再来约你。还有，今天也可以正常叫我男朋友，不用只在逗我的时候叫ㅋㅋ",
    ],
    [
      "slow",
      "继续了解",
      "嗯，那就慢一点。我没有把我们每一次聊天都当成在等你最后答应，你也别有这个压力。",
    ],
    [
      "friend",
      "只做朋友",
      "好，那我们按朋友的方式来。刚开始有一点不习惯也没关系，不用故意表现得特别自然。",
    ],
    [
      "fade",
      "暂停联系",
      "好，我知道了，谢谢你认真告诉我。以后在群里碰到也不用躲着，想安静就安静，不用再解释一次。",
    ],
  ];
  for (const [rel, text, reply] of endingOptions) {
    const n = node("final-" + rel, text, {
      actions: [v("finalRelation", rel)],
    });
    deliver(n, "你：" + text + "。~伯贤：" + reply, {
      date: dates[121],
      app: "kakao",
      thread: "伯贤",
    });
    nextDay(121, n);
    addChoice(
      confirm,
      n.id,
      text,
      rel === "dating"
        ? [eq("relation", "dating")]
        : rel === "fade"
          ? [eq("fade", true)]
          : [],
    );
  }
}
const finalDay = node("day-122", "2027-02-25", {
  actions: [
    { type: "date", key: "", value: dates[122] },
    v("dayIndex", 122),
    v("storyApp", "kakao"),
  ],
});
const endings = [
  [
    "dating",
    "下次已经约好",
    "伯贤：下周五我来找你。有空吗，我亲爱的女朋友？没空的话我会做一只乖乖等你的小狗狗！~你：这次不许只买两个面包。~伯贤：知道，你第二天的早饭也算上。",
  ],
  [
    "slow",
    "先不要改备注",
    "伯贤：我没催你。但周六那顿还算数吧？~你：算，不过我请。~伯贤：行，别临时把我最想点的划掉就好。~你：那你先发菜单。~伯贤：好。",
  ],
  [
    "friend",
    "群里还有你的位置",
    "珉澄：最后一批东西有人来拿吗？~允书：终于不是让我找桌子螺丝。~伯贤：有饭吗？~你：有饭我就去。~珉澄：有，四份，不让你们来搬箱子。~伯贤：这次终于只是吃饭。",
  ],
  ["fade", "没有继续置顶", "伯贤：最近还好吗？听允书说你这阵子忙。"],
];
for (const [rel, label, text] of endings) {
  const n = node("end-" + rel, label, {
    conditions: [eq("finalRelation", rel)],
    actions: [v("storyThread", rel === "friend" ? "这次别迟到" : "伯贤")],
  });
  deliver(n, text, {
    date: dates[122],
    app: "kakao",
    thread: rel === "friend" ? "这次别迟到" : "伯贤",
  });
  const done = node("ending-" + rel, label, {
    type: "ending",
    actions: [{ type: "ending", key: "", value: label }],
  });
  if (rel === "fade") {
    const reply = node("end-fade-reply", "还好，你也照顾好自己。");
    deliver(reply, "你：还好，你也照顾好自己。~伯贤：嗯，你也是。", {
      date: dates[122],
      app: "kakao",
      thread: "伯贤",
    });
    reply.next.push(done.id);
    addChoice(n, reply.id, "礼貌回应");
    addChoice(n, done.id, "不回复，留在这一天");
  } else addChoice(n, done.id, "留在这一天 · 查看已发生的聊天");
  finalDay.next.push(n.id);
}
// Authored song cards; no audio, lyrics or paid media.
for (const title of [
  "No Problem",
  "My Love",
  "Take You Home",
  "Love Again",
  "Late Night Calls",
])
  script.content.spotify.push({
    id: "song-" + title.toLowerCase().replaceAll(" ", "-"),
    title,
    body: "BAEKHYUN",
    sender: "伯贤",
    time: "",
    meta: { artist: "BAEKHYUN", playlist: "慢慢听" },
    kind: "text",
  });
function calendar(id, title, date, time, from, conditions = []) {
  script.content.calendar.push({
    id,
    title,
    body: "双方在故事中确认的安排。虚构日程，不是现实艺人行程。",
    time: date + " " + time,
    sender: "{{player}}",
    kind: "event",
    hidden: true,
    meta: { date, startTime: time },
  });
  const p = script.events.find((n) => n.id === from);
  if (!p) throw Error("Missing calendar trigger " + from);
  if (conditions.length) {
    const n = node(id + "-unlock", "确认日历安排", {
      conditions,
      actions: [unlock(id)],
    });
    p.next.push(n.id);
  } else p.actions.push(unlock(id));
}
calendar(
  "cal-housewarming",
  "允书家吃饭",
  "2026-10-31",
  "18:30",
  "d3-main-reply-0",
);
calendar(
  "cal-first-meet",
  "取围巾或买面包，喝点东西",
  "2026-11-01",
  "15:00",
  "d6-main-reply-0",
);
calendar("cal-meal18", "和伯贤吃饭", "2026-11-18", "17:30", "d19-main-reply-0");
calendar("cal-meal19", "和伯贤吃饭", "2026-11-19", "17:30", "d19-main-reply-1");
calendar(
  "cal-january-meet",
  "和伯贤单独吃饭",
  "2027-01-27",
  "18:30",
  "d91-main-reply-0",
);
calendar(
  "cal-expression14",
  "认真聊聊",
  "2027-02-14",
  "20:00",
  "d110-main-reply-0",
  [eq("relation", "pending")],
);
calendar(
  "cal-expression18",
  "另约时间认真聊聊",
  "2027-02-18",
  "20:00",
  "d110-main-reply-1",
  [eq("relation", "pending")],
);
const callNode = script.events.find((n) => n.id === "d2-call-reply-0");
if (callNode) {
  script.content.phone.push({
    id: "call-oct28",
    title: "伯贤",
    body: "听得到吗？\n怎么了？\n没怎么，本来想回你，打了两行又删了。\n不是，你最近都这么晚才有空吗？\n五分钟失败了。你去忙吧，晚安。",
    sender: "伯贤",
    time: "2026-10-28 21:47",
    kind: "call",
    hidden: true,
    meta: {
      direction: "incoming",
      duration: "05:00",
      status: "已接听",
      fictional: "true",
    },
  });
  callNode.actions.push(unlock("call-oct28"));
}
const breadPath = "stories/childhood/assets/salt-bread.jpg",
  drinkPath = "stories/childhood/assets/coffee.jpg";
const mediaFor = (path) =>
  fs.existsSync(path)
    ? "data:image/jpeg;base64," + fs.readFileSync(path).toString("base64")
    : "";
for (const [di, path, sender, body] of [
  [1, breadPath, "伯贤", "是这个吧？"],
  [38, drinkPath, "伯贤", "这盖子一直碰我鼻子。我刚发现是我拿反了。"],
]) {
  const media = mediaFor(path);
  if (!media) continue;
  const id = "photo-" + di;
  const photo = {
    id,
    title: body,
    body: "原创AI剧情道具图，不是真人私照。",
    sender,
    time: dates[di] + " 19:59",
    kind: "image",
    media,
    hidden: true,
  };
  script.content.photos.push(photo);
  const start = script.events.find((n) => n.id === "day-" + di);
  start.actions.push(unlock(id));
  const chat = threads.get("伯贤");
  chat.messages.push({
    ...photo,
    id: id + "-bubble",
    title: "伯贤",
    senderId: "contact-0",
    body,
    meta: { alt: body },
  });
  start.actions.push(unlock(id + "-bubble"));
}
const roomMedia = mediaFor("stories/childhood/assets/living-room.jpg");
if (roomMedia) {
  script.content.instagram.find((x) => x.id === "ig-seed-room").media = roomMedia;
  for (const day of ["11-15", "12-17"]) {
    const di = rows.findIndex((r) => r.day === day);
    const item = script.content.instagram.find(
      (x) =>
        x.id ===
        script.events
          .find((n) => n.id === "d" + di + "-main")
          ?.actions.find((a) => a.type === "unlock")?.key,
    );
    if (item) item.media = roomMedia;
  }
}
// End-to-end engine paths. Each step is an actual visible choice, including day transitions.
const sceneImages = {
  '2026-11-06': 'restaurant-table',
  '2026-11-21': 'print-workspace',
  '2026-11-26': 'print-workspace',
  '2026-12-09': 'dinner',
  '2026-12-12': 'home-shelf',
  '2027-01-02': 'dinner',
  '2027-01-06': 'home-shelf',
  '2027-01-16': 'home-shelf',
  '2027-02-01': 'print-workspace',
  '2027-02-18': 'dinner',
};
for(const [date,asset] of Object.entries(sceneImages)){
  const item=script.content.instagram.find(i=>i.time.startsWith(date));
  const media=mediaFor(`stories/childhood/assets/${asset}.jpg`);
  if(item && media){item.media=media;item.meta={...item.meta,alt:'原创AI虚构场景道具图，不是真人私照。'};}
}
const printPhoto=mediaFor('stories/childhood/assets/print-workspace.jpg');
const printMessage=threads.get('珉澄')?.messages.find(i=>i.time.startsWith('2026-11-03')&&!i.outgoing);
if(printPhoto && printMessage){printMessage.media=printPhoto;printMessage.kind='image';}
for (const [relation, ending] of endings) {
  const choices = [];
  for (let i = 0; i < 122; i++) {
    const day = rows[i].day;
    let option = 0;
    if (day === "10-29" && relation === "slow") option = 1;
    if (day === "12-25" && relation === "friend") option = 1;
    if (day === "01-25" && relation === "friend") option = 1;
    if (day === "02-12" && relation === "slow") option = 1;
    if (day === "02-12" && relation === "friend") option = 2;
    if (day === "02-22" && relation === "fade") option = 2;
    if (day === "02-24") {
      choices.push({ choose: "final-" + relation });
    } else {
      choices.push({ choose: "d" + i + "-main-reply-" + option });
      if (day === "10-26")
        choices.push(
          { choose: "d" + i + "-bakery" },
          { choose: "d" + i + "-bakery-reply-0" },
          { choose: "d" + i + "-bakery-memory-reply-0" },
          { choose: "d" + i + "-dinner-reply-0" },
        );
      if (day === "10-27") {
        choices.push(
          { choose: "d" + i + "-recent-reply-0" },
          { choose: "d" + i + "-reminder-reply-0" },
        );
      }
      if (day === "10-28") choices.push({ choose: "d" + i + "-call-reply-1" });
      if (day === "11-01")
        choices.push({ choose: "d" + i + "-meeting-after-reply-0" });
      if (day === "11-20")
        choices.push(
          { choose: "d" + i + "-drink-reply-2" },
          { choose: "d" + i + "-water-reply-0" },
        );
      if (day === "11-30")
        choices.push(
          { choose: "d" + i + "-joke-ready-reply-0" },
          { choose: "d" + i + "-joke-answer-reply-0" },
        );
      if (day === "02-14" && ["dating", "fade"].includes(relation))
        choices.push({ choose: "d" + i + "-confession-answer-reply-0" });
    }
    choices.push({ choose: "day-" + (i + 1) });
  }
  choices.push({
    choose: relation === "fade" ? "end-fade-reply" : "ending-" + relation,
  });
  script.tests.push({
    name: "四个月完整路径-" + relation,
    steps: choices,
    ending,
  });
}
for (const n of script.events)
  for (const a of n.actions)
    if (a.type === "choice") {
      const target = script.events.find((x) => x.id === a.key);
      if (target) {
        target.event = "choose";
        target.target = target.id;
      }
    }
fs.writeFileSync(
  "stories/template/story.json",
  JSON.stringify(script, null, 2) + "\n",
);
fs.writeFileSync(
  "stories/childhood/INTEGRATION.md",
  `# 剧情集成检查\n\n123个连续日期：2026-10-26 至 2027-02-25。新增修订优先于原日历细稿。\n\n- 玩家姓名统一占位符；旧工作剧情使用不同作品ID，避免覆盖旧存档。\n- 当前聊天显示回复选项，完成当日后显式进入次日，不等待现实时间。\n- 参加/缺席、选图、改期、提醒、搭车、表白延期及四结局分别保存。\n- 原文中“沉默”只作表现，不设为接受恋爱；结局需主动确认。\n- 角色不会从浏览帖子知道玩家做了什么；配角私聊不自动转告。\n- 主剧情中文；社交外语保留对应中文。不声称完成全韩文翻译。\n- 公开人物图片候选：官方Weverse媒体页 https://weverse.io/baekhyun/media 。尚未确认公开转载权限，未下载或植入私聊。无Bubble地址与密令。\n- 两张原创道具图：盐面包、歪杯盖咖啡；图像工具生成，不是真人私照。\n\n生成：node scripts/build-childhood.mjs。运行 story:validate、story:test、build 和单元测试。\n`,
);
console.log(
  JSON.stringify({
    days: rows.length,
    nodes: script.events.length,
    messages: counter,
    reviewedDates: Object.keys(revised).length,
  }),
);
