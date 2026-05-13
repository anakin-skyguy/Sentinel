import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useSentinelStore } from "./store";
import { Sidebar } from "./components/Sidebar";
import { ModalDetailAlerte } from "./components/ModalDetailAlerte";
import { Operations } from "./pages/Operations";
import { ModelPerformance } from "./pages/ModelPerformance";
import { AgentNetwork } from "./pages/AgentNetwork";
import { IncidentLog } from "./pages/IncidentLog";
import { Configuration } from "./pages/Configuration";
import { Transactions } from "./pages/Transactions";
import { UMLDiagram } from "./pages/UMLDiagram";

const PAGE_MAP: Record<string, React.ReactNode> = {
  operations: <Operations />,
  transactions: <Transactions />,
  agents: <AgentNetwork />,
  performance: <ModelPerformance />,
  incidents: <IncidentLog />,
  config: <Configuration />,
  uml: <UMLDiagram />,
};

function TopBar() {
  const { activeTab, kpi, wsConnected, simulationPaused, toggleSimulation } = useSentinelStore();

  const TAB_LABELS: Record<string, string> = {
    operations: "Operations",
    transactions: "Transactions",
    agents: "Agent Network",
    performance: "Model Performance",
    incidents: "Incident Log",
    config: "Configuration",
    uml: "Architecture UML",
  };

  return (
    <header className="shrink-0 h-10 flex items-center justify-between px-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <span className="text-xs font-display font-bold text-foreground tracking-tight">SENTINEL</span>
        <span className="text-muted-foreground text-xs">/</span>
        <span className="text-xs font-mono text-muted-foreground">{TAB_LABELS[activeTab]}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-muted-foreground">
          <span className="text-foreground font-semibold">{kpi.transactions_par_min}</span> tx/min
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          <span className={kpi.bloques > 0 ? "text-red-400 font-semibold" : "text-foreground font-semibold"}>{kpi.bloques}</span> bloquées
        </span>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${!simulationPaused && wsConnected ? "bg-teal-400 agent-pulse" : "bg-amber-400"}`} />
          <span className={!simulationPaused ? "text-teal-400" : "text-amber-400"}>
            {simulationPaused ? "SIMULATION PAUSED" : "LIVE STREAM"}
          </span>
        </div>
        <button
          onClick={toggleSimulation}
          title={simulationPaused ? "Resume simulation" : "Pause simulation"}
          className="flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-wider border border-border px-2 py-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          {simulationPaused
            ? <><Play size={10} /><span>RESUME</span></>
            : <><Pause size={10} /><span>PAUSE</span></>
          }
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const { activeTab, tickSimulation, initSimulation, config } = useSentinelStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initSimulation();
  }, []);

  // Restart interval whenever simulationSpeed changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tickSimulation, config.simulationSpeed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [config.simulationSpeed, tickSimulation]);

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {PAGE_MAP[activeTab] ?? <Operations />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ModalDetailAlerte />


    </div>
  );
}
