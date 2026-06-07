import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Demo } from "@/components/Demo";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NLP Studio — Text Classification & NLP Platform" },
      {
        name: "description",
        content:
          "AI-powered NLP and text classification platform for sentiment analysis, spam detection, topic prediction, and intelligent language understanding.",
      },
      { property: "og:title", content: "NLP Studio — Text Classification & NLP Platform" },
      {
        property: "og:description",
        content:
          "Transform text into intelligent insights with futuristic AI models, real-time analytics, and a beautiful interactive demo.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Demo />
      </main>
      <Footer />
    </div>
  );
}
