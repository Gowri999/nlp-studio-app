import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AuthCard, LoginForm, RegisterForm } from "@/components/AuthForms";
import { useAuth } from "@/lib/auth";
import { CursorGlow } from "@/components/CursorGlow";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — NLP Studio" },
      { name: "description", content: "Sign in to your NLP Studio account to access AI-powered text classification." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate({ to: "/features" }); }, [user, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <CursorGlow />
      <div className="absolute inset-0 grid-bg" />
      <motion.div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl animate-float" />
      <motion.div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>

      <AuthCard>
        {mode === "login"
          ? <LoginForm onSwitch={() => setMode("register")} />
          : <RegisterForm onSwitch={() => setMode("login")} />}
      </AuthCard>
    </div>
  );
}
