import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileText, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { ListenButton } from "@/components/ListenButton";
import { toast } from "sonner";

export const Route = createFileRoute("/text-summarization")({
  head: () => ({
    meta: [
      { title: "Text Summarization — NLP Studio" },
      { name: "description", content: "Condense long articles and documents into concise summaries." },
    ],
  }),
  component: ProtectedPage,
});

const SAMPLE = `Artificial intelligence is rapidly reshaping the modern world. From healthcare diagnostics to autonomous vehicles, AI systems analyze enormous datasets, recognize subtle patterns, and make decisions in milliseconds. Researchers continue to push the boundaries of what's possible, exploring new architectures, training techniques, and applications. As models become more capable, conversations around ethics, safety, and accessibility become increasingly important. The next decade will likely see AI integrated into nearly every industry, transforming how we work, learn, and live.`;

function summarize(text: string, ratio: number) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const target = Math.max(1, Math.round(sentences.length * ratio));
  return sentences.slice(0, target).join(" ");
}

function Page() {
  const [text, setText] = useState(SAMPLE);
  const [length, setLength] = useState(1); // 0=short, 1=medium, 2=long
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);

  const ratio = [0.25, 0.5, 0.75][length];
  const labels = ["Short", "Medium", "Long"];
  const origCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const sumCount = useMemo(() => summary.trim().split(/\s+/).filter(Boolean).length, [summary]);

  const onSummarize = () => {
    if (!text.trim()) return;
    setLoading(true);
    setSummary("");
    setTimeout(() => {
      setSummary(summarize(text, ratio));
      setLoading(false);
    }, 900);
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Summary copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  };

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
              <FileText className="w-3.5 h-3.5" /> SUMMARIZATION
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gradient">Text Summarization</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
              Paste long articles, essays, or documents and get a clean, focused summary in seconds.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="gradient-border p-6 rounded-2xl">
              <label className="text-sm font-medium mb-3 block">Original text</label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your article or document..."
                className="min-h-[260px] bg-background/40 border-white/10 resize-none"
              />
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Summary length</span>
                  <span className="text-accent font-medium">{labels[length]}</span>
                </div>
                <Slider value={[length]} onValueChange={(v) => setLength(v[0])} min={0} max={2} step={1} />
              </div>
              <div className="text-xs text-muted-foreground mt-3">{origCount} words</div>
              <Button
                onClick={onSummarize}
                disabled={loading || !text.trim()}
                className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Summarizing…</> : <><Sparkles className="w-4 h-4" /> Summarize</>}
              </Button>
            </div>

            <div className="gradient-border p-6 rounded-2xl min-h-[380px] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Summary</h3>
                {summary && (
                  <div className="flex items-center gap-1">
                    <ListenButton id="summary" text={summary} />
                    <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 text-xs">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy
                    </Button>
                  </div>
                )}
              </div>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Compressing text…
                  </motion.div>
                ) : summary ? (
                  <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
                    <p className="text-sm leading-relaxed flex-1">{summary}</p>
                    <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                      <Stat label="Original" value={`${origCount}w`} />
                      <Stat label="Summary" value={`${sumCount}w`} />
                      <Stat label="Reduced" value={`${origCount ? Math.round((1 - sumCount / origCount) * 100) : 0}%`} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center">
                    Adjust the length slider and click Summarize.
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold text-gradient">{value}</div>
    </div>
  );
}

function ProtectedPage() { return (<RequireAuth><Page /></RequireAuth>); }
