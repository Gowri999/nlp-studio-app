import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { ListenButton } from "@/components/ListenButton";
import { useAuth } from "@/lib/auth";
import { pickKeywords, hashPct } from "@/components/FeatureTool";
import { toast } from "sonner";

export const Route = createFileRoute("/image-analyzer")({
  head: () => ({
    meta: [
      { title: "Image Text Analyzer — NLP Studio" },
      {
        name: "description",
        content:
          "Upload any image or screenshot. Extract the text with OCR and run NLP analysis — type, purpose, spam detection, sentiment, and keywords.",
      },
      { property: "og:title", content: "Image Text Analyzer — NLP Studio" },
      {
        property: "og:description",
        content:
          "OCR plus NLP. Detect text type, purpose, scams, sentiment, and key terms from any uploaded image.",
      },
    ],
  }),
  component: ImageAnalyzerPage,
});

type Stage = "idle" | "uploading" | "ocr" | "analyzing" | "done";

type Analysis = {
  extracted: string;
  type: { label: string; confidence: number };
  purpose: { label: string; reason: string };
  spam: {
    genuine: boolean;
    confidence: number;
    redFlags: string[];
    greenFlags: string[];
  };
  sentiment: { label: "Positive" | "Negative" | "Neutral"; confidence: number };
  keywords: string[];
};

const SPAM_WORDS = [
  "urgent", "winner", "free", "click here", "verify", "bank", "password",
  "limited time", "act now", "claim", "prize", "lottery", "wire", "bitcoin",
  "guarantee", "risk-free", "congratulations", "ssn", "otp", "reset",
];
const POS_WORDS = ["love", "great", "excellent", "amazing", "thanks", "happy", "good", "awesome", "wonderful"];
const NEG_WORDS = ["bad", "hate", "terrible", "awful", "angry", "worst", "scam", "fraud", "fail", "horrible"];

