import { motion } from "motion/react";
import { useSentinelStore } from "../store";
import type { Agent } from "../types";
import { cn } from "../lib/utils";

function AgentStatusDot({ status }: { status: Agent["statut"] }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-teal-400",
    IDLE: "bg-amber-400",
    ERROR: "bg-red-400",
    OFFLINE: "bg-muted-foreground",
  };
  return (
    <span className={cn("w-2 h-2 rounded-full shrink-0", colors[status], status === "ACTIVE" && "agent-pulse")} />
  );
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-1.5 p-3 rounded border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-2">
        <AgentStatusDot status={agent.statut} />
        <span className="text-[11px] font-display font-semibold text-foreground truncate">{agent.nom}</span>
        <span className={cn(
          "ml-auto text-[9px] font-mono font-semibold tracking-widest px-1.5 py-0.5 rounded-sm border",
          agent.statut === "ACTIVE" ? "text-teal-400 border-teal-500/30 bg-teal-500/10" :
          agent.statut === "IDLE" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
          agent.statut === "ERROR" ? "text-red-400 border-red-500/30 bg-red-500/10" :
          "text-muted-foreground border-border bg-muted"
        )}>
          {agent.statut}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground font-mono leading-relaxed truncate">{agent.tache_courante}</p>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-[9px] font-mono text-muted-foreground">
          <span className="text-foreground font-semibold">{agent.messages_traites.toLocaleString()}</span> msgs
        </span>
        <span className="text-[9px] font-mono text-muted-foreground">
          <span className="text-foreground font-semibold">{agent.latence_ms}ms</span> latency
        </span>
      </div>
    </motion.div>
  );
}

export function PanneauAgents() {
  const { agents } = useSentinelStore();
  const activeCount = agents.filter(a => a.statut === "ACTIVE").length;

  return (
    <div className="flex flex-col h-full min-h-0 bg-card border border-border rounded overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground">Agent Network Status</span>
        <span className="text-[10px] font-mono text-teal-400">{activeCount}/6 ACTIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-2 flex flex-col gap-1.5">
        {agents.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i} />
        ))}
        <div className="mt-2 p-2 rounded border border-border/50 bg-muted/10">
          <div className="text-[9px] font-mono text-muted-foreground mb-1 tracking-widest uppercase">FIPA-ACL Protocol</div>
          <div className="flex flex-wrap gap-1">
            {["REQUEST", "INFORM", "PROPOSE", "ACCEPT", "REJECT"].map(p => (
              <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 bg-muted/40 border border-border rounded-sm text-muted-foreground">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
