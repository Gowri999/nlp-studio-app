// Backend NLP API service (with mock fallback)
const API_BASE = "https://nlp-studio-backend.onrender.com";
// Flips to true when any backend call fails — UI shows a "Demo Mode" banner.
export let DEMO_MODE = false;
const listeners = new Set<(v: boolean) => void>();
export function onDemoModeChange(cb: (v: boolean) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function setDemo(v: boolean) {
  if (DEMO_MODE === v) return;
  DEMO_MODE = v;
  listeners.forEach((l) => l(v));
}

// Kept for backwards-compatibility with existing UI; no-op now.
export function setUserHFToken(_token: string) {}

export class HFError extends Error {
  code: "loading" | "ratelimit" | "auth" | "network" | "unknown";
  constructor(code: HFError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

export function friendlyError(err: unknown): string {
  if (err instanceof HFError) {
    switch (err.code) {
      case "loading":   return "Model loading, please try again in 30 seconds.";
      case "ratelimit": return "Rate limit reached. Try again later.";
      case "auth":      return "Authentication failed.";
      case "network":   return "Network error. Check your connection and try again.";
      default:          return err.message || "Something went wrong. Please retry.";
    }
  }
  return "Something went wrong. Please retry.";
}

async function callAPI<T = any>(path: string, text: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    throw new HFError("network", "Network error");
  }

  if (res.status === 429) throw new HFError("ratelimit", "Rate limited");
  if (res.status === 401 || res.status === 403) throw new HFError("auth", "Auth failed");

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new HFError("unknown", String(msg));
  }
  // Backend shape: { analysis_type, result }
  return (data && data.result !== undefined ? data.result : data) as T;
}

async function withFallback<T>(fn: () => Promise<T>, mock: () => T): Promise<T> {
  try {
    const r = await fn();
    setDemo(false);
    return r;
  } catch {
    setDemo(true);
    return mock();
  }
}

export type HFLabel = { label: string; score: number };
export type HFZeroShot = { labels: string[]; scores: number[]; sequence: string };
export type HFToken = {
  entity_group?: string;
  entity?: string;
  word: string;
  score: number;
  start: number;
  end: number;
};

// ---- Helpers to coerce backend results into shapes the UI already expects ----
function toLabelArray(raw: any, fallbackLabel = "result"): HFLabel[][] {
  if (!raw) return [[{ label: fallbackLabel, score: 0 }]];
  // Already HF-shaped
  if (Array.isArray(raw) && Array.isArray(raw[0])) return raw as HFLabel[][];
  if (Array.isArray(raw) && raw[0] && typeof raw[0] === "object" && "label" in raw[0]) {
    return [raw as HFLabel[]];
  }
  // { label, score, confidence }
  if (typeof raw === "object" && (raw.label || raw.prediction)) {
    const label = String(raw.label ?? raw.prediction);
    const score = Number(raw.score ?? raw.confidence ?? 0);
    const s = score > 1 ? score / 100 : score;
    const others = Array.isArray(raw.scores)
      ? raw.scores.map((x: any) => ({ label: String(x.label), score: Number(x.score ?? 0) }))
      : [];
    return [[{ label, score: s }, ...others]];
  }
  // { scores: { label: n, ... } } or { emotions: {...} }
  const map = raw.scores ?? raw.emotions ?? raw.probabilities ?? raw;
  if (map && typeof map === "object") {
    const arr: HFLabel[] = Object.entries(map)
      .filter(([, v]) => typeof v === "number")
      .map(([label, v]) => ({ label, score: (v as number) > 1 ? (v as number) / 100 : (v as number) }));
    if (arr.length) return [arr];
  }
  return [[{ label: fallbackLabel, score: 1 }]];
}

function toZeroShot(raw: any, text: string, fallbackLabels: string[]): HFZeroShot {
  if (raw && Array.isArray(raw.labels) && Array.isArray(raw.scores)) {
    return { sequence: text, labels: raw.labels.map(String), scores: raw.scores.map(Number) };
  }
  // { topic: "X", confidence: 0.9, all: { ... } }
  const top = raw?.topic ?? raw?.label ?? raw?.category ?? raw?.prediction;
  const all = raw?.all ?? raw?.scores ?? raw?.probabilities;
  if (all && typeof all === "object") {
    const entries = Object.entries(all)
      .filter(([, v]) => typeof v === "number")
      .map(([k, v]) => [k, (v as number) > 1 ? (v as number) / 100 : (v as number)] as const)
      .sort((a, b) => b[1] - a[1]);
    if (entries.length) {
      return { sequence: text, labels: entries.map((e) => e[0]), scores: entries.map((e) => e[1]) };
    }
  }
  if (top) {
    const conf = Number(raw?.confidence ?? raw?.score ?? 0.9);
    const s = conf > 1 ? conf / 100 : conf;
    const rest = fallbackLabels.filter((l) => l !== top);
    const remain = Math.max(0, 1 - s);
    const each = rest.length ? remain / rest.length : 0;
    return {
      sequence: text,
      labels: [String(top), ...rest],
      scores: [s, ...rest.map(() => each)],
    };
  }
  return { sequence: text, labels: fallbackLabels, scores: fallbackLabels.map((_, i) => Math.max(0.04, 0.8 - i * 0.1)) };
}

function toKeywordTokens(raw: any): HFToken[] {
  const arr: any[] = Array.isArray(raw) ? raw : raw?.keywords ?? raw?.keyphrases ?? raw?.tokens ?? [];
  return arr
    .map((k, i) => {
      if (typeof k === "string") return { word: k, score: Math.max(0.5, 0.95 - i * 0.05), start: 0, end: 0 };
      const word = String(k.word ?? k.keyword ?? k.phrase ?? k.text ?? "");
      const sc = Number(k.score ?? k.confidence ?? k.weight ?? 0.8);
      return { word, score: sc > 1 ? sc / 100 : sc, start: 0, end: 0 };
    })
    .filter((t) => t.word);
}

// ---- Tiny heuristics for mocks ----
const POS = ["love","great","amazing","awesome","excellent","good","happy","best","wonderful","fantastic","like","enjoy"];
const NEG = ["hate","bad","terrible","awful","worst","sad","angry","horrible","disappointing","poor","ugly"];
const SPAMMY = ["free","win","winner","prize","click","limited","offer","cash","money","$","urgent","claim","!!!"];
const ANGER = ["angry","furious","hate","rage","mad"];
const FEAR = ["scared","afraid","fear","terrified","worried"];
const SAD = ["sad","cry","cried","unhappy","depressed","lonely"];
const JOY = ["happy","joy","excited","amazing","love","glad"];
const SURPRISE = ["surprise","surprised","shocked","wow","unexpected"];

function tone(text: string): "pos" | "neg" | "neu" {
  const t = text.toLowerCase();
  const p = POS.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  const n = NEG.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0);
  if (p > n) return "pos";
  if (n > p) return "neg";
  return "neu";
}

