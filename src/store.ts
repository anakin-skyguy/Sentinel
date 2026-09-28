import { create } from "zustand";
import type { Transaction, Agent, KPIData, TimelinePoint, SentinelConfig, Resolution } from "./types";

const MARCHANDS = [
  "Amazon EU", "Carrefour", "Fnac", "Total Energie", "BNP Paribas ATM",
  "Uber Eats", "SNCF", "Decathlon", "Apple Store", "Zara Online",
  "Shell Station", "Lidl", "Netflix", "PayPal Transfer", "Western Union",
  "Casino Supermarché", "Boulanger", "Darty", "Leroy Merlin", "H&M"
];

const PAYS = ["FR", "DE", "ES", "IT", "BE", "NL", "US", "RU", "CN", "NG", "BR", "MA"];
const BANQUES = ["BNP Paribas", "Société Générale", "Crédit Agricole", "LCL", "HSBC France", "La Banque Postale"];

export const DEFAULT_CONFIG: SentinelConfig = {
  rules: {
    R1: { enabled: true, label: "Montant de la transaction > €5 000", bonus: 0.20 },
    R2: { enabled: true, label: "Plus de 3 transactions sur la même carte en 1 heure", bonus: 0.25 },
    R3: { enabled: true, label: "Heure entre 01:00 et 04:00 UTC", bonus: 0.15 },
  },
  thresholds: { block: 0.35, flag: 0.20 },
  weights: { xgb: 0.65, iso: 0.35 },
  simulationSpeed: 800,
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

function generateCarte() {
  return String(randomInt(1000, 9999));
}

function generateTransaction(config: SentinelConfig): Transaction {
  const now = new Date();
  const hour = now.getUTCHours();
  const montant = Math.random() < 0.05 ? randomBetween(5001, 15000) : randomBetween(5, 4999);
  const xgb_score = Math.random() < 0.08 ? randomBetween(0.55, 0.99) : randomBetween(0.01, 0.35);
  const if_score = Math.random() < 0.1 ? randomBetween(0.45, 0.98) : randomBetween(0.01, 0.4);
  const score_ml = config.weights.xgb * xgb_score + config.weights.iso * if_score;

  let bonus = 0;
  const regles: string[] = [];
  if (config.rules.R1.enabled && montant > 5000) {
    bonus += config.rules.R1.bonus;
    regles.push(`R1: Montant > €5 000 (+${config.rules.R1.bonus.toFixed(2)})`);
  }
  if (config.rules.R2.enabled && Math.random() < 0.08) {
    bonus += config.rules.R2.bonus;
    regles.push(`R2: >3 transactions/heure (+${config.rules.R2.bonus.toFixed(2)})`);
  }
  if (config.rules.R3.enabled && hour >= 1 && hour <= 4) {
    bonus += config.rules.R3.bonus;
    regles.push(`R3: Horaire 01h–04h UTC (+${config.rules.R3.bonus.toFixed(2)})`);
  }

  const score_final = Math.min(1.0, score_ml + bonus);

  let verdict: "APPROVE" | "FLAG" | "BLOCK";
  let performative: string;
  if (score_final >= config.thresholds.block) { verdict = "BLOCK"; performative = "ACCEPT_PROPOSAL"; }
  else if (score_final >= config.thresholds.flag) { verdict = "FLAG"; performative = "ACCEPT_PROPOSAL"; }
  else { verdict = "APPROVE"; performative = "REJECT_PROPOSAL"; }

  const pays = Math.random() < 0.15 ? PAYS[randomInt(7, PAYS.length)] : PAYS[randomInt(0, 6)];

  const raisonnements: Record<string, string> = {
    APPROVE: "Score ML faible, aucune règle métier déclenchée. Transaction conforme au profil comportemental de la carte.",
    FLAG: "Score ML modéré ou règle métier déclenchée. Transaction mise sous surveillance pour analyse humaine.",
    BLOCK: "Score ML élevé combiné aux règles métier. Probabilité de fraude supérieure au seuil de blocage. Transaction rejetée."
  };

  return {
    id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    montant: Math.round(montant * 100) / 100,
    marchand: MARCHANDS[randomInt(0, MARCHANDS.length)],
    carte_fin: generateCarte(),
    banque: BANQUES[randomInt(0, BANQUES.length)],
    horodatage: now.toISOString(),
    verdict,
    score_final: Math.round(score_final * 1000) / 1000,
    score_ml: Math.round(score_ml * 1000) / 1000,
    xgb_score: Math.round(xgb_score * 1000) / 1000,
    if_score: Math.round(if_score * 1000) / 1000,
    regles_declenchees: regles,
    agent_decision: "AgentBanque",
    performative,
    raisonnement: raisonnements[verdict],
    pays,
    delai_ms: randomInt(18, 95),
  };
}

function generateAgents(): Agent[] {
  return [
    { id: "coordinateur", nom: "Coordinateur", role: "Orchestration & Health Monitor", statut: "ACTIVE", tache_courante: "Monitoring agent network", messages_traites: 0, latence_ms: 2, derniere_activite: new Date().toISOString() },
    { id: "surveillance", nom: "Surveillance", role: "Transaction Ingestion & Normalization", statut: "ACTIVE", tache_courante: "Awaiting transaction stream", messages_traites: 0, latence_ms: 5, derniere_activite: new Date().toISOString() },
    { id: "analyseml", nom: "AnalyseML", role: "ML Model Scoring", statut: "ACTIVE", tache_courante: "Idle — model ready", messages_traites: 0, latence_ms: 12, derniere_activite: new Date().toISOString() },
    { id: "evaluateurrisque", nom: "ÉvaluateurRisque", role: "Business Rules Engine", statut: "ACTIVE", tache_courante: "Rules evaluation standby", messages_traites: 0, latence_ms: 3, derniere_activite: new Date().toISOString() },
    { id: "banque", nom: "AgentBanque", role: "Final Decision Authority", statut: "ACTIVE", tache_courante: "Decision engine ready", messages_traites: 0, latence_ms: 4, derniere_activite: new Date().toISOString() },
    { id: "audit", nom: "Audit", role: "ACL Message Logger", statut: "ACTIVE", tache_courante: "Logging ACL messages", messages_traites: 0, latence_ms: 1, derniere_activite: new Date().toISOString() },
  ];
}

function generateTimeline(): TimelinePoint[] {
  const points: TimelinePoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000);
    const label = h.getUTCHours().toString().padStart(2, "0") + ":00";
    const base = randomInt(80, 200);
    points.push({
      heure: label,
      approuves: base,
      signales: randomInt(2, 15),
      bloques: randomInt(0, 4),
    });
  }
  return points;
}

