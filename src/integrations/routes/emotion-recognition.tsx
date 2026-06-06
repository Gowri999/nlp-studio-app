import { createFileRoute } from "@tanstack/react-router";
import { Smile } from "lucide-react";
import { FeatureTool, pickKeywords } from "@/components/FeatureTool";
import { analyzeEmotion, topLabels } from "@/lib/api";

export const Route = createFileRoute("/emotion-recognition")({
  head: () => ({
    meta: [
      { title: "Emotion Recognition — NLP Studio" },
      { name: "description", content: "Identify joy, anger, fear, sadness, and surprise from raw text." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <FeatureTool
      icon={Smile}
      badge="EMOTION"
      title="Emotion Recognition"
      description="Detect granular emotions — joy, anger, fear, sadness, surprise — from any text."
      placeholder="Paste a message, review, or post..."
      sample="I'm so excited and happy about the surprise — it was absolutely amazing!"
      analyze={async (text) => {
        const res = await analyzeEmotion(text);
        const sorted = topLabels(res);
        const top = sorted[0];
        const conf = Math.round(top.score * 1000) / 10;
        const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        return {
          headline: cap(top.label),
          summary: `Dominant emotion: ${cap(top.label)} (${conf}% confidence).`,
          rows: sorted.slice(0, 6).map((s, i) => ({
            label: cap(s.label),
            value: Math.round(s.score * 1000) / 10,
            color: i === 0 ? "from-primary to-accent" : "from-cyan-glow to-primary",
          })),
          tags: pickKeywords(text),
        };
      }}
    />
  );
}
