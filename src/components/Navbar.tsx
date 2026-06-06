import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/demo", label: "Demo" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const privateLinks = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/demo", label: "Demo" },
  { to: "/image-analyzer", label: "Image Analyzer" },
  { to: "/model", label: "Model" },
  { to: "/analytics", label: "Analytics" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const links = user ? privateLinks : publicLinks;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentPath = router.state.location.pathname;

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-500 ${scrolled ? "glass-strong glow-purple" : "glass"}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 blur-md bg-primary/60 rounded-lg" />
              <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              NLP<span className="text-gradient"> Studio</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = currentPath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to as any}
                  className={`relative px-3 py-2 text-sm transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l.label}
                  {active && <span className="absolute bottom-1 left-3 right-3 h-px bg-gradient-to-r from-primary to-accent" />}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground max-w-[220px]">
                    <UserIcon className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={handleLogout} className="bg-white/5 border-white/10 hover:bg-white/10 gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button className="lg:hidden text-foreground p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mt-2 glass-strong rounded-2xl p-4 flex flex-col gap-1"
          >
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to as any}
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                <Link to="/profile" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2"><UserIcon className="w-4 h-4" /> Profile</Button>
                </Link>
                <Button variant="ghost" onClick={() => { setOpen(false); handleLogout(); }} className="justify-start gap-2"><LogOut className="w-4 h-4" /> Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">Get Started</Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