interface SentinelState {
  transactions: Transaction[];
  agents: Agent[];
  kpi: KPIData;
  timeline: TimelinePoint[];
  selectedTx: Transaction | null;
  wsConnected: boolean;
  activeTab: string;
  config: SentinelConfig;
  simulationPaused: boolean;

  addTransaction: (tx: Transaction) => void;
  setSelectedTx: (tx: Transaction | null) => void;
  setActiveTab: (tab: string) => void;
  tickSimulation: () => void;
  initSimulation: () => void;
  resolveTransaction: (id: string, action: Resolution, resolvedBy?: string) => void;
  toggleSimulation: () => void;

  // Config actions
  toggleRule: (ruleId: "R1" | "R2" | "R3") => void;
  setRuleBonus: (ruleId: "R1" | "R2" | "R3", bonus: number) => void;
  setThreshold: (key: "block" | "flag", value: number) => void;
  setWeights: (xgb: number) => void; // iso = 1 - xgb
  setSimulationSpeed: (ms: number) => void;
  resetConfig: () => void;
}

export const useSentinelStore = create<SentinelState>((set, get) => ({
  transactions: [],
  agents: generateAgents(),
  kpi: {
    total_transactions: 2861,
    fraudes_detectees: 139,
    taux_faux_positifs: 2.3,
    delai_moyen_ms: 35,
    approuves: 2861,
    signales: 128,
    bloques: 11,
    transactions_par_min: 0,
  },
  timeline: generateTimeline(),
  selectedTx: null,
  wsConnected: true,
  activeTab: "operations",
  config: { ...DEFAULT_CONFIG },
  simulationPaused: false,

  addTransaction: (tx) => set((state) => {
    const newTxs = [tx, ...state.transactions].slice(0, 500);
    const kpi = { ...state.kpi };
    kpi.total_transactions += 1;
    if (tx.verdict === "BLOCK") { kpi.bloques += 1; kpi.fraudes_detectees += 1; }
    else if (tx.verdict === "FLAG") { kpi.signales += 1; }
    else { kpi.approuves += 1; }
    kpi.delai_moyen_ms = Math.round((kpi.delai_moyen_ms * 0.95 + tx.delai_ms * 0.05));
    kpi.taux_faux_positifs = Math.round((kpi.signales / Math.max(1, kpi.total_transactions)) * 1000) / 10;

    const timeline = [...state.timeline];
    const last = { ...timeline[timeline.length - 1] };
    if (tx.verdict === "APPROVE") last.approuves += 1;
    else if (tx.verdict === "FLAG") last.signales += 1;
    else last.bloques += 1;
    timeline[timeline.length - 1] = last;

    const agents = state.agents.map(a => {
      const tasks: Record<string, string> = {
        coordinateur: "Monitoring agent network",
        surveillance: `Processing ${tx.id.slice(0, 12)}`,
        analyseml: `XGB: ${tx.xgb_score.toFixed(3)} | IF: ${tx.if_score.toFixed(3)}`,
        evaluateurrisque: tx.regles_declenchees.length > 0 ? `Rules: ${tx.regles_declenchees.length} triggered` : "No rules triggered",
        banque: `Decision: ${tx.verdict} (score ${tx.score_final.toFixed(3)})`,
        audit: `Logged ${tx.performative} → ${tx.agent_decision}`,
      };
      return { ...a, tache_courante: tasks[a.id] || a.tache_courante, messages_traites: a.messages_traites + 1, derniere_activite: new Date().toISOString() };
    });

    return { transactions: newTxs, kpi, timeline, agents };
  }),

  setSelectedTx: (tx) => set({ selectedTx: tx }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSimulation: () => set((state) => ({ simulationPaused: !state.simulationPaused })),

  resolveTransaction: (id, action, resolvedBy = "Analyst") => set((state) => {
    const transactions = state.transactions.map(tx =>
      tx.id === id
        ? { ...tx, resolution: action, resolved_at: new Date().toISOString(), resolved_by: resolvedBy }
        : tx
    );
    // If the selected transaction is the one being resolved, update it too
    const selectedTx = state.selectedTx?.id === id
      ? transactions.find(t => t.id === id) ?? null
      : state.selectedTx;
    return { transactions, selectedTx };
  }),

  tickSimulation: () => {
    const state = get();
    if (state.simulationPaused) return;
    const tx = generateTransaction(state.config);
    get().addTransaction(tx);
    set((s) => ({
      kpi: { ...s.kpi, transactions_par_min: randomInt(42, 58) }
    }));
  },

  initSimulation: () => {
    const config = get().config;
    const initial: Transaction[] = [];
    for (let i = 0; i < 40; i++) initial.push(generateTransaction(config));
    set((state) => {
      let kpi = { ...state.kpi };
      initial.forEach(tx => {
        kpi.total_transactions += 1;
        if (tx.verdict === "BLOCK") { kpi.bloques += 1; kpi.fraudes_detectees += 1; }
        else if (tx.verdict === "FLAG") kpi.signales += 1;
        else kpi.approuves += 1;
      });
      kpi.transactions_par_min = randomInt(42, 58);
      return { transactions: initial.reverse(), kpi };
    });
  },

  toggleRule: (ruleId) => set((state) => ({
    config: {
      ...state.config,
      rules: {
        ...state.config.rules,
        [ruleId]: { ...state.config.rules[ruleId], enabled: !state.config.rules[ruleId].enabled }
      }
    }
  })),

  setRuleBonus: (ruleId, bonus) => set((state) => ({
    config: {
      ...state.config,
      rules: {
        ...state.config.rules,
        [ruleId]: { ...state.config.rules[ruleId], bonus }
      }
    }
  })),

  setThreshold: (key, value) => set((state) => ({
    config: {
      ...state.config,
      thresholds: { ...state.config.thresholds, [key]: value }
    }
  })),

  setWeights: (xgb) => set((state) => ({
    config: {
      ...state.config,
      weights: { xgb, iso: Math.round((1 - xgb) * 100) / 100 }
    }
  })),

  setSimulationSpeed: (ms) => set((state) => ({
    config: { ...state.config, simulationSpeed: ms }
  })),

  resetConfig: () => set({ config: { ...DEFAULT_CONFIG } }),
}));
