import { TrendingUp, AlertTriangle, XCircle, Clock, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useSentinelStore } from "../store";

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function KPICard({ label, value, sub, icon, color, delay }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-card border border-border rounded p-4 flex flex-col gap-2 min-w-0"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-display font-bold tracking-tight ${color}`}>{value}</span>
        {sub && <span className="text-xs text-muted-foreground mb-1 font-mono">{sub}</span>}
      </div>
    </motion.div>
  );
}

export function CarteKPI() {
  const { kpi } = useSentinelStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 shrink-0">
      <KPICard
        label="Transactions / min"
        value={kpi.transactions_par_min}
        sub="tx/min"
        icon={<Zap size={14} strokeWidth={1.5} />}
        color="text-teal-400"
        delay={0}
      />
      <KPICard
        label="Total aujourd'hui"
        value={kpi.total_transactions.toLocaleString("fr-FR")}
        sub={`↑ ${kpi.approuves.toLocaleString()} approuvés`}
        icon={<TrendingUp size={14} strokeWidth={1.5} />}
        color="text-foreground"
        delay={0.05}
      />
      <KPICard
        label="Signalées"
        value={kpi.signales}
        sub="en attente"
        icon={<AlertTriangle size={14} strokeWidth={1.5} />}
        color="text-amber-400"
        delay={0.1}
      />
      <KPICard
        label="Bloquées"
        value={kpi.bloques}
        sub={`${((kpi.bloques / Math.max(1, kpi.total_transactions)) * 100).toFixed(2)}% du flux`}
        icon={<XCircle size={14} strokeWidth={1.5} />}
        color="text-red-400"
        delay={0.15}
      />
      <KPICard
        label="Latence médiane"
        value={`${kpi.delai_moyen_ms}ms`}
        sub="pipeline end-to-end"
        icon={<Clock size={14} strokeWidth={1.5} />}
        color="text-primary"
        delay={0.2}
      />
    </div>
  );
}
