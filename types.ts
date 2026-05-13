export type Verdict = "APPROVE" | "FLAG" | "BLOCK";

export type AgentStatus = "ACTIVE" | "IDLE" | "ERROR" | "OFFLINE";

export type Resolution = "CONFIRMED_BLOCK" | "MARKED_SAFE" | "ESCALATED" | "ACKNOWLEDGED" | "INVESTIGATING";

export interface Transaction {
  id: string;
  montant: number;
  marchand: string;
  carte_fin: string;
  banque: string;
  horodatage: string;
  verdict: Verdict;
  score_final: number;
  score_ml: number;
  xgb_score: number;
  if_score: number;
  regles_declenchees: string[];
  agent_decision: string;
  performative: string;
  raisonnement: string;
  pays: string;
  delai_ms: number;
  resolution?: Resolution;
  resolved_at?: string;
  resolved_by?: string;
}

export interface SentinelConfig {
  rules: {
    R1: { enabled: boolean; label: string; bonus: number };
    R2: { enabled: boolean; label: string; bonus: number };
    R3: { enabled: boolean; label: string; bonus: number };
  };
  thresholds: {
    block: number;
    flag: number;
  };
  weights: {
    xgb: number;
    iso: number;
  };
  simulationSpeed: number; // ms between ticks
}

export interface Agent {
  id: string;
  nom: string;
  role: string;
  statut: AgentStatus;
  tache_courante: string;
  messages_traites: number;
  latence_ms: number;
  derniere_activite: string;
}

export interface KPIData {
  total_transactions: number;
  fraudes_detectees: number;
  taux_faux_positifs: number;
  delai_moyen_ms: number;
  approuves: number;
  signales: number;
  bloques: number;
  transactions_par_min: number;
}

export interface TimelinePoint {
  heure: string;
  approuves: number;
  signales: number;
  bloques: number;
}
