import { Brain, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer id="contact" className="relative pt-24 pb-10 mt-10 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="gradient-border p-8 lg:p-12 rounded-3xl mb-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-glow/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-cyan-glow/20 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Stay ahead of the <span className="text-gradient">NLP curve</span>
              </h3>
              <p className="text-muted-foreground mt-3">
                Get research updates, new models, and product news. No spam, ever.
              </p>
            </div>
            <form className="flex gap-2 w-full">
              <Input
                type="email"
                placeholder="you@example.com"
                className="bg-background/50 border-white/10 h-12 rounded-xl"
              />
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 h-12 px-6 rounded-xl glow-purple">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <a href="#home" className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">
                NLP<span className="text-gradient"> Studio</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The futuristic NLP and text classification platform built for researchers, builders, and dreamers.
            </p>
            <div className="flex gap-2 mt-5">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-white/10 hover:text-accent transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Features", "Demo", "Models", "Analytics", "Pricing"] },
            { title: "Resources", links: ["Documentation", "API Reference", "Research Papers", "Tutorials", "Blog"] },
            { title: "Company", links: ["About", "Careers", "Contact", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 NLP Studio. Crafted with care for AI-native teams.</p>
          <p>contact@nlpstudio.ai · San Francisco, CA</p>
        </div>
      </div>
    </footer>
  );
}
