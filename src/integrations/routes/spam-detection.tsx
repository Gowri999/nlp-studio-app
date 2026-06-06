import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { FeatureTool, pickKeywords } from "@/components/FeatureTool";
import { analyzeSpam, topLabels } from "@/lib/api";

export const Route = createFileRoute("/spam-detection")({
  head: () => ({
    meta: [
      { title: "Spam Detection — NLP Studio" },
      { name: "description", content: "Identify spam, phishing, and unwanted content with advanced ML classifiers." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <FeatureTool
      icon={Shield}
      badge="SPAM FILTER"
      title="Spam Detection"
      description="Classify any message as spam or legitimate using a model trained on millions of examples."
      placeholder="Paste an email, SMS, or message..."
      sample="WIN FREE MONEY NOW!!! Click this link to claim your $1000 prize — limited time offer!"
      analyze={async (text) => {
        const res = await analyzeSpam(text);
        const sorted = topLabels(res);
        const top = sorted[0];
        // labels are typically LABEL_0 (ham) and LABEL_1 (spam)
        const isSpam = /spam|label_1/i.test(top.label);
        const conf = Math.round(top.score * 1000) / 10;
        const spamScore = isSpam ? conf : Math.round((1 - top.score) * 1000) / 10;
        return {
          headline: isSpam ? "Spam" : "Not Spam",
          summary: isSpam
            ? `High likelihood of spam (${conf}% confidence).`
            : `Content appears legitimate (${conf}% confidence).`,
          rows: [
            { label: "Spam",       value: spamScore,       color: "from-pink-500 to-rose-400" },
            { label: "Legitimate", value: 100 - spamScore, color: "from-emerald-400 to-cyan-glow" },
          ],
          tags: pickKeywords(text),
        };
      }}
    />
  );
}
