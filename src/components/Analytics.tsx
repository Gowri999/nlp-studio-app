import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Activity, Database, Target, Zap } from "lucide-react";

const activity = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}h`,
  v: 40 + Math.round(Math.sin(i / 2) * 20 + Math.random() * 25),
}));

const modelPerf = [
  { name: "BERT", acc: 96 },
  { name: "LSTM", acc: 89 },
  { name: "Transformer", acc: 97 },
  { name: "NaiveBayes", acc: 81 },
  { name: "LogReg", acc: 84 },
];

const distribution = [
  { name: "Positive", value: 42 },
  { name: "Neutral", value: 31 },
  { name: "Negative", value: 18 },
  { name: "Spam", value: 9 },
];

const COLORS = ["oklch(0.7 0.22 295)", "oklch(0.78 0.18 210)", "oklch(0.65 0.25 330)", "oklch(0.8 0.18 180)"];

const stats = [
  { icon: Target, label: "Accuracy", value: "98.4%", change: "+1.2%" },
  { icon: Zap, label: "Avg Latency", value: "25ms", change: "-3ms" },
  { icon: Database, label: "Datasets", value: "1.2M", change: "+12k" },
  { icon: Activity, label: "Active Calls/s", value: "8.4k", change: "+22%" },
];

export function Analytics() {
  return (
    <section id="analytics" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
            ANALYTICS
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Insights, <span className="text-gradient">visualized</span>
          </h2>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="gradient-border p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-xs text-emerald-400 font-medium">{s.change}</span>
              </div>
              <div className="text-2xl font-bold font-display">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 gradient-border p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Real-time Activity</h3>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.22 295)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="t" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.04 275 / 0.9)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 12,
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.2 280)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gradient-border p-6 rounded-2xl"
          >
            <h3 className="font-semibold mb-4">Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={distribution} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.04 275 / 0.9)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {distribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 gradient-border p-6 rounded-2xl"
          >
            <h3 className="font-semibold mb-4">Model Performance</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={modelPerf}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.18 210)" />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 295)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.04 275 / 0.9)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 12,
                  }}
                  cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
                />
                <Bar dataKey="acc" fill="url(#g2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
