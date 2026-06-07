import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Cpu, Zap, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/model")({
  head: () => ({
    meta: [
      { title: "Models — NLP Studio" },
      { name: "description", content: "Per-model accuracy, latency and architecture for the NLP Studio model fleet." },
    ],
  }),
  component: () => (<RequireAuth><ModelPage /></RequireAuth>),
});

const models = [
  { name: "BERT", accuracy: 94, latency: 32, color: "from-primary to-accent", icon: Brain, desc: "Bidirectional encoder for sentiment & classification." },
  { name: "Transformers", accuracy: 91, latency: 28, color: "from-fuchsia-500 to-primary", icon: Sparkles, desc: "Generic transformer for translation & summarization." },
  { name: "spaCy", accuracy: 89, latency: 12, color: "from-cyan-400 to-primary", icon: Cpu, desc: "Industrial NER, POS tagging, dependency parsing." },
  { name: "Custom CNN", accuracy: 96, latency: 18, color: "from-emerald-400 to-cyan-glow", icon: Zap, desc: "In-house CNN for spam & toxicity detection." },
];

const usage = [
  { name: "BERT", value: 38 },
  { name: "Transformers", value: 27 },
  { name: "spaCy", value: 18 },
  { name: "Custom CNN", value: 17 },
];

const COLORS = ["hsl(265 90% 65%)", "hsl(290 90% 65%)", "hsl(195 90% 60%)", "hsl(160 80% 55%)"];

function ModelPage() {
  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center max-w-2xl mx-auto">
            <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">MODEL FLEET</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Four <span className="text-gradient">specialized models</span>, one platform
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">Each task is routed to the best-fit architecture.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {models.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-strong gradient-border rounded-2xl p-6">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4`}>
                  <m.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{m.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Accuracy</span><span className="font-semibold">{m.accuracy}%</span></div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.accuracy}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className={`h-full bg-gradient-to-r ${m.color}`} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Latency</span><span className="font-semibold">{m.latency}ms</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass-strong gradient-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Accuracy comparison</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={models}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis domain={[80, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                    <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                      {models.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="glass-strong gradient-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Inference share</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={usage} dataKey="value" nameKey="name" innerRadius={50} outerRadius={95} paddingAngle={3}>
                      {usage.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
