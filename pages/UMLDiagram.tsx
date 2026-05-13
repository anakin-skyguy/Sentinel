import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, GitBranch, Box, ArrowRight, ChevronDown, ChevronRight, Database, Cpu, Globe, Code2, LayoutDashboard, Zap } from "lucide-react";
import { cn } from "../lib/utils";

type DiagramView = "component" | "sequence" | "class" | "deployment";

// ─── Shared helpers ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
      {children}
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border ${color}`}>
      {children}
    </span>
  );
}

// ─── Component Diagram ──────────────────────────────────────────────────────

const LAYERS = [
  {
    id: "ui",
    label: "UI Layer — React 19 + TypeScript + Vite 7",
    color: "border-primary/30 bg-primary/5",
    titleColor: "text-primary",
    components: [
      { name: "App.tsx", desc: "Root layout, simulation loop (setInterval), AnimatePresence routing" },
      { name: "Sidebar", desc: "Icon nav, setActiveTab(), wsConnected indicator" },
      { name: "TopBar", desc: "tx/min counter, LIVE/PAUSED badge, PAUSE/RESUME button" },
      { name: "ModalDetailAlerte", desc: "Slide-in panel: scores, rules, FIPA-ACL, resolution actions" },
    ],
  },
  {
    id: "pages",
    label: "Pages Layer — 6 views",
    color: "border-teal-500/30 bg-teal-500/5",
    titleColor: "text-teal-400",
    components: [
      { name: "Operations", desc: "KPI cards + FluxTransactions + PanneauAgents + GraphiqueFraude" },
      { name: "Transactions", desc: "Full table, sort/filter/search, pagination, CSV export" },
      { name: "AgentNetwork", desc: "Agent cards, FIPA-ACL flow table, JADE topology" },
      { name: "ModelPerformance", desc: "Radar chart, confusion matrix, XGBoost & IF config" },
      { name: "IncidentLog", desc: "Flagged/blocked only, resolution workflow, CSV export" },
      { name: "Configuration", desc: "Rules toggle, score sliders, threshold editor, sim speed" },
    ],
  },
  {
    id: "components",
    label: "Shared Components",
    color: "border-amber-500/30 bg-amber-500/5",
    titleColor: "text-amber-400",
    components: [
      { name: "CarteKPI", desc: "4 animated metric cards: total, frauds, FP rate, avg latency" },
      { name: "FluxTransactions", desc: "Live scrolling stream, color-coded rows, click→modal" },
      { name: "PanneauAgents", desc: "6 agent status pills with pulse animation and current task" },
      { name: "GraphiqueFraude", desc: "Recharts AreaChart — 24h timeline, stacked APPROVE/FLAG/BLOCK" },
    ],
  },
  {
    id: "state",
    label: "State Layer — Zustand store",
    color: "border-purple-500/30 bg-purple-500/5",
    titleColor: "text-purple-400",
    components: [
      { name: "useSentinelStore", desc: "Single global store: transactions[], agents[], kpi, timeline, config, selectedTx" },
      { name: "generateTransaction()", desc: "Simulates XGBoost + Isolation Forest scores + business rules" },
      { name: "tickSimulation()", desc: "Called every config.simulationSpeed ms; generates + injects 1 transaction" },
      { name: "resolveTransaction()", desc: "Analyst resolution: CONFIRMED_BLOCK | MARKED_SAFE | ESCALATED | ACKNOWLEDGED | INVESTIGATING" },
    ],
  },
];

function ComponentDiagram() {
  const [expanded, setExpanded] = useState<string | null>("ui");

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      <p className="text-[11px] font-mono text-muted-foreground shrink-0">
        Architecture en couches du frontend React — cliquez sur une couche pour l'explorer.
      </p>
      {LAYERS.map((layer, li) => (
        <motion.div
          key={layer.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: li * 0.06 }}
          className={`border rounded overflow-hidden shrink-0 ${layer.color}`}
        >
          <button
            onClick={() => setExpanded(expanded === layer.id ? null : layer.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
          >
            <span className={`text-[11px] font-mono font-bold tracking-wide ${layer.titleColor}`}>{layer.label}</span>
            {expanded === layer.id ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {expanded === layer.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 p-3 pt-0">
                  {layer.components.map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded p-3"
                    >
                      <div className="text-[11px] font-mono font-bold text-foreground mb-1">{c.name}</div>
                      <div className="text-[10px] font-sans text-muted-foreground leading-relaxed">{c.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Data flow arrows */}
      <div className="bg-card border border-border rounded p-4 shrink-0">
        <SectionTitle><ArrowRight size={10} />Data Flow</SectionTitle>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "setInterval", color: "text-primary border-primary/20 bg-primary/5" },
            { label: "tickSimulation()", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
            { label: "generateTransaction()", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
            { label: "addTransaction(tx)", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
            { label: "Zustand store update", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
            { label: "React re-render", color: "text-teal-400 border-teal-500/20 bg-teal-500/5" },
            { label: "UI reflects new state", color: "text-teal-400 border-teal-500/20 bg-teal-500/5" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <ArrowRight size={10} className="text-muted-foreground/40 shrink-0" />}
              <Tag color={step.color}>{step.label}</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sequence Diagram ────────────────────────────────────────────────────────

const AGENTS_SEQ = [
  { id: "coordinateur", label: "Coordinateur", color: "bg-primary/20 border-primary/40 text-primary" },
  { id: "surveillance", label: "Surveillance", color: "bg-teal-500/20 border-teal-500/40 text-teal-400" },
  { id: "analyseml", label: "AnalyseML", color: "bg-blue-500/20 border-blue-500/40 text-blue-400" },
  { id: "evaluateur", label: "ÉvaluateurRisque", color: "bg-amber-500/20 border-amber-500/40 text-amber-400" },
  { id: "banque", label: "AgentBanque", color: "bg-red-500/20 border-red-500/40 text-red-400" },
  { id: "audit", label: "Audit", color: "bg-purple-500/20 border-purple-500/40 text-purple-400" },
];

const MESSAGES = [
  { from: 0, to: 1, label: "REQUEST (health check)", note: "FIPA-ACL performative", color: "text-primary" },
  { from: 1, to: 1, label: "normalize(tx)", note: "Internal: validate + persist to PostgreSQL", color: "text-teal-400" },
  { from: 1, to: 2, label: "INFORM (tx data)", note: "montant, carte_fin, pays, horodatage", color: "text-teal-400" },
  { from: 2, to: 2, label: "POST /predict", note: "Flask API: XGBoost + Isolation Forest inference", color: "text-blue-400" },
  { from: 2, to: 3, label: "INFORM (xgb_score, if_score, score_ml)", note: "Weighted combination: 0.65×XGB + 0.35×IF", color: "text-blue-400" },
  { from: 3, to: 3, label: "applyRules(R1, R2, R3)", note: "Bonus: +0.20 montant / +0.25 freq / +0.15 horaire", color: "text-amber-400" },
  { from: 3, to: 4, label: "PROPOSE (score_final)", note: "score_final = min(1.0, score_ml + Σbonus)", color: "text-amber-400" },
  { from: 4, to: 4, label: "applyThresholds()", note: "≥0.35 → BLOCK | ≥0.20 → FLAG | else → APPROVE", color: "text-red-400" },
  { from: 4, to: 5, label: "INFORM (verdict, performative)", note: "ACCEPT_PROPOSAL | REJECT_PROPOSAL", color: "text-red-400" },
  { from: 5, to: 5, label: "logACL(message)", note: "Audit trail persisted", color: "text-purple-400" },
];

function SequenceDiagram() {
  const [hovered, setHovered] = useState<number | null>(null);
  const COL_W = 140;
  const ROW_H = 56;
  const HEADER_H = 60;
  const LIFELINE_X = (i: number) => 24 + i * COL_W + COL_W / 2;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      <p className="text-[11px] font-mono text-muted-foreground shrink-0">
        Diagramme de séquence FIPA-ACL — pipeline de détection de fraude (JADE 4.6 + Flask ML API).
      </p>

      <div className="bg-card border border-border rounded overflow-x-auto shrink-0">
        <svg
          width={24 + AGENTS_SEQ.length * COL_W + 24}
          height={HEADER_H + MESSAGES.length * ROW_H + 40}
          className="block"
        >
          {/* Agent headers */}
          {AGENTS_SEQ.map((agent, i) => (
            <g key={agent.id}>
              <rect
                x={LIFELINE_X(i) - 54}
                y={8}
                width={108}
                height={36}
                rx={4}
                className="fill-card stroke-border"
                strokeWidth={1}
              />
              <text
                x={LIFELINE_X(i)}
                y={30}
                textAnchor="middle"
                className="fill-foreground font-mono"
                fontSize={9}
                fontWeight="bold"
              >
                {agent.label}
              </text>
              {/* Lifeline */}
              <line
                x1={LIFELINE_X(i)}
                y1={44}
                x2={LIFELINE_X(i)}
                y2={HEADER_H + MESSAGES.length * ROW_H + 20}
                stroke="oklch(30% 0.02 230)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </g>
          ))}

          {/* Messages */}
          {MESSAGES.map((msg, mi) => {
            const y = HEADER_H + mi * ROW_H + ROW_H / 2;
            const x1 = LIFELINE_X(msg.from);
            const x2 = LIFELINE_X(msg.to);
            const isSelf = msg.from === msg.to;
            const isHov = hovered === mi;

            return (
              <g
                key={mi}
                onMouseEnter={() => setHovered(mi)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "default" }}
              >
                {/* Row highlight */}
                {isHov && (
                  <rect
                    x={24}
                    y={y - ROW_H / 2 + 4}
                    width={24 + AGENTS_SEQ.length * COL_W}
                    height={ROW_H - 8}
                    rx={3}
                    fill="oklch(20% 0.02 230)"
                    opacity={0.6}
                  />
                )}

                {isSelf ? (
                  <>
                    <path
                      d={`M ${x1} ${y - 8} Q ${x1 + 44} ${y - 8} ${x1 + 44} ${y} Q ${x1 + 44} ${y + 8} ${x1} ${y + 8}`}
                      fill="none"
                      stroke={isHov ? "#0ECFB0" : "oklch(40% 0.03 230)"}
                      strokeWidth={1.5}
                    />
                    <polygon
                      points={`${x1},${y + 8} ${x1 - 5},${y + 4} ${x1 - 5},${y + 12}`}
                      fill={isHov ? "#0ECFB0" : "oklch(40% 0.03 230)"}
                    />
                    <text x={x1 + 48} y={y + 3} fontSize={9} fontFamily="IBM Plex Mono" fill={isHov ? "#ffffff" : "oklch(55% 0.02 220)"}>
                      {msg.label}
                    </text>
                  </>
                ) : (
                  <>
                    <line
                      x1={x1} y1={y}
                      x2={x2 - (x2 > x1 ? 6 : -6)} y2={y}
                      stroke={isHov ? "#0ECFB0" : "oklch(40% 0.03 230)"}
                      strokeWidth={1.5}
                    />
                    <polygon
                      points={
                        x2 > x1
                          ? `${x2},${y} ${x2 - 8},${y - 4} ${x2 - 8},${y + 4}`
                          : `${x2},${y} ${x2 + 8},${y - 4} ${x2 + 8},${y + 4}`
                      }
                      fill={isHov ? "#0ECFB0" : "oklch(40% 0.03 230)"}
                    />
                    {/* Label above arrow */}
                    <text
                      x={(x1 + x2) / 2}
                      y={y - 6}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="IBM Plex Mono"
                      fontWeight="600"
                      fill={isHov ? "#ffffff" : "oklch(65% 0.02 220)"}
                    >
                      {msg.label}
                    </text>
                  </>
                )}

                {/* Note on hover */}
                {isHov && (
                  <text
                    x={isSelf ? x1 + 48 : (x1 + x2) / 2}
                    y={y + 14}
                    textAnchor={isSelf ? "start" : "middle"}
                    fontSize={8}
                    fontFamily="IBM Plex Mono"
                    fill="oklch(55% 0.02 220)"
                  >
                    // {msg.note}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="bg-card border border-border rounded p-3 shrink-0">
        <SectionTitle><Zap size={10} />Légende des performatives FIPA-ACL</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "REQUEST", desc: "Demande d'action" },
            { label: "INFORM", desc: "Transmission d'information" },
            { label: "PROPOSE", desc: "Proposition de valeur" },
            { label: "ACCEPT_PROPOSAL", desc: "Décision de blocage/signalement" },
            { label: "REJECT_PROPOSAL", desc: "Décision d'approbation" },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5 text-[10px] font-mono bg-muted/30 border border-border rounded px-2 py-1">
              <span className="text-primary font-semibold">{p.label}</span>
              <span className="text-muted-foreground">— {p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Class Diagram ────────────────────────────────────────────────────────────

const CLASSES = [
  {
    name: "Transaction",
    stereotype: "interface",
    color: "border-teal-500/40 bg-teal-500/5",
    titleColor: "text-teal-400",
    fields: [
      { name: "id", type: "string", vis: "+" },
      { name: "montant", type: "number", vis: "+" },
      { name: "marchand", type: "string", vis: "+" },
      { name: "carte_fin", type: "string", vis: "+" },
      { name: "banque", type: "string", vis: "+" },
      { name: "pays", type: "string", vis: "+" },
      { name: "horodatage", type: "string", vis: "+" },
      { name: "verdict", type: "Verdict", vis: "+" },
      { name: "score_final", type: "number", vis: "+" },
      { name: "score_ml", type: "number", vis: "+" },
      { name: "xgb_score", type: "number", vis: "+" },
      { name: "if_score", type: "number", vis: "+" },
      { name: "regles_declenchees", type: "string[]", vis: "+" },
      { name: "agent_decision", type: "string", vis: "+" },
      { name: "performative", type: "string", vis: "+" },
      { name: "raisonnement", type: "string", vis: "+" },
      { name: "delai_ms", type: "number", vis: "+" },
      { name: "resolution?", type: "Resolution", vis: "+" },
      { name: "resolved_at?", type: "string", vis: "+" },
      { name: "resolved_by?", type: "string", vis: "+" },
    ],
    methods: [],
  },
  {
    name: "Agent",
    stereotype: "interface",
    color: "border-primary/40 bg-primary/5",
    titleColor: "text-primary",
    fields: [
      { name: "id", type: "string", vis: "+" },
      { name: "nom", type: "string", vis: "+" },
      { name: "role", type: "string", vis: "+" },
      { name: "statut", type: "AgentStatus", vis: "+" },
      { name: "tache_courante", type: "string", vis: "+" },
      { name: "messages_traites", type: "number", vis: "+" },
      { name: "latence_ms", type: "number", vis: "+" },
      { name: "derniere_activite", type: "string", vis: "+" },
    ],
    methods: [],
  },
  {
    name: "SentinelConfig",
    stereotype: "interface",
    color: "border-amber-500/40 bg-amber-500/5",
    titleColor: "text-amber-400",
    fields: [
      { name: "rules", type: "{ R1, R2, R3 }", vis: "+" },
      { name: "thresholds", type: "{ block, flag }", vis: "+" },
      { name: "weights", type: "{ xgb, iso }", vis: "+" },
      { name: "simulationSpeed", type: "number", vis: "+" },
    ],
    methods: [],
  },
  {
    name: "KPIData",
    stereotype: "interface",
    color: "border-blue-500/40 bg-blue-500/5",
    titleColor: "text-blue-400",
    fields: [
      { name: "total_transactions", type: "number", vis: "+" },
      { name: "fraudes_detectees", type: "number", vis: "+" },
      { name: "taux_faux_positifs", type: "number", vis: "+" },
      { name: "delai_moyen_ms", type: "number", vis: "+" },
      { name: "approuves", type: "number", vis: "+" },
      { name: "signales", type: "number", vis: "+" },
      { name: "bloques", type: "number", vis: "+" },
      { name: "transactions_par_min", type: "number", vis: "+" },
    ],
    methods: [],
  },
  {
    name: "SentinelState",
    stereotype: "store (Zustand)",
    color: "border-purple-500/40 bg-purple-500/5",
    titleColor: "text-purple-400",
    fields: [
      { name: "transactions", type: "Transaction[]", vis: "-" },
      { name: "agents", type: "Agent[]", vis: "-" },
      { name: "kpi", type: "KPIData", vis: "-" },
      { name: "timeline", type: "TimelinePoint[]", vis: "-" },
      { name: "selectedTx", type: "Transaction | null", vis: "-" },
      { name: "wsConnected", type: "boolean", vis: "-" },
      { name: "activeTab", type: "string", vis: "-" },
      { name: "config", type: "SentinelConfig", vis: "-" },
      { name: "simulationPaused", type: "boolean", vis: "-" },
    ],
    methods: [
      { name: "addTransaction(tx)", ret: "void" },
      { name: "setSelectedTx(tx)", ret: "void" },
      { name: "setActiveTab(tab)", ret: "void" },
      { name: "tickSimulation()", ret: "void" },
      { name: "initSimulation()", ret: "void" },
      { name: "resolveTransaction(id, action)", ret: "void" },
      { name: "toggleSimulation()", ret: "void" },
      { name: "toggleRule(ruleId)", ret: "void" },
      { name: "setThreshold(key, value)", ret: "void" },
      { name: "setWeights(xgb)", ret: "void" },
      { name: "setSimulationSpeed(ms)", ret: "void" },
      { name: "resetConfig()", ret: "void" },
    ],
  },
  {
    name: "TimelinePoint",
    stereotype: "interface",
    color: "border-red-500/40 bg-red-500/5",
    titleColor: "text-red-400",
    fields: [
      { name: "heure", type: "string", vis: "+" },
      { name: "approuves", type: "number", vis: "+" },
      { name: "signales", type: "number", vis: "+" },
      { name: "bloques", type: "number", vis: "+" },
    ],
    methods: [],
  },
];

const ENUMS = [
  { name: "Verdict", values: ["APPROVE", "FLAG", "BLOCK"], color: "text-teal-400 border-teal-500/30 bg-teal-500/5" },
  { name: "AgentStatus", values: ["ACTIVE", "IDLE", "ERROR", "OFFLINE"], color: "text-primary border-primary/30 bg-primary/5" },
  { name: "Resolution", values: ["CONFIRMED_BLOCK", "MARKED_SAFE", "ESCALATED", "ACKNOWLEDGED", "INVESTIGATING"], color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
];

function ClassDiagram() {
  const [selected, setSelected] = useState<string | null>("SentinelState");

  const cls = CLASSES.find(c => c.name === selected);

  return (
    <div className="flex gap-2 h-full min-h-0 overflow-hidden">
      {/* Class list */}
      <div className="w-52 shrink-0 flex flex-col gap-1 overflow-y-auto">
        <p className="text-[10px] font-mono text-muted-foreground mb-1">Cliquez sur une classe</p>
        {CLASSES.map(c => (
          <button
            key={c.name}
            onClick={() => setSelected(c.name)}
            className={cn(
              "text-left px-3 py-2 rounded border text-[11px] font-mono transition-colors",
              selected === c.name
                ? c.color + " " + c.titleColor
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <div className="font-bold">{c.name}</div>
            <div className="text-[9px] opacity-70">«{c.stereotype}»</div>
          </button>
        ))}
        <div className="mt-2">
          <p className="text-[10px] font-mono text-muted-foreground mb-1">Enums & Types</p>
          {ENUMS.map(e => (
            <div key={e.name} className={`mb-1 rounded border px-3 py-2 ${e.color}`}>
              <div className={`text-[10px] font-mono font-bold`}>«enum» {e.name}</div>
              <div className="flex flex-col gap-0.5 mt-1">
                {e.values.map(v => (
                  <span key={v} className="text-[9px] font-mono text-muted-foreground">{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-y-auto">
        <AnimatePresence mode="wait">
          {cls && (
            <motion.div
              key={cls.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className={`border rounded overflow-hidden ${cls.color}`}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/50">
                <div className="text-[9px] font-mono text-muted-foreground">«{cls.stereotype}»</div>
                <div className={`text-lg font-display font-bold ${cls.titleColor}`}>{cls.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-0 divide-x divide-border/50">
                {/* Fields */}
                <div className="p-4">
                  <SectionTitle>Attributs</SectionTitle>
                  <div className="flex flex-col gap-1">
                    {cls.fields.map(f => (
                      <div key={f.name} className="flex items-baseline gap-2 text-[11px] font-mono">
                        <span className="text-muted-foreground w-3 shrink-0">{f.vis}</span>
                        <span className="text-foreground">{f.name}</span>
                        <span className="text-muted-foreground/60">:</span>
                        <span className="text-primary/80">{f.type}</span>
                      </div>
                    ))}
                    {cls.fields.length === 0 && <span className="text-[10px] font-mono text-muted-foreground/50">— aucun —</span>}
                  </div>
                </div>

                {/* Methods */}
                <div className="p-4">
                  <SectionTitle>Méthodes</SectionTitle>
                  <div className="flex flex-col gap-1">
                    {cls.methods.map(m => (
                      <div key={m.name} className="flex items-baseline gap-2 text-[11px] font-mono">
                        <span className="text-teal-400">+</span>
                        <span className="text-foreground">{m.name}</span>
                        <span className="text-muted-foreground/60">:</span>
                        <span className="text-amber-400/80">{m.ret}</span>
                      </div>
                    ))}
                    {cls.methods.length === 0 && <span className="text-[10px] font-mono text-muted-foreground/50">— aucune —</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Relations */}
        <div className="bg-card border border-border rounded p-4 shrink-0">
          <SectionTitle><GitBranch size={10} />Relations entre classes</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {[
              { from: "SentinelState", rel: "has []", to: "Transaction", desc: "max 500, LIFO order" },
              { from: "SentinelState", rel: "has []", to: "Agent", desc: "6 agents JADE" },
              { from: "SentinelState", rel: "has 1", to: "KPIData", desc: "live computed" },
              { from: "SentinelState", rel: "has []", to: "TimelinePoint", desc: "24h window" },
              { from: "SentinelState", rel: "has 1", to: "SentinelConfig", desc: "user-configurable" },
              { from: "Transaction", rel: "uses", to: "Verdict", desc: "APPROVE | FLAG | BLOCK" },
              { from: "Transaction", rel: "uses?", to: "Resolution", desc: "analyst resolution" },
              { from: "Agent", rel: "uses", to: "AgentStatus", desc: "ACTIVE | IDLE | ERROR | OFFLINE" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-foreground font-semibold w-28 shrink-0">{r.from}</span>
                <span className="text-muted-foreground/60">──</span>
                <span className="text-amber-400/80 w-14 shrink-0">{r.rel}</span>
                <span className="text-muted-foreground/60">──▶</span>
                <span className="text-teal-400 font-semibold w-24 shrink-0">{r.to}</span>
                <span className="text-muted-foreground/50">// {r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deployment Diagram ───────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "frontend",
    icon: LayoutDashboard,
    label: "Frontend",
    tech: "React 19 · TypeScript · Vite 7 · Tailwind",
    color: "border-primary/40 bg-primary/5",
    titleColor: "text-primary",
    details: [
      "Zustand global store",
      "Recharts data viz",
      "motion/react animations",
      "Simulation engine (client-side)",
    ],
    port: "5173 (dev) / 80 (prod)",
  },
  {
    id: "agents",
    icon: Cpu,
    label: "JADE Agent Platform",
    tech: "JADE 4.6 · Java 17 · Maven 3.9",
    color: "border-teal-500/40 bg-teal-500/5",
    titleColor: "text-teal-400",
    details: [
      "Coordinateur (health monitor)",
      "Surveillance (tx ingestion)",
      "AnalyseML (ML orchestrator)",
      "ÉvaluateurRisque (rules engine)",
      "AgentBanque (decision authority)",
      "Audit (ACL logger)",
    ],
    port: "1099 (RMI) · 7778 (HTTP/WS)",
  },
  {
    id: "ml",
    icon: Code2,
    label: "ML Inference API",
    tech: "Python 3.11 · Flask 3 · XGBoost 2.0 · scikit-learn 1.5",
    color: "border-amber-500/40 bg-amber-500/5",
    titleColor: "text-amber-400",
    details: [
      "POST /predict endpoint",
      "XGBoost model (xgb.pkl)",
      "Isolation Forest (if.pkl)",
      "SMOTE resampling",
      "284,807 training samples",
    ],
    port: "5000",
  },
  {
    id: "db",
    icon: Database,
    label: "PostgreSQL 15",
    tech: "Hibernate 6 · HikariCP · JDBC",
    color: "border-blue-500/40 bg-blue-500/5",
    titleColor: "text-blue-400",
    details: [
      "transactions table",
      "acl_messages audit log",
      "agents_state table",
      "Connection pool (HikariCP)",
    ],
    port: "5432",
  },
  {
    id: "infra",
    icon: Globe,
    label: "Infrastructure",
    tech: "Docker 24 · Docker Compose v2 · Nginx 1.27",
    color: "border-purple-500/40 bg-purple-500/5",
    titleColor: "text-purple-400",
    details: [
      "nginx (reverse proxy)",
      "jade-platform container",
      "ml-api container",
      "postgres container",
      "react-frontend container",
    ],
    port: "80 / 443",
  },
];

const CONNECTIONS = [
  { from: "frontend", to: "agents", label: "WebSocket (Tyrus/Grizzly)", type: "ws" },
  { from: "agents", to: "ml", label: "HTTP POST /predict", type: "http" },
  { from: "agents", to: "db", label: "JDBC / Hibernate ORM", type: "db" },
  { from: "infra", to: "frontend", label: "Nginx reverse proxy", type: "proxy" },
];

function DeploymentDiagram() {
  const [selected, setSelected] = useState<string | null>(null);
  const svc = SERVICES.find(s => s.id === selected);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      <p className="text-[11px] font-mono text-muted-foreground shrink-0">
        Architecture de déploiement — Docker Compose. Cliquez sur un service pour les détails.
      </p>

      {/* Service nodes */}
      <div className="grid grid-cols-5 gap-2 shrink-0">
        {SERVICES.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelected(selected === s.id ? null : s.id)}
            className={cn(
              "border rounded p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
              s.color,
              selected === s.id ? "ring-1 ring-offset-1 ring-offset-background " + s.titleColor.replace("text-", "ring-") : ""
            )}
          >
            <s.icon size={20} className={s.titleColor} strokeWidth={1.5} />
            <div className={`text-[11px] font-mono font-bold mt-2 ${s.titleColor}`}>{s.label}</div>
            <div className="text-[9px] font-sans text-muted-foreground mt-1 leading-relaxed">{s.tech}</div>
            <div className="mt-2 text-[9px] font-mono text-muted-foreground/60">:{s.port}</div>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {svc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`border rounded p-4 overflow-hidden shrink-0 ${svc.color}`}
          >
            <div className={`text-sm font-display font-bold mb-3 ${svc.titleColor}`}>{svc.label}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SectionTitle>Composants internes</SectionTitle>
                {svc.details.map(d => (
                  <div key={d} className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${svc.titleColor.replace("text-", "bg-")}`} />
                    {d}
                  </div>
                ))}
              </div>
              <div>
                <SectionTitle>Connexions</SectionTitle>
                {CONNECTIONS.filter(c => c.from === svc.id || c.to === svc.id).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-mono mb-1.5">
                    <span className="text-foreground font-semibold">{c.from}</span>
                    <ArrowRight size={10} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground font-semibold">{c.to}</span>
                    <span className="text-muted-foreground/60">// {c.label}</span>
                  </div>
                ))}
                {CONNECTIONS.filter(c => c.from === svc.id || c.to === svc.id).length === 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground/50">Aucune connexion directe</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection table */}
      <div className="bg-card border border-border rounded p-4 shrink-0">
        <SectionTitle><Globe size={10} />Connexions inter-services</SectionTitle>
        <div className="flex flex-col gap-2">
          {CONNECTIONS.map((c, i) => (
            <div key={i} className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-foreground font-semibold w-24 shrink-0">{c.from}</span>
              <ArrowRight size={12} className="text-muted-foreground shrink-0" />
              <span className="text-foreground font-semibold w-24 shrink-0">{c.to}</span>
              <Tag color={
                c.type === "ws" ? "text-teal-400 border-teal-500/30 bg-teal-500/10" :
                c.type === "http" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                c.type === "db" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" :
                "text-purple-400 border-purple-500/30 bg-purple-500/10"
              }>{c.type.toUpperCase()}</Tag>
              <span className="text-muted-foreground">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance targets */}
      <div className="bg-card border border-border rounded p-4 shrink-0">
        <SectionTitle><Zap size={10} />Objectifs de performance</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Latence médiane", value: "35ms", color: "text-teal-400" },
            { label: "P95 latence", value: "70ms", color: "text-teal-400" },
            { label: "Débit cible", value: "≥50 tx/s", color: "text-primary" },
            { label: "ROC-AUC", value: "96%", color: "text-amber-400" },
          ].map(p => (
            <div key={p.label} className="bg-muted/20 border border-border rounded p-3">
              <div className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">{p.label}</div>
              <div className={`text-xl font-display font-bold mt-1 ${p.color}`}>{p.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main UML Page ────────────────────────────────────────────────────────────

const VIEWS: { id: DiagramView; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "component", label: "Composants", icon: Layers, desc: "Architecture en couches React" },
  { id: "sequence", label: "Séquence", icon: GitBranch, desc: "Pipeline FIPA-ACL agents" },
  { id: "class", label: "Classes", icon: Box, desc: "Types TypeScript & relations" },
  { id: "deployment", label: "Déploiement", icon: Globe, desc: "Services Docker & connexions" },
];

export function UMLDiagram() {
  const [view, setView] = useState<DiagramView>("component");

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-2">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-display font-bold text-foreground tracking-tight">Architecture UML</h2>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Diagrammes de composants, séquence, classes et déploiement
          </p>
        </div>
        {/* View switcher */}
        <div className="flex items-center gap-1 bg-muted/30 border border-border rounded p-1">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              title={v.desc}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-semibold tracking-wide transition-colors",
                view === v.id
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <v.icon size={12} strokeWidth={1.5} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Diagram content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full overflow-hidden"
          >
            {view === "component" && <ComponentDiagram />}
            {view === "sequence" && <SequenceDiagram />}
            {view === "class" && <ClassDiagram />}
            {view === "deployment" && <DeploymentDiagram />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
