import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { FeatureTool, pickKeywords } from "@/components/FeatureTool";
import { analyzeInsights } from "@/lib/api";

export const Route = createFileRoute("/ai-text-insights")({
  head: () => ({
    meta: [
      { title: "AI Text Insights — NLP Studio" },
      { name: "description", content: "Deep semantic understanding powered by transformer architectures." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <FeatureTool
      icon={Brain}
      badge="INSIGHTS"
      title="AI Text Insights"
      description="Generate deep semantic insights — tone, intent, and style — from any passage."
      placeholder="Paste a paragraph or document..."
      sample="The quarterly earnings exceeded analyst expectations, signaling strong momentum across all major business units."
      analyze={async (text) => {
        const res = await analyzeInsights(text);
        const words = text.trim().split(/\s+/).length;
        const sentences = Math.max(1, text.split(/[.!?]+/).filter(Boolean).length);
        const top = res.labels[0];
        const conf = Math.round(res.scores[0] * 1000) / 10;
        const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        return {
          headline: cap(top),
          summary: `${words} words across ${sentences} sentences. Dominant style: ${cap(top)} (${conf}%).`,
          rows: res.labels.slice(0, 5).map((label, i) => ({
            label: cap(label),
            value: Math.round(res.scores[i] * 1000) / 10,
            color: i === 0 ? "from-primary to-accent" : "from-cyan-glow to-primary",
          })),
          tags: pickKeywords(text, 6),
        };
      }}
    />
  );
}
