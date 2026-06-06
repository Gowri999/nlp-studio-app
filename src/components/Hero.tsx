import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Particles } from "./Particles";
import { useAuth } from "@/lib/auth";

export function Hero() {
  const { user } = useAuth();
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <Particles count={40} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-purple-glow/30 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full bg-cyan-glow/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">
                Powered by next-gen NLP transformers
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Transform Text Into{" "}
              <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple-glow">
                Intelligent Insights
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              AI-powered NLP and Text Classification platform for sentiment analysis, spam detection,
              topic prediction, and smart language understanding.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="group bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-8 h-14 rounded-xl glow-purple hover:scale-105 transition-transform"
              >
                <Link to="/demo">
                  <Play className="w-4 h-4 mr-2" />
                  Try Demo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="glass border-white/10 hover:bg-white/5 h-14 rounded-xl px-8"
              >
                <Link to={user ? "/features" : "/login"}>
                  {user ? "Open Features" : (<><Lock className="w-4 h-4 mr-2" /> Login to Unlock All Features</>)}
                </Link>
              </Button>
            </div>

            {user && (
              <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
                <div>
                  <div className="text-2xl font-bold text-foreground font-display">98.4%</div>
                  <div>Accuracy</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-foreground font-display">12M+</div>
                  <div>Texts processed</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-foreground font-display">25ms</div>
                  <div>Latency</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* AI Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[500px] hidden lg:block"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Concentric rings */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-primary/20"
                  style={{ width: 180 + i * 90, height: 180 + i * 90 }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent glow-purple"
                    style={{ top: -6, left: "50%", transform: "translateX(-50%)" }}
                  />
                </motion.div>
              ))}

              {/* Core */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary via-accent to-purple-glow glow-purple flex items-center justify-center animate-pulse-glow"
              >
                <div className="absolute inset-2 rounded-full glass-strong flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-foreground" />
                </div>
              </motion.div>

              {/* Floating tags */}
              {[
                { label: "Sentiment", x: -160, y: -120, delay: 0 },
                { label: "Spam", x: 180, y: -80, delay: 0.5 },
                { label: "Topic", x: 200, y: 100, delay: 1 },
                { label: "Emotion", x: -180, y: 140, delay: 1.5 },
                { label: "Language", x: 0, y: -200, delay: 2 },
              ].map((t) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [t.y, t.y - 10, t.y] }}
                  transition={{ delay: t.delay, duration: 4, repeat: Infinity }}
                  className="absolute glass px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
                >
                  {t.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
