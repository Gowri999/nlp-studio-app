import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { FeatureTool, pickKeywords } from "@/components/FeatureTool";
import { analyzeSentiment, topLabels } from "@/lib/api";

export const Route = createFileRoute("/sentiment-analysis")({
  head: () => ({
    meta: [
      { title: "Sentiment Analysis — NLP Studio" },
      { name: "description", content: "Detect positive, negative, and neutral tones in text with AI-powered sentiment analysis." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <FeatureTool
      icon={Heart}
      badge="SENTIMENT"
      title="Sentiment Analysis"
      description="Analyze the emotional tone of any text. Get instant positive or negative classifications with confidence scores."
      placeholder="Paste a review, tweet, comment, or any text..."
      sample="I absolutely love this product — it's the best thing I've bought all year!"
      analyze={async (text) => {
        const res = await analyzeSentiment(text);
        const sorted = topLabels(res);
        const top = sorted[0];
        const label = top.label.toUpperCase();
        const conf = Math.round(top.score * 1000) / 10;
        const get = (l: string) =>
          Math.round(((sorted.find((s) => s.label.toUpperCase() === l)?.score ?? 0) * 1000)) / 10;
        return {
          headline: label,
          summary: `Model detected ${label} sentiment with ${conf}% confidence.`,
          rows: [
            { label: "Positive", value: get("POSITIVE"), color: "from-emerald-400 to-cyan-glow" },
            { label: "Negative", value: get("NEGATIVE"), color: "from-pink-500 to-rose-400" },
          ],
          tags: pickKeywords(text),
        };
      }}
    />
  );
}
