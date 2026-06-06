import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type User = { id: string; name: string; email: string; createdAt: string };

type AuthCtx = {
  user: User | null;
  ready: boolean;
  totalAnalyzed: number;
  bumpAnalyzed: (n?: number) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const COUNT_KEY_PREFIX = "nlp_studio_count_";

function toUser(session: Session | null): User | null {
  if (!session?.user) return null;
  const u = session.user;
  const name =
    (u.user_metadata?.name as string | undefined) ||
    (u.email ? u.email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim() : "User") ||
    "User";
  return {
    id: u.id,
    email: u.email || "",
    name,
    createdAt: u.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);

  useEffect(() => {
    // Listener FIRST, then read existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session));
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load per-user counter when user changes
  useEffect(() => {
    if (!user) { setTotalAnalyzed(0); return; }
    try {
      const c = Number(localStorage.getItem(COUNT_KEY_PREFIX + user.id) || "0");
      setTotalAnalyzed(Number.isNaN(c) ? 0 : c);
    } catch {}
  }, [user]);

  const bumpAnalyzed = useCallback((n = 1) => {
    setTotalAnalyzed((prev) => {
      const next = prev + n;
      try {
        if (user) localStorage.setItem(COUNT_KEY_PREFIX + user.id, String(next));
      } catch {}
      return next;
    });
  }, [user]);

  const login: AuthCtx["login"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register: AuthCtx["register"] = async (name, email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/features` : undefined,
      },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, ready, totalAnalyzed, bumpAnalyzed, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
