import { motion } from "framer-motion";
import { Upload, Cog, Layers, Brain, BarChart3 } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload Text", desc: "Paste, upload, or stream text from any source." },
  { icon: Cog, title: "NLP Processing", desc: "Tokenization, lemmatization, and cleaning pipelines." },
  { icon: Layers, title: "Feature Extraction", desc: "Embeddings, TF-IDF, and contextual vectors." },
  { icon: Brain, title: "AI Classification", desc: "Run through our ensemble of trained models." },
  { icon: BarChart3, title: "Result Visualization", desc: "Beautiful, actionable insights in real-time." },
];

export function Workflow() {
  return (
    <section id="about" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
            WORKFLOW
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            From raw text to <span className="text-gradient">decisions</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line for mobile, horizontal for desktop */}
          <div className="hidden lg:block absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-4 relative">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="relative w-14 h-14 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-md opacity-60" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold font-display glow-purple">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full glass-strong text-xs flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
