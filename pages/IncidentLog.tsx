import { useState, useMemo } from "react";
import { FileText, Download, Search, X } from "lucide-react";
import { useSentinelStore } from "../store";
import { formatCurrency, formatTime, verdictBg } from "../lib/utils";
import type { Resolution } from "../types";

const RESOLUTION_COLORS: Record<Resolution, string> = {
  CONFIRMED_BLOCK: "text-red-400 border-red-500/30 bg-red-500/10",
  MARKED_SAFE: "text-teal-400 border-teal-500/30 bg-teal-500/10",
  ESCALATED: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  ACKNOWLEDGED: "text-primary border-primary/30 bg-primary/10",
  INVESTIGATING: "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

const RESOLUTION_LABELS: Record<Resolution, string> = {
  CONFIRMED_BLOCK: "Confirmed",
  MARKED_SAFE: "Safe",
  ESCALATED: "Escalated",
  ACKNOWLEDGED: "ACK",
  INVESTIGATING: "Investigating",
};

export function IncidentLog() {
  const { transactions, setSelectedTx } = useSentinelStore();
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<"ALL" | "FLAG" | "BLOCK">("ALL");
  const [resolutionFilter, setResolutionFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");

  const incidents = useMemo(() => {
    return transactions
      .filter(t => t.verdict !== "APPROVE")
      .filter(t => verdictFilter === "ALL" || t.verdict === verdictFilter)
      .filter(t => {
        if (resolutionFilter === "PENDING") return !t.resolution;
        if (resolutionFilter === "RESOLVED") return !!t.resolution;
        return true;
      })
      .filter(t => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.marchand.toLowerCase().includes(q) ||
          t.carte_fin.includes(q) ||
          t.banque.toLowerCase().includes(q) ||
          t.pays.toLowerCase().includes(q)
        );
      });
  }, [transactions, search, verdictFilter, resolutionFilter]);

  const pendingCount = transactions.filter(t => t.verdict !== "APPROVE" && !t.resolution).length;

  const exportCSV = () => {
    const headers = ["ID", "Marchand", "Montant", "Carte", "Banque", "Pays", "Score", "Verdict", "Règles", "Résolution", "Horodatage"];
    const rows = incidents.map(tx => [
      tx.id,
      tx.marchand,
      tx.montant.toFixed(2),
      `···${tx.carte_fin}`,
      tx.banque,
      tx.pays,
      tx.score_final.toFixed(3),
      tx.verdict,
      tx.regles_declenchees.join(" | ") || "—",
      tx.resolution ?? "PENDING",
      tx.horodatage,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-incidents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-2">
      <div className="shrink-0 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-display font-bold text-foreground tracking-tight">Incident Log</h2>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {incidents.length} incidents affichés · <span className="text-amber-400">{pendingCount} en attente</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Verdict filter */}
          {(["ALL", "FLAG", "BLOCK"] as const).map(v => (
            <button
              key={v}
              onClick={() => setVerdictFilter(v)}
              className={`text-[10px] font-mono px-2 py-1 rounded-sm border transition-colors ${
                verdictFilter === v
                  ? v === "BLOCK" ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : v === "FLAG" ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-muted border-border text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          {/* Resolution filter */}
          {(["ALL", "PENDING", "RESOLVED"] as const).map(v => (
            <button
              key={v}
              onClick={() => setResolutionFilter(v)}
              className={`text-[10px] font-mono px-2 py-1 rounded-sm border transition-colors ${
                resolutionFilter === v
                  ? "bg-muted border-border text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-wider border border-border text-muted-foreground px-3 py-1.5 rounded hover:text-foreground hover:bg-muted transition-colors"
          >
            <Download size={11} /> EXPORT CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="shrink-0 relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par ID, marchand, carte, banque, pays..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-8 py-2 bg-card border border-border rounded text-[11px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-card border border-border rounded overflow-hidden flex flex-col">
        {/* Column headers */}
        <div className="shrink-0 grid grid-cols-[1fr_80px_70px_60px_80px_90px_90px_90px] gap-2 px-3 py-2 border-b border-border bg-muted/30">
          {["ID / MARCHAND", "MONTANT", "CARTE", "SCORE", "VERDICT", "RÈGLES", "RÉSOLUTION", "HORODATAGE"].map(h => (
            <span key={h} className="text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground">{h}</span>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <FileText size={32} strokeWidth={1} />
              <span className="text-sm font-mono">Aucun incident ne correspond aux filtres.</span>
            </div>
          ) : (
            incidents.map(tx => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`grid grid-cols-[1fr_80px_70px_60px_80px_90px_90px_90px] gap-2 px-3 py-2.5 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${
                  tx.verdict === "BLOCK" ? "border-l-2 border-l-red-500/60" : "border-l-2 border-l-amber-500/40"
                } ${tx.resolution ? "opacity-60" : ""}`}
              >
                <div>
                  <div className="text-[11px] font-mono text-foreground truncate">{tx.id.slice(0, 18)}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{tx.marchand}</div>
                </div>
                <span className="text-[11px] font-mono text-foreground self-center">{formatCurrency(tx.montant)}</span>
                <span className="text-[11px] font-mono text-muted-foreground self-center">···{tx.carte_fin}</span>
                <span className={`text-[11px] font-mono font-semibold self-center ${tx.verdict === "BLOCK" ? "text-red-400" : "text-amber-400"}`}>
                  {tx.score_final.toFixed(3)}
                </span>
                <div className="self-center">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest uppercase border rounded-sm ${verdictBg(tx.verdict)}`}>
                    {tx.verdict}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground self-center truncate">
                  {tx.regles_declenchees.length > 0 ? `${tx.regles_declenchees.length} règle(s)` : "—"}
                </span>
                <div className="self-center">
                  {tx.resolution ? (
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wide uppercase border rounded-sm ${RESOLUTION_COLORS[tx.resolution]}`}>
                      {RESOLUTION_LABELS[tx.resolution]}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-amber-400 font-semibold">PENDING</span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground self-center">{formatTime(tx.horodatage)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
