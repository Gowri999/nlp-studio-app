import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { FeatureTool, pickKeywords } from "@/components/FeatureTool";
import { analyzeTopic } from "@/lib/api";

export const Route = createFileRoute("/topic-classification")({
  head: () => ({
    meta: [
      { title: "Topic Classification — NLP Studio" },
      { name: "description", content: "Auto-categorize text into politics, tech, sports, business, and more." },
    ],
  }),
  component: Page,
});

const TOPICS = ["Technology", "Sports", "Politics", "Business", "Health", "Entertainment", "Science", "Education"];

function Page() {
  return (
    <FeatureTool
      icon={Tag}
      badge="TOPIC"
      title="Topic Classification"
      description="Drop in an article or paragraph and the model assigns the most likely subject category."
      placeholder="Paste an article or paragraph..."
      sample="The new AI model from the startup uses transformer architecture and trains on petabytes of data."
      analyze={async (text) => {
        const res = await analyzeTopic(text, TOPICS);
        const top = res.labels[0];
        const conf = Math.round(res.scores[0] * 1000) / 10;
        return {
          headline: top,
          summary: `Primary topic identified as ${top} with ${conf}% confidence.`,
          rows: res.labels.slice(0, 5).map((label, i) => ({
            label,
            value: Math.round(res.scores[i] * 1000) / 10,
            color: i === 0 ? "from-primary to-accent" : "from-cyan-glow to-primary",
          })),
          tags: pickKeywords(text),
        };
      }}
    />
  );
}