// ---- Public API ----
export const analyzeSentiment = (text: string) =>
  withFallback<HFLabel[][]>(
    async () => toLabelArray(await callAPI("/api/analyze/sentiment", text), "POSITIVE"),
    () => {
      const t = tone(text);
      if (t === "pos") return [[{ label: "POSITIVE", score: 0.964 }, { label: "NEGATIVE", score: 0.036 }]];
      if (t === "neg") return [[{ label: "NEGATIVE", score: 0.942 }, { label: "POSITIVE", score: 0.058 }]];
      return [[{ label: "POSITIVE", score: 0.515 }, { label: "NEGATIVE", score: 0.485 }]];
    }
  );

export const analyzeEmotion = (text: string) =>
  withFallback<HFLabel[][]>(
    async () => toLabelArray(await callAPI("/api/analyze/emotion", text), "joy"),
    () => {
      const t = text.toLowerCase();
      const score = (ws: string[]) => ws.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
      const buckets: HFLabel[] = [
        { label: "joy",      score: score(JOY) },
        { label: "anger",    score: score(ANGER) },
        { label: "sadness",  score: score(SAD) },
        { label: "fear",     score: score(FEAR) },
        { label: "surprise", score: score(SURPRISE) },
        { label: "neutral",  score: 0.2 },
      ];
      const top = [...buckets].sort((a, b) => b.score - a.score)[0];
      const dominant = top.score > 0 ? top.label : "neutral";
      const base: Record<string, number> = {
        joy: 0.08, anger: 0.06, sadness: 0.07, fear: 0.05, surprise: 0.09, neutral: 0.15,
      };
      base[dominant] = dominant === "joy" ? 0.923 : dominant === "anger" ? 0.889 : 0.86;
      return [Object.entries(base).map(([label, score]) => ({ label, score }))];
    }
  );

