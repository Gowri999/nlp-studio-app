import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, Loader2, Heart, Globe, Shield, Tag, Search, Brain, Smile, Zap, FileText, Users, Languages, AlertTriangle, Volume2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Try the Demo — NLP Studio" },
      { name: "description", content: "Try Sentiment Analysis and Language Detection free. Login to unlock all 13+ NLP tools." },
    ],
  }),
  component: DemoPage,
});

const POS = ["love","amazing","great","best","incredible","happy","awesome","fantastic","wonderful","excellent"];
const NEG = ["hate","terrible","awful","worst","bad","sad","horrible","disappointed","angry","boring"];

const LANGS: { code: string; name: string; words: string[] }[] = [
  { code: "en", name: "English", words: ["the","is","and","you","this","what","with","have"] },
  { code: "es", name: "Spanish", words: ["el","la","es","que","de","con","una","por"] },
  { code: "fr", name: "French", words: ["le","la","est","que","une","avec","pour","vous"] },
  { code: "de", name: "German", words: ["der","die","das","ist","und","ich","nicht","mit"] },
  { code: "hi", name: "Hindi", words: ["है","और","का","की","में","नहीं","मैं","आप"] },
];

const LOCKED = [
  { icon: Shield, title: "Spam Detection" },
  { icon: Tag, title: "Topic Classification" },
  { icon: Search, title: "Keyword Extraction" },
  { icon: Brain, title: "AI Text Insights" },
  { icon: Smile, title: "Emotion Recognition" },
  { icon: Zap, title: "Real-Time Predictions" },
  { icon: FileText, title: "Text Summarization" },
  { icon: Users, title: "Named Entity Recognition" },
  { icon: Languages, title: "Language Translation" },
  { icon: AlertTriangle, title: "Hate Speech Detection" },
  { icon: Volume2, title: "Voice Reader" },
];

const TRY_KEY = "demo_lang_tries";

function getTriesToday() {
  try {
    const raw = localStorage.getItem(TRY_KEY);
    if (!raw) return 0;
    const { date, n } = JSON.parse(raw);
    if (date !== new Date().toDateString()) return 0;
    return n as number;
  } catch { return 0; }
}
function bumpTries() {
  const n = getTriesToday() + 1;
  localStorage.setItem(TRY_KEY, JSON.stringify({ date: new Date().toDateString(), n }));
  return n;
}

function DemoPage() {
  const { user } = useAuth();
  const [sentText, setSentText] = useState("I absolutely love this product!");
  const [sentResult, setSentResult] = useState<{ label: string; conf: number } | null>(null);
  const [sentLoading, setSentLoading] = useState(false);
  const [langText, setLangText] = useState("Hola, ¿cómo estás hoy?");
  const [langResult, setLangResult] = useState<{ name: string; conf: number } | null>(null);
  const [langLoading, setLangLoading] = useState(false);
  const [tries, setTries] = useState(getTriesToday());

  const runSent = () => {
    if (!sentText.trim()) return;
    setSentLoading(true);
    setSentResult(null);
    setTimeout(() => {
      const lower = sentText.toLowerCase();
      const pos = POS.filter(w => lower.includes(w)).length;
      const neg = NEG.filter(w => lower.includes(w)).length;
      const label = pos > neg ? "Positive" : neg > pos ? "Negative" : "Neutral";
      const conf = 70 + ((sentText.length * 7) % 28);
      setSentResult({ label, conf });
      setSentLoading(false);
    }, 700);
  };

  const runLang = () => {
    if (!langText.trim()) return;
    if (!user && tries >= 5) {
      toast.error("Daily limit reached", { description: "Sign up for unlimited language detection." });
      return;
    }
    setLangLoading(true);
    setLangResult(null);
    setTimeout(() => {
      const lower = langText.toLowerCase();
      const scored = LANGS.map(l => ({ ...l, hits: l.words.filter(w => lower.includes(w)).length }));
      scored.sort((a, b) => b.hits - a.hits);
      const top = scored[0].hits === 0 ? LANGS[0] : scored[0];
      setLangResult({ name: top.name, conf: 75 + Math.min(20, scored[0].hits * 5) });
      if (!user) setTries(bumpTries());
      setLangLoading(false);
    }, 600);
  };

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {!user && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong gradient-border rounded-2xl p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-accent" />
                <p className="text-sm">
                  You're using the <span className="text-foreground font-semibold">free demo</span>.
                  <span className="text-muted-foreground"> Sentiment max 100 chars · Language detection {Math.max(0, 5 - tries)}/5 left today.</span>
                </p>
              </div>
              <Link to="/login">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                  Login to Unlock All
                </Button>
              </Link>
            </motion.div>
          )}

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
              <Sparkles className="w-3 h-3 inline mr-1" /> INTERACTIVE DEMO
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Try <span className="text-gradient">NLP Studio</span> in seconds
            </h1>
            <p className="mt-4 text-muted-foreground">Two tools available free. The rest unlock with login.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {/* Sentiment */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong gradient-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Sentiment Analysis</h3>
                  <p className="text-xs text-muted-foreground">{user ? "Unlimited" : "100 char limit"}</p>
                </div>
              </div>
              <Textarea
                value={sentText}
                onChange={(e) => setSentText(user ? e.target.value : e.target.value.slice(0, 100))}
                placeholder="Type a review or tweet…"
                className="bg-white/5 border-white/10 min-h-[100px]"
              />
              {!user && <p className="text-[11px] text-muted-foreground mt-1 text-right">{sentText.length}/100</p>}
              <Button onClick={runSent} disabled={sentLoading} className="mt-3 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                {sentLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : "Analyze sentiment"}
              </Button>
              <AnimatePresence>
                {sentResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-4 glass rounded-xl p-4">
                    <div className="text-2xl font-display font-bold text-gradient">{sentResult.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">Confidence {sentResult.conf}%</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Language Detection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="glass-strong gradient-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Language Detection</h3>
                  <p className="text-xs text-muted-foreground">{user ? "Unlimited" : `${Math.max(0, 5 - tries)} of 5 free / day`}</p>
                </div>
              </div>
              <Textarea
                value={langText}
                onChange={(e) => setLangText(e.target.value)}
                placeholder="Paste text in any language…"
                className="bg-white/5 border-white/10 min-h-[100px]"
              />
              <Button onClick={runLang} disabled={langLoading || (!user && tries >= 5)}
                className="mt-3 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                {langLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting…</> : (!user && tries >= 5) ? "Daily limit reached" : "Detect language"}
              </Button>
              <AnimatePresence>
                {langResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-4 glass rounded-xl p-4">
                    <div className="text-2xl font-display font-bold text-gradient">{langResult.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">Confidence {langResult.conf}%</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {!user && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">More tools — <span className="text-muted-foreground">locked</span></h2>
                <p className="text-sm text-muted-foreground mt-1">Login to instantly unlock everything.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {LOCKED.map((f, i) => (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link to="/login" className="block glass rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.06] transition-colors">
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 opacity-60 group-hover:opacity-100 transition">
                        <f.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-sm text-foreground/80">{f.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1">Login to unlock →</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-8 h-12 glow-purple">
                    Create free account
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
