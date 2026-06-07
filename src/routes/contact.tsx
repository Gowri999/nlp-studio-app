import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Send, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — NLP Studio" },
      { name: "description", content: "Get in touch with the NLP Studio team — sales, support, partnerships." },
    ],
  }),
  component: ContactPage,
});

const FAQ = [
  { q: "Is there a free plan?", a: "Yes — the Demo page offers free Sentiment Analysis and 5 Language Detection runs per day. Sign up to unlock all 13+ tools." },
  { q: "Which languages do you support?", a: "Translation supports 12+ languages and detection covers 50+. Voice playback uses your device's installed TTS voices." },
  { q: "Can I export results?", a: "Yes — every tool supports Copy, Download (TXT/JSON) and a Listen button to read results aloud." },
  { q: "How accurate are the models?", a: "Our flagship classifiers benchmark at 94–98% on standard datasets. See the Model page for per-model accuracy." },
  { q: "Is my data stored?", a: "All analysis runs in your session. Nothing is persisted to a server in this build." },
];

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Message sent!", { description: "We'll get back within 24h." });
    }, 900);
  };

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">CONTACT</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Let's <span className="text-gradient">talk</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">Sales, support, partnerships — we read every message.</p>
          </motion.div>

          <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 mb-16">
            <div className="space-y-4">
              <div className="glass-strong gradient-border rounded-2xl p-5">
                <Mail className="w-5 h-5 text-accent mb-2" />
                <div className="font-medium">Email</div>
                <a href="mailto:hello@nlpstudio.ai" className="text-sm text-muted-foreground hover:text-accent">hello@nlpstudio.ai</a>
              </div>
              <div className="glass-strong gradient-border rounded-2xl p-5">
                <MessageSquare className="w-5 h-5 text-accent mb-2" />
                <div className="font-medium">Live chat</div>
                <p className="text-sm text-muted-foreground">Mon–Fri · 9am–6pm UTC</p>
              </div>
            </div>

            <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong gradient-border rounded-2xl p-6 space-y-4">
              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10 h-11" />
              <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 h-11" />
              <Textarea placeholder="How can we help?" value={msg} onChange={(e) => setMsg(e.target.value)} className="bg-white/5 border-white/10 min-h-[140px]" />
              <Button type="submit" disabled={loading || sent}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 glow-purple">
                {sent ? <><CheckCircle2 className="w-4 h-4" /> Sent</> : loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send message</>}
              </Button>
            </motion.form>
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently asked</h2>
            <div className="space-y-3 max-w-3xl mx-auto">
              {FAQ.map((f, i) => {
                const open = openIdx === i;
                return (
                  <div key={i} className="glass rounded-xl overflow-hidden">
                    <button onClick={() => setOpenIdx(open ? null : i)} className="w-full flex items-center justify-between gap-4 p-4 text-left">
                      <span className="font-medium">{f.q}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                          {f.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