export const analyzeSpam = (text: string) =>
  withFallback<HFLabel[][]>(
    async () => {
      const raw = await callAPI<any>("/api/analyze/spam", text);
      // Normalize {is_spam, confidence} → label array
      if (raw && typeof raw === "object" && "is_spam" in raw) {
        const conf = Number(raw.confidence ?? 0.9);
        const s = conf > 1 ? conf / 100 : conf;
        const spamLabel = raw.is_spam ? "LABEL_1" : "LABEL_0";
        const otherLabel = raw.is_spam ? "LABEL_0" : "LABEL_1";
        return [[{ label: spamLabel, score: s }, { label: otherLabel, score: 1 - s }]];
      }
      return toLabelArray(raw, "LABEL_0");
    },
    () => {
      const t = text.toLowerCase();
      const hits = SPAMMY.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
      const isSpam = hits >= 2;
      if (isSpam) return [[{ label: "LABEL_1", score: 0.987 }, { label: "LABEL_0", score: 0.013 }]];
      return [[{ label: "LABEL_0", score: 0.991 }, { label: "LABEL_1", score: 0.009 }]];
    }
  );

export const analyzeLanguage = (text: string) =>
  withFallback<HFLabel[][]>(
    async () => {
      const raw = await callAPI<any>("/api/analyze/language", text);
      // Backend may return { language: "en", confidence: 0.97 }
      if (raw && typeof raw === "object" && (raw.language || raw.lang)) {
        const code = String(raw.language ?? raw.lang).toLowerCase().slice(0, 2);
        const conf = Number(raw.confidence ?? raw.score ?? 0.95);
        const s = conf > 1 ? conf / 100 : conf;
        return [[{ label: code, score: s }]];
      }
      return toLabelArray(raw, "en");
    },
    () => {
      const t = text.toLowerCase();
      const guess =
        /[áéíóúñ¿¡]/.test(t) ? "es" :
        /[àâçéèêëîïôûùüœ]/.test(t) ? "fr" :
        /[äöüß]/.test(t) ? "de" :
        /[\u3040-\u30ff]/.test(t) ? "ja" :
        /[\u4e00-\u9fff]/.test(t) ? "zh" :
        /[\u0400-\u04ff]/.test(t) ? "ru" :
        "en";
      const others = ["en","es","fr","de","it","pt"].filter((l) => l !== guess).slice(0, 4);
      return [[
        { label: guess, score: 0.973 },
        ...others.map((l, i) => ({ label: l, score: 0.02 - i * 0.004 })),
      ]];
    }
  );

export const analyzeTopic = (text: string, labels: string[]) =>
  withFallback<HFZeroShot>(
    async () => toZeroShot(await callAPI("/api/analyze/topic", text), text, labels),
    () => {
      const t = text.toLowerCase();
      const kw: Record<string, string[]> = {
        Technology: ["ai","model","data","software","tech","computer","app","code","algorithm","startup"],
        Sports:     ["game","team","player","score","match","league","coach","season"],
        Politics:   ["government","election","policy","president","vote","party","senate"],
        Business:   ["market","revenue","company","stock","earnings","customer","sales","quarter"],
        Health:     ["health","doctor","patient","disease","medical","hospital","virus"],
        Entertainment: ["movie","film","music","song","actor","show","series"],
        Science:    ["research","study","experiment","scientist","theory","physics","biology"],
        Education:  ["student","school","teacher","class","learn","university","course"],
      };
      const scored = labels.map((l) => {
        const words = kw[l] ?? [l.toLowerCase()];
        const hits = words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
        return { label: l, raw: hits + Math.random() * 0.1 };
      }).sort((a, b) => b.raw - a.raw);
      const total = scored.reduce((s, x) => s + x.raw + 0.05, 0);
      const scores = scored.map((x) => Math.max(0.02, (x.raw + 0.05) / total));
      scores[0] = Math.max(scores[0], 0.78);
      return { sequence: text, labels: scored.map((x) => x.label), scores };
    }
  );

