import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Model = "sentiment" | "spam" | "topic" | "fake";

const sampleResults: Record<Model, any> = {
  sentiment: {
    label: "Positive",
    confidence: 94,
    color: "from-emerald-400 to-cyan-glow",
    keywords: ["love", "amazing", "incredible", "best"],
    emotions: { Joy: 78, Trust: 65, Anticipation: 42, Surprise: 30 },
    gaugeValue: 88,
  },
  spam: {
    label: "Not Spam",
    confidence: 87,
    color: "from-cyan-glow to-primary",
    keywords: ["meeting", "schedule", "report", "team"],
    emotions: { Neutral: 80, Trust: 60, Joy: 25, Anger: 10 },
    gaugeValue: 13,
  },
  topic: {
    label: "Technology",
    confidence: 91,
    color: "from-primary to-purple-glow",
    keywords: ["AI", "model", "data", "neural"],
    emotions: { Curiosity: 75, Trust: 70, Joy: 50, Anticipation: 60 },
    gaugeValue: 70,
  },
  fake: {
    label: "Likely Real",
    confidence: 82,
    color: "from-cyan-glow to-emerald-400",
    keywords: ["source", "verified", "official", "data"],
    emotions: { Trust: 82, Neutral: 60, Anticipation: 35, Doubt: 18 },
    gaugeValue: 18,
  },
};

export function Demo() {
  const [text, setText] = useState("I absolutely love this product — it's the best thing I've bought all year!");
  const [model, setModel] = useState<Model>("sentiment");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1400));
    setResult(sampleResults[model]);
    setLoading(false);
  };

  return (
    <section id="demo" className="relative py-32">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
            INTERACTIVE DEMO
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Try it <span className="text-gradient">live</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Paste any text below and watch our AI break it down in real time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="gradient-border p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Input
              </h3>
              <Select value={model} onValueChange={(v) => setModel(v as Model)}>
                <SelectTrigger className="w-[200px] glass border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                  <SelectItem value="spam">Spam Detection</SelectItem>
                  <SelectItem value="topic">Topic Prediction</SelectItem>
                  <SelectItem value="fake">Fake News Detection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              className="min-h-[220px] bg-background/50 border-white/10 resize-none text-base focus-visible:ring-primary/50"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-muted-foreground">
                {text.length} characters · {text.trim().split(/\s+/).filter(Boolean).length} words
              </div>
              <Button
                onClick={analyze}
                disabled={loading || !text.trim()}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 glow-purple hover:scale-105 transition-transform"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Text
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="gradient-border p-6 rounded-2xl min-h-[420px]"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Results
            </h3>

            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                  ))}
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[320px] text-center"
                >
                  <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Click "Analyze Text" to see AI-powered predictions, keywords, and emotion breakdowns.
                  </p>
                </motion.div>
              )}

              {!loading && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Prediction */}
                  <div className="glass p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground mb-1">Prediction</div>
                    <div className={`text-3xl font-bold font-display bg-gradient-to-r ${result.color} bg-clip-text text-transparent`}>
                      {result.label}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-semibold">{result.confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="glass p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground mb-2">Top Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((k: string, i: number) => (
                        <motion.span
                          key={k}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-white/10"
                        >
                          {k}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Emotions */}
                  <div className="glass p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground mb-3">Emotion Meter</div>
                    <div className="space-y-2">
                      {Object.entries(result.emotions).map(([k, v]: any, i) => (
                        <div key={k}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{k}</span>
                            <span className="text-muted-foreground">{v}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${v}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full bg-gradient-to-r from-cyan-glow to-primary rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