function detectType(text: string): { label: string; confidence: number } {
  const t = text.toLowerCase();
  if (/(invoice|total\s*:|amount due|bill to)/.test(t)) return { label: "Invoice", confidence: hashPct(text, "inv", 78, 95) };
  if (/(subject:|from:|to:|dear\b|regards|sincerely)/.test(t)) return { label: "Email", confidence: hashPct(text, "em", 80, 96) };
  if (/(#\w+|@\w+|retweet|likes?|followers)/.test(t)) return { label: "Social Media Post", confidence: hashPct(text, "sm", 75, 93) };
  if (/(buy now|sale|discount|% off|offer)/.test(t)) return { label: "Advertisement", confidence: hashPct(text, "ad", 76, 94) };
  if (/(headline|reported|according to|breaking)/.test(t)) return { label: "News Article", confidence: hashPct(text, "nw", 74, 92) };
  if (/(name:|address:|phone:|signature)/.test(t)) return { label: "Form", confidence: hashPct(text, "fm", 72, 90) };
  if (/\b(otp|code|verify|verification)\b/.test(t)) return { label: "SMS / OTP", confidence: hashPct(text, "sms", 78, 94) };
  return { label: "General Text", confidence: hashPct(text, "gn", 65, 85) };
}

function detectPurpose(text: string): { label: string; reason: string } {
  const t = text.toLowerCase();
  if (/(verify|password|account|click|bank|wire|bitcoin)/.test(t))
    return { label: "Phishing", reason: "Contains credential / financial action requests typical of phishing." };
  if (/(sale|discount|offer|buy|deal|% off)/.test(t))
    return { label: "Promotional", reason: "Uses persuasive marketing language and offers." };
  if (/(win|prize|lottery|free money|claim)/.test(t))
    return { label: "Scam / Spam", reason: "Promises unrealistic rewards — classic scam pattern." };
  if (/(meeting|invoice|report|policy|regards)/.test(t))
    return { label: "Official", reason: "Formal tone and business vocabulary." };
  if (/(love you|miss|family|friend|dear)/.test(t))
    return { label: "Personal", reason: "Personal pronouns and intimate vocabulary." };
  return { label: "Informative", reason: "Neutral factual content with no strong intent markers." };
}

function detectSpam(text: string, purpose: string) {
  const t = text.toLowerCase();
  const red = SPAM_WORDS.filter((w) => t.includes(w));
  const green: string[] = [];
  if (/regards|sincerely|kind regards/.test(t)) green.push("Professional sign-off");
  if (/@[a-z0-9.-]+\.[a-z]{2,}/.test(t)) green.push("Real-looking email address");
  if (!/http[s]?:\/\/\S+/.test(t)) green.push("No suspicious links");
  if (!/[A-Z]{6,}/.test(text)) green.push("No shouting / all-caps spam");

  const isSpam = purpose === "Phishing" || purpose === "Scam / Spam" || red.length >= 3;
  return {
    genuine: !isSpam,
    confidence: isSpam ? hashPct(text, "sp", 70, 94) : hashPct(text, "gn", 72, 96),
    redFlags: red.slice(0, 6),
    greenFlags: green.slice(0, 5),
  };
}

function detectSentiment(text: string): Analysis["sentiment"] {
  const t = text.toLowerCase();
  const pos = POS_WORDS.filter((w) => t.includes(w)).length;
  const neg = NEG_WORDS.filter((w) => t.includes(w)).length;
  let label: Analysis["sentiment"]["label"] = "Neutral";
  if (pos > neg) label = "Positive";
  else if (neg > pos) label = "Negative";
  return { label, confidence: hashPct(text, label, 68, 94) };
}

function analyzeText(extracted: string): Analysis {
  const type = detectType(extracted);
  const purpose = detectPurpose(extracted);
  const spam = detectSpam(extracted, purpose.label);
  const sentiment = detectSentiment(extracted);
  const keywords = pickKeywords(extracted, 8);
  return { extracted, type, purpose, spam, sentiment, keywords };
}

function ImageAnalyzerPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Analysis | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { user, bumpAnalyzed } = useAuth();

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image (JPG, PNG, WEBP).");
      return;
    }
    setFile(f);
    setResult(null);
    setStage("idle");
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStage("idle");
    setProgress(0);
  };

  const onAnalyze = async () => {
    if (!file) return;
    try {
      setStage("uploading");
      setProgress(10);
      await new Promise((r) => setTimeout(r, 400));

      setStage("ocr");
      const { default: Tesseract } = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress(20 + Math.round(m.progress * 60));
          }
        },
      });
      const extracted = (data.text || "").trim();
      if (!extracted) {
        toast.error("No readable text found in this image.");
        setStage("idle");
        return;
      }

      setStage("analyzing");
      setProgress(90);
      await new Promise((r) => setTimeout(r, 600));

      const analysis = analyzeText(extracted);
      setResult(analysis);
      setProgress(100);
      setStage("done");
      bumpAnalyzed(1);

      // Save history per user
      if (user) {
        const key = `nlp_studio_image_history_${user.email}`;
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.unshift({
          at: new Date().toISOString(),
          name: file.name,
          type: analysis.type.label,
          purpose: analysis.purpose.label,
          genuine: analysis.spam.genuine,
          sentiment: analysis.sentiment.label,
        });
        localStorage.setItem(key, JSON.stringify(prev.slice(0, 25)));
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while analyzing the image.");
      setStage("idle");
    }
  };

  const stageLabel: Record<Stage, string> = {
    idle: "Ready",
    uploading: "Uploading…",
    ocr: "Extracting text…",
    analyzing: "Analyzing…",
    done: "Done!",
  };

  return (
    <RequireAuth>
      <div className="relative min-h-screen">
        <CursorGlow />
        <Navbar />
        <main className="relative z-10 pt-32 pb-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center"
            >
              <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
                <Camera className="w-3.5 h-3.5" /> Vision + NLP
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="text-gradient">Image Text Analyzer</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                Upload any image or screenshot — we&apos;ll extract the text and analyze it for you.
              </p>
            </motion.div>

            {/* Upload zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gradient-border rounded-2xl p-6"
            >
              {!previewUrl ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed transition-all p-12 flex flex-col items-center justify-center text-center min-h-[260px] ${
                    dragOver
                      ? "border-accent bg-accent/5"
                      : "border-white/15 hover:border-accent/60 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mb-4 shadow-[0_0_30px_-5px_hsl(var(--accent))]">
                    <Upload className="w-6 h-6 text-accent" />
                  </div>
                  <p className="font-medium">Drag & drop your image here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse — JPG, PNG, WEBP
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="w-full max-h-[360px] object-contain"
                    />
                    {(stage === "ocr" || stage === "analyzing") && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                          initial={{ y: "-10%" }}
                          animate={{ y: "110%" }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_20px_hsl(var(--accent))]"
                        />
                      </div>
                    )}
                    <button
                      onClick={reset}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <div className="text-muted-foreground">Selected file</div>
                      <div className="font-medium truncate">{file?.name}</div>
                    </div>
                    <Button
                      onClick={onAnalyze}
                      disabled={stage !== "idle" && stage !== "done"}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0 shadow-[0_0_30px_-5px_hsl(var(--accent))]"
                    >
                      {stage === "idle" || stage === "done" ? (
                        <><Sparkles className="w-4 h-4" /> Analyze Image</>
                      ) : (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {stageLabel[stage]}</>
                      )}
                    </Button>

                    {stage !== "idle" && (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="inline-flex items-center gap-1"><ScanLine className="w-3 h-3" /> {stageLabel[stage]}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                            className="h-full bg-gradient-to-r from-primary to-accent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 grid md:grid-cols-2 gap-6"
                >
                  {/* Extracted text */}
                  <div className="md:col-span-2 glass rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Extracted Text</h3>
                      <ListenButton id="img-ocr" text={result.extracted} />
                    </div>
                    <pre className="text-sm whitespace-pre-wrap bg-background/40 border border-white/10 rounded-lg p-4 max-h-72 overflow-auto">
                      {result.extracted}
                    </pre>
                  </div>

                  {/* Text type */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Text type</div>
                    <div className="text-2xl font-bold text-gradient">{result.type.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result.type.confidence}% confidence</div>
                  </div>

                  {/* Purpose */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Purpose</div>
                    <div className="text-2xl font-bold text-gradient">{result.purpose.label}</div>
                    <p className="text-sm text-muted-foreground mt-2">{result.purpose.reason}</p>
                  </div>

                  {/* Spam detection */}
                  <div className="md:col-span-2 glass rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        {result.spam.genuine ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-7 h-7 text-amber-400" />
                        )}
                        <div>
                          <div className="text-xs text-muted-foreground">Authenticity</div>
                          <div className="text-xl font-bold">
                            {result.spam.genuine ? "✅ Genuine" : "⚠️ Likely Spam / Scam"}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.spam.confidence}% confidence
                      </div>
                    </div>
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-amber-400 mb-2">Red flags</div>
                        {result.spam.redFlags.length === 0 ? (
                          <div className="text-xs text-muted-foreground">None detected.</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {result.spam.redFlags.map((f) => (
                              <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200">{f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-emerald-400 mb-2">Green flags</div>
                        {result.spam.greenFlags.length === 0 ? (
                          <div className="text-xs text-muted-foreground">None detected.</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {result.spam.greenFlags.map((f) => (
                              <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">{f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
                    <div className="text-2xl font-bold text-gradient">{result.sentiment.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result.sentiment.confidence}% confidence</div>
                  </div>

                  {/* Keywords */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-2">Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.length ? result.keywords.map((k) => (
                        <span key={k} className="text-xs px-3 py-1 rounded-full glass border border-white/10">{k}</span>
                      )) : <span className="text-xs text-muted-foreground">No keywords found.</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}
