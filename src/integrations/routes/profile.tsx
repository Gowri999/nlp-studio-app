import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut, Mail, Calendar, MessageSquare, Sparkles, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — NLP Studio" },
      { name: "description", content: "Your account, usage stats and saved history." },
    ],
  }),
  component: () => (<RequireAuth><ProfilePage /></RequireAuth>),
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function ProfilePage() {
  const { user, totalAnalyzed, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const memberSince = new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const clearHistory = () => {
    try { localStorage.removeItem("nlp_studio_count"); } catch {}
    toast.success("History cleared");
    setTimeout(() => location.reload(), 400);
  };

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-strong gradient-border rounded-3xl p-8 mb-6">
            <div className="flex flex-wrap items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-lg opacity-70" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-display font-bold text-primary-foreground">
                  {initials(user.name)}
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <h1 className="text-2xl sm:text-3xl font-display font-bold">{user.name}</h1>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Mail className="w-3.5 h-3.5" /> {user.email}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1"><Calendar className="w-3.5 h-3.5" /> Member since {memberSince}</div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-2xl p-6 gradient-border">
              <MessageSquare className="w-6 h-6 text-accent mb-2" />
              <div className="text-3xl font-display font-bold">{totalAnalyzed.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Texts analyzed (this device)</div>
            </div>
            <div className="glass rounded-2xl p-6 gradient-border">
              <Sparkles className="w-6 h-6 text-accent mb-2" />
              <div className="text-3xl font-display font-bold">13+</div>
              <div className="text-xs text-muted-foreground mt-1">Tools available to you</div>
            </div>
          </div>

          <div className="glass-strong gradient-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Saved history</h3>
              <Button onClick={clearHistory} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            </div>
            {totalAnalyzed === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No analyses yet.</p>
                <Link to="/features" className="inline-block mt-3 text-sm text-accent hover:text-primary">
                  Try a feature →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You've run <span className="text-foreground font-semibold">{totalAnalyzed}</span> analyses on this device. Detailed history (per-text records) coming soon.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
