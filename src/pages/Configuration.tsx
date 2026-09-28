import { motion } from "motion/react";
import { RotateCcw, Zap } from "lucide-react";
import { useSentinelStore } from "../store";

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-5 rounded-full border transition-all shrink-0 relative focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        enabled ? "bg-teal-400/20 border-teal-400/50" : "bg-muted border-border"
      }`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
        enabled ? "left-5 bg-teal-400" : "left-0.5 bg-muted-foreground"
      }`} />
    </button>
  );
}

function SliderInput({
  label, value, min, max, step, onChange, format, color
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string; color: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
        <span className={`text-sm font-mono font-bold ${color}`}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-teal-400"
      />
      <div className="flex justify-between text-[9px] font-mono text-muted-foreground/60">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export function Configuration() {
  const { config, toggleRule, setRuleBonus, setThreshold, setWeights, setSimulationSpeed, resetConfig } = useSentinelStore();

  const ruleIds = ["R1", "R2", "R3"] as const;

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-2 overflow-y-auto">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-display font-bold text-foreground tracking-tight">Configuration</h2>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">Règles métier, seuils de décision, paramètres système — modifications actives en temps réel</p>
        </div>
        <button
          onClick={resetConfig}
          className="flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-wider border border-border px-3 py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <RotateCcw size={11} /> RESET DEFAULTS
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Business rules */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded p-4">
          <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">Règles Métier (ÉvaluateurRisque)</div>
          <div className="flex flex-col gap-3">
            {ruleIds.map(ruleId => {
              const rule = config.rules[ruleId];
              return (
                <div key={ruleId} className={`flex flex-col gap-2 p-3 rounded border transition-colors ${rule.enabled ? "border-border bg-muted/10" : "border-border/50 bg-muted/5 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-primary">{ruleId}</span>
                        <span className={`text-[9px] font-mono font-semibold ${rule.enabled ? "text-amber-400" : "text-muted-foreground"}`}>
                          +{rule.bonus.toFixed(2)} bonus
                        </span>
                      </div>
                      <p className="text-[11px] font-sans text-muted-foreground">{rule.label}</p>
                    </div>
                    <Toggle enabled={rule.enabled} onToggle={() => toggleRule(ruleId)} />
                  </div>
                  {rule.enabled && (
                    <div className="pt-2 border-t border-border/50">
                      <SliderInput
                        label="Bonus score"
                        value={rule.bonus}
                        min={0.05}
                        max={0.5}
                        step={0.01}
                        onChange={v => setRuleBonus(ruleId, v)}
                        format={v => `+${v.toFixed(2)}`}
                        color="text-amber-400"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Decision thresholds + weights */}
        <div className="flex flex-col gap-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded p-4">
            <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">Seuils de Décision (AgentBanque)</div>
            <div className="flex flex-col gap-4">
              <SliderInput
                label="Seuil BLOCK (≥ valeur → rejeté)"
                value={config.thresholds.block}
                min={0.1}
                max={0.9}
                step={0.01}
                onChange={v => setThreshold("block", Math.max(v, config.thresholds.flag + 0.01))}
                format={v => `≥ ${v.toFixed(2)}`}
                color="text-red-400"
              />
              <SliderInput
                label="Seuil FLAG (≥ valeur → surveillé)"
                value={config.thresholds.flag}
                min={0.05}
                max={0.5}
                step={0.01}
                onChange={v => setThreshold("flag", Math.min(v, config.thresholds.block - 0.01))}
                format={v => `≥ ${v.toFixed(2)}`}
                color="text-amber-400"
              />
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                {[
                  { label: "BLOCK", range: `≥ ${config.thresholds.block.toFixed(2)}`, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                  { label: "FLAG", range: `${config.thresholds.flag.toFixed(2)}–${(config.thresholds.block - 0.001).toFixed(2)}`, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "APPROVE", range: `< ${config.thresholds.flag.toFixed(2)}`, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
                ].map(t => (
                  <div key={t.label} className={`flex flex-col items-center p-2 rounded border ${t.bg}`}>
                    <span className={`text-[9px] font-mono font-bold tracking-widest ${t.color}`}>{t.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{t.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded p-4">
            <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">Poids des Modèles (AnalyseML)</div>
            <SliderInput
              label="Poids XGBoost (iso = 1 − xgb)"
              value={config.weights.xgb}
              min={0.1}
              max={0.9}
              step={0.05}
              onChange={v => setWeights(v)}
              format={v => `XGB ${(v * 100).toFixed(0)}% / ISO ${((1 - v) * 100).toFixed(0)}%`}
              color="text-teal-400"
            />
            <div className="mt-3 p-3 bg-muted/20 rounded border border-border font-mono text-[11px] leading-relaxed text-foreground">
              <div className="text-muted-foreground text-[9px] mb-1">// scoreML live formula</div>
              <div>
                scoreML = <span className="text-teal-400">{config.weights.xgb.toFixed(2)}</span> × xgb
                {" "}+ <span className="text-teal-400">{config.weights.iso.toFixed(2)}</span> × iso
              </div>
              <div className="mt-1 text-muted-foreground text-[9px]">// scoreFinal</div>
              <div>scoreFinal = <span className="text-amber-400">min</span>(1.0, scoreML + Σ bonus)</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Simulation speed */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded p-4 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">
          <Zap size={11} /> Vitesse de Simulation
        </div>
        <SliderInput
          label="Intervalle entre transactions"
          value={config.simulationSpeed}
          min={200}
          max={3000}
          step={100}
          onChange={v => setSimulationSpeed(v)}
          format={v => `${v}ms (${(60000 / v).toFixed(0)} tx/min)`}
          color="text-primary"
        />
      </motion.div>

      {/* System info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded p-4 shrink-0">
        <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-3">Stack Technique</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { cat: "Agents", val: "JADE 4.6, Java 17, Maven 3.9" },
            { cat: "ML Service", val: "Python 3.11, Flask 3, XGBoost 2.0, scikit-learn 1.5" },
            { cat: "Database", val: "PostgreSQL 15, Hibernate 6, HikariCP" },
            { cat: "Real-time", val: "Tyrus WebSocket, Grizzly HTTP" },
            { cat: "Frontend", val: "React 19, TypeScript 5, Vite 7, Recharts 2, Zustand" },
            { cat: "Infrastructure", val: "Docker 24, Docker Compose v2, Nginx 1.27" },
            { cat: "Testing", val: "JUnit 5 + Mockito (Java), pytest (Python)" },
            { cat: "Performance", val: "35ms median, P95 70ms, ≥50 tx/s" },
          ].map(({ cat, val }) => (
            <div key={cat} className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">{cat}</span>
              <span className="text-[11px] font-sans text-foreground leading-relaxed">{val}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
