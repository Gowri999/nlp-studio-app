import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

const models = [
  { name: "BERT", desc: "Bidirectional transformer for deep contextual understanding.", accuracy: 96, speed: 78, useCase: "Sentiment & QA" },
  { name: "LSTM", desc: "Recurrent network excelling at sequence and time-series text.", accuracy: 89, speed: 70, useCase: "Sequence labelling" },
  { name: "Naive Bayes", desc: "Lightning-fast probabilistic baseline for spam & topic.", accuracy: 81, speed: 98, useCase: "Spam filtering" },
  { name: "Logistic Regression", desc: "Interpretable linear classifier — perfect for prod.", accuracy: 84, speed: 95, useCase: "Binary classification" },
  { name: "Transformer NLP", desc: "Self-attention powerhouse for state-of-the-art tasks.", accuracy: 97, speed: 72, useCase: "Universal NLP" },
];

export function Models() {
  return (
    <section id="models" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
            AI MODELS
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            A model for <span className="text-gradient">every use-case</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -8 }}
              className="group relative gradient-border p-6 rounded-2xl overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-purple-glow/0 group-hover:bg-purple-glow/30 blur-3xl transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-purple">
                    <Cpu className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground glass px-2 py-1 rounded-md">{m.useCase}</span>
                </div>
                <h3 className="text-xl font-bold font-display mb-1">{m.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{m.desc}</p>

                {[
                  { label: "Accuracy", value: m.accuracy },
                  { label: "Speed", value: m.speed },
                ].map((b) => (
                  <div key={b.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="font-semibold">{b.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${b.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
