import { motion } from "motion/react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

const METRICS = [
  { label: "ROC-AUC", value: 0.96, color: "#0ECFB0" },
  { label: "Recall", value: 0.857, color: "#F59E0B" },
  { label: "Precision", value: 0.848, color: "#0ECFB0" },
  { label: "F1 Score", value: 0.853, color: "#0ECFB0" },
];

const CONFUSION = [
  { name: "Vrais Négatifs", value: 2761, color: "#0ECFB0" },
  { name: "Faux Positifs", value: 100, color: "#F59E0B" },
  { name: "Faux Négatifs", value: 18, color: "#F59E0B" },
  { name: "Vrais Positifs", value: 121, color: "#0ECFB0" },
];

const RADAR_DATA = [
  { metric: "AUC", xgb: 96, isolation: 78 },
  { metric: "Recall", xgb: 85.7, isolation: 72 },
  { metric: "Precision", xgb: 84.8, isolation: 68 },
  { metric: "F1", xgb: 85.3, isolation: 70 },
  { metric: "Speed", xgb: 75, isolation: 95 },
  { metric: "Novelty", xgb: 40, isolation: 90 },
];

export function ModelPerformance() {
  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-2 overflow-y-auto">
      <div className="shrink-0">
        <h2 className="text-sm font-display font-bold text-foreground tracking-tight">Model Performance</h2>
        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">XGBoost + Isolation Forest — Kaggle Credit Card Fraud Dataset (284,807 transactions)</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded p-4"
          >
            <div className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase mb-2">{m.label}</div>
            <div className="text-3xl font-display font-bold text-teal-400">{(m.value * 100).toFixed(1)}%</div>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.value * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                className="h-full bg-teal-400 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        {/* Radar comparison */}
        <div className="bg-card border border-border rounded p-4 flex flex-col">
          <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">Model Comparison</div>
          <div className="flex-1 min-h-0" style={{ minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="oklch(20% 0.02 230)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fill: "oklch(55% 0.02 220)" }} />
                <Radar name="XGBoost" dataKey="xgb" stroke="#0ECFB0" fill="#0ECFB0" fillOpacity={0.15} strokeWidth={1.5} />
                <Radar name="Isolation Forest" dataKey="isolation" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-teal-400" /> XGBoost
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Isolation Forest
            </span>
          </div>
        </div>

        {/* Confusion matrix */}
        <div className="bg-card border border-border rounded p-4 flex flex-col">
          <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">Confusion Matrix (3,000 transactions)</div>
          <div className="flex-1 min-h-0" style={{ minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONFUSION} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fill: "oklch(55% 0.02 220)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fill: "oklch(55% 0.02 220)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(13% 0.018 230)", border: "1px solid oklch(20% 0.02 230)", borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 11 }}
                  labelStyle={{ color: "oklch(55% 0.02 220)", fontSize: 10 }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {CONFUSION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model details */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div className="bg-card border border-border rounded p-4">
          <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">XGBoost Configuration</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Estimators", "300"], ["Max Depth", "6"], ["scale_pos_weight", "auto"],
              ["Rebalancing", "SMOTE 1:10"], ["Dataset", "284,807 tx"], ["Frauds", "492 (0.17%)"]
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="text-[9px] font-mono text-muted-foreground">{k}</span>
                <span className="text-[11px] font-mono text-foreground font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded p-4">
          <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">Isolation Forest Configuration</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Estimators", "200"], ["Contamination", "0.002"], ["Type", "Unsupervised"],
              ["Use case", "Novelty detection"], ["Saved as", "if.pkl"], ["Library", "scikit-learn 1.5"]
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="text-[9px] font-mono text-muted-foreground">{k}</span>
                <span className="text-[11px] font-mono text-foreground font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
