import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/components/AuthForms";
import { CursorGlow } from "@/components/CursorGlow";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — NLP Studio" },
      { name: "description", content: "Request a password reset link for your NLP Studio account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent", { description: "Check your inbox (demo only)." });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <CursorGlow />
      <div className="absolute inset-0 grid-bg" />
      <motion.div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl animate-float" />
      <motion.div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <Link to="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>

      <AuthCard>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-purple">
              <KeyRound className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold">Forgot your <span className="text-gradient">password?</span></h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset it. This is a UI placeholder — the reset flow will be wired up later.
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground mt-1">
                  If an account exists for <span className="text-foreground">{email}</span>, you'll receive reset instructions shortly.
                </p>
              </div>
              <Button variant="outline" className="mt-2 bg-white/5 border-white/10" onClick={() => { setSent(false); setEmail(""); }}>
                Send another link
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pl-9 h-11 bg-white/5 border-white/10 focus-visible:ring-primary/60"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-purple"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send reset link"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link to="/login" className="text-primary hover:text-accent">Sign in</Link>
          </p>
        </motion.div>
      </AuthCard>
    </div>
  );
}
