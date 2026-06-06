import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Sparkles, AlertCircle, RotateCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { ListenButton } from "@/components/ListenButton";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { friendlyError, DEMO_MODE, onDemoModeChange } from "@/lib/api";

export type ResultRow = { label: string; value: number; color?: string };

export type AnalyzeResult = {
  headline: string;
  summary: string;
  rows: ResultRow[];
  tags?: string[];
};

interface FeatureToolProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  placeholder: string;
  sample: string;
  analyze: (text: string) => Promise<AnalyzeResult> | AnalyzeResult;
}

type Step = "idle" | "sending" | "processing" | "done";

export function FeatureTool({
  icon: Icon,
  badge,
  title,
  description,
  placeholder,
  sample,
  analyze,
}: FeatureToolProps) {
  const [text, setText] = useState(sample);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemoBanner] = useState(DEMO_MODE);
  useEffect(() => {
    const off = onDemoModeChange(setDemoBanner);
    return () => { off; };
  }, []);

  const { bumpAnalyzed } = useAuth();
  const onAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setStep("sending");
    try {
      await new Promise((r) => setTimeout(r, 150));
      setStep("processing");
      const r = await analyze(text);
      setResult(r);
      setStep("done");
      bumpAnalyzed(1);
    } catch (e) {
      setError(friendlyError(e));
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
              <Icon className="w-3.5 h-3.5" /> {badge}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gradient">{title}</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">{description}</p>
            {demo && (
              <div className="mt-5 inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-accent border border-accent/30">
                🚀 Demo Mode — Real AI backend coming soon
              </div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="gradient-border p-6 rounded-2xl"
            >
              <label className="text-sm font-medium mb-3 block">Your text</label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="min-h-[220px] bg-background/40 border-white/10 resize-none"
              />
              <Button
                onClick={onAnalyze}
                disabled={loading || !text.trim()}
                className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {step === "sending" ? "Sending…" : step === "processing" ? "Analyzing with AI…" : "Working…"}</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze</>
                )}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="gradient-border p-6 rounded-2xl min-h-[340px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Results</h3>
                {result && !loading && (
                  <ListenButton
                    id={`feature-${badge}`}
                    text={`${result.headline}. ${result.summary}${result.rows?.length ? ". " + result.rows.slice(0, 3).map(r => `${r.label} ${r.value} percent`).join(", ") : ""}${result.tags?.length ? ". Key terms: " + result.tags.join(", ") : ""}`}
                  />
                )}
              </div>
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3"
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    <div className="text-sm">
                      {step === "sending" ? "Sending…" : step === "processing" ? "Processing…" : "Done!"}
                    </div>
                    <div className="flex gap-2 text-[10px] uppercase tracking-wider">
                      <span className={step === "sending" ? "text-accent" : ""}>Sending</span>
                      <span>→</span>
                      <span className={step === "processing" ? "text-accent" : ""}>Processing</span>
                      <span>→</span>
                      <span className={step === "done" ? "text-accent" : ""}>Done</span>
                    </div>
                  </motion.div>
                )}
                {!loading && error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 gap-4 text-center"
                  >
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                    <div className="text-sm text-rose-200 max-w-xs">{error}</div>
                    <Button
                      onClick={onAnalyze}
                      variant="outline"
                      size="sm"
                      className="border-white/10"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Retry
                    </Button>
                  </motion.div>
                )}
                {!loading && !result && !error && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground py-16 text-center"
                  >
                    Enter text and click Analyze to see results.
                  </motion.div>
                )}
                {!loading && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <div className="text-2xl font-bold text-gradient">{result.headline}</div>
                      <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>
                    </div>

                    <div className="space-y-3">
                      {result.rows.map((row) => (
                        <div key={row.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-medium">{row.value}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${row.value}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${row.color ?? "from-primary to-accent"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {result.tags && result.tags.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Key terms</div>
                        <div className="flex flex-wrap gap-2">
                          {result.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs px-3 py-1 rounded-full glass border border-white/10"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </RequireAuth>
  );
}

// Helpers shared across pages
export function pickKeywords(text: string, n = 5): string[] {
  const stop = new Set(("the a an and or but if then to of in on for with at by from is are was were be been being this that those these it its as i you we they he she them his her our your their not no do does did so very just".split(" ")));
  const counts = new Map<string, number>();
  text.toLowerCase().replace(/[^a-z0-9\s']/g, " ").split(/\s+/).forEach((w) => {
    if (!w || w.length < 3 || stop.has(w)) return;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

export function hashPct(text: string, salt: string, min = 55, max = 98): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  for (let i = 0; i < salt.length; i++) h = (h * 31 + salt.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}
