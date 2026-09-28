import { Shield, Activity, List, Cpu, BarChart2, FileText, Settings, Wifi, WifiOff, GitBranch } from "lucide-react";
import { cn } from "../lib/utils";
import { useSentinelStore } from "../store";

const NAV_ITEMS = [
  { id: "operations", label: "Operations", icon: Activity },
  { id: "transactions", label: "Transactions", icon: List },
  { id: "agents", label: "Agent Network", icon: Cpu },
  { id: "performance", label: "Model Performance", icon: BarChart2 },
  { id: "incidents", label: "Incident Log", icon: FileText },
  { id: "config", label: "Configuration", icon: Settings },
  { id: "uml", label: "Architecture UML", icon: GitBranch },
];

export function Sidebar() {
  const { activeTab, setActiveTab, wsConnected } = useSentinelStore();

  return (
    <aside className="shrink-0 w-14 flex flex-col border-r border-border bg-card h-full">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-border shrink-0">
        <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Shield size={16} className="text-primary" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            title={label}
            className={cn(
              "w-10 h-10 rounded flex items-center justify-center transition-colors duration-150 group relative",
              activeTab === id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon size={18} strokeWidth={1.5} />
            {activeTab === id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
            )}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="shrink-0 p-2 border-t border-border">
        <div
          title={wsConnected ? "WebSocket connected" : "WebSocket disconnected"}
          className={cn(
            "w-10 h-10 rounded flex items-center justify-center",
            wsConnected ? "text-teal-400" : "text-red-400"
          )}
        >
          {wsConnected ? <Wifi size={16} strokeWidth={1.5} /> : <WifiOff size={16} strokeWidth={1.5} />}
        </div>
        <div className="w-10 h-10 rounded flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="text-[10px] font-mono text-muted-foreground font-semibold">SA</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
