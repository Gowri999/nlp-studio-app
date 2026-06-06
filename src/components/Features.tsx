import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Heart, Shield, Tag, Globe, Search, Brain, Smile, Zap,
  FileText, Users, Languages, AlertTriangle, Volume2,
} from "lucide-react";

export const featureList = [
  { slug: "sentiment-analysis", icon: Heart, title: "Sentiment Analysis", desc: "Detect positive, negative, and neutral tones with industry-leading precision." },
  { slug: "spam-detection", icon: Shield, title: "Spam Detection", desc: "Filter unwanted content using advanced ML classifiers trained on millions of samples." },
  { slug: "topic-classification", icon: Tag, title: "Topic Classification", desc: "Auto-categorize text into politics, tech, sports, business, and more." },
  { slug: "language-detection", icon: Globe, title: "Language Detection", desc: "Recognize 100+ languages instantly with confidence scoring." },
  { slug: "keyword-extraction", icon: Search, title: "Keyword Extraction", desc: "Surface the most meaningful terms and entities from any document." },
  { slug: "ai-text-insights", icon: Brain, title: "AI Text Insights", desc: "Deep semantic understanding powered by transformer architectures." },
  { slug: "emotion-recognition", icon: Smile, title: "Emotion Recognition", desc: "Identify joy, anger, fear, sadness, and surprise from raw text." },
  { slug: "real-time-predictions", icon: Zap, title: "Real-time Predictions", desc: "Sub-50ms inference for live chat, comments, and stream processing." },
  { slug: "text-summarization", icon: FileText, title: "Text Summarization", desc: "Condense long articles, essays, and documents into crisp summaries." },
  { slug: "named-entity-recognition", icon: Users, title: "Named Entity Recognition", desc: "Extract people, organizations, locations, dates, and money from text." },
  { slug: "language-translation", icon: Languages, title: "Language Translation", desc: "Translate between 12+ languages with auto-detect and instant swap." },
  { slug: "hate-speech-detection", icon: AlertTriangle, title: "Hate Speech Detection", desc: "Score toxicity, threats, insults, and identity hate in real time." },
  { slug: "voice-reader", icon: Volume2, title: "Voice Reader", desc: "Read any text aloud with karaoke-style highlighting, voices, speed and pitch control." },
] as const;

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
            CAPABILITIES
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Everything you need to <span className="text-gradient">understand text</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A complete suite of NLP models, beautifully unified under one platform.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureList.map((f, i) => (
            <motion.div
              key={f.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <Link
                to={`/${f.slug}` as any}
                className="group relative gradient-border p-6 rounded-2xl overflow-hidden block h-full cursor-pointer"
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/0 group-hover:bg-primary/20 blur-3xl transition-all duration-500" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open tool →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
