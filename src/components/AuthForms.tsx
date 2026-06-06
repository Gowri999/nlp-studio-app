import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

function Field({ icon: Icon, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        {...props}
        className="pl-9 h-11 bg-white/5 border-white/10 focus-visible:ring-primary/60 focus-visible:border-primary/40"
      />
    </div>
  );
}

export function LoginForm({ onSwitch }: { onSwitch?: () => void }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      toast.success("Welcome back!");
      setTimeout(() => navigate({ to: "/features" }), 400);
    } catch (err: any) {
      const msg = err?.message || "Invalid email or password";
      setError(msg);
      toast.error("Login failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-display font-bold">Welcome <span className="text-gradient">back</span></h2>
        <p className="text-sm text-muted-foreground">Sign in to continue to NLP Studio</p>
      </div>

      <Field icon={Mail} type="email" placeholder="you@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} autoComplete="email" />

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type={show ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="pl-9 pr-10 h-11 bg-white/5 border-white/10 focus-visible:ring-primary/60"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-end text-sm">
        <Link to="/forgot-password" className="text-primary hover:text-accent transition-colors">
          Forgot password?
        </Link>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={loading || success}
        className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-purple"
      >
        {success ? <><CheckCircle2 className="w-4 h-4" /> Success</> : loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Login"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        {onSwitch ? (
          <button type="button" onClick={onSwitch} className="text-primary hover:text-accent">Sign Up</button>
        ) : (
          <Link to="/signup" className="text-primary hover:text-accent">Sign Up</Link>
        )}
      </p>
    </motion.form>
  );
}

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export function RegisterForm({ onSwitch }: { onSwitch?: () => void }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const score = useMemo(() => strength(password), [password]);
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["bg-destructive", "bg-destructive", "bg-yellow-500", "bg-cyan-400", "bg-emerald-400"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      const name = email.split("@")[0];
      await register(name, email, password);
      setSuccess(true);
      toast.success("Account created!", { description: "Welcome to NLP Studio" });
      setTimeout(() => navigate({ to: "/features" }), 400);
    } catch (err: any) {
      const msg = err?.message || "Could not create account";
      setError(msg);
      toast.error("Signup failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-display font-bold">Create your <span className="text-gradient">account</span></h2>
        <p className="text-sm text-muted-foreground">Start exploring AI-powered text intelligence</p>
      </div>

      <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} autoComplete="email" />
      <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} autoComplete="new-password" />

      {password && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : "bg-white/10"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Strength: <span className="text-foreground">{labels[Math.max(0, score - 1)]}</span></p>
        </div>
      )}

      <Field icon={Lock} type="password" placeholder="Confirm password" value={confirm} onChange={(e: any) => setConfirm(e.target.value)} autoComplete="new-password" />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button type="submit" disabled={loading || success}
        className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-purple">
        {success ? <><CheckCircle2 className="w-4 h-4" /> Created</> : loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        {onSwitch ? (
          <button type="button" onClick={onSwitch} className="text-primary hover:text-accent">Login</button>
        ) : (
          <Link to="/login" className="text-primary hover:text-accent">Login</Link>
        )}
      </p>
    </motion.form>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-accent/40 rounded-3xl blur-2xl opacity-60" />
      <div className="relative glass-strong rounded-3xl p-6 sm:p-8 gradient-border">
        {children}
      </div>
    </div>
  );
}
