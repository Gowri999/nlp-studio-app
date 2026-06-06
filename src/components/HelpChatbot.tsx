import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Msg = { role: "bot" | "user"; text: string; ts: number };

const QUICK = ["How to start?", "Features", "Pricing", "Contact"] as const;

function botReply(input: string): string {
  const q = input.toLowerCase().trim();
  if (!q) return "Ask me anything about NLP Studio!";
  if (/(start|begin|how.*use|getting started|onboard)/.test(q))
    return "👋 Easy! Click **Try Demo** on the home page to test Sentiment & Language Detection — no login needed. To unlock all 13 tools, click **Sign Up**, then head to **Features**.";
  if (/(feature|tool|what.*do|capabilit)/.test(q))
    return "🧠 NLP Studio includes 13 tools: Sentiment, Spam, Topic, Language Detection, Keyword Extraction, Emotion, NER, Summarization, Translation, Hate Speech, Real-time Predictions, AI Insights, and Voice Reader. Open **Features** to try them.";
  if (/(price|pricing|cost|free|paid|plan)/.test(q))
    return "💸 Completely free during beta. The Demo on the home page is open to everyone. Login unlocks the full toolkit at no cost.";
  if (/(login|sign in|sign up|account|register|forgot|password)/.test(q))
    return "🔐 Click **Login** in the navbar (top-right). New here? Use **Sign Up**. Forgot your password? There's a reset link on the login page.";
  if (/(voice|speech|read aloud|tts|listen)/.test(q))
    return "🔊 Every tool has a 🔊 listen button. The **Voice Reader** page also lets you adjust speed, pitch, volume, and voice — even auto-matches translations to the target language.";
  if (/(contact|support|email|help|reach)/.test(q))
    return "📬 Visit the **Contact** page to send a message, or check the FAQ section there for instant answers.";
  if (/(translat)/.test(q))
    return "🌐 The Translation tool supports 12+ languages with auto voice playback in the target language. Find it on the Features page.";
  if (/(api|integrat|webhook|sdk)/.test(q))
    return "⚙️ A public API is on the roadmap. For now, all tools run inside the app with sub-50ms inference.";
  if (/(hi|hello|hey|yo|sup)/.test(q))
    return "Hey! 👋 I'm your NLP Studio guide. Ask about features, login, pricing, or how to start.";
  if (/(thank|thx|cheers)/.test(q))
    return "Anytime! 💜 Happy analyzing.";
  return "I can help with **features**, **how to start**, **pricing**, **login**, or **contact**. Try one of the quick replies below 👇";
}

export function HelpChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! I'm **Nova** 🤖 — your NLP Studio assistant. How can I help today?",
      ts: Date.now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { role: "user", text: t, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "bot", text: botReply(t), ts: Date.now() }]);
      setTyping(false);
    }, 600 + Math.random() * 500);
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open help chat"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg glow-purple flex items-center justify-center hover:scale-110 transition-transform"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-glow animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-3 sm:right-5 z-[60] w-[calc(100vw-1.5rem)] sm:w-[380px] h-[560px] max-h-[80vh] glass-strong rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  Nova <Sparkles className="w-3 h-3 text-accent" />
                </div>
                <div className="text-[11px] text-muted-foreground">AI help · always online</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-sm"
                        : "glass border border-white/10 text-foreground rounded-bl-sm"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-accent">$1</strong>'),
                    }}
                  />
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full glass border border-white/10 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="glass border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick replies */}
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full glass border border-white/10 hover:border-accent/50 hover:text-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 border-t border-white/10 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60 placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-0 h-9 w-9 rounded-xl"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
