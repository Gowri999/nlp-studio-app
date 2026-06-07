import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { ListenButton } from "@/components/ListenButton";

export const Route = createFileRoute("/hate-speech-detection")({
  head: () => ({
    meta: [
      { title: "Hate Speech Detection — NLP Studio" },
      { name: "description", content: "Score toxicity, threats, insults, and identity hate in real time." },
    ],
  }),
  component: ProtectedPage,
});

const TOXIC = ["hate", "kill", "stupid", "idiot", "dumb", "trash", "loser", "ugly", "die", "shut up", "moron", "worthless"];
const SEVERE = ["kill", "die", "murder", "destroy"];
const OBSCENE = ["damn", "hell", "crap"];
const THREAT = ["kill", "hurt", "attack", "destroy", "punch"];
const IDENTITY = ["race", "gender", "religion", "ethnic"];

const SAFE_EXAMPLE = "Thanks so much for the thoughtful feedback — I really appreciate the kind words and helpful suggestions!";
const TOXIC_EXAMPLE = "You are such a stupid idiot, I hate you and I hope you just shut up and disappear forever.";

function score(text: string) {
  const lower = ` ${text.toLowerCase()} `;
  const count = (arr: string[]) => arr.reduce((n, w) => n + (lower.includes(` ${w} `) || lower.includes(w) ? 1 : 0), 0);
  const words = text.trim().split(/\s+/).length || 1;
  const tox = Math.min(100, Math.round((count(TOXIC) / Math.max(1, words / 4)) * 100));
  const sev = Math.min(100, Math.round((count(SEVERE) / Math.max(1, words / 5)) * 110));
  const obs = Math.min(100, Math.round((count(OBSCENE) / Math.max(1, words / 5)) * 90));
  const thr = Math.min(100, Math.round((count(THREAT) / Math.max(1, words / 5)) * 100));
  const ins = Math.min(100, Math.round((count(["stupid", "idiot", "loser", "ugly", "moron"]) / Math.max(1, words / 4)) * 110));
  const idh = Math.min(100, Math.round((count(IDENTITY) / Math.max(1, words / 4)) * 90));
  const overall = Math.round(Math.max(tox, sev * 0.9, ins * 0.85, thr * 0.95));
  return { overall, tox, sev, obs, thr, ins, idh };
}

function verdict(score: number) {
  if (score >= 85) return { label: "⛔ Severe", className: "bg-red-600/30 border-red-500/60 text-red-100" };
  if (score >= 60) return { label: "🔴 Toxic", className: "bg-orange-600/30 border-orange-500/60 text-orange-100" };
  if (score >= 30) return { label: "⚠️ Mild", className: "bg-yellow-500/20 border-yellow-400/50 text-yellow-100" };
  return { label: "✅ Safe", className: "bg-emerald-500/20 border-emerald-400/50 text-emerald-100" };
}

function gradientFor(s: number) {
  if (s >= 85) return "from-red-600 to-rose-500";
  if (s >= 60) return "from-orange-500 to-red-500";
  if (s >= 30) return "from-yellow-400 to-orange-500";
  return "from-emerald-400 to-cyan-glow";
}

function Page() {
  const [text, setText] = useState(SAFE_EXAMPLE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof score> | null>(null);

  const analyze = (t?: string) => {
    const v = t ?? text;
    if (t !== undefined) setText(t);
    if (!v.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(score(v));
      setLoading(false);
    }, 900);
  };

  const v = result ? verdict(result.overall) : null;
  const isHigh = result && result.overall > 70;

  const rows = result ? [
    { label: "Toxicity", value: result.tox },
    { label: "Severe Toxicity", value: result.sev },
    { label: "Obscene", value: result.obs },
    { label: "Threat", value: result.thr },
    { label: "Insult", value: result.ins },
    { label: "Identity Hate", value: result.idh },
  ] : [];

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
              <AlertTriangle className="w-3.5 h-3.5" /> TOXICITY
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gradient">Hate Speech Detection</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
              Score toxicity, threats, insults, and identity hate across comments, tweets, and messages.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="gradient-border p-6 rounded-2xl">
              <label className="text-sm font-medium mb-3 block">Text to analyze</label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a comment, tweet, or message..." className="min-h-[220px] bg-background/40 border-white/10 resize-none" />
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => analyze(SAFE_EXAMPLE)} className="flex-1 border-white/10 bg-background/30">Test Safe</Button>
                <Button variant="outline" size="sm" onClick={() => analyze(TOXIC_EXAMPLE)} className="flex-1 border-white/10 bg-background/30">Test Toxic</Button>
              </div>
              <Button onClick={() => analyze()} disabled={loading || !text.trim()} className="w-full mt-3 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4" /> Analyze Toxicity</>}
              </Button>
            </div>

            <div className="gradient-border p-6 rounded-2xl min-h-[380px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Results</h3>
                {result && v && (
                  <ListenButton
                    id="hate"
                    text={`Toxicity score is ${result.overall} percent. Verdict: ${v.label.replace(/[^A-Za-z ]/g, "").trim()}. Categories: Toxicity ${result.tox} percent, Severe ${result.sev} percent, Obscene ${result.obs} percent, Threat ${result.thr} percent, Insult ${result.ins} percent, Identity hate ${result.idh} percent.`}
                  />
                )}
              </div>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Scoring…
                  </motion.div>
                ) : result && v ? (
                  <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <motion.div
                      animate={isHigh ? { boxShadow: ["0 0 0 0 rgba(239,68,68,0.4)", "0 0 0 16px rgba(239,68,68,0)"] } : {}}
                      transition={isHigh ? { duration: 1.4, repeat: Infinity } : {}}
                      className={`rounded-xl border p-4 ${v.className}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase opacity-80">Overall toxicity</div>
                          <div className="text-3xl font-bold">{result.overall}%</div>
                        </div>
                        <div className="text-lg font-semibold">{v.label}</div>
                      </div>
                      <div className="h-2 mt-3 rounded-full bg-black/30 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.overall}%` }} transition={{ duration: 0.8 }} className={`h-full bg-gradient-to-r ${gradientFor(result.overall)}`} />
                      </div>
                    </motion.div>

                    <div className="space-y-3">
                      {rows.map((r) => (
                        <div key={r.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{r.label}</span>
                            <span className="font-medium">{r.value}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${r.value}%` }} transition={{ duration: 0.8 }} className={`h-full bg-gradient-to-r ${gradientFor(r.value)}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-muted-foreground py-16 text-center">
                    Click Analyze Toxicity to see the breakdown.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProtectedPage() { return (<RequireAuth><Page /></RequireAuth>); }
