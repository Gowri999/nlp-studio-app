import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Download, MessageSquare, BarChart3, Sparkles } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — NLP Studio" },
      { name: "description", content: "Live usage analytics: most used features, sentiment trend, language distribution." },
    ],
  }),
  component: () => (<RequireAuth><AnalyticsPage /></RequireAuth>),
});

const featureUsage = [
  { name: "Sentiment", uses: 412 },
  { name: "Spam", uses: 287 },
  { name: "Topic", uses: 198 },
  { name: "Translation", uses: 176 },
  { name: "Summarize", uses: 142 },
  { name: "NER", uses: 118 },
  { name: "Voice", uses: 96 },
];

const sentimentTrend = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  positive: 50 + Math.round(20 * Math.sin(i / 2) + Math.random() * 8),
  negative: 30 + Math.round(10 * Math.cos(i / 2) + Math.random() * 6),
  neutral: 20 + Math.round(5 * Math.sin(i / 3) + Math.random() * 4),
}));

const langs = [
  { name: "English", value: 48 },
  { name: "Spanish", value: 18 },
  { name: "French", value: 12 },
  { name: "German", value: 9 },
  { name: "Hindi", value: 7 },
  { name: "Other", value: 6 },
];

const COLORS = ["hsl(265 90% 65%)", "hsl(290 90% 65%)", "hsl(195 90% 60%)", "hsl(160 80% 55%)", "hsl(40 90% 60%)", "hsl(0 0% 55%)"];

function AnalyticsPage() {
  const { totalAnalyzed } = useAuth();
  const [live, setLive] = useState(totalAnalyzed + 1284);

  useEffect(() => {
    const id = setInterval(() => setLive((n) => n + Math.floor(Math.random() * 3)), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { setLive(totalAnalyzed + 1284); }, [totalAnalyzed]);

  const exportReport = () => {
    const csv = [
      "metric,value",
      `total_texts,${live}`,
      `your_session,${totalAnalyzed}`,
      ...featureUsage.map(f => `${f.name},${f.uses}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `nlp-studio-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  const stats = [
    { icon: MessageSquare, label: "Texts analyzed (live)", value: live.toLocaleString() },
    { icon: Sparkles, label: "Your session", value: totalAnalyzed.toLocaleString() },
    { icon: BarChart3, label: "Avg confidence", value: "94.2%" },
    { icon: Activity, label: "Active models", value: "4" },
  ];

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">ANALYTICS</div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Live <span className="text-gradient">platform pulse</span>
              </h1>
            </motion.div>
            <Button onClick={exportReport} className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
              <Download className="w-4 h-4" /> Export report
            </Button>
          </div>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 gradient-border">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3">
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-2xl font-display font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </section>

          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            <div className="glass-strong gradient-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Most used features</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureUsage}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                    <Bar dataKey="uses" fill="hsl(265 90% 65%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-strong gradient-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Language distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={langs} dataKey="value" nameKey="name" innerRadius={50} outerRadius={95} paddingAngle={3}>
                      {langs.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-strong gradient-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Sentiment trend (last 14 days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sentimentTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                  <Line type="monotone" dataKey="positive" stroke="hsl(160 80% 55%)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="neutral" stroke="hsl(195 90% 60%)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="negative" stroke="hsl(340 80% 60%)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
