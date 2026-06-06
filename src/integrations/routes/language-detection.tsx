import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { FeatureTool } from "@/components/FeatureTool";
import { analyzeLanguage, topLabels, langName } from "@/lib/api";

export const Route = createFileRoute("/language-detection")({
  head: () => ({
    meta: [
      { title: "Language Detection — NLP Studio" },
      { name: "description", content: "Recognize 20+ languages instantly with confidence scoring." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <FeatureTool
      icon={Globe}
      badge="LANGUAGE"
      title="Language Detection"
      description="Identify the language of any text with high confidence — supports 20+ languages."
      placeholder="Paste text in any language..."
      sample="Bonjour le monde, comment allez-vous aujourd'hui ?"
      analyze={async (text) => {
        const res = await analyzeLanguage(text);
        const sorted = topLabels(res);
        const top = sorted[0];
        const name = langName(top.label);
        const conf = Math.round(top.score * 1000) / 10;
        return {
          headline: name,
          summary: `Detected ${name} with ${conf}% confidence.`,
          rows: sorted.slice(0, 5).map((s, i) => ({
            label: langName(s.label),
            value: Math.round(s.score * 1000) / 10,
            color: i === 0 ? "from-primary to-accent" : "from-cyan-glow to-primary",
          })),
        };
      }}
    />
  );
}
