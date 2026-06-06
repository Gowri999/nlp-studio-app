import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export function pickVoiceForLang(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  if (!lang) return undefined;
  const l = lang.toLowerCase();
  const base = l.split("-")[0];
  return (
    voices.find((v) => v.lang.toLowerCase() === l) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base + "-")) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base))
  );
}

export type SpeechSettings = {
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string | null;
};

const DEFAULTS: SpeechSettings = { rate: 1, pitch: 1, volume: 1, voiceURI: null };
const STORAGE_KEY = "nlp-studio-speech-settings";

type SpeakOptions = {
  lang?: string;
  voiceURI?: string;
  onWord?: (charIndex: number, charLength: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
};

type Ctx = {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  settings: SpeechSettings;
  setSettings: (s: Partial<SpeechSettings>) => void;
  speaking: boolean;
  paused: boolean;
  speakingId: string | null;
  speak: (text: string, id?: string, opts?: SpeakOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const SpeechCtx = createContext<Ctx | null>(null);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<SpeechSettings>(DEFAULTS);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // hydrate
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported("speechSynthesis" in window);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettingsState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  // load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const setSettings = useCallback((s: Partial<SpeechSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...s };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    utterRef.current = null;
    setSpeaking(false);
    setPaused(false);
    setSpeakingId(null);
  }, []);

  const speak = useCallback((text: string, id?: string, opts: SpeakOptions = {}) => {
    if (!text.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = settings.rate;
    u.pitch = settings.pitch;
    u.volume = settings.volume;
    const list = window.speechSynthesis.getVoices();
    const wantedURI = opts.voiceURI ?? settings.voiceURI;
    let voice: SpeechSynthesisVoice | undefined;
    if (opts.lang) {
      voice = pickVoiceForLang(list, opts.lang);
    }
    if (!voice && wantedURI && !opts.lang) voice = list.find((v) => v.voiceURI === wantedURI);
    if (voice) u.voice = voice;
    if (opts.lang) u.lang = opts.lang;
    u.onstart = () => { setSpeaking(true); setPaused(false); setSpeakingId(id ?? "default"); opts.onStart?.(); };
    u.onend = () => { setSpeaking(false); setPaused(false); setSpeakingId(null); utterRef.current = null; opts.onEnd?.(); };
    u.onerror = () => { setSpeaking(false); setPaused(false); setSpeakingId(null); utterRef.current = null; };
    u.onboundary = (e) => {
      if (e.name === "word" || (e as any).name === undefined) {
        opts.onWord?.(e.charIndex, (e as any).charLength ?? 0);
      }
    };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }, [settings]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported]);

  // stop when tab hidden / unmount
  useEffect(() => {
    const onHide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      stop();
    };
  }, [stop]);

  return (
    <SpeechCtx.Provider value={{ supported, voices, settings, setSettings, speaking, paused, speakingId, speak, pause, resume, stop }}>
      {children}
      <RouteChangeStopper />
    </SpeechCtx.Provider>
  );
}

function RouteChangeStopper() {
  const { stop } = useSpeech();
  useEffect(() => {
    let last = typeof window !== "undefined" ? window.location.pathname : "";
    const check = () => {
      if (typeof window === "undefined") return;
      if (window.location.pathname !== last) {
        last = window.location.pathname;
        stop();
      }
    };
    window.addEventListener("popstate", check);
    const id = window.setInterval(check, 400);
    return () => { window.removeEventListener("popstate", check); window.clearInterval(id); };
  }, [stop]);
  return null;
}

export function useSpeech() {
  const ctx = useContext(SpeechCtx);
  if (!ctx) throw new Error("useSpeech must be used inside SpeechProvider");
  return ctx;
}