// No NER endpoint in backend — use a lightweight local extractor so the
// Named Entity Recognition page keeps working.
export const analyzeEntities = (text: string) =>
  withFallback<HFToken[]>(
    async () => {
      // Try backend in case it adds it later; otherwise fall back.
      const raw = await callAPI<any>("/api/analyze/entities", text);
      if (Array.isArray(raw)) return raw as HFToken[];
      if (raw && Array.isArray(raw.entities)) {
        return raw.entities.map((e: any) => ({
          entity_group: e.type ?? e.entity_group ?? e.label ?? "MISC",
          word: e.word ?? e.text ?? "",
          score: Number(e.score ?? e.confidence ?? 0.9),
          start: e.start ?? 0,
          end: e.end ?? 0,
        }));
      }
      throw new HFError("unknown", "no entities");
    },
    () => {
      const out: HFToken[] = [];
      const re = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const w = m[1];
        const group =
          /(?:Inc|Corp|Ltd|Company|University)/i.test(w) ? "ORG"
          : w.split(" ").length >= 2 ? "PER"
          : "LOC";
        out.push({ entity_group: group, word: w, score: 0.93, start: m.index, end: m.index + w.length });
        if (out.length >= 8) break;
      }
      return out;
    }
  );

export const analyzeKeywords = (text: string) =>
  withFallback<HFToken[]>(
    async () => toKeywordTokens(await callAPI("/api/analyze/keywords", text)),
    () => {
      const stop = new Set("the a an and or but if then to of in on for with at by from is are was were be been being this that those these it its as i you we they he she them his her our your their not no do does did so very just".split(" "));
      const counts = new Map<string, number>();
      text.toLowerCase().replace(/[^a-z0-9\s']/g, " ").split(/\s+/).forEach((w) => {
        if (!w || w.length < 4 || stop.has(w)) return;
        counts.set(w, (counts.get(w) ?? 0) + 1);
      });
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
      const max = top[0]?.[1] || 1;
      return top.map(([w, c], i) => ({
        word: w,
        score: Math.min(0.98, 0.6 + (c / max) * 0.35 - i * 0.02),
        start: 0,
        end: 0,
      }));
    }
  );

const INSIGHT_LABELS = ["informative","persuasive","emotional","analytical","formal","casual","optimistic","critical"];

export const analyzeInsights = (text: string) =>
  withFallback<HFZeroShot>(
    async () => toZeroShot(await callAPI("/api/analyze/insights", text), text, INSIGHT_LABELS),
    () => {
      const t = tone(text);
      const order =
        t === "pos" ? ["optimistic","informative","persuasive","analytical","formal","casual","emotional","critical"] :
        t === "neg" ? ["critical","emotional","analytical","informative","formal","persuasive","casual","optimistic"] :
                      ["informative","analytical","formal","persuasive","casual","optimistic","emotional","critical"];
      const scores = order.map((_, i) => Math.max(0.04, 0.82 - i * 0.1));
      return { sequence: text, labels: order, scores };
    }
  );

// Real-time backend endpoint — returns whatever the backend provides.
export const analyzeRealtime = (text: string) =>
  withFallback<any>(
    () => callAPI("/api/analyze/realtime", text),
    () => ({ latency_ms: 18 + (text.length % 22), throughput: 0.95, stability: 0.97 })
  );

// Combined summary across all analyzers.
export const analyzeSummary = (text: string) =>
  withFallback<any>(
    () => callAPI("/api/analyze/summary", text),
    () => ({ summary: "Demo summary — backend unavailable." })
  );

// ---- Language code → display name ----
const LANG_NAMES: Record<string, string> = {
  ar: "Arabic", bg: "Bulgarian", de: "German", el: "Greek", en: "English",
  es: "Spanish", fr: "French", hi: "Hindi", it: "Italian", ja: "Japanese",
  nl: "Dutch", pl: "Polish", pt: "Portuguese", ru: "Russian", sw: "Swahili",
  th: "Thai", tr: "Turkish", ur: "Urdu", vi: "Vietnamese", zh: "Chinese",
};
export const langName = (code: string) => LANG_NAMES[code] ?? code.toUpperCase();

export function topLabels(res: HFLabel[][] | HFLabel[]): HFLabel[] {
  const arr = Array.isArray(res[0]) ? (res[0] as HFLabel[]) : (res as HFLabel[]);
  return [...arr].sort((a, b) => b.score - a.score);
}
