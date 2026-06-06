import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Languages, Loader2, Sparkles, Copy, Check, ArrowLeftRight, History, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { ListenButton } from "@/components/ListenButton";
import { useSpeech, pickVoiceForLang } from "@/lib/speech";
import { toast } from "sonner";

export const Route = createFileRoute("/language-translation")({
  head: () => ({
    meta: [
      { title: "Language Translation — NLP Studio" },
      { name: "description", content: "Translate text between 12+ languages with auto-detect." },
    ],
  }),
  component: ProtectedPage,
});

const LANGS = [
  { code: "en", name: "English" }, { code: "es", name: "Spanish" }, { code: "fr", name: "French" },
  { code: "de", name: "German" }, { code: "hi", name: "Hindi" }, { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" }, { code: "ar", name: "Arabic" }, { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" }, { code: "ko", name: "Korean" }, { code: "it", name: "Italian" },
];

const FAKE: Record<string, Record<string, string>> = {
  en: { hello: "hello", world: "world", love: "love", "good morning": "good morning" },
  es: { hello: "hola", world: "mundo", love: "amor", "good morning": "buenos días" },
  fr: { hello: "bonjour", world: "monde", love: "amour", "good morning": "bonjour" },
  de: { hello: "hallo", world: "welt", love: "liebe", "good morning": "guten morgen" },
  hi: { hello: "नमस्ते", world: "दुनिया", love: "प्यार", "good morning": "सुप्रभात" },
  zh: { hello: "你好", world: "世界", love: "爱", "good morning": "早上好" },
  ja: { hello: "こんにちは", world: "世界", love: "愛", "good morning": "おはよう" },
  ar: { hello: "مرحبا", world: "عالم", love: "حب", "good morning": "صباح الخير" },
  pt: { hello: "olá", world: "mundo", love: "amor", "good morning": "bom dia" },
  ru: { hello: "привет", world: "мир", love: "любовь", "good morning": "доброе утро" },
  ko: { hello: "안녕하세요", world: "세계", love: "사랑", "good morning": "좋은 아침" },
  it: { hello: "ciao", world: "mondo", love: "amore", "good morning": "buongiorno" },
};

function fakeTranslate(text: string, target: string): string {
  const dict = FAKE[target] || {};
  let out = text;
  Object.entries(dict).forEach(([en, tr]) => {
    out = out.replace(new RegExp(`\\b${en}\\b`, "gi"), tr);
  });
  // Add a flair so users see something happened
  return out + (target !== "en" ? ` [${target.toUpperCase()}]` : "");
}

function Page() {
  const [auto, setAuto] = useState(true);
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("es");
  const [input, setInput] = useState("Hello world, I love good morning coffee.");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ from: string; to: string; src: string; out: string }[]>([]);

  const { voices, stop } = useSpeech();
  const targetVoice = useMemo(() => pickVoiceForLang(voices, target), [voices, target]);

  // Stop any active playback whenever the languages change or are swapped
  useEffect(() => { stop(); }, [target, source, stop]);

  const onTranslate = () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setTimeout(() => {
      const result = fakeTranslate(input, target);
      setOutput(result);
      setHistory((h) => [{ from: auto ? "auto" : source, to: target, src: input, out: result }, ...h].slice(0, 6));
      setLoading(false);
    }, 800);
  };

  const onSwap = () => {
    if (auto) return toast.info("Disable auto-detect to swap languages");
    setSource(target);
    setTarget(source);
    setInput(output);
    setOutput(input);
  };

  const onCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Translation copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
              <Languages className="w-3.5 h-3.5" /> TRANSLATION
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gradient">Language Translation</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
              Translate between 12+ languages with auto-detect, instant swap, and a recent history.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <div className="space-y-4">
              <div className="gradient-border p-4 rounded-2xl flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={auto} onCheckedChange={setAuto} id="auto" />
                  <label htmlFor="auto" className="text-sm">Auto-detect</label>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-xs text-muted-foreground">From</span>
                  <Select value={source} onValueChange={setSource} disabled={auto}>
                    <SelectTrigger className="bg-background/40 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button size="icon" variant="ghost" onClick={onSwap} className="rounded-full">
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-xs text-muted-foreground">To</span>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger className="bg-background/40 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <Mic className="w-3.5 h-3.5 text-accent" />
                <span>Auto voice:</span>
                <span className="text-foreground font-medium">
                  {targetVoice ? `${targetVoice.name} (${targetVoice.lang})` : `No ${target.toUpperCase()} voice installed — using browser default`}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="gradient-border p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">Source {auto && "(auto)"}</div>
                    {input && <ListenButton id="trans-src" text={input} lang={auto ? "en" : source} />}
                  </div>
                  <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type text to translate..." className="min-h-[220px] bg-background/40 border-white/10 resize-none" />
                  <div className="text-xs text-muted-foreground mt-2">{input.length} characters</div>
                </div>
                <div className="gradient-border p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">Translation</div>
                    {output && (
                      <div className="flex items-center gap-1">
                        <ListenButton id="trans-out" text={output} lang={target} />
                        <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 text-xs">
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="min-h-[220px] rounded-md bg-background/40 border border-white/10 p-3 text-sm whitespace-pre-wrap">
                    {loading ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Translating…</div>
                    ) : output ? output : <span className="text-muted-foreground">Translation will appear here.</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{output.length} characters</div>
                </div>
              </div>

              <Button onClick={onTranslate} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Translating…</> : <><Sparkles className="w-4 h-4" /> Translate</>}
              </Button>
            </div>

            <aside className="gradient-border p-5 rounded-2xl h-fit">
              <div className="flex items-center gap-2 text-sm font-medium mb-4">
                <History className="w-4 h-4" /> Recent translations
              </div>
              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground">Your translation history will appear here.</div>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="text-xs border border-white/10 rounded-lg p-2.5 bg-background/30">
                      <div className="text-[10px] text-accent uppercase tracking-wide mb-1">{h.from} → {h.to}</div>
                      <div className="line-clamp-1 text-muted-foreground">{h.src}</div>
                      <div className="line-clamp-1">{h.out}</div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProtectedPage() { return (<RequireAuth><Page /></RequireAuth>); }
