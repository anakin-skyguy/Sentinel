import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, CheckCircle, XCircle, MessageSquare, ShieldCheck, ShieldOff, Search, UserCheck } from "lucide-react";
import { useSentinelStore } from "../store";
import { formatCurrency, formatTime, verdictBg, scoreColor } from "../lib/utils";
import type { Resolution } from "../types";

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
        <span className={`text-[11px] font-mono font-semibold ${color}`}>{value.toFixed(3)}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: value >= 0.35 ? "#E53E3E" : value >= 0.20 ? "#F59E0B" : "#0ECFB0" }}
        />
      </div>
    </div>
  );
}

const RESOLUTION_LABELS: Record<Resolution, { label: string; color: string }> = {
  CONFIRMED_BLOCK: { label: "Block Confirmed", color: "text-red-400" },
  MARKED_SAFE: { label: "Marked Safe", color: "text-teal-400" },
  ESCALATED: { label: "Escalated to Analyst", color: "text-amber-400" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-primary" },
  INVESTIGATING: { label: "Under Investigation", color: "text-purple-400" },
};

export function ModalDetailAlerte() {
  const { selectedTx, setSelectedTx, resolveTransaction } = useSentinelStore();

  const handleResolve = (action: Resolution) => {
    if (!selectedTx) return;
    resolveTransaction(selectedTx.id, action);
  };

  return (
    <AnimatePresence>
      {selectedTx && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedTx(null)}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-0 top-0 bottom-0 w-[480px] bg-card border-l border-border z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between p-4 border-b border-border">
              <div>
                <div className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Transaction Detail</div>
                <div className="text-sm font-mono font-semibold text-foreground">{selectedTx.id}</div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col gap-4">
              {/* Verdict */}
              <div className="flex items-center justify-between p-3 rounded border border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  {selectedTx.verdict === "BLOCK" ? <XCircle size={20} className="text-red-400" /> :
                   selectedTx.verdict === "FLAG" ? <AlertTriangle size={20} className="text-amber-400" /> :
                   <CheckCircle size={20} className="text-teal-400" />}
                  <div>
                    <div className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">Décision finale</div>
                    <span className={`text-base font-display font-bold ${
                      selectedTx.verdict === "BLOCK" ? "text-red-400" :
                      selectedTx.verdict === "FLAG" ? "text-amber-400" : "text-teal-400"
                    }`}>{selectedTx.verdict}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">Score final</div>
                  <span className={`text-2xl font-display font-bold ${scoreColor(selectedTx.score_final)}`}>
                    {selectedTx.score_final.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Transaction info */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Montant", value: formatCurrency(selectedTx.montant) },
                  { label: "Marchand", value: selectedTx.marchand },
                  { label: "Carte", value: `···${selectedTx.carte_fin}` },
                  { label: "Banque", value: selectedTx.banque },
                  { label: "Pays", value: selectedTx.pays },
                  { label: "Horodatage", value: formatTime(selectedTx.horodatage) },
                  { label: "Délai pipeline", value: `${selectedTx.delai_ms}ms` },
                  { label: "Agent décideur", value: selectedTx.agent_decision },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2 rounded border border-border bg-muted/10">
                    <div className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase mb-0.5">{label}</div>
                    <div className="text-[11px] font-mono text-foreground truncate">{value}</div>
                  </div>
                ))}
              </div>

              {/* ML Scores */}
              <div className="p-3 rounded border border-border bg-muted/10 flex flex-col gap-3">
                <div className="text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground">Model Scoring</div>
                <ScoreBar label="XGBoost Score" value={selectedTx.xgb_score} color={scoreColor(selectedTx.xgb_score)} />
                <ScoreBar label="Isolation Forest Score" value={selectedTx.if_score} color={scoreColor(selectedTx.if_score)} />
                <ScoreBar label="Score ML combiné (0.65×XGB + 0.35×IF)" value={selectedTx.score_ml} color={scoreColor(selectedTx.score_ml)} />
                <div className="border-t border-border pt-2">
                  <ScoreBar label="Score Final (+ règles métier)" value={selectedTx.score_final} color={scoreColor(selectedTx.score_final)} />
                </div>
              </div>

              {/* Business rules */}
              <div className="p-3 rounded border border-border bg-muted/10">
                <div className="text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-2">Règles Métier Déclenchées</div>
                {selectedTx.regles_declenchees.length === 0 ? (
                  <span className="text-[11px] font-mono text-muted-foreground">Aucune règle déclenchée</span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {selectedTx.regles_declenchees.map(r => (
                      <div key={r} className="flex items-center gap-2 text-[11px] font-mono">
                        <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                        <span className="text-amber-400">{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FIPA ACL */}
              <div className="p-3 rounded border border-border bg-muted/10">
                <div className="text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare size={10} />
                  FIPA-ACL Message
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground w-20">Performative</span>
                    <span className="text-[10px] font-mono font-semibold text-primary">{selectedTx.performative}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground w-20">Receiver</span>
                    <span className="text-[10px] font-mono text-foreground">{selectedTx.agent_decision}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground w-20">Ontology</span>
                    <span className="text-[10px] font-mono text-foreground">fraud-detection</span>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="p-3 rounded border border-border bg-muted/10">
                <div className="text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-2">Raisonnement Agent</div>
                <p className="text-[11px] font-sans text-muted-foreground leading-relaxed">{selectedTx.raisonnement}</p>
              </div>
            </div>

            {/* Resolution badge */}
            {selectedTx.resolution && (
              <div className="shrink-0 px-4 pb-2">
                <div className="flex items-center gap-2 p-2 rounded border border-border bg-muted/20">
                  <UserCheck size={12} className={RESOLUTION_LABELS[selectedTx.resolution].color} />
                  <span className={`text-[11px] font-mono font-semibold ${RESOLUTION_LABELS[selectedTx.resolution].color}`}>
                    {RESOLUTION_LABELS[selectedTx.resolution].label}
                  </span>
                  {selectedTx.resolved_at && (
                    <span className="ml-auto text-[9px] font-mono text-muted-foreground">
                      {formatTime(selectedTx.resolved_at)} · {selectedTx.resolved_by}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="shrink-0 p-4 border-t border-border flex gap-2">
              {selectedTx.resolution ? (
                <button
                  onClick={() => resolveTransaction(selectedTx.id, selectedTx.resolution!)}
                  disabled
                  className="flex-1 py-2 text-[11px] font-mono font-semibold tracking-wider border border-border text-muted-foreground/50 rounded cursor-not-allowed"
                >
                  RESOLVED
                </button>
              ) : selectedTx.verdict === "BLOCK" ? (
                <>
                  <button
                    onClick={() => handleResolve("CONFIRMED_BLOCK")}
                    className="flex-1 py-2 text-[11px] font-mono font-semibold tracking-wider border border-red-500/30 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldOff size={12} /> CONFIRM BLOCK
                  </button>
                  <button
                    onClick={() => handleResolve("MARKED_SAFE")}
                    className="flex-1 py-2 text-[11px] font-mono font-semibold tracking-wider border border-teal-500/30 text-teal-400 rounded hover:bg-teal-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck size={12} /> MARK SAFE
                  </button>
                </>
              ) : selectedTx.verdict === "FLAG" ? (
                <>
                  <button
                    onClick={() => handleResolve("ESCALATED")}
                    className="flex-1 py-2 text-[11px] font-mono font-semibold tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded hover:bg-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck size={12} /> ESCALATE
                  </button>
                  <button
                    onClick={() => handleResolve("MARKED_SAFE")}
                    className="flex-1 py-2 text-[11px] font-mono font-semibold tracking-wider border border-teal-500/30 text-teal-400 rounded hover:bg-teal-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck size={12} /> MARK SAFE
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleResolve("ACKNOWLEDGED")}
                  className="flex-1 py-2 text-[11px] font-mono font-semibold tracking-wider border border-teal-500/30 bg-teal-500/10 text-teal-400 rounded hover:bg-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={12} /> ACKNOWLEDGE
                </button>
              )}
              <button
                onClick={() => handleResolve("INVESTIGATING")}
                disabled={!!selectedTx.resolution}
                className="py-2 px-3 text-[11px] font-mono font-semibold tracking-wider border border-border text-muted-foreground rounded hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <Search size={12} /> INVESTIGATE
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
