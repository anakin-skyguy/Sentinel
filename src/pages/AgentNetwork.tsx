import { motion } from "motion/react";
import { useSentinelStore } from "../store";
import { cn } from "../lib/utils";

const AGENT_DETAILS = {
  coordinateur: { desc: "Démarre le système JADE, surveille la santé de tous les agents, redémarre les agents défaillants.", performatives: ["REQUEST", "INFORM"] },
  surveillance: { desc: "Reçoit les transactions du flux, les normalise, les sauvegarde en base PostgreSQL, puis les transfère à AnalyseML.", performatives: ["INFORM", "REQUEST"] },
  analyseml: { desc: "Appelle l'endpoint /predict de l'API Flask Python. Reçoit les scores XGBoost et Isolation Forest, calcule le score ML combiné.", performatives: ["REQUEST", "INFORM"] },
  evaluateurrisque: { desc: "Applique les 3 règles métier (R1: montant, R2: fréquence, R3: horaire) et calcule le score final avec les bonus.", performatives: ["PROPOSE", "INFORM"] },
  banque: { desc: "Prend la décision finale BLOCK/FLAG/APPROVE selon les seuils de score. Envoie ACCEPT_PROPOSAL ou REJECT_PROPOSAL.", performatives: ["ACCEPT_PROPOSAL", "REJECT_PROPOSAL"] },
  audit: { desc: "Enregistre chaque message ACL échangé entre les agents pour constituer la piste d'audit complète.", performatives: ["INFORM"] },
};

const FLOW = [
  { from: "surveillance", to: "analyseml", label: "INFORM (tx data)" },
  { from: "analyseml", to: "evaluateurrisque", label: "INFORM (ML scores)" },
  { from: "evaluateurrisque", to: "banque", label: "PROPOSE (final score)" },
  { from: "banque", to: "audit", label: "INFORM (decision)" },
  { from: "coordinateur", to: "surveillance", label: "REQUEST (health)" },
];

export function AgentNetwork() {
  const { agents } = useSentinelStore();

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-2 overflow-y-auto">
      <div className="shrink-0">
        <h2 className="text-sm font-display font-bold text-foreground tracking-tight">Agent Network</h2>
        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">JADE 4.6 — Java 17 — FIPA-ACL Protocol</p>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        {agents.map((agent, i) => {
          const details = AGENT_DETAILS[agent.id as keyof typeof AGENT_DETAILS];
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  agent.statut === "ACTIVE" ? "bg-teal-400 agent-pulse" : "bg-muted-foreground"
                )} />
                <span className="text-sm font-display font-bold text-foreground">{agent.nom}</span>
                <span className={cn(
                  "ml-auto text-[9px] font-mono font-semibold tracking-widest px-1.5 py-0.5 rounded-sm border",
                  agent.statut === "ACTIVE" ? "text-teal-400 border-teal-500/30 bg-teal-500/10" : "text-muted-foreground border-border"
                )}>
                  {agent.statut}
                </span>
              </div>
              <p className="text-[11px] font-sans text-muted-foreground leading-relaxed">{details?.desc}</p>
              <div className="flex flex-wrap gap-1">
                {details?.performatives.map(p => (
                  <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-sm">{p}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div>
                  <div className="text-[9px] font-mono text-muted-foreground">Messages traités</div>
                  <div className="text-sm font-mono font-bold text-foreground">{agent.messages_traites.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-muted-foreground">Latence</div>
                  <div className="text-sm font-mono font-bold text-teal-400">{agent.latence_ms}ms</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ACL Message flow */}
      <div className="bg-card border border-border rounded p-4 shrink-0">
        <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">FIPA-ACL Message Flow</div>
        <div className="flex flex-col gap-2">
          {FLOW.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 text-[11px] font-mono"
            >
              <span className="text-foreground font-semibold w-36 shrink-0">{f.from}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground font-semibold w-36 shrink-0">{f.to}</span>
              <span className="text-primary text-[10px] px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-sm">{f.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
