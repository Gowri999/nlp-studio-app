import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { Features } from "@/components/Features";
import { RequireAuth } from "@/components/RequireAuth";
import { motion } from "framer-motion";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "All Features — NLP Studio" },
      { name: "description", content: "Access all 13+ NLP tools — sentiment, spam, summarization, translation, voice and more." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FeaturesHub />
    </RequireAuth>
  ),
});

function FeaturesHub() {
  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-4">
            <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
              ALL TOOLS UNLOCKED
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Your <span className="text-gradient">AI toolkit</span>
            </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Pick any tool below — no limits, full export, voice everywhere.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { v: "98.4%", l: "Accuracy" },
              { v: "13+", l: "Tools" },
              { v: "12M+", l: "Texts" },
              { v: "25ms", l: "Latency" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold font-display text-gradient">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
    <Features />
    <Footer />
  </div>
);
}
