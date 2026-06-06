import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Target, Users, Code2, Sparkles, Database, Cpu } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — NLP Studio" },
      { name: "description", content: "Our mission, the team, and the technology behind NLP Studio." },
    ],
  }),
  component: AboutPage,
});

const team = [
  { name: "Aria Patel", role: "Co-founder · ML Lead", initials: "AP" },
  { name: "Liam Chen", role: "Co-founder · Product", initials: "LC" },
  { name: "Sara Okafor", role: "NLP Research", initials: "SO" },
  { name: "Diego Ruiz", role: "Frontend & Design", initials: "DR" },
];

const stack = [
  { icon: Cpu, name: "Transformers", desc: "BERT, RoBERTa, T5 fine-tuned in-house" },
  { icon: Database, name: "Vector DB", desc: "Sub-25ms semantic retrieval" },
  { icon: Code2, name: "TypeScript + React", desc: "Type-safe, animated UI" },
  { icon: Sparkles, name: "Edge inference", desc: "Globally distributed for low latency" },
];

function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">ABOUT</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Building the <span className="text-gradient">future of text intelligence</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              We make state-of-the-art NLP feel effortless — for engineers, writers, researchers and product teams.
            </p>
          </motion.div>

          <section className="grid md:grid-cols-2 gap-5 mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass-strong gradient-border rounded-2xl p-7">
              <Target className="w-7 h-7 text-accent mb-3" />
              <h2 className="text-xl font-semibold mb-2">Our mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every team should be able to extract meaning, sentiment and structure from text without a PhD.
                We unify 13+ NLP capabilities under one interactive studio with voice, visualization and exports.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="glass-strong gradient-border rounded-2xl p-7">
              <Brain className="w-7 h-7 text-accent mb-3" />
              <h2 className="text-xl font-semibold mb-2">Why us</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                98.4% benchmark accuracy. Sub-25ms latency. Privacy-first design. And a UI you'll actually enjoy using.
              </p>
            </motion.div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-accent" /> The team</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {team.map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-semibold text-primary-foreground">
                    {m.initials}
                  </div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.role}</div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Tech stack</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {stack.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <s.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
