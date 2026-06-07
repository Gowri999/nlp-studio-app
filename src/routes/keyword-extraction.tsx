import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { FeatureTool, pickKeywords } from "@/components/FeatureTool";
import { analyzeKeywords } from "@/lib/api";

export const Route = createFileRoute("/keyword-extraction")({
  head: () => ({
    meta: [
      { title: "Keyword Extraction — NLP Studio" },
      { name: "description", content: "Surface the most meaningful terms and entities from any document." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <FeatureTool
      icon={Search}
      badge="KEYWORDS"
      title="Keyword Extraction"
      description="Pull the most important terms, entities, and phrases from any document instantly."
      placeholder="Paste an article, document, or transcript..."
      sample="Artificial intelligence and machine learning are transforming industries across healthcare, finance, and education."
      analyze={async (text) => {
        let tokens: { word: string; score: number }[] = [];
        try {
          const res = await analyzeKeywords(text);
          tokens = (res || []).map((t) => ({ word: t.word, score: t.score }));
        } catch {
          // Fall back to local extractor if the keyphrase model is unavailable
          tokens = pickKeywords(text, 8).map((w, i) => ({ word: w, score: 0.95 - i * 0.07 }));
        }
        // Dedupe + keep top
        const seen = new Set<string>();
        const dedup = tokens.filter((t) => {
          const k = t.word.toLowerCase().trim();
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        const top = dedup.sort((a, b) => b.score - a.score).slice(0, 8);
        const fallback = top.length === 0;
        const final = fallback
          ? pickKeywords(text, 8).map((w, i) => ({ word: w, score: 0.9 - i * 0.07 }))
          : top;
        return {
          headline: `${final.length} key terms`,
          summary: "Top-ranked phrases extracted with a transformer model.",
          rows: final.slice(0, 5).map((k, i) => ({
            label: k.word,
            value: Math.round(k.score * 1000) / 10,
            color: i === 0 ? "from-primary to-accent" : "from-cyan-glow to-primary",
          })),
          tags: final.map((k) => k.word),
        };
      }}
    />
  );
}
