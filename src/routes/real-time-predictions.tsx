import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { FeatureTool, hashPct, pickKeywords } from "@/components/FeatureTool";

export const Route = createFileRoute("/real-time-predictions")({
  head: () => ({
    meta: [
      { title: "Real-time Predictions — NLP Studio" },
      { name: "description", content: "Sub-50ms inference for live chat, comments, and stream processing." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <FeatureTool
      icon={Zap}
      badge="REAL-TIME"
      title="Real-time Predictions"
      description="Ultra-low-latency inference — perfect for live chat moderation, streaming comments, and real-time pipelines."
      placeholder="Paste a live message or stream sample..."
      sample="User just posted: 'This service is incredibly fast and reliable!'"
      analyze={(text) => {
        const latency = 18 + (text.length % 22);
        return {
          headline: `${latency}ms`,
          summary: `Prediction returned in ${latency}ms — well under the 50ms SLA.`,
          rows: [
            { label: "Throughput",   value: hashPct(text, "thr", 88, 99), color: "from-emerald-400 to-cyan-glow" },
            { label: "Latency score",value: Math.max(60, 100 - latency),  color: "from-primary to-accent" },
            { label: "Stability",    value: hashPct(text, "stab", 90, 99),color: "from-cyan-glow to-primary" },
            { label: "Confidence",   value: hashPct(text, "rt", 78, 97),  color: "from-primary to-purple-glow" },
          ],
          tags: pickKeywords(text),
        };
      }}
    />
  );
}
