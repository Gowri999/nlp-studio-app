import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Loader2, Sparkles, Download, AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { ListenButton } from "@/components/ListenButton";
import { toast } from "sonner";
import { analyzeEntities, friendlyError } from "@/lib/api";

export const Route = createFileRoute("/named-entity-recognition")({
  head: () => ({
    meta: [
      { title: "Named Entity Recognition — NLP Studio" },
      { name: "description", content: "Extract people, organizations, locations, dates, and money from text." },
    ],
  }),
  component: ProtectedPage,
});

type EType = "PERSON" | "ORG" | "LOC" | "DATE" | "MONEY";


const COLORS: Record<EType, string> = {
  PERSON: "bg-blue-500/30 text-blue-200 border-blue-400/40",
  ORG: "bg-emerald-500/30 text-emerald-200 border-emerald-400/40",
  LOC: "bg-orange-500/30 text-orange-200 border-orange-400/40",
  DATE: "bg-purple-500/30 text-purple-200 border-purple-400/40",
  MONEY: "bg-rose-500/30 text-rose-200 border-rose-400/40",
};

const LABELS: Record<EType, string> = {
  PERSON: "Person", ORG: "Organization", LOC: "Location", DATE: "Date", MONEY: "Money / Number",
};

const SAMPLE = "On March 14, 2024, Sam Altman announced that OpenAI raised $10 billion from Microsoft in San Francisco. Tim Cook joined the meeting from Apple's headquarters in California.";

type Entity = { text: string; type: EType; start: number; end: number };

const HF_TO_TYPE: Record<string, EType> = { PER: "PERSON", ORG: "ORG", LOC: "LOC" };

function regexExtras(text: string): Entity[] {
  const out: Entity[] = [];
  const push = (re: RegExp, type: EType) => {
    let m;
    while ((m = re.exec(text))) {
      out.push({ text: m[0], type, start: m.index, end: m.index + m[0].length });
    }
  };
  push(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:yesterday|today|tomorrow)\b/gi, "DATE");
  push(/\$\d+(?:[.,]\d+)?\s*(?:billion|million|thousand|k|M|B)?|\b\d+(?:[.,]\d+)?\s*(?:billion|million|dollars|euros)\b/gi, "MONEY");
  return out;
}

function Page() {
  const [text, setText] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [ents, setEnts] = useState<Entity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setEnts(null);
    setError(null);
    try {
      const res = await analyzeEntities(text);
      const mapped: Entity[] = (res || [])
        .filter((t) => t.entity_group && HF_TO_TYPE[t.entity_group])
        .map((t) => ({
          text: t.word.replace(/^##/, ""),
          type: HF_TO_TYPE[t.entity_group!],
          start: t.start,
          end: t.end,
        }));
      // Merge in regex DATE / MONEY (not covered by base NER)
      const all = [...mapped, ...regexExtras(text)]
        .filter((e) => e.text && e.start >= 0)
        .sort((a, b) => a.start - b.start);
      // Drop overlaps
      const out: Entity[] = [];
      for (const e of all) {
        if (out.length && e.start < out[out.length - 1].end) continue;
        out.push(e);
      }
      setEnts(out);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const onExport = () => {
    if (!ents) return;
    const blob = new Blob([JSON.stringify(ents, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "entities.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Entities exported as JSON");
  };

  const renderHighlighted = () => {
    if (!ents) return null;
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    ents.forEach((e, i) => {
      if (e.start > cursor) parts.push(<span key={`t${i}`}>{text.slice(cursor, e.start)}</span>);
      parts.push(
        <span key={`e${i}`} className={`px-1.5 py-0.5 rounded border ${COLORS[e.type]} mx-0.5`}>
          {e.text}<span className="opacity-60 text-[10px] ml-1">{e.type}</span>
        </span>
      );
      cursor = e.end;
    });
    if (cursor < text.length) parts.push(<span key="tail">{text.slice(cursor)}</span>);
    return parts;
  };

  const grouped = ents ? (["PERSON", "ORG", "LOC", "DATE", "MONEY"] as EType[]).map((t) => ({
    type: t,
    items: [...new Set(ents.filter((e) => e.type === t).map((e) => e.text))],
  })) : [];

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
              <Users className="w-3.5 h-3.5" /> ENTITY RECOGNITION
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gradient">Named Entity Recognition</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
              Identify and color-code people, organizations, locations, dates, and money from any text.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="gradient-border p-6 rounded-2xl">
              <label className="text-sm font-medium mb-3 block">Input text</label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[260px] bg-background/40 border-white/10 resize-none" />
              <Button onClick={onExtract} disabled={loading || !text.trim()} className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</> : <><Sparkles className="w-4 h-4" /> Extract Entities</>}
              </Button>
            </div>

            <div className="gradient-border p-6 rounded-2xl min-h-[380px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Entities</h3>
                {ents && (
                  <div className="flex items-center gap-1">
                    <ListenButton
                      id="ner"
                      text={ents.length === 0 ? "No entities found." : (["PERSON","ORG","LOC","DATE","MONEY"] as EType[]).map((t) => {
                        const items = [...new Set(ents.filter((e) => e.type === t).map((e) => e.text))];
                        return items.length ? `${LABELS[t]}: ${items.join(", ")}` : "";
                      }).filter(Boolean).join(". ")}
                    />
                    <Button size="sm" variant="ghost" onClick={onExport} className="h-7 text-xs">
                      <Download className="w-3.5 h-3.5" /> JSON
                    </Button>
                  </div>
                )}
              </div>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Tagging entities…
                  </motion.div>
                ) : ents ? (
                  <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <div className="text-sm leading-relaxed">{renderHighlighted()}</div>
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      {grouped.map((g) => g.items.length > 0 && (
                        <div key={g.type}>
                          <div className="text-xs text-muted-foreground mb-1.5">{LABELS[g.type]} ({g.items.length})</div>
                          <div className="flex flex-wrap gap-1.5">
                            {g.items.map((it) => (
                              <span key={it} className={`text-xs px-2 py-0.5 rounded border ${COLORS[g.type]}`}>{it}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {ents.length === 0 && <div className="text-sm text-muted-foreground">No entities found.</div>}
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                    <div className="text-sm text-rose-200 max-w-xs">{error}</div>
                    <Button onClick={onExtract} variant="outline" size="sm" className="border-white/10">
                      <RotateCw className="w-3.5 h-3.5" /> Retry
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-muted-foreground py-16 text-center">
                    Click Extract Entities to highlight named entities.
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
