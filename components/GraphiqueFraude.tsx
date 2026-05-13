import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useSentinelStore } from "../store";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded p-3 shadow-lg">
        <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}:</span>
            <span className="text-foreground font-semibold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function GraphiqueFraude() {
  const { timeline } = useSentinelStore();

  return (
    <div className="flex flex-col h-full min-h-0 bg-card border border-border rounded overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground">Fraud Activity — 24H</span>
        <div className="flex items-center gap-4">
          {[
            { label: "APPROUVÉ", color: "bg-teal-400" },
            { label: "SIGNALÉ", color: "bg-amber-400" },
            { label: "BLOQUÉ", color: "bg-red-400" },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApprouves" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ECFB0" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ECFB0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSignales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBloques" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#E53E3E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="heure"
              tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fill: "oklch(55% 0.02 220)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(20% 0.02 230)" }}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fill: "oklch(55% 0.02 220)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="approuves" name="approuvés" stroke="#0ECFB0" strokeWidth={1.5} fill="url(#colorApprouves)" />
            <Area type="monotone" dataKey="signales" name="signalés" stroke="#F59E0B" strokeWidth={1.5} fill="url(#colorSignales)" />
            <Area type="monotone" dataKey="bloques" name="bloqués" stroke="#E53E3E" strokeWidth={1.5} fill="url(#colorBloques)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
