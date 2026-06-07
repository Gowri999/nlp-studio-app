import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AuthCard, RegisterForm } from "@/components/AuthForms";
import { useAuth } from "@/lib/auth";
import { CursorGlow } from "@/components/CursorGlow";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — NLP Studio" },
      { name: "description", content: "Create your free NLP Studio account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate({ to: "/features" }); }, [user, navigate]);
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <CursorGlow />
      <div className="absolute inset-0 grid-bg" />
      <motion.div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl animate-float" />
      <motion.div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>
      <AuthCard>
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
