import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown, Filter } from "lucide-react";
import { useSentinelStore } from "../store";
import { formatCurrency, formatTime, verdictBg, scoreColor } from "../lib/utils";
import type { Verdict } from "../types";

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const cls = verdictBg(verdict);
  return (
    <motion.span
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`inline-block px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest uppercase border rounded-sm verdict-reveal ${cls}`}
    >
      {verdict}
    </motion.span>
  );
}

export function FluxTransactions() {
  const { transactions, setSelectedTx } = useSentinelStore();
  const [filter, setFilter] = useState<"ALL" | Verdict>("ALL");
  const [isLive, setIsLive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(transactions.length);

  const filtered = filter === "ALL" ? transactions : transactions.filter(t => t.verdict === filter);

  useEffect(() => {
    if (isLive && transactions.length !== prevCountRef.current) {
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevCountRef.current = transactions.length;
  }, [transactions.length, isLive]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-card border border-border rounded overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground">Transaction Stream</span>
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 agent-pulse inline-block" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-muted-foreground" />
          {(["ALL", "APPROVE", "FLAG", "BLOCK"] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border transition-colors ${
                filter === v
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
        </div>
      </div>

      {/* Column headers */}
      <div className="shrink-0 grid grid-cols-[1fr_80px_70px_70px_60px_80px_90px] gap-2 px-3 py-1.5 border-b border-border bg-muted/30">
        {["ID / MARCHAND", "MONTANT", "CARTE", "PAYS", "SCORE", "VERDICT", "HORODATAGE"].map(h => (
          <span key={h} className="text-[9px] font-mono font-semibold tracking-widest uppercase text-muted-foreground truncate">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0" onScroll={(e) => {
        const el = e.currentTarget;
        setIsLive(el.scrollTop < 50);
      }}>
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm font-mono">
              No transactions match the current filter criteria.
            </div>
          ) : (
            filtered.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setSelectedTx(tx)}
                className={`grid grid-cols-[1fr_80px_70px_70px_60px_80px_90px] gap-2 px-3 py-2 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40 group ${
                  tx.verdict === "BLOCK" ? "border-l-2 border-l-red-500/60" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-foreground truncate">{tx.id.slice(0, 18)}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{tx.marchand}</div>
                </div>
                <span className="text-[11px] font-mono text-foreground self-center">{formatCurrency(tx.montant)}</span>
                <span className="text-[11px] font-mono text-muted-foreground self-center">···{tx.carte_fin}</span>
                <span className="text-[11px] font-mono text-muted-foreground self-center">{tx.pays}</span>
                <span className={`text-[11px] font-mono font-semibold self-center ${scoreColor(tx.score_final)}`}>
                  {tx.score_final.toFixed(3)}
                </span>
                <div className="self-center">
                  <VerdictBadge verdict={tx.verdict} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground self-center">{formatTime(tx.horodatage)}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Jump to live */}
      {!isLive && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            setIsLive(true);
          }}
          className="shrink-0 flex items-center justify-center gap-1.5 py-1.5 bg-primary/10 border-t border-primary/30 text-primary text-[10px] font-mono font-semibold tracking-wider hover:bg-primary/20 transition-colors"
        >
          <ArrowDown size={12} />
          JUMP TO LIVE
        </motion.button>
      )}
    </div>
  );
}
