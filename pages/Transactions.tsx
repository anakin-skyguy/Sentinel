import { useState, useMemo } from "react";
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSentinelStore } from "../store";
import { formatCurrency, formatTime, verdictBg, scoreColor } from "../lib/utils";
import type { Verdict } from "../types";

type SortKey = "horodatage" | "montant" | "score_final" | "verdict";
type SortDir = "asc" | "desc";

function SortIcon({ col, active, dir }: { col: string; active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={10} className="text-muted-foreground/40" />;
  return dir === "asc" ? <ArrowUp size={10} className="text-primary" /> : <ArrowDown size={10} className="text-primary" />;
}

export function Transactions() {
  const { transactions, setSelectedTx } = useSentinelStore();
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<"ALL" | Verdict>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("horodatage");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (verdictFilter !== "ALL") {
      result = result.filter(t => t.verdict === verdictFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.marchand.toLowerCase().includes(q) ||
        t.carte_fin.includes(q) ||
        t.banque.toLowerCase().includes(q) ||
        t.pays.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === "horodatage") { va = a.horodatage; vb = b.horodatage; }
      else if (sortKey === "montant") { va = a.montant; vb = b.montant; }
      else if (sortKey === "score_final") { va = a.score_final; vb = b.score_final; }
      else { va = a.verdict; vb = b.verdict; }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, search, verdictFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["ID", "Marchand", "Montant", "Carte", "Banque", "Pays", "XGB", "IF", "Score ML", "Score Final", "Verdict", "Règles", "Délai ms", "Horodatage"];
    const rows = filtered.map(tx => [
      tx.id, tx.marchand, tx.montant.toFixed(2), `···${tx.carte_fin}`, tx.banque, tx.pays,
      tx.xgb_score.toFixed(3), tx.if_score.toFixed(3), tx.score_ml.toFixed(3), tx.score_final.toFixed(3),
      tx.verdict, tx.regles_declenchees.join(" | ") || "—", tx.delai_ms, tx.horodatage,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLS: { key: SortKey | null; label: string; cls: string }[] = [
    { key: null, label: "ID / MARCHAND", cls: "flex-1 min-w-0" },
    { key: "montant", label: "MONTANT", cls: "w-[90px] shrink-0" },
    { key: null, label: "CARTE", cls: "w-[70px] shrink-0" },
    { key: null, label: "PAYS", cls: "w-[50px] shrink-0" },
    { key: null, label: "XGB", cls: "w-[60px] shrink-0" },
    { key: null, label: "IF", cls: "w-[60px] shrink-0" },
    { key: "score_final", label: "SCORE", cls: "w-[70px] shrink-0" },
    { key: "verdict", label: "VERDICT", cls: "w-[80px] shrink-0" },
    { key: null, label: "DÉLAI", cls: "w-[60px] shrink-0" },
    { key: "horodatage", label: "HORODATAGE", cls: "w-[90px] shrink-0" },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-2">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-display font-bold text-foreground tracking-tight">Transactions</h2>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {filtered.length.toLocaleString("fr-FR")} transactions · page {page + 1}/{Math.max(1, totalPages)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["ALL", "APPROVE", "FLAG", "BLOCK"] as const).map(v => (
            <button
              key={v}
              onClick={() => { setVerdictFilter(v); setPage(0); }}
              className={`text-[10px] font-mono px-2 py-1 rounded-sm border transition-colors ${
                verdictFilter === v
                  ? v === "BLOCK" ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : v === "FLAG" ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : v === "APPROVE" ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                    : "bg-muted border-border text-foreground"
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
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="w-full pl-8 pr-8 py-2 bg-card border border-border rounded text-[11px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        {search && (
          <button onClick={() => { setSearch(""); setPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-card border border-border rounded overflow-hidden flex flex-col">
        {/* Header row */}
        <div className="shrink-0 flex gap-2 px-3 py-2 border-b border-border bg-muted/30">
          {COLS.map(col => (
            <div
              key={col.label}
              className={`${col.cls} flex items-center gap-1 ${col.key ? "cursor-pointer hover:text-foreground select-none" : ""} text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground`}
              onClick={() => col.key && handleSort(col.key)}
            >
              {col.label}
              {col.key && <SortIcon col={col.key} active={sortKey === col.key} dir={sortDir} />}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence initial={false}>
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <Search size={24} strokeWidth={1} />
                <span className="text-sm font-mono">Aucun résultat.</span>
              </div>
            ) : (
              paginated.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, delay: i < 10 ? i * 0.02 : 0 }}
                  onClick={() => setSelectedTx(tx)}
                  className={`flex gap-2 px-3 py-2 border-b border-border/50 cursor-pointer hover:bg-muted/40 transition-colors ${
                    tx.verdict === "BLOCK" ? "border-l-2 border-l-red-500/60" :
                    tx.verdict === "FLAG" ? "border-l-2 border-l-amber-500/40" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-foreground truncate">{tx.id.slice(0, 20)}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{tx.marchand}</div>
                  </div>
                  <span className="w-[90px] shrink-0 text-[11px] font-mono text-foreground self-center">{formatCurrency(tx.montant)}</span>
                  <span className="w-[70px] shrink-0 text-[11px] font-mono text-muted-foreground self-center">···{tx.carte_fin}</span>
                  <span className="w-[50px] shrink-0 text-[11px] font-mono text-muted-foreground self-center">{tx.pays}</span>
                  <span className={`w-[60px] shrink-0 text-[11px] font-mono self-center ${scoreColor(tx.xgb_score)}`}>{tx.xgb_score.toFixed(3)}</span>
                  <span className={`w-[60px] shrink-0 text-[11px] font-mono self-center ${scoreColor(tx.if_score)}`}>{tx.if_score.toFixed(3)}</span>
                  <span className={`w-[70px] shrink-0 text-[11px] font-mono font-semibold self-center ${scoreColor(tx.score_final)}`}>{tx.score_final.toFixed(3)}</span>
                  <div className="w-[80px] shrink-0 self-center">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest uppercase border rounded-sm ${verdictBg(tx.verdict)}`}>
                      {tx.verdict}
                    </span>
                  </div>
                  <span className="w-[60px] shrink-0 text-[10px] font-mono text-muted-foreground self-center">{tx.delai_ms}ms</span>
                  <span className="w-[90px] shrink-0 text-[10px] font-mono text-muted-foreground self-center">{formatTime(tx.horodatage)}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
            <span className="text-[10px] font-mono text-muted-foreground">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-[10px] font-mono px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← PREV
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`text-[10px] font-mono w-7 py-1 rounded border transition-colors ${
                      p === page ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-[10px] font-mono px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                NEXT →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
