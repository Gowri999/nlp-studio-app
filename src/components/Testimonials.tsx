import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Aisha Khan",
    role: "NLP Researcher · MIT",
    text: "NLP Studio has shifted our entire research pipeline. The accuracy on niche datasets is genuinely state-of-the-art.",
    initials: "AK",
  },
  {
    name: "Marcus Chen",
    role: "Lead Data Scientist · Stripe",
    text: "We replaced three internal models with one platform. Latency is incredible and the dashboards are gorgeous.",
    initials: "MC",
  },
  {
    name: "Sofia Rodriguez",
    role: "ML Engineer · Spotify",
    text: "Sentiment analysis on millions of reviews — done in real time. The DX is best in class.",
    initials: "SR",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
            TESTIMONIALS
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Loved by <span className="text-gradient">researchers and teams</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="gradient-border p-6 rounded-2xl relative"
            >
              <Quote className="w-8 h-8 text-primary/40 mb-3" />
              <p className="text-foreground/90 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground glow-purple">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
